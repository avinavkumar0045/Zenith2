import { useWeatherStore } from '@/modules/weather/store/useWeatherStore';

export class PredictionEngine {
  /**
   * Resolves prediction confidence based on the selected simulated time offset and cloud factors.
   * High: < 3 hours from now.
   * Moderate: 3 to 12 hours from now.
   * Low: > 12 hours from now (or if cloud cover is high).
   */
  public static getConfidenceLevel(selectedTime: Date, currentTime: Date): 'High' | 'Moderate' | 'Low' {
    const diffMs = Math.abs(selectedTime.getTime() - currentTime.getTime());
    const diffHours = diffMs / 3600000;

    let confidence: 'High' | 'Moderate' | 'Low' = 'High';
    
    if (diffHours < 3.0) {
      confidence = 'High';
    } else if (diffHours < 12.0) {
      confidence = 'Moderate';
    } else {
      confidence = 'Low';
    }

    // Weather forecast uncertainty penalty: if sky is cloudy, confidence degrades by one step
    const weather = useWeatherStore.getState().weather;
    if (weather && weather.cloudCover > 55) {
      if (confidence === 'High') confidence = 'Moderate';
      else if (confidence === 'Moderate') confidence = 'Low';
    }

    return confidence;
  }
}
