export interface SkyCorrelationReport {
  latitude: number;
  longitude: number;
  
  visibleMoon: boolean;
  moonAltitude: number;
  
  visiblePlanets: string[];
  visibleConstellations: string[];
  
  visibleSatellites: number;
  upcomingPasses: number;
  issVisible: boolean;
  
  bestTarget: string;
  bestDirection: string;
  
  observationQuality: string;
  skySummary: string[];
}
