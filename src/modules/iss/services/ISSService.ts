import { ISSTelemetryService } from './ISSTelemetryService';
import { useISSStore } from '../store/useISSStore';
import { OrbitService } from '../../satellites/services/OrbitService';
import { eventBus } from '../../location/utils/EventBus';
import { ISSObject } from '../types/iss.types';

class ISSServiceClass {
  private updateInterval: any = null;

  constructor() {
    eventBus.on('locationChanged', () => {
      // Could trigger proximity calculations here
    });
  }

  public async initialize() {
    const store = useISSStore.getState();
    store.setLoading(true);
    store.setError(null);

    const iss = await ISSTelemetryService.fetchISSTelemetry();
    
    if (iss) {
      store.setISS(iss);
      this.startRealTimeUpdates();
    } else {
      store.setError("Failed to locate ISS telemetry data.");
    }
    
    store.setLoading(false);
  }

  private startRealTimeUpdates() {
    if (this.updateInterval) clearInterval(this.updateInterval);

    // Propagate the ISS every 1 second for smoother visualization compared to standard satellites
    this.updateInterval = setInterval(() => {
      const store = useISSStore.getState();
      if (store.iss) {
        // We cast back because OrbitService.propagateSatellite returns a standard SatelliteObject
        const updated = OrbitService.propagateSatellite(store.iss) as ISSObject;
        // Restore crewCount which isn't in SatelliteObject
        updated.crewCount = store.iss.crewCount;
        
        store.setISS(updated);
      }
    }, 1000);
  }
}

export const ISSService = new ISSServiceClass();
