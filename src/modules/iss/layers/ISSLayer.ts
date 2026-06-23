import { BaseLayer } from '../../globe/layers/BaseLayer';
import { GlobeService } from '../../globe/services/GlobeService';
import { CameraService } from '../../globe/services/CameraService';
import { MarkerService } from '../../globe/services/MarkerService';
import { useISSStore } from '../store/useISSStore';
import { useSatelliteStore } from '../../satellites/store/useSatelliteStore';
import * as Cesium from 'cesium';

export class ISSLayer extends BaseLayer {
  private dataSource: Cesium.CustomDataSource;
  private unsubscribeStore: (() => void) | null = null;
  private clickHandler: Cesium.ScreenSpaceEventHandler | null = null;

  constructor() {
    super('iss-layer', 'International Space Station');
    this.dataSource = new Cesium.CustomDataSource(this.name);
  }

  public initialize(): void {
    const viewer = GlobeService.getViewer();
    viewer.dataSources.add(this.dataSource);

    this.unsubscribeStore = useISSStore.subscribe((state) => {
      if (!this.isVisible) return;
      this.syncISS(state.iss);
    });

    this.clickHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    this.clickHandler.setInputAction((click: any) => {
      const pickedObject = viewer.scene.pick(click.position);
      if (Cesium.defined(pickedObject) && pickedObject.id && pickedObject.id.id) {
        const idStr = pickedObject.id.id as string;
        if (idStr === 'sat_25544') { // ISS NORAD ID
          const { iss, setIsTracking } = useISSStore.getState();
          if (iss) {
            CameraService.trackEntity(idStr);
            setIsTracking(true);
            
            // Feature 5: ISS Orbit Integration - trigger OrbitLayer natively
            useSatelliteStore.getState().setSelectedSatellite(iss);
          }
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }


  private syncISS(iss: any) {
    if (!iss) return;

    let entity = this.dataSource.entities.getById(iss.id);
    const position = Cesium.Cartesian3.fromDegrees(iss.longitude, iss.latitude, iss.altitude);

    if (!entity) {
      const options = MarkerService.createGenericMarker({
        id: iss.id,
        name: 'ISS',
        latitude: iss.latitude,
        longitude: iss.longitude,
        altitude: iss.altitude,
        color: '#0ea5e9', // Premium distinct blue
        size: 14 // Larger marker
      });
      options.position = position as any;
      this.dataSource.entities.add(options);
    } else {
      entity.position = position as any;
    }
  }

  protected onShow(): void {
    this.dataSource.show = true;
    const state = useISSStore.getState();
    this.syncISS(state.iss);
  }

  protected onHide(): void {
    this.dataSource.show = false;
  }

  protected onUpdate(time?: any): void {
  }

  public destroy(): void {
    if (this.unsubscribeStore) this.unsubscribeStore();
    if (this.clickHandler) this.clickHandler.destroy();
    const viewer = GlobeService.getViewer();
    viewer.dataSources.remove(this.dataSource, true);
  }
}
