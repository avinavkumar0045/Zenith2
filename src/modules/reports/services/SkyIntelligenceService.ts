import { useLocationStore } from '../../location/store/useLocationStore';
import { useMoonStore } from '../../moon/store/useMoonStore';
import { usePlanetStore } from '../../planets/store/usePlanetStore';
import { usePassStore } from '../../pass-predictions/store/usePassStore';
import { useISSStore } from '../../iss/store/useISSStore';
import { useSatelliteStore } from '../../satellites/store/useSatelliteStore';
import { useSkyIntelligenceStore } from '../store/useSkyIntelligenceStore';
import { SkyObservationScoreEngine } from './SkyObservationScoreEngine';
import { SkyRecommendationEngine } from './SkyRecommendationEngine';
import { UnifiedSkyReport } from '../types/sky-intelligence.types';
import * as SunCalc from 'suncalc';

class SkyIntelligenceServiceClass {
  private unsubscribeLocation: (() => void) | null = null;
  private unsubscribeMoon: (() => void) | null = null;
  private unsubscribePlanet: (() => void) | null = null;
  private unsubscribePass: (() => void) | null = null;
  private unsubscribeIss: (() => void) | null = null;
  private unsubscribeSat: (() => void) | null = null;

  public initialize() {
    this.unsubscribeLocation = useLocationStore.subscribe((state, prevState) => {
      if (state.activeLocation !== prevState.activeLocation) {
        this.generateReport();
      }
    });

    this.unsubscribeMoon = useMoonStore.subscribe((state, prevState) => {
      if (state.lastUpdated !== prevState.lastUpdated && !state.loading) {
        this.generateReport();
      }
    });

    this.unsubscribePlanet = usePlanetStore.subscribe((state, prevState) => {
      if (state.lastUpdated !== prevState.lastUpdated && !state.loading) {
        this.generateReport();
      }
    });

    this.unsubscribePass = usePassStore.subscribe((state, prevState) => {
      if (state.upcomingPasses !== prevState.upcomingPasses && !state.loading) {
        this.generateReport();
      }
    });

    this.unsubscribeIss = useISSStore.subscribe((state, prevState) => {
      if (state.isTracking !== prevState.isTracking) {
         this.generateReport();
      }
    });

    this.unsubscribeSat = useSatelliteStore.subscribe((state, prevState) => {
      if (state.activeSatellites.length !== prevState.activeSatellites.length) {
        this.generateReport();
      }
    });

    // Initial generate
    this.generateReport();
  }

  private generateReport() {
    const { activeLocation } = useLocationStore.getState();
    if (!activeLocation) return;

    const sunPos = SunCalc.getPosition(new Date(), activeLocation.latitude, activeLocation.longitude);
    const sunAlt = sunPos.altitude * 180 / Math.PI;
    const dayState = sunAlt > 0 ? 'Day' : (sunAlt > -18 ? 'Twilight' : 'Night');

    const { moonData } = useMoonStore.getState();
    const { planets } = usePlanetStore.getState();
    const { upcomingPasses } = usePassStore.getState();
    const { iss } = useISSStore.getState();
    const { activeSatellites } = useSatelliteStore.getState();

    const visiblePlanets = Object.values(planets || {}).filter(p => p.isAboveHorizon).map(p => p.name);
    const hiddenPlanets = Object.values(planets || {}).filter(p => !p.isAboveHorizon).map(p => p.name);

    let nextIssPass = null;
    if (upcomingPasses) {
      const issPasses = upcomingPasses.filter(p => p.satelliteId === '25544' && new Date(p.startTime).getTime() > Date.now());
      if (issPasses.length > 0) {
        const next = new Date(issPasses[0].startTime);
        nextIssPass = next.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
      }
    }

    const strongPasses = upcomingPasses ? upcomingPasses.filter(p => p.maxElevation > 40 && new Date(p.startTime).getTime() > Date.now()).length : 0;
    
    // Evaluate simplistic ISS visibility from ISS Store if possible, or fallback to false
    // Since ISSObject has altitude we could theoretically check it, but we can also use activePasses
    const isIssCurrentlyVisible = upcomingPasses ? upcomingPasses.some(p => p.satelliteId === '25544' && new Date(p.startTime).getTime() < Date.now() && new Date(p.endTime).getTime() > Date.now()) : false;

    const report: UnifiedSkyReport = {
      location: {
        name: activeLocation.name || 'Unknown Location',
        dayState: dayState as 'Day' | 'Twilight' | 'Night'
      },
      observationScore: SkyObservationScoreEngine.calculateScore(),
      bestObservationTarget: SkyRecommendationEngine.getBestTarget(),
      moonSummary: {
        phase: moonData?.phaseName || 'Unknown',
        altitude: moonData?.altitude || 0,
        isVisible: moonData?.isVisible || false
      },
      planetSummary: {
        visiblePlanets,
        hiddenPlanets
      },
      issSummary: {
        nextPassTime: nextIssPass,
        isCurrentlyVisible: isIssCurrentlyVisible
      },
      satelliteSummary: {
        activeCount: activeSatellites.length,
        strongPassesCount: strongPasses
      },
      recommendations: SkyRecommendationEngine.getRecommendations(),
      warnings: SkyRecommendationEngine.getWarnings(),
      lastUpdated: Date.now()
    };

    useSkyIntelligenceStore.getState().setReport(report);
  }

  public destroy() {
    if (this.unsubscribeLocation) this.unsubscribeLocation();
    if (this.unsubscribeMoon) this.unsubscribeMoon();
    if (this.unsubscribePlanet) this.unsubscribePlanet();
    if (this.unsubscribePass) this.unsubscribePass();
    if (this.unsubscribeIss) this.unsubscribeIss();
    if (this.unsubscribeSat) this.unsubscribeSat();
  }
}

export const SkyIntelligenceService = new SkyIntelligenceServiceClass();
