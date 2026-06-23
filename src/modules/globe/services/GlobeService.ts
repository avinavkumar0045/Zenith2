import * as Cesium from 'cesium';
import { eventBus } from '../../location/utils/EventBus';

class GlobeServiceClass {
  private viewer: Cesium.Viewer | null = null;
  private isInitialized = false;
  private clickHandler: Cesium.ScreenSpaceEventHandler | null = null;

  public initialize(viewerInstance: Cesium.Viewer) {
    if (this.isInitialized) return;
    this.viewer = viewerInstance;
    this.isInitialized = true;

    // Register click event handler
    this.clickHandler = new Cesium.ScreenSpaceEventHandler(this.viewer.scene.canvas);
    this.clickHandler.setInputAction((click: any) => {
      const earthPosition = this.viewer!.camera.pickEllipsoid(click.position, this.viewer!.scene.globe.ellipsoid);
      if (earthPosition) {
        const cartographic = Cesium.Cartographic.fromCartesian(earthPosition);
        const longitude = Cesium.Math.toDegrees(cartographic.longitude);
        const latitude = Cesium.Math.toDegrees(cartographic.latitude);
        eventBus.emit('globeClicked', { latitude, longitude });
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);
  }

  public getViewer(): Cesium.Viewer {
    if (!this.viewer) {
      throw new Error("GlobeService is not initialized with a Viewer yet.");
    }
    return this.viewer;
  }

  public enableLighting(enable: boolean) {
    if (this.viewer) {
      this.viewer.scene.globe.enableLighting = enable;
    }
  }

  public destroy() {
    if (this.clickHandler) {
      this.clickHandler.destroy();
      this.clickHandler = null;
    }
    this.viewer = null;
    this.isInitialized = false;
  }
}

export const GlobeService = new GlobeServiceClass();
