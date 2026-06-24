import { useLocationStore } from '../../location/store/useLocationStore';
import { usePassStore } from '../../pass-predictions/store/usePassStore';
import { useSatelliteStore } from '../../satellites/store/useSatelliteStore';
import { useMoonStore } from '../../moon/store/useMoonStore';
import { useMoonPositionStore } from '../../moon/store/useMoonPositionStore';
import { usePlanetStore } from '../../planets/store/usePlanetStore';
import { useReportStore } from '../store/useReportStore';
import { ScoringService } from './ScoringService';
import { ObservationService } from './ObservationService';
import { eventBus } from '../../location/utils/EventBus';
import { CelestialReportObject } from '../types/report.types';

class ReportServiceClass {
  private unsubscribePassStore: (() => void) | null = null;
  private unsubscribeSatStore: (() => void) | null = null;
  private unsubscribeMoonStore: (() => void) | null = null;
  private unsubscribeMoonPosStore: (() => void) | null = null;
  private unsubscribePlanetStore: (() => void) | null = null;

  public initialize() {
    // 1. Listen to explicit location changes
    eventBus.on('locationChanged', () => {
      this.generateReport();
    });

    // 2. Listen to pass prediction updates
    this.unsubscribePassStore = usePassStore.subscribe((state, prevState) => {
      if (state.upcomingPasses !== prevState.upcomingPasses || state.loading !== prevState.loading) {
        if (!state.loading) {
          this.generateReport();
        }
      }
    });

    // 3. Listen to satellite changes (for Overhead Count)
    this.unsubscribeSatStore = useSatelliteStore.subscribe((state, prevState) => {
      if (state.activeSatellites.length !== prevState.activeSatellites.length) {
        this.generateReport();
      }
    });

    // 4. Listen to moon changes
    this.unsubscribeMoonStore = useMoonStore.subscribe((state, prevState) => {
      if (state.lastUpdated !== prevState.lastUpdated && !state.loading) {
        this.generateReport();
      }
    });

    // 5. Listen to moon position changes
    this.unsubscribeMoonPosStore = useMoonPositionStore.subscribe((state, prevState) => {
      if (state.lastUpdated !== prevState.lastUpdated) {
        this.generateReport();
      }
    });

    // 6. Listen to planet changes
    this.unsubscribePlanetStore = usePlanetStore.subscribe((state, prevState) => {
      if (state.lastUpdated !== prevState.lastUpdated && !state.loading) {
        this.generateReport();
      }
    });
  }

  private generateReport() {
    const { activeLocation } = useLocationStore.getState();
    const { upcomingPasses } = usePassStore.getState();
    const { activeSatellites } = useSatelliteStore.getState();

    if (!activeLocation) {
      useReportStore.getState().setReport(null);
      return;
    }

    useReportStore.getState().setLoading(true);

    const locationName = activeLocation.name;
    const dayState = activeLocation.dayState;
    const satellitesOverheadCount = activeSatellites.length;
    
    let issNextPassTime = null;
    let bestElevation = null;

    if (upcomingPasses.length > 0) {
      issNextPassTime = new Date(upcomingPasses[0].startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const bestPass = upcomingPasses.reduce((prev, current) => 
        (prev.maxElevation > current.maxElevation) ? prev : current
      );
      bestElevation = bestPass.maxElevation;
    }

    const score = ScoringService.generateScore(dayState, upcomingPasses);
    const quality = ScoringService.getQualityLabel(score);
    const recommendations = ObservationService.generateRecommendations(upcomingPasses, dayState);

    // Inject Moon Intelligence
    const { moonData } = useMoonStore.getState();
    const { regionName, isVisibleFromLocation } = useMoonPositionStore.getState();

    if (moonData) {
      if (regionName) {
        recommendations.push(`Moon currently overhead above the ${regionName}.`);
      }
      
      if (isVisibleFromLocation) {
        if (moonData.observationScore >= 8) {
          recommendations.push(`Moon observation conditions are excellent (${moonData.phaseName}).`);
        } else if (moonData.observationScore >= 5) {
          recommendations.push(`Moon currently visible (${moonData.phaseName}).`);
        } else {
          recommendations.push(`Moon is visible from the selected location.`);
        }
      } else {
        recommendations.push("Moon is currently below the horizon.");
      }
    }

    // Inject Planet Intelligence
    const { planets } = usePlanetStore.getState();
    const planetVals = Object.values(planets || {});
    if (planetVals.length > 0) {
      planetVals.forEach(p => {
        if (p.isAboveHorizon) {
          if (p.observationScore >= 8) {
            recommendations.push(`${p.name} is well positioned for observation.`);
          } else if (p.observationScore >= 5) {
            recommendations.push(`${p.name} is currently visible.`);
          }
        } else {
          // Unclutter report: only optionally add if needed, but let's add Saturn as requested in the example
          if (p.id === 'saturn' || p.id === 'jupiter') {
             recommendations.push(`${p.name} is below the horizon.`);
          }
        }
      });
    }

    const report: CelestialReportObject = {
      locationName,
      dayState,
      satellitesOverheadCount,
      issNextPassTime,
      bestElevation,
      observationScore: score,
      observationQuality: quality,
      recommendations,
      timestamp: Date.now()
    };

    useReportStore.getState().setReport(report);
    useReportStore.getState().setLoading(false);
  }

  public destroy() {
    if (this.unsubscribePassStore) this.unsubscribePassStore();
    if (this.unsubscribeSatStore) this.unsubscribeSatStore();
    if (this.unsubscribeMoonStore) this.unsubscribeMoonStore();
    if (this.unsubscribeMoonPosStore) this.unsubscribeMoonPosStore();
    if (this.unsubscribePlanetStore) this.unsubscribePlanetStore();
  }
}

export const ReportService = new ReportServiceClass();
