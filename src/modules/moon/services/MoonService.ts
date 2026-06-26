import { eventBus } from '../../location/utils/EventBus';
import { useLocationStore } from '../../location/store/useLocationStore';
import { useMoonStore } from '../store/useMoonStore';
import { MoonCalculationService } from './MoonCalculationService';

class MoonServiceClass {
  public initialize() {
    eventBus.on('locationChanged', () => {
      this.updateMoonData();
    });
    
    // Initial fetch if location is already set
    if (useLocationStore.getState().activeLocation) {
      this.updateMoonData();
    }
  }

  public updateMoonData(date: Date = new Date()) {
    const { activeLocation } = useLocationStore.getState();
    if (!activeLocation) {
      useMoonStore.getState().setMoonData(null);
      return;
    }

    useMoonStore.getState().setLoading(true);
    
    try {
      const data = MoonCalculationService.calculateMoonData(activeLocation, date);
      useMoonStore.getState().setMoonData(data);
      eventBus.emit('moonUpdated', data);
    } catch (error) {
      console.error("Failed to calculate moon data", error);
    } finally {
      useMoonStore.getState().setLoading(false);
    }
  }

  public destroy() {
    eventBus.off('locationChanged');
  }
}

export const MoonService = new MoonServiceClass();
