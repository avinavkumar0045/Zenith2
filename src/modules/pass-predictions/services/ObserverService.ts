import { LocationIntelligenceObject } from '../../location/types/location.types';
import { ObserverObject } from '../types/pass.types';

class ObserverServiceClass {
  public createObserver(location: LocationIntelligenceObject): ObserverObject {
    return {
      latitude: location.latitude,
      longitude: location.longitude,
      altitude: 0, // Simplified to sea level for now
      timezone: location.timezone,
    };
  }
}

export const ObserverService = new ObserverServiceClass();
