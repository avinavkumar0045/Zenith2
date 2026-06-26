import * as Cesium from 'cesium';
import { ObserverLocation } from '../UserCentricView.types';
import { SkySceneService } from '../services/SkySceneService';
import { CameraController } from '../services/CameraController';

export class SkyRenderer {
  private viewer: Cesium.Viewer | null = null;
  private preUpdateListener: (() => void) | null = null;

  public initialize(
    container: HTMLDivElement, 
    observerLocation: ObserverLocation,
    onCameraChange: () => void
  ): Cesium.Viewer {
    // Set Cesium base URL
    (window as any).CESIUM_BASE_URL = '/cesium';

    // 1. Initialize viewer with minimal widgets (isolated cinematic planetarium)
    this.viewer = new Cesium.Viewer(container, {
      animation: false,
      baseLayerPicker: false,
      fullscreenButton: false,
      geocoder: false,
      homeButton: false,
      infoBox: false,
      sceneModePicker: false,
      selectionIndicator: false,
      timeline: false,
      navigationHelpButton: false,
      navigationInstructionsInitiallyVisible: false,
      scene3DOnly: true,
      // We want high quality sky rendering without Earth globe textures interfering
      globe: new Cesium.Globe() 
    });

    // Clean up credits for clean cinematic look
    const credits = this.viewer.bottomContainer as HTMLElement;
    if (credits) {
      credits.style.display = 'none';
    }

    // Configure globe rendering:
    // We disable default earth lighting and make globe atmospheric properties blend seamlessly.
    const scene = this.viewer.scene;
    scene.globe.show = false; // Hide the Earth sphere completely so it doesn't clip our custom dome!
    scene.globe.enableLighting = false;
    scene.globe.showGroundAtmosphere = false;
    if (scene.skyAtmosphere) {
      scene.skyAtmosphere.show = false; // We render our own premium atmospheric scattering dome!
    }
    
    // Set background to absolute dark space
    scene.backgroundColor = Cesium.Color.BLACK;
    
    // We use observer Cartesian coordinates for camera lock
    const observerCartesian = Cesium.Cartesian3.fromDegrees(
      observerLocation.longitude,
      observerLocation.latitude,
      observerLocation.altitude || 10.0
    );

    // 2. Initialize CameraController
    CameraController.initialize(this.viewer, observerCartesian, onCameraChange);

    // 3. Initialize SkySceneService
    SkySceneService.initialize(this.viewer, observerLocation);

    // 4. Hook update tick to Cesium preUpdate event
    this.preUpdateListener = scene.preUpdate.addEventListener(() => {
      if (!this.viewer) return;
      
      // Fetch selected date dynamically from useTimeStore to support timelapsing
      let selectedTime = new Date();
      try {
        const timeStore = require('@/components/workspaces/time-intelligence/types').useTimeStore.getState();
        selectedTime = timeStore.selectedTime || new Date();
      } catch (e) {}

      // Update all planetarium layers
      SkySceneService.update(selectedTime, observerLocation);
    });

    // 5. Force camera frustum near/far clipping planes on preRender
    // This prevents Cesium from dynamically shrinking the frustum and clipping our sky dome
    const preRenderListener = scene.preRender.addEventListener(() => {
      // Force canvas resize to match actual container bounds (fixes 300x150 default startup size)
      this.viewer?.resize();

      const frustum = scene.camera.frustum as Cesium.PerspectiveFrustum;
      if (frustum) {
        frustum.near = 1.0;
        frustum.far = 10000000.0; // 10,000 km, large enough to contain all sky elements!
      }
    });
    (this as any)._preRenderListener = preRenderListener;

    return this.viewer;
  }

  public destroy() {
    if (this.preUpdateListener) {
      this.preUpdateListener();
      this.preUpdateListener = null;
    }

    if ((this as any)._preRenderListener) {
      (this as any)._preRenderListener();
      (this as any)._preRenderListener = null;
    }
    
    CameraController.destroy();
    SkySceneService.destroy();

    if (this.viewer) {
      this.viewer.destroy();
      this.viewer = null;
    }
  }
}
