import { PassQuality } from '../types/pass.types';

class VisibilityServiceClass {
  /**
   * Calculates a simplified pass quality based on max elevation.
   * Future expansion can integrate exact sun phase (day/night/twilight) for 'visible' calculations.
   */
  public calculatePassQuality(maxElevation: number): PassQuality {
    if (maxElevation >= 60) return 'Excellent';
    if (maxElevation >= 30) return 'Good';
    if (maxElevation >= 15) return 'Average';
    return 'Poor';
  }

  /**
   * Simplified visibility logic. True if max elevation > 10.
   * Can be integrated with suncalc later to verify dark sky / illuminated satellite.
   */
  public isVisible(maxElevation: number): boolean {
    return maxElevation >= 10;
  }
}

export const VisibilityService = new VisibilityServiceClass();
