export class MoonObservationServiceClass {
  public calculateScore(altitude: number, illumination: number, isVisible: boolean, dayState: string): number {
    if (!isVisible || altitude < 0) return 0;
    
    let score = 0;
    
    // Altitude factor: Best between 30 and 90 degrees
    if (altitude >= 30) {
      score += 5;
    } else if (altitude >= 10) {
      score += 3;
    } else {
      score += 1;
    }
    
    // Illumination factor
    if (illumination >= 0.5) {
      score += 3;
    } else if (illumination >= 0.1) {
      score += 2;
    } else {
      score += 1; // New moon or very thin crescent
    }
    
    // Night conditions
    if (dayState === 'Night' || dayState === 'Dusk' || dayState === 'Dawn') {
      score += 2;
    } else if (dayState === 'Golden Hour') {
      score += 1;
    }
    
    return Math.min(10, Math.max(0, score));
  }
}

export const MoonObservationService = new MoonObservationServiceClass();
