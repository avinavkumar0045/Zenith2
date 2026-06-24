import { IWeatherProvider, RawWeatherResponse } from './IWeatherProvider';

export class OpenMeteoProvider implements IWeatherProvider {
  private readonly BASE_URL = 'https://api.open-meteo.com/v1/forecast';

  public async fetchCurrentWeather(latitude: number, longitude: number): Promise<RawWeatherResponse> {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      current: 'temperature_2m,relative_humidity_2m,precipitation,rain,showers,snowfall,cloud_cover,visibility',
      timezone: 'auto'
    });

    const response = await fetch(`${this.BASE_URL}?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`OpenMeteo API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const current = data.current;

    const isRaining = (current.rain > 0) || (current.showers > 0) || (current.precipitation > 0 && current.snowfall === 0);
    const isSnowing = current.snowfall > 0;

    return {
      temperature: current.temperature_2m,
      humidity: current.relative_humidity_2m,
      cloudCover: current.cloud_cover,
      visibilityKm: current.visibility ? current.visibility / 1000 : 20, // open-meteo returns meters, default to 20km if missing
      isRaining,
      isSnowing
    };
  }
}
