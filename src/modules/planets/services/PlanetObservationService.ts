export class PlanetObservationServiceClass {
  public calculateScore(planetId: string, altitude: number, isVisible: boolean): number {
    if (!isVisible || altitude < 0) return 0;
    
    // Intrinsic brightness proxies (max score multiplier)
    const brightnessMap: Record<string, number> = {
      venus: 10,
      jupiter: 9,
      mars: 8,
      saturn: 7,
      mercury: 6
    };
    
    const intrinsicScore = brightnessMap[planetId] || 5;
    
    // Altitude penalty (lower altitude = more atmospheric distortion)
    let altFactor = 1.0;
    if (altitude < 10) altFactor = 0.3;
    else if (altitude < 20) altFactor = 0.6;
    else if (altitude < 30) altFactor = 0.8;
    else if (altitude > 60) altFactor = 1.0;
    
    const score = Math.round(intrinsicScore * altFactor);
    return Math.max(0, Math.min(10, score));
  }
}

export const PlanetObservationService = new PlanetObservationServiceClass();
