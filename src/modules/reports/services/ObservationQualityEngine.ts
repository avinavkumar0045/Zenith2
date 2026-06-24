import { ObservationQuality } from '../types/observation-planning.types';

export class ObservationQualityEngineClass {
  public determineQuality(altitude: number, isDaylight: boolean, isVisible: boolean = true): ObservationQuality {
    if (!isVisible || altitude <= 0) return 'Hidden';

    if (isDaylight) {
      if (altitude > 40) return 'Average';
      return 'Poor';
    }

    if (altitude > 60) return 'Excellent';
    if (altitude >= 40) return 'Good';
    if (altitude >= 20) return 'Average';
    if (altitude >= 10) return 'Poor';
    
    return 'Hidden';
  }
}

export const ObservationQualityEngine = new ObservationQualityEngineClass();
