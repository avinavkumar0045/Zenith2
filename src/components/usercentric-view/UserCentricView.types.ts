export type ZoomLevel = 'eye' | 'binocular' | 'telescope' | 'deepsky';
export type HorizonTheme = 'mountains' | 'forest' | 'city' | 'ocean' | 'desert';

export interface ObserverLocation {
  latitude: number;
  longitude: number;
  altitude: number;
}

export interface SkyObject {
  id: string;
  name: string;
  type: 'star' | 'planet' | 'moon' | 'satellite' | 'deepsky';
  ra: number; // Right Ascension in hours (0 to 24)
  dec: number; // Declination in degrees (-90 to +90)
  magnitude?: number;
  color?: string; // Hex or CSS color string
  description?: string;
  altitude?: number; // Calculated Altitude in degrees
  azimuth?: number; // Calculated Azimuth in degrees
  visible?: boolean;
}

export interface SatellitePosition {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  altitude: number; // height in km
}
