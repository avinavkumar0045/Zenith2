export interface SatelliteObject {
  id: string;
  noradId: number;
  name: string;
  category: string;
  latitude: number;
  longitude: number;
  altitude: number;
  velocity: number;
  inclination: number;
  source: string;
  timestamp: number;
  tleLine1?: string;
  tleLine2?: string;
}

export interface SatelliteCategory {
  id: string;
  name: string;
}
