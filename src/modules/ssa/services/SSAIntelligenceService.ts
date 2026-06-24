import { useLocationStore } from '../../location/store/useLocationStore';
import { useMoonStore } from '../../moon/store/useMoonStore';
import { usePlanetStore } from '../../planets/store/usePlanetStore';
import { useConstellationStore } from '../../constellations/store/useConstellationStore';
import { useSatelliteStore } from '../../satellites/store/useSatelliteStore';
import { useISSStore } from '../../iss/store/useISSStore';
import { usePassStore } from '../../pass-predictions/store/usePassStore';
import { useWeatherStore } from '../../weather/store/useWeatherStore';
import { useSkyCorrelationStore } from '../../sky-correlation/store/useSkyCorrelationStore';
import { useObservationPlanningStore } from '../../reports/store/useObservationPlanningStore';

import { useSSAStore } from '../store/useSSAStore';
import { SpaceActivityEngine } from './SpaceActivityEngine';
import { OverheadAssetEngine } from './OverheadAssetEngine';
import { SpaceEnvironmentEngine } from './SpaceEnvironmentEngine';
import { SSAReport } from '../types/ssa.types';

class SSAIntelligenceServiceClass {
  private unsubscribeList: (() => void)[] = [];

  public initialize() {
    const trigger = () => this.generateReport();

    this.unsubscribeList.push(
      useLocationStore.subscribe((state, prevState) => {
        if (state.activeLocation !== prevState.activeLocation) trigger();
      }),
      useMoonStore.subscribe((state, prevState) => {
        if (state.lastUpdated !== prevState.lastUpdated) trigger();
      }),
      usePlanetStore.subscribe((state, prevState) => {
        if (state.lastUpdated !== prevState.lastUpdated) trigger();
      }),
      useConstellationStore.subscribe((state, prevState) => {
        if (state.visibleConstellations !== prevState.visibleConstellations) trigger();
      }),
      useSatelliteStore.subscribe((state, prevState) => {
        if (state.activeSatellites !== prevState.activeSatellites) trigger();
      }),
      useISSStore.subscribe((state, prevState) => {
        if (state.isTracking !== prevState.isTracking) trigger();
      }),
      usePassStore.subscribe((state, prevState) => {
        if (state.upcomingPasses !== prevState.upcomingPasses) trigger();
      }),
      useWeatherStore.subscribe((state, prevState) => {
        if (state.weather?.updatedAt !== prevState.weather?.updatedAt) trigger();
      }),
      useSkyCorrelationStore.subscribe((state, prevState) => {
        if (state.report !== prevState.report) trigger();
      }),
      useObservationPlanningStore.subscribe((state, prevState) => {
        if (state.plan !== prevState.plan) trigger();
      })
    );

    // Initial run
    trigger();
  }

  private generateReport() {
    const { activeLocation } = useLocationStore.getState();
    if (!activeLocation) return;

    const { moonData } = useMoonStore.getState();
    const { planets } = usePlanetStore.getState();
    const { visibleConstellations } = useConstellationStore.getState();
    const { activeSatellites } = useSatelliteStore.getState();
    const { isTracking: issTracking } = useISSStore.getState();
    const { upcomingPasses } = usePassStore.getState();
    const { weather } = useWeatherStore.getState();

    const spaceActivityIndex = SpaceActivityEngine.calculateIndex();
    const overheadAssets = OverheadAssetEngine.getRankedAssets();
    const mostRelevantAsset = overheadAssets.length > 0 ? overheadAssets[0] : 'None';
    const satelliteCount = activeSatellites.length;
    
    const environmentSummary = SpaceEnvironmentEngine.generateSummary(mostRelevantAsset, satelliteCount);

    const now = Date.now();
    const visibleSatelliteCount = upcomingPasses ? upcomingPasses.filter(p => new Date(p.startTime).getTime() < now && new Date(p.endTime).getTime() > now).length : 0;
    
    let issPassStatus = 'None';
    if (issTracking) issPassStatus = 'Currently Visible';
    else if (upcomingPasses && upcomingPasses.some(p => p.satelliteId === '25544' && new Date(p.startTime).getTime() < now && new Date(p.endTime).getTime() > now)) issPassStatus = 'Passing Overhead';
    else if (upcomingPasses && upcomingPasses.some(p => p.satelliteId === '25544' && new Date(p.startTime).getTime() > now)) issPassStatus = 'Pass Expected Soon';

    const planetCount = planets ? Object.values(planets).filter(p => p.isAboveHorizon).length : 0;

    const report: SSAReport = {
      spaceActivityIndex,
      environmentSummary,
      overheadAssets,
      mostRelevantAsset,
      satelliteCount,
      visibleSatelliteCount,
      moonStatus: moonData?.isVisible ? 'Visible' : 'Hidden',
      planetStatus: `${planetCount} Visible`,
      constellationStatus: `${visibleConstellations.length} Prominent`,
      issStatus: issPassStatus,
      weatherStatus: weather ? weather.weatherCondition : 'Unknown',
      observationQuality: weather ? weather.observationQuality : 'Unknown',
      spaceAwarenessSummary: environmentSummary // mapped
    };

    useSSAStore.getState().setReport(report);
  }

  public destroy() {
    this.unsubscribeList.forEach(unsub => unsub());
    this.unsubscribeList = [];
  }
}

export const SSAIntelligenceService = new SSAIntelligenceServiceClass();
