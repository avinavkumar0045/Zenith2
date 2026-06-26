import { CameraMode } from '../Visualization.types';
import { GlobeService } from '@/modules/globe/services/GlobeService';
import { useLocationStore } from '@/modules/location/store/useLocationStore';
import { useSatelliteStore } from '@/modules/satellites/store/useSatelliteStore';
import { usePlanetStore } from '@/modules/planets/store/usePlanetStore';

export class CameraEngine {
  /**
   * Updates the Cesium camera mode based on state.
   */
  public static setCameraMode(mode: CameraMode, selectedTrackEntityId: string | null) {
    try {
      const viewer = GlobeService.getViewer();
      if (!viewer) return;

      // 1. If mode is "free", stop tracking
      if (mode === 'free') {
        viewer.trackedEntity = undefined;
        return;
      }

      // 2. Resolve tracking target
      let targetEntityId: string | null = null;

      if (mode === 'earth-lock') {
        const activeLocation = useLocationStore.getState().activeLocation;
        if (activeLocation) {
          // Look for the location beacon or mark entity ID
          targetEntityId = `loc_${activeLocation.id}`;
        }
      } else if (mode === 'follow-iss') {
        targetEntityId = 'sat_25544'; // ISS NORAD ID
      } else if (mode === 'track-moon') {
        targetEntityId = 'moon-ground-position';
      } else if (mode === 'track-selected') {
        if (selectedTrackEntityId) {
          targetEntityId = selectedTrackEntityId;
        } else {
          // Fallback to active stores
          const selectedSat = useSatelliteStore.getState().selectedSatellite;
          const selectedPlanet = usePlanetStore.getState().selectedPlanet;
          
          if (selectedSat) {
            targetEntityId = selectedSat.id;
          } else if (selectedPlanet) {
            targetEntityId = `planet-ground-${selectedPlanet}`;
          }
        }
      }

      // 3. Apply tracking in Cesium
      if (targetEntityId) {
        // Attempt to find the entity in the viewer
        let entity = viewer.entities.getById(targetEntityId);
        
        if (!entity) {
          // Search in data sources (e.g. SatelliteLayer or ISSLayer custom data sources)
          for (let i = 0; i < viewer.dataSources.length; i++) {
            const ds = viewer.dataSources.get(i);
            const found = ds.entities.getById(targetEntityId);
            if (found) {
              entity = found;
              break;
            }
          }
        }

        if (entity) {
          viewer.trackedEntity = entity;
        } else {
          // If entity not loaded yet, reset trackedEntity to avoid stale locks
          viewer.trackedEntity = undefined;
        }
      } else {
        viewer.trackedEntity = undefined;
      }
    } catch (e) {
      // GlobeService or viewer is not initialized yet (e.g., SSR or initial load)
    }
  }
}
