export type PlanetId = 'mercury' | 'venus' | 'mars' | 'jupiter' | 'saturn';

export interface PlanetIntelligenceObject {
  id: PlanetId;
  name: string;
  visible: boolean;
  altitude: number;
  azimuth: number;
  riseTime: string | null;
  setTime: string | null;
  distance: number; // in Astronomical Units (AU) or km, let's use AU
  observationScore: number; // 0-10
  isAboveHorizon: boolean;
  
  // Coordinates for Sub-Planet Point
  subPlanetLatitude: number;
  subPlanetLongitude: number;
  
  lastUpdated: number;
}
