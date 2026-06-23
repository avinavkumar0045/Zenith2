import { BaseLayer } from './BaseLayer';
import { GlobeService } from '../services/GlobeService';
import { CameraService } from '../services/CameraService';
import { MarkerService } from '../services/MarkerService';
import { useSatelliteStore } from '../../satellites/store/useSatelliteStore';
import * as Cesium from 'cesium';

export class SatelliteLayer extends BaseLayer {
  private dataSource: Cesium.CustomDataSource;
  private unsubscribeStore: (() => void) | null = null;
  private clickHandler: Cesium.ScreenSpaceEventHandler | null = null;

  constructor() {
    super('satellite-layer', 'Satellites');
    this.dataSource = new Cesium.CustomDataSource(this.name);
  }

  public initialize(): void {
    const viewer = GlobeService.getViewer();
    viewer.dataSources.add(this.dataSource);

    // Subscribe to Zustand store for satellite updates
    this.unsubscribeStore = useSatelliteStore.subscribe((state) => {
      if (!this.isVisible) return;
      this.syncSatellites(state.activeSatellites);
    });

    // Handle clicks specifically on satellite markers
    this.clickHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    this.clickHandler.setInputAction((click: any) => {
      const pickedObject = viewer.scene.pick(click.position);
      if (Cesium.defined(pickedObject) && pickedObject.id && pickedObject.id.id) {
        const idStr = pickedObject.id.id as string;
        if (idStr.startsWith('sat_')) {
          const { activeSatellites, setSelectedSatellite } = useSatelliteStore.getState();
          const sat = activeSatellites.find(s => s.id === idStr);
          if (sat) {
            setSelectedSatellite(sat);
            CameraService.trackEntity(idStr);
          }
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }

  private syncSatellites(satellites: any[]) {
    // A primitive sync: for production with 10k+ satellites, use PointPrimitiveCollection.
    // For Phase 2B, CustomDataSource is acceptable for a few hundred markers.
    
    // Create a Set of incoming IDs
    const incomingIds = new Set(satellites.map(s => s.id));

    // Remove entities that are no longer in the store
    const entitiesToRemove: Cesium.Entity[] = [];
    this.dataSource.entities.values.forEach(entity => {
      if (!incomingIds.has(entity.id)) {
        entitiesToRemove.push(entity);
      }
    });
    entitiesToRemove.forEach(e => this.dataSource.entities.remove(e));

    // Add or update entities
    satellites.forEach(sat => {
      let entity = this.dataSource.entities.getById(sat.id);
      const position = Cesium.Cartesian3.fromDegrees(sat.longitude, sat.latitude, sat.altitude);

      if (!entity) {
        const options = MarkerService.createSatelliteMarker({
          id: sat.id,
          name: sat.name,
          latitude: sat.latitude,
          longitude: sat.longitude,
          altitude: sat.altitude,
        });
        // We override position here because createSatelliteMarker uses static positioning 
        // but we might want it as a dynamic property eventually.
        options.position = position as any;
        this.dataSource.entities.add(options);
      } else {
        // Update position
        entity.position = position as any;
      }
    });
  }

  protected onShow(): void {
    this.dataSource.show = true;
    const state = useSatelliteStore.getState();
    this.syncSatellites(state.activeSatellites);
  }

  protected onHide(): void {
    this.dataSource.show = false;
  }

  protected onUpdate(time?: any): void {
    // Continuous dynamic updates could happen here if we mapped TLEs to Cesium's sampled properties.
    // However, for this architecture, the SatelliteService polls every 10s and updates the store.
  }

  public destroy(): void {
    if (this.unsubscribeStore) this.unsubscribeStore();
    if (this.clickHandler) this.clickHandler.destroy();
    const viewer = GlobeService.getViewer();
    viewer.dataSources.remove(this.dataSource, true);
  }
}
