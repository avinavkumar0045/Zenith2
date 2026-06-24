export interface RawWeatherResponse {
  cloudCover: number;
  visibilityKm: number;
  humidity: number;
  temperature: number;
  isRaining: boolean;
  isSnowing: boolean;
}

export interface IWeatherProvider {
  fetchCurrentWeather(latitude: number, longitude: number): Promise<RawWeatherResponse>;
}
