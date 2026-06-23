export interface OrbitPoint {
  latitude: number;
  longitude: number;
  altitude: number;
  timestamp: number;
}

export interface OrbitIntelligenceObject {
  satelliteId: string;
  category: string;
  pastOrbitPoints: OrbitPoint[];
  futureOrbitPoints: OrbitPoint[];
  groundTrackPoints: OrbitPoint[];
  periodMinutes: number;
  inclination: number;
  altitude: number;
  velocity: number;
  lastUpdated: number;
}
