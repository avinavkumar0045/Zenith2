export interface UnifiedSkyReport {
  location: {
    name: string;
    dayState: 'Day' | 'Night' | 'Twilight';
  };
  observationScore: number; // 0 to 10
  bestObservationTarget: {
    name: string;
    reason: string;
  } | null;
  moonSummary: {
    phase: string;
    altitude: number;
    isVisible: boolean;
  };
  planetSummary: {
    visiblePlanets: string[];
    hiddenPlanets: string[];
  };
  issSummary: {
    nextPassTime: string | null;
    isCurrentlyVisible: boolean;
  };
  satelliteSummary: {
    activeCount: number;
    strongPassesCount: number;
  };
  recommendations: string[];
  warnings: string[];
  
  // Phase 7B - Observation Planning Integration
  observationPlan: import('./observation-planning.types').ObservationPlan | null;
  
  lastUpdated: number;
}
