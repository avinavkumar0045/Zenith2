import * as Cesium from 'cesium';
import { BaseSkyLayer } from './BaseSkyLayer';
import { ObserverLocation, HorizonTheme } from '../UserCentricView.types';
import { CelestialProjectionEngine } from '../engine/CelestialProjectionEngine';
import { CameraController } from '../services/CameraController';
import { SkySceneService } from '../services/SkySceneService';
import { SkyDomeRadiusService } from '../engine/SkyDomeRadiusService';
import { ObserverVisibilityEngine } from '../engine/ObserverVisibilityEngine';
import { AtmosphereRefractionEngine } from '../engine/AtmosphereRefractionEngine';
import { AdaptiveLabelEngine } from '../engine/AdaptiveLabelEngine';
import { HorizonLayer } from './HorizonLayer';

export class MoonLayer extends BaseSkyLayer {
  private billboard: Cesium.Billboard | null = null;
  private label: Cesium.Label | null = null;
  private billboardCollection: Cesium.BillboardCollection | null = null;
  private labelsCollection: Cesium.LabelCollection | null = null;
  
  private lastIllumination = -1;
  private lastPhase = -1;
  private moonSphereCanvas: HTMLCanvasElement | null = null;

  constructor() {
    super('moon-layer');
  }

  protected onInitialize(): void {
    if (!this.viewer) return;

    this.billboardCollection = this.viewer.scene.primitives.add(new Cesium.BillboardCollection());
    this.labelsCollection = this.viewer.scene.primitives.add(new Cesium.LabelCollection());

    const dummyPos = new Cesium.Cartesian3(0, 0, 0);

    // Initial dummy billboard, will update texture dynamically when phase changes
    if (this.billboardCollection) {
      this.billboard = this.billboardCollection.add({
        id: 'moon-billboard',
        position: dummyPos,
        width: 32,
        height: 32,
        disableDepthTestDistance: Number.POSITIVE_INFINITY
      });
    }

    if (this.labelsCollection) {
      this.label = this.labelsCollection.add({
        position: dummyPos,
        text: 'MOON',
        font: 'bold 9pt Outfit, Inter, sans-serif',
        fillColor: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
        pixelOffset: new Cesium.Cartesian3(0, -22, 0),
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        disableDepthTestDistance: Number.POSITIVE_INFINITY
      });
    }

    // Load high-resolution Moon texture asynchronously
    this.loadMoonTexture();
  }

  private loadMoonTexture(): void {
    const url = 'https://solar-system-scope.github.io/textures/download/2k_moon.jpg';
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      this.mapTextureToSphere(img);
    };
    img.onerror = () => {
      console.warn("Could not load high-res Moon texture, using fallback maria rendering.");
    };
    img.src = url;
  }

  private mapTextureToSphere(img: HTMLImageElement): void {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const r_sphere = 50; // radius of sphere inside canvas
    const cx = size / 2;
    const cy = size / 2;

    const sphereCanvas = document.createElement('canvas');
    sphereCanvas.width = size;
    sphereCanvas.height = size;
    const sCtx = sphereCanvas.getContext('2d');
    if (!sCtx) return;
    const sData = sCtx.createImageData(size, size);

    const texCanvas = document.createElement('canvas');
    texCanvas.width = img.width;
    texCanvas.height = img.height;
    const tCtx = texCanvas.getContext('2d');
    if (!tCtx) return;
    tCtx.drawImage(img, 0, 0);
    const texData = tCtx.getImageData(0, 0, img.width, img.height);

    const R = r_sphere;
    const R2 = R * R;
    const halfSize = size / 2;

    for (let y = 0; y < size; y++) {
      const dy = y - halfSize;
      for (let x = 0; x < size; x++) {
        const dx = x - halfSize;
        const dist2 = dx * dx + dy * dy;
        const idx = (y * size + x) * 4;

        if (dist2 > R2) {
          sData.data[idx + 3] = 0; // transparent
          continue;
        }

        const dz = Math.sqrt(R2 - dist2);
        const lat = Math.asin(dy / R);
        const lon = Math.atan2(dx, dz);

        const u = (lon + Math.PI) / (2 * Math.PI);
        const v = (lat + Math.PI / 2) / Math.PI;

        const tx = Math.floor(u * (img.width - 1));
        const ty = Math.floor((1.0 - v) * (img.height - 1));
        const tIdx = (ty * img.width + tx) * 4;

        // Spherical shading
        const nx = dx / R;
        const ny = -dy / R;
        const nz = dz / R;
        const lx = 0.577;
        const ly = 0.577;
        const lz = 0.577;
        const dot = Math.max(0.25, nx * lx + ny * ly + nz * lz); // ambient 0.25

        sData.data[idx] = Math.min(255, texData.data[tIdx] * (dot * 0.75 + 0.25));
        sData.data[idx + 1] = Math.min(255, texData.data[tIdx + 1] * (dot * 0.75 + 0.25));
        sData.data[idx + 2] = Math.min(255, texData.data[tIdx + 2] * (dot * 0.75 + 0.25));
        sData.data[idx + 3] = 255;
      }
    }
    sCtx.putImageData(sData, 0, 0);
    ctx.drawImage(sphereCanvas, 0, 0);

    this.moonSphereCanvas = canvas;
    // Force redraw
    this.lastIllumination = -1;
    this.lastPhase = -1;
  }

  /**
   * Generates a realistic Moon billboard texture with the correct phase shading and earthshine.
   */
  private generateMoonTexture(illumination: number, phase: number): string {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    const cx = 64;
    const cy = 64;
    const r = 58;

    // 1. Draw Earthshine - faint glow on the shadow side
    ctx.fillStyle = '#0a0b12';
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // 2. Draw lit moon sphere with craters inside a clipping mask
    ctx.save();
    
    // We will clip to the illuminated part of the Moon
    // A moon's illuminated region is bounded by the outer circular edge and the elliptical terminator.
    ctx.beginPath();
    
    // Determine which side is lit (Waxing vs Waning)
    // phase: 0 = New, 0.25 = First Quarter, 0.5 = Full, 0.75 = Third Quarter, 1 = New
    const isLeftLit = phase > 0.5; // Waning: left side is lit in northern hemisphere
    const isRightLit = phase <= 0.5; // Waxing: right side is lit

    if (illumination >= 0.98) {
      // Full Moon: just clip the full circle
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
    } else if (illumination <= 0.02) {
      // New Moon: clip nothing
      ctx.arc(cx, cy, 0, 0, 0);
    } else {
      // Draw outer circle arc for lit side
      const startAngle = isRightLit ? -Math.PI / 2 : Math.PI / 2;
      const endAngle = isRightLit ? Math.PI / 2 : -Math.PI / 2;
      ctx.arc(cx, cy, r, startAngle, endAngle);

      // Draw terminator arc (ellipse)
      // Width of the ellipse scales with illumination
      // At quarter moon, width is 0. At crescent/gibbous it curves
      const terminatorWidth = r * (2 * illumination - 1);
      
      // We draw from top pole back to bottom pole (or vice-versa)
      if (isRightLit) {
        ctx.ellipse(cx, cy, Math.abs(terminatorWidth), r, 0, Math.PI / 2, -Math.PI / 2, terminatorWidth < 0);
      } else {
        ctx.ellipse(cx, cy, Math.abs(terminatorWidth), r, 0, -Math.PI / 2, Math.PI / 2, terminatorWidth < 0);
      }
    }
    
    ctx.closePath();
    ctx.clip();

    if (this.moonSphereCanvas) {
      ctx.drawImage(this.moonSphereCanvas, cx - r, cy - r, r * 2, r * 2);
    } else {
      // Draw illuminated Moon base (cream/light gray)
      ctx.fillStyle = '#f4f6f7';
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();

      // Draw realistic maria (dark gray basaltic plains)
      ctx.fillStyle = '#ccd1d1';
      const maria = [
        { x: cx - 18, y: cy - 22, rx: 14, ry: 10, rot: -0.2 }, // Mare Imbrium
        { x: cx + 18, y: cy - 14, rx: 16, ry: 12, rot: 0.1 },  // Mare Serenitatis / Tranquillitatis
        { x: cx + 22, y: cy + 12, rx: 12, ry: 10, rot: 0.3 },  // Mare Fecunditatis
        { x: cx - 22, y: cy + 8, rx: 10, ry: 15, rot: -0.1 },  // Oceanus Procellarum bottom
        { x: cx - 8, y: cy + 28, rx: 15, ry: 8, rot: 0.0 }     // Mare Nubium
      ];
      maria.forEach(m => {
        ctx.beginPath();
        ctx.ellipse(m.x, m.y, m.rx, m.ry, m.rot, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw craters (white circles with subtle shadows)
      const craters = [
        { x: cx - 22, y: cy + 18, r: 4 }, // Tycho (with rays later)
        { x: cx - 14, y: cy - 18, r: 3 }, // Copernicus
        { x: cx - 8, y: cy - 36, r: 2.5 }, // Plato
        { x: cx + 32, y: cy - 26, r: 3 },
        { x: cx + 4, y: cy + 42, r: 2 }
      ];
      craters.forEach(c => {
        // Shadow
        ctx.fillStyle = '#99a3a4';
        ctx.beginPath();
        ctx.arc(c.x + 1, c.y + 1, c.r, 0, Math.PI * 2);
        ctx.fill();
        // Rim
        ctx.fillStyle = '#fdfefe';
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Tycho rays
      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 1.2;
      const tycho = craters[0];
      const rayAngles = [0, 0.4, 0.8, 1.2, 1.6, 2.0, 2.4, 2.8, 3.2, 3.6, 4.0, 4.4, 4.8, 5.2, 5.6, 6.0];
      rayAngles.forEach(angle => {
        ctx.beginPath();
        ctx.moveTo(tycho.x, tycho.y);
        ctx.lineTo(tycho.x + Math.cos(angle) * 35, tycho.y + Math.sin(angle) * 35);
        ctx.stroke();
      });
    }

    ctx.restore();

    // 3. Draw a subtle glowing halo representing atmosphere refraction around the Moon
    const haloGrad = ctx.createRadialGradient(cx, cy, r - 3, cx, cy, r + 6);
    haloGrad.addColorStop(0, 'rgba(255, 255, 255, 0.15)');
    haloGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.05)');
    haloGrad.addColorStop(1, 'rgba(255, 255, 255, 0.0)');
    ctx.fillStyle = haloGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r + 6, 0, Math.PI * 2);
    ctx.fill();

    return canvas.toDataURL();
  }

  protected onUpdate(
    date: Date, 
    observerLocation: ObserverLocation, 
    observerPosition: Cesium.Cartesian3
  ): void {
    if (!this.viewer || !this.billboard || !this.label) return;

    let moonData: any = null;
    try {
      const state = require('@/modules/moon/store/useMoonStore').useMoonStore.getState();
      moonData = state.moonData;
    } catch (e) {}

    let cloudCover = 0.0;
    try {
      const { weather } = require('@/modules/weather/store/useWeatherStore').useWeatherStore.getState();
      if (weather) cloudCover = (weather.cloudCover ?? 0) / 100.0;
    } catch (e) {}

    // Fetch active horizon theme
    let horizonTheme: HorizonTheme = 'mountains';
    try {
      const horizonLayer = SkySceneService.getLayer<HorizonLayer>('horizon-layer');
      if (horizonLayer) {
        horizonTheme = horizonLayer.currentTheme;
      }
    } catch (e) {}

    // Use default values if moon store is not updated or initialized
    const alt = moonData ? moonData.altitude : 45.0;
    const az = moonData ? moonData.azimuth : 180.0;
    const illumination = moonData ? moonData.illumination : 0.5; // default half moon
    const phase = moonData ? moonData.phase : 0.25; // default quarter moon

    // Check if texture needs recreation due to phase change
    if (Math.abs(this.lastIllumination - illumination) > 0.02 || Math.abs(this.lastPhase - phase) > 0.02) {
      this.lastIllumination = illumination;
      this.lastPhase = phase;
      const texture = this.generateMoonTexture(illumination, phase);
      this.billboard.image = texture;
    }

    // Apply atmospheric refraction (apparent coordinates)
    const refractedAlt = AtmosphereRefractionEngine.getRefractedAltitude(alt);

    // Project coordinates using adaptive radius (placed at baseRadius * 0.97) and refracted altitude
    const currentFov = CameraController.currentFov;
    const baseRadius = SkyDomeRadiusService.getAdaptiveRadius(currentFov);
    const moonRadius = baseRadius * 0.97;

    const globalPos = CelestialProjectionEngine.altAzToCartesian(
      refractedAlt,
      az,
      observerPosition,
      moonRadius
    );

    this.billboard.position = globalPos;
    this.label.position = globalPos;

    // Apply physical occlusion and cloud cover dimming
    const occlusion = ObserverVisibilityEngine.getOcclusionMultiplier(refractedAlt, az, horizonTheme);
    const cloudDimming = ObserverVisibilityEngine.getCloudDimmingMultiplier(cloudCover * 100.0);

    if (occlusion > 0.01 && this.isVisible) {
      this.billboard.show = true;

      // Apply physical horizon magnification (giant moon illusion)
      const scaleMult = AtmosphereRefractionEngine.getHorizonScaleMultiplier(refractedAlt);

      // Scale Moon based on camera zoom FOV and scale factor
      const zoomScale = Math.max(1.0, 60.0 / currentFov);
      const size = 30 * Math.pow(zoomScale, 0.7) * scaleMult;

      this.billboard.width = size;
      this.billboard.height = size;
      
      // Observe mode check
      let observeFade = 1.0;
      let isTarget = false;
      if (SkySceneService.isObserving) {
        isTarget = (SkySceneService as any).observedObjectId === 'moon';
        if (!isTarget) {
          observeFade = 0.15;
        }
      }

      // Apply warm orange/red color shifting near the horizon
      const baseColor = AtmosphereRefractionEngine.getRefractedColor(Cesium.Color.WHITE, refractedAlt);
      this.billboard.color = baseColor.withAlpha(cloudDimming * occlusion * observeFade);
      
      this.label.fillColor = Cesium.Color.WHITE.withAlpha(cloudDimming * occlusion * observeFade);
      this.label.pixelOffset = new Cesium.Cartesian3(0, -(size / 2 + 10), 0);
      
      const isSelected = (SkySceneService as any).selectedObjectId === 'moon';
      const isHovered = false;

      // Determine label visibility using AdaptiveLabelEngine
      const showLabelText = AdaptiveLabelEngine.shouldShowLabel(
        'moon',
        'moon',
        -12.7,
        isSelected || isTarget,
        isHovered,
        currentFov
      );

      this.label.show = showLabelText && (observeFade > 0.5 || isTarget);
    } else {
      this.billboard.show = false;
      this.label.show = false;
    }
  }

  protected onShow(): void {
    if (this.billboardCollection) this.billboardCollection.show = true;
    if (this.labelsCollection) this.labelsCollection.show = true;
  }

  protected onHide(): void {
    if (this.billboardCollection) this.billboardCollection.show = false;
    if (this.labelsCollection) this.labelsCollection.show = false;
  }

  protected onDestroy(): void {
    if (!this.viewer) return;
    if (this.billboardCollection) {
      this.viewer.scene.primitives.remove(this.billboardCollection);
      this.billboardCollection = null;
    }
    if (this.labelsCollection) {
      this.viewer.scene.primitives.remove(this.labelsCollection);
      this.labelsCollection = null;
    }
    this.billboard = null;
    this.label = null;
  }
}
