export type WeatherQuality = 'Excellent' | 'Good' | 'Average' | 'Poor' | 'Very Poor';

export interface AstronomicalWeatherObject {
  latitude: number;
  longitude: number;

  cloudCover: number; // percentage
  visibilityKm: number; // km
  humidity: number; // percentage
  temperature: number; // Celsius

  isRaining: boolean;
  isSnowing: boolean;

  observationQuality: WeatherQuality;
  weatherCondition: string; // Human readable
  scoreMultiplier: number; // 0.0 to 1.0

  updatedAt: number;
}
