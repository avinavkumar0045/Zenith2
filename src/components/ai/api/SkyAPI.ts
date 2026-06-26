import { useLocationStore } from '@/modules/location/store/useLocationStore';
import { useSkyIntelligenceStore } from '@/modules/reports/store/useSkyIntelligenceStore';
import { useObservationPlanningStore } from '@/modules/reports/store/useObservationPlanningStore';
import { useWeatherStore } from '@/modules/weather/store/useWeatherStore';

export class SkyAPI {
  public static getActiveLocation() {
    return useLocationStore.getState().activeLocation;
  }

  public static getWeather() {
    const weather = useWeatherStore.getState().weather;
    return weather ? {
      condition: weather.weatherCondition,
      cloudCover: weather.cloudCover,
      temperature: weather.temperature,
      scoreMultiplier: weather.scoreMultiplier
    } : null;
  }

  public static getReport() {
    return useSkyIntelligenceStore.getState().report;
  }

  public static getPlan() {
    return useObservationPlanningStore.getState().plan;
  }

  public static getSkyScore(): number {
    return this.getReport()?.observationScore ?? 50;
  }

  public static getBestTarget() {
    return this.getReport()?.bestObservationTarget ?? null;
  }

  public static getRecommendations() {
    return this.getReport()?.recommendations ?? [];
  }

  public static getWarnings() {
    return this.getReport()?.warnings ?? [];
  }
}
