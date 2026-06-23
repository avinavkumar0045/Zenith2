import { useLocationStore } from '../../location/store/useLocationStore';
import { usePassStore } from '../../pass-predictions/store/usePassStore';
import { useSatelliteStore } from '../../satellites/store/useSatelliteStore';
import { useReportStore } from '../store/useReportStore';
import { ScoringService } from './ScoringService';
import { ObservationService } from './ObservationService';
import { eventBus } from '../../location/utils/EventBus';
import { CelestialReportObject } from '../types/report.types';

class ReportServiceClass {
  private unsubscribePassStore: (() => void) | null = null;
  private unsubscribeSatStore: (() => void) | null = null;

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
  }
}

export const ReportService = new ReportServiceClass();
