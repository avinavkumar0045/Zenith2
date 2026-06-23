import * as Cesium from 'cesium';
import { GlobeService } from './GlobeService';

class CameraServiceClass {
  /**
   * Focuses the camera on a specific geospatial location.
   */
  public focusLocation(longitude: number, latitude: number, altitude: number = 2000000.0) {
    const viewer = GlobeService.getViewer();
    viewer.camera.flyTo({
      destination: Cesium.Cartesian3.fromDegrees(longitude, latitude, altitude),
      duration: 2.0,
      easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT,
    });
  }

  /**
   * Tracks a dynamic entity, such as a satellite or the ISS.
   */
  public trackEntity(entityId: string) {
    const viewer = GlobeService.getViewer();
    const entity = viewer.entities.getById(entityId);
    if (entity) {
      viewer.trackedEntity = entity;
    }
  }

  /**
   * Stops tracking the current entity.
   */
  public stopTracking() {
    const viewer = GlobeService.getViewer();
    viewer.trackedEntity = undefined;
  }

  /**
   * Resets the view to the default Earth overview.
   */
  public resetView() {
    this.stopTracking();
    this.focusLocation(0.0, 20.0, 20000000.0);
  }
}

export const CameraService = new CameraServiceClass();
