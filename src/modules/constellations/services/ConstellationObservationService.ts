export class ConstellationObservationServiceClass {
  
  public calculateScore(altitude: number, isDaylight: boolean, weatherMultiplier: number = 1.0): number {
    if (altitude <= 0) return 0; // Below horizon
    if (isDaylight) return 0; // Constellations are generally invisible during the day

    // Base score based on altitude (higher is better, less atmosphere to look through)
    // 0 deg -> 0, 90 deg -> 10
    let score = (altitude / 90) * 10;

    // Apply weather multiplier (from ObservationConditionsEngine via SkyIntelligence / WeatherStore)
    score *= weatherMultiplier;

    return Math.max(0, Math.min(10, score));
  }
}

export const ConstellationObservationService = new ConstellationObservationServiceClass();
