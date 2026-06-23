export interface CelestialReportObject {
  locationName: string;
  dayState: string;
  satellitesOverheadCount: number;
  issNextPassTime: string | null;
  bestElevation: number | null;
  observationScore: number; // 0 to 10
  observationQuality: string; // "Excellent", "Good", "Average", "Poor"
  recommendations: string[];
  timestamp: number;
}
