export interface ConstellationObject {
  id: string;
  name: string;
  abbreviation: string;
  rightAscension: number; // Decimal hours
  declination: number; // Degrees
  
  altitude: number; // Degrees
  azimuth: number; // Degrees
  
  visibilityScore: number; // 0-10
  isVisible: boolean;
  isNearZenith: boolean;
  
  recommended: boolean;
  description: string;
}
