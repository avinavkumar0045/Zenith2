export interface ObserverObject {
  latitude: number;
  longitude: number;
  altitude: number; // in meters (usually assume 0 or derived from location if available)
  timezone: string;
}

export type PassQuality = 'Excellent' | 'Good' | 'Average' | 'Poor';

export interface PassPredictionObject {
  passId: string;
  satelliteId: string;
  satelliteName: string;

  startTime: string; // ISO string
  peakTime: string;  // ISO string
  endTime: string;   // ISO string

  maxElevation: number; // degrees
  
  observerLatitude: number;
  observerLongitude: number;

  durationSeconds: number;

  visible: boolean; // Based on sun/twilight

  passQuality: PassQuality;

  timestamp: number; // Calculation time
}
