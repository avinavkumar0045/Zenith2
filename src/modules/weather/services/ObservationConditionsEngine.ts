import { RawWeatherResponse } from '../providers/IWeatherProvider';
import { AstronomicalWeatherObject, WeatherQuality } from '../types/weather.types';

export class ObservationConditionsEngineClass {
  
  public evaluateConditions(latitude: number, longitude: number, raw: RawWeatherResponse): AstronomicalWeatherObject {
    let scoreMultiplier = 1.0;
    let conditionText = "Clear skies";

    // 1. Precipitation Penalty (Instant kill for astronomy)
    if (raw.isRaining || raw.isSnowing) {
      scoreMultiplier = 0.0;
      conditionText = raw.isRaining ? "Raining" : "Snowing";
      return this.buildResult(latitude, longitude, raw, 'Very Poor', conditionText, scoreMultiplier);
    }

    // 2. Cloud Cover Penalty
    if (raw.cloudCover > 90) {
      scoreMultiplier *= 0.1;
      conditionText = "Overcast";
    } else if (raw.cloudCover > 60) {
      scoreMultiplier *= 0.4;
      conditionText = "Mostly Cloudy";
    } else if (raw.cloudCover > 30) {
      scoreMultiplier *= 0.7;
      conditionText = "Partly Cloudy";
    } else if (raw.cloudCover > 10) {
      scoreMultiplier *= 0.9;
      conditionText = "Mostly Clear";
    }

    // 3. Visibility Penalty (Usually only matters if clouds are low or fog/haze is present)
    if (raw.visibilityKm < 5) {
      scoreMultiplier *= 0.3; // Fog or severe haze
      if (raw.cloudCover <= 60) conditionText = "Poor Visibility / Fog";
    } else if (raw.visibilityKm < 10) {
      scoreMultiplier *= 0.7; // Hazy
    }

    // Determine Quality Label
    let quality: WeatherQuality = 'Excellent';
    if (scoreMultiplier < 0.2) quality = 'Very Poor';
    else if (scoreMultiplier < 0.5) quality = 'Poor';
    else if (scoreMultiplier < 0.8) quality = 'Average';
    else if (scoreMultiplier < 0.95) quality = 'Good';

    return this.buildResult(latitude, longitude, raw, quality, conditionText, scoreMultiplier);
  }

  private buildResult(
    latitude: number, 
    longitude: number, 
    raw: RawWeatherResponse, 
    quality: WeatherQuality, 
    condition: string, 
    multiplier: number
  ): AstronomicalWeatherObject {
    return {
      latitude,
      longitude,
      cloudCover: raw.cloudCover,
      visibilityKm: raw.visibilityKm,
      humidity: raw.humidity,
      temperature: raw.temperature,
      isRaining: raw.isRaining,
      isSnowing: raw.isSnowing,
      observationQuality: quality,
      weatherCondition: condition,
      scoreMultiplier: multiplier,
      updatedAt: Date.now()
    };
  }
}

export const ObservationConditionsEngine = new ObservationConditionsEngineClass();
