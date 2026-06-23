export interface LocationIntelligenceObject {
  id: string; // e.g. "lat,lng" or unique place id
  name: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
  localTime: string;
  dayState: string; // e.g., 'Day', 'Night', 'Golden Hour', 'Twilight'
  sunrise: string;
  sunset: string;
  twilight: string;
  source: string; // e.g. 'Nominatim', 'Geolocation', 'Globe Click'
  timestamp: number;
}
