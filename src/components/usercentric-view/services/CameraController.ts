import * as Cesium from 'cesium';
import { ZoomLevel } from '../UserCentricView.types';

export class CameraControllerClass {
  private viewer: Cesium.Viewer | null = null;
  private observerPosition: Cesium.Cartesian3 | null = null;
  private isPointerDown = false;
  private lastMousePosition = { x: 0, y: 0 };
  
  // Orientation states in radians
  public heading = 0.0; // 0 = North, clockwise
  public pitch = 0.7;   // ~40° above horizon — look UP at the sky on load
  public roll = 0.0;

  // Zoom / FOV state in degrees
  public currentFov = 60.0;
  
  // Callback when camera updates (for compass, etc.)
  private onCameraChangeCallback: (() => void) | null = null;

  public initialize(
    viewer: Cesium.Viewer, 
    observerPosition: Cesium.Cartesian3,
    onCameraChange: () => void
  ) {
    this.viewer = viewer;
    this.observerPosition = observerPosition;
    this.onCameraChangeCallback = onCameraChange;

    const scene = viewer.scene;
    const canvas = scene.canvas;

    // 1. Lock camera position
    viewer.camera.setView({
      destination: observerPosition,
      orientation: {
        heading: this.heading,
        pitch: this.pitch,
        roll: this.roll
      }
    });

    // 2. Disable default camera controls
    scene.screenSpaceCameraController.enableRotate = false;
    scene.screenSpaceCameraController.enableTranslate = false;
    scene.screenSpaceCameraController.enableZoom = false;
    scene.screenSpaceCameraController.enableTilt = false;
    scene.screenSpaceCameraController.enableLook = false;

    // 3. Bind custom mouse drag handlers for rotation
    canvas.addEventListener('pointerdown', this.handlePointerDown);
    canvas.addEventListener('pointermove', this.handlePointerMove);
    canvas.addEventListener('pointerup', this.handlePointerUp);
    canvas.addEventListener('wheel', this.handleWheel, { passive: false });

    // Force initial orientation and FOV
    this.updateFov();
  }

  public destroy() {
    if (!this.viewer) return;

    const canvas = this.viewer.scene.canvas;
    canvas.removeEventListener('pointerdown', this.handlePointerDown);
    canvas.removeEventListener('pointermove', this.handlePointerMove);
    canvas.removeEventListener('pointerup', this.handlePointerUp);
    canvas.removeEventListener('wheel', this.handleWheel);

    // Restore default camera controls
    const scc = this.viewer.scene.screenSpaceCameraController;
    scc.enableRotate = true;
    scc.enableTranslate = true;
    scc.enableZoom = true;
    scc.enableTilt = true;
    scc.enableLook = true;

    this.viewer = null;
    this.observerPosition = null;
    this.onCameraChangeCallback = null;
  }

  private handlePointerDown = (e: PointerEvent) => {
    // Only drag with left click or primary touch
    if (e.button !== 0 && !e.isPrimary) return;
    this.isPointerDown = true;
    this.lastMousePosition = { x: e.clientX, y: e.clientY };
    this.viewer?.scene.canvas.setPointerCapture(e.pointerId);
  };

  private handlePointerMove = (e: PointerEvent) => {
    if (!this.isPointerDown || !this.viewer || !this.observerPosition) return;

    const deltaX = e.clientX - this.lastMousePosition.x;
    const deltaY = e.clientY - this.lastMousePosition.y;

    this.lastMousePosition = { x: e.clientX, y: e.clientY };

    // Sensitivity scales with the current field of view (zoomed in = higher sensitivity control)
    const sensitivity = 0.003 * (this.currentFov / 60.0);

    // Update heading and pitch
    this.heading += deltaX * sensitivity;
    
    // Constrain pitch to look between slightly below horizon (-10 degrees) and zenith (89 degrees)
    const minPitch = Cesium.Math.toRadians(-15);
    const maxPitch = Cesium.Math.toRadians(89);
    this.pitch = Math.max(minPitch, Math.min(maxPitch, this.pitch - deltaY * sensitivity));

    // Force camera stay locked at observerPosition but update orientation
    this.viewer.camera.setView({
      destination: this.observerPosition,
      orientation: {
        heading: this.heading,
        pitch: this.pitch,
        roll: this.roll
      }
    });

    if (this.onCameraChangeCallback) {
      this.onCameraChangeCallback();
    }
  };

  private handlePointerUp = (e: PointerEvent) => {
    if (!this.isPointerDown) return;
    this.isPointerDown = false;
    try {
      this.viewer?.scene.canvas.releasePointerCapture(e.pointerId);
    } catch (err) {}
  };

  private handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    // Scroll adjusts FOV
    const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9;
    this.currentFov = Math.max(0.1, Math.min(65.0, this.currentFov * zoomFactor));
    this.updateFov();

    if (this.onCameraChangeCallback) {
      this.onCameraChangeCallback();
    }
  };

  private updateFov() {
    if (!this.viewer) return;
    const frustum = this.viewer.camera.frustum as Cesium.PerspectiveFrustum;
    if (frustum) {
      frustum.fov = Cesium.Math.toRadians(this.currentFov);
    }
  }

  /**
   * Sets the camera orientation instantly.
   */
  public setOrientation(headingDeg: number, pitchDeg: number) {
    if (!this.viewer || !this.observerPosition) return;
    
    this.heading = Cesium.Math.toRadians(headingDeg);
    this.pitch = Cesium.Math.toRadians(pitchDeg);

    this.viewer.camera.setView({
      destination: this.observerPosition,
      orientation: {
        heading: this.heading,
        pitch: this.pitch,
        roll: this.roll
      }
    });

    if (this.onCameraChangeCallback) {
      this.onCameraChangeCallback();
    }
  }

  /**
   * Smoothly rotates the camera orientation to look at a specific Alt/Az.
   */
  public slewTo(
    headingDeg: number, 
    pitchDeg: number, 
    targetFovDeg?: number,
    durationSeconds: number = 2.0
  ): Promise<void> {
    return new Promise((resolve) => {
      if (!this.viewer || !this.observerPosition) {
        resolve();
        return;
      }

      const targetHeading = Cesium.Math.toRadians(headingDeg);
      const targetPitch = Cesium.Math.toRadians(pitchDeg);

      // Animate FOV zoom concurrently if specified
      if (targetFovDeg !== undefined) {
        const startFov = this.currentFov;
        const endFov = targetFovDeg;
        const startTime = Date.now();
        const durationMs = durationSeconds * 1000;

        const animateFov = () => {
          if (!this.viewer) return;
          const elapsed = Date.now() - startTime;
          const t = Math.min(1.0, elapsed / durationMs);
          
          // Smooth step easing
          const easeT = t * t * (3 - 2 * t);
          this.currentFov = startFov + (endFov - startFov) * easeT;
          this.updateFov();

          if (t < 1.0) {
            requestAnimationFrame(animateFov);
          }
        };
        requestAnimationFrame(animateFov);
      }

      // Smooth camera orientation transition
      this.viewer.camera.flyTo({
        destination: this.observerPosition,
        orientation: {
          heading: targetHeading,
          pitch: targetPitch,
          roll: 0.0
        },
        duration: durationSeconds,
        easingFunction: Cesium.EasingFunction.QUADRATIC_IN_OUT,
        complete: () => {
          this.heading = targetHeading;
          this.pitch = targetPitch;
          if (this.onCameraChangeCallback) {
            this.onCameraChangeCallback();
          }
          resolve();
        },
        cancel: () => {
          resolve();
        }
      });
    });
  }

  /**
   * Sets the camera FOV to match the specified ZoomLevel preset.
   */
  public setZoomPreset(level: ZoomLevel) {
    let fov = 60.0;
    switch (level) {
      case 'eye':
        fov = 60.0;
        break;
      case 'binocular':
        fov = 8.0;
        break;
      case 'telescope':
        fov = 1.0;
        break;
      case 'deepsky':
        fov = 0.3;
        break;
    }
    
    if (this.viewer) {
      this.slewTo(
        Cesium.Math.toDegrees(this.heading), 
        Cesium.Math.toDegrees(this.pitch), 
        fov, 
        1.0
      );
    } else {
      this.currentFov = fov;
    }
  }

  /**
   * Returns current heading and pitch in degrees.
   */
  public getCameraOrientationDeg() {
    let hDeg = Cesium.Math.toDegrees(this.heading) % 360;
    if (hDeg < 0) hDeg += 360;
    
    const pDeg = Cesium.Math.toDegrees(this.pitch);
    return { heading: hDeg, pitch: pDeg };
  }
}

export const CameraController = new CameraControllerClass();
