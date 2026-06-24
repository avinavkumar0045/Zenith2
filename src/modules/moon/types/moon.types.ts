export interface MoonIntelligenceObject {
  phase: number;
  phaseName: string;
  illumination: number; // 0 to 1
  age: number; // days since new moon (approx 0-29.53)
  altitude: number; // degrees
  azimuth: number; // degrees
  distance: number; // km
  moonrise: string | null;
  moonset: string | null;
  isVisible: boolean;
  observationScore: number; // 0 to 10
  timestamp: number;
}
