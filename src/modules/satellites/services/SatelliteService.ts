import { CelesTrakProvider } from '../providers/CelesTrakProvider';
import { useSatelliteStore } from '../store/useSatelliteStore';
import { eventBus } from '../../location/utils/EventBus';
import { OrbitService } from './OrbitService';

class SatelliteServiceClass {
  private provider = new CelesTrakProvider();
  private updateInterval: any = null;

  constructor() {
    // Listen to location changes (from Location Intelligence Engine)
    // to trigger a potential refresh or proximity filter.
    // For now, we'll just fetch a default category when the app boots or location changes initially.
    eventBus.on('locationChanged', () => {
      const { activeSatellites } = useSatelliteStore.getState();
      if (activeSatellites.length === 0) {
        this.fetchCategory('weather');
      }
    });
  }

  public async fetchCategory(categoryId: string) {
    const store = useSatelliteStore.getState();
    store.setLoading(true);
    store.setError(null);

    try {
      const sats = await this.provider.fetchSatellites(categoryId);
      store.setSatellites(sats);
      
      this.startRealTimeUpdates();
    } catch (e) {
      store.setError("Failed to fetch satellite data");
    } finally {
      store.setLoading(false);
    }
  }

  private startRealTimeUpdates() {
    if (this.updateInterval) clearInterval(this.updateInterval);

    // Propagate all active satellites every 10 seconds
    this.updateInterval = setInterval(() => {
      const store = useSatelliteStore.getState();
      const updated = store.activeSatellites.map(sat => OrbitService.propagateSatellite(sat));
      store.setSatellites(updated);

      // If there is a selected satellite, update its instance as well
      if (store.selectedSatellite) {
        const updatedSelected = OrbitService.propagateSatellite(store.selectedSatellite);
        store.setSelectedSatellite(updatedSelected);
      }
    }, 10000);
  }
}

export const SatelliteService = new SatelliteServiceClass();
