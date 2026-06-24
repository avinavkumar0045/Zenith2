import { useLocationStore } from '../../location/store/useLocationStore';
import { useMoonStore } from '../../moon/store/useMoonStore';
import { usePlanetStore } from '../../planets/store/usePlanetStore';
import { useConstellationStore } from '../../constellations/store/useConstellationStore';
import { usePassStore } from '../../pass-predictions/store/usePassStore';
import { useISSStore } from '../../iss/store/useISSStore';
import { useWeatherStore } from '../../weather/store/useWeatherStore';
import { useObservationPlanningStore } from '../../reports/store/useObservationPlanningStore';

import { useSkyCorrelationStore } from '../store/useSkyCorrelationStore';
import { OverheadObjectEngine } from './OverheadObjectEngine';
import { VisibilitySummaryEngine } from './VisibilitySummaryEngine';
import { SkyCorrelationReport } from '../types/sky-correlation.types';

class SkyCorrelationServiceClass {
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
      usePassStore.subscribe((state, prevState) => {
        if (state.upcomingPasses !== prevState.upcomingPasses) trigger();
      }),
      useISSStore.subscribe((state, prevState) => {
        if (state.isTracking !== prevState.isTracking) trigger();
      }),
      useWeatherStore.subscribe((state, prevState) => {
        if (state.weather?.updatedAt !== prevState.weather?.updatedAt) trigger();
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

    const rawData = OverheadObjectEngine.generateRawData(activeLocation.latitude, activeLocation.longitude);
    const skySummary = VisibilitySummaryEngine.generateSummary(rawData);

    const report: SkyCorrelationReport = {
      ...rawData,
      skySummary
    };

    useSkyCorrelationStore.getState().setReport(report);
  }

  public destroy() {
    this.unsubscribeList.forEach(unsub => unsub());
    this.unsubscribeList = [];
  }
}

export const SkyCorrelationService = new SkyCorrelationServiceClass();
