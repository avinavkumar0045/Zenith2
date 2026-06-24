import * as satellite from 'satellite.js';
import { useLocationStore } from '../../location/store/useLocationStore';
import { useSatelliteStore } from '../../satellites/store/useSatelliteStore';
import { usePassStore } from '../store/usePassStore';
import { eventBus } from '../../location/utils/EventBus';
import { ObserverService } from './ObserverService';
import { VisibilityService } from './VisibilityService';
import { PassPredictionObject, ObserverObject } from '../types/pass.types';
import { SatelliteObject } from '../../satellites/types/satellite.types';

class PassPredictionServiceClass {
  private cache: Map<string, PassPredictionObject[]> = new Map();
  private unsubscribe: (() => void) | null = null;

  public initialize() {
    // 1. Listen to location changes via EventBus
    eventBus.on('locationChanged', () => {
      this.recalculate();
    });

    // 2. Listen to satellite selection changes
    this.unsubscribe = useSatelliteStore.subscribe((state, prevState) => {
      if (state.selectedSatellite?.id !== prevState.selectedSatellite?.id) {
        this.recalculate();
      }
    });
  }

  private async recalculate() {
    const { activeLocation } = useLocationStore.getState();
    const { selectedSatellite } = useSatelliteStore.getState();

    if (!activeLocation || !selectedSatellite || !selectedSatellite.tleLine1 || !selectedSatellite.tleLine2) {
      usePassStore.getState().setPasses([]);
      return;
    }

    usePassStore.getState().setLoading(true);

    // Yield to main thread briefly for UI responsiveness
    await new Promise(resolve => setTimeout(resolve, 50));

    const observer = ObserverService.createObserver(activeLocation);
    const cacheKey = `${activeLocation.id}_${selectedSatellite.id}`;

    if (this.cache.has(cacheKey)) {
      usePassStore.getState().setPasses(this.cache.get(cacheKey)!);
      usePassStore.getState().setLoading(false);
      return;
    }

    const passes = this.calculatePasses(observer, selectedSatellite);
    this.cache.set(cacheKey, passes);
    
    usePassStore.getState().setPasses(passes);
    usePassStore.getState().setLoading(false);
  }

  private calculatePasses(observer: ObserverObject, sat: SatelliteObject): PassPredictionObject[] {
    const passes: PassPredictionObject[] = [];
    const satrec = satellite.twoline2satrec(sat.tleLine1!, sat.tleLine2!);

    const observerGd = {
      longitude: satellite.degreesToRadians(observer.longitude),
      latitude: satellite.degreesToRadians(observer.latitude),
      height: observer.altitude / 1000 // satellite.js expects km
    };

    const now = new Date();
    const endTime = new Date(now.getTime() + 24 * 60 * 60 * 1000); // Next 24 hours
    
    let isPassing = false;
    let currentPass: Partial<PassPredictionObject> | null = null;
    let maxElev = 0;
    let peakTime = now;

    // 1 minute steps
    const stepMs = 60 * 1000;

    for (let time = now.getTime(); time <= endTime.getTime(); time += stepMs) {
      const date = new Date(time);
      const pv = satellite.propagate(satrec, date);
      
      if (!pv.position || typeof pv.position === 'boolean') continue;

      const gmst = satellite.gstime(date);
      const positionEcf = satellite.eciToEcf(pv.position, gmst);
      // @ts-ignore: @types/satellite.js defines ecfToLookAngle but runtime exports ecfToLookAngles
      const lookAngles = satellite.ecfToLookAngles(observerGd, positionEcf);

      
      const elevation = satellite.radiansToDegrees(lookAngles.elevation);

      if (elevation > 0) {
        if (!isPassing) {
          // Start of pass
          isPassing = true;
          maxElev = elevation;
          peakTime = date;
          currentPass = {
            passId: `${sat.id}_${time}`,
            satelliteId: sat.id,
            satelliteName: sat.name,
            startTime: date.toISOString(),
            observerLatitude: observer.latitude,
            observerLongitude: observer.longitude,
          };
        } else {
          if (elevation > maxElev) {
            maxElev = elevation;
            peakTime = date;
          }
        }
      } else {
        if (isPassing && currentPass) {
          // End of pass
          isPassing = false;
          const startMs = new Date(currentPass.startTime!).getTime();
          const duration = Math.round((date.getTime() - startMs) / 1000);
          
          if (duration > 60) { // Filter out phantom passes < 1 min
            passes.push({
              ...currentPass,
              peakTime: peakTime.toISOString(),
              endTime: date.toISOString(),
              maxElevation: maxElev,
              durationSeconds: duration,
              visible: VisibilityService.isVisible(maxElev),
              passQuality: VisibilityService.calculatePassQuality(maxElev),
              timestamp: Date.now()
            } as PassPredictionObject);
          }
          currentPass = null;
          
          // Optimization: If we found 5 passes, we can break early
          if (passes.length >= 5) break;
        }
      }
    }

    return passes;
  }

  public destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}

export const PassPredictionService = new PassPredictionServiceClass();
