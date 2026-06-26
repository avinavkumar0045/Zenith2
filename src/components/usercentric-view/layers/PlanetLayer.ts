import * as Cesium from 'cesium';
import { BaseSkyLayer } from './BaseSkyLayer';
import { ObserverLocation, HorizonTheme } from '../UserCentricView.types';
import { CelestialProjectionEngine } from '../engine/CelestialProjectionEngine';
import { CameraController } from '../services/CameraController';
import { SkyDomeRadiusService } from '../engine/SkyDomeRadiusService';
import { ObserverVisibilityEngine } from '../engine/ObserverVisibilityEngine';
import { AtmosphereRefractionEngine } from '../engine/AtmosphereRefractionEngine';
import { AdaptiveLabelEngine } from '../engine/AdaptiveLabelEngine';
import { SkySceneService } from '../services/SkySceneService';
import { HorizonLayer } from './HorizonLayer';

export class PlanetLayer extends BaseSkyLayer {
  private billboardCollection: Cesium.BillboardCollection | null = null;
  private labelsCollection: Cesium.LabelCollection | null = null;
  private planetBillboards: Map<string, Cesium.Billboard> = new Map();
  private planetLabels: Map<string, Cesium.Label> = new Map();
  private textures: Record<string, string> = {};

  constructor() {
    super('planet-layer');
  }

  protected onInitialize(): void {
    if (!this.viewer) return;

    this.billboardCollection = this.viewer.scene.primitives.add(new Cesium.BillboardCollection());
    this.labelsCollection = this.viewer.scene.primitives.add(new Cesium.LabelCollection());

    // Generate procedural planet textures
    this.generatePlanetTextures();

    // Setup initial billboards and labels
    this.createPlanetBillboards();

    // Load high-resolution textures asynchronously
    this.loadHighResTextures();
  }

  private generatePlanetTextures(): void {
    // 1. Mercury (Gray, cratered)
    const merCanvas = document.createElement('canvas');
    merCanvas.width = 64;
    merCanvas.height = 64;
    const merCtx = merCanvas.getContext('2d');
    if (merCtx) {
      merCtx.fillStyle = '#8a8a8a';
      merCtx.beginPath();
      merCtx.arc(32, 32, 28, 0, Math.PI * 2);
      merCtx.fill();
      // Draw craters
      merCtx.fillStyle = '#6e6e6e';
      const craters = [[18, 25, 4], [40, 20, 5], [25, 45, 6], [45, 42, 3], [32, 32, 5]];
      craters.forEach(([x, y, r]) => {
        merCtx.beginPath();
        merCtx.arc(x, y, r, 0, Math.PI * 2);
        merCtx.fill();
        // Subtle white rim
        merCtx.strokeStyle = 'rgba(255,255,255,0.2)';
        merCtx.lineWidth = 1;
        merCtx.stroke();
      });
    }
    this.textures['mercury'] = merCanvas.toDataURL();

    // 2. Venus (Bright white/yellowish, cloud-covered, glowing)
    const venCanvas = document.createElement('canvas');
    venCanvas.width = 64;
    venCanvas.height = 64;
    const venCtx = venCanvas.getContext('2d');
    if (venCtx) {
      // Glow
      const grad = venCtx.createRadialGradient(32, 32, 12, 32, 32, 32);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, '#fcf3cf');
      grad.addColorStop(0.7, 'rgba(253, 242, 233, 0.4)');
      grad.addColorStop(1, 'rgba(253, 242, 233, 0.0)');
      venCtx.fillStyle = grad;
      venCtx.fillRect(0, 0, 64, 64);
      
      // Core sphere
      venCtx.fillStyle = '#f9e79f';
      venCtx.beginPath();
      venCtx.arc(32, 32, 20, 0, Math.PI * 2);
      venCtx.fill();
    }
    this.textures['venus'] = venCanvas.toDataURL();

    // 3. Mars (Orange-red, white polar ice cap)
    const marCanvas = document.createElement('canvas');
    marCanvas.width = 64;
    marCanvas.height = 64;
    const marCtx = marCanvas.getContext('2d');
    if (marCtx) {
      marCtx.fillStyle = '#dc7633';
      marCtx.beginPath();
      marCtx.arc(32, 32, 28, 0, Math.PI * 2);
      marCtx.fill();
      // Dark desert patches
      marCtx.fillStyle = '#a04000';
      marCtx.beginPath();
      marCtx.ellipse(32, 38, 22, 10, 0.1, 0, Math.PI * 2);
      marCtx.fill();
      marCtx.beginPath();
      marCtx.arc(20, 24, 7, 0, Math.PI * 2);
      marCtx.fill();
      // Polar Ice Cap
      marCtx.fillStyle = '#fdfefe';
      marCtx.beginPath();
      marCtx.arc(32, 6, 6, 0, Math.PI);
      marCtx.fill();
    }
    this.textures['mars'] = marCanvas.toDataURL();

    // 4. Jupiter (Beige/brown stripes, red spot)
    const jupCanvas = document.createElement('canvas');
    jupCanvas.width = 128;
    jupCanvas.height = 128;
    const jupCtx = jupCanvas.getContext('2d');
    if (jupCtx) {
      jupCtx.fillStyle = '#f5cba7';
      jupCtx.beginPath();
      jupCtx.arc(64, 64, 60, 0, Math.PI * 2);
      jupCtx.fill();
      // Draw belts/stripes
      const stripes = [
        { y: 28, h: 10, color: '#d35400' },
        { y: 44, h: 6, color: '#ba4a00' },
        { y: 64, h: 12, color: '#ca6f1e' },
        { y: 84, h: 8, color: '#e59866' },
        { y: 98, h: 10, color: '#a04000' }
      ];
      // Clip to sphere
      jupCtx.save();
      jupCtx.beginPath();
      jupCtx.arc(64, 64, 60, 0, Math.PI * 2);
      jupCtx.clip();

      stripes.forEach(s => {
        jupCtx.fillStyle = s.color;
        jupCtx.fillRect(4, s.y, 120, s.h);
      });

      // Great Red Spot
      jupCtx.fillStyle = '#c0392b';
      jupCtx.beginPath();
      jupCtx.ellipse(84, 76, 12, 7, 0, 0, Math.PI * 2);
      jupCtx.fill();
      jupCtx.restore();
    }
    this.textures['jupiter'] = jupCanvas.toDataURL();

    // 5. Saturn (Yellow-gold, rings)
    const satCanvas = document.createElement('canvas');
    satCanvas.width = 256;
    satCanvas.height = 128;
    const satCtx = satCanvas.getContext('2d');
    if (satCtx) {
      // Draw rings behind planet first
      satCtx.strokeStyle = 'rgba(212, 172, 13, 0.4)';
      satCtx.lineWidth = 14;
      satCtx.beginPath();
      satCtx.ellipse(128, 64, 80, 24, -0.22, Math.PI, 0); // back half of rings
      satCtx.stroke();
      satCtx.strokeStyle = 'rgba(244, 208, 63, 0.7)';
      satCtx.lineWidth = 6;
      satCtx.beginPath();
      satCtx.ellipse(128, 64, 70, 21, -0.22, Math.PI, 0);
      satCtx.stroke();

      // Saturn body
      satCtx.fillStyle = '#f9e79f';
      satCtx.beginPath();
      satCtx.arc(128, 64, 30, 0, Math.PI * 2);
      satCtx.fill();
      // Body stripes
      satCtx.save();
      satCtx.beginPath();
      satCtx.arc(128, 64, 30, 0, Math.PI * 2);
      satCtx.clip();
      satCtx.fillStyle = '#d4ac0d';
      satCtx.fillRect(98, 54, 60, 6);
      satCtx.fillRect(98, 70, 60, 4);
      satCtx.restore();

      // Draw rings in front of planet
      satCtx.strokeStyle = 'rgba(244, 208, 63, 0.7)';
      satCtx.lineWidth = 6;
      satCtx.beginPath();
      satCtx.ellipse(128, 64, 70, 21, -0.22, 0, Math.PI); // front half of rings
      satCtx.stroke();
      satCtx.strokeStyle = 'rgba(212, 172, 13, 0.4)';
      satCtx.lineWidth = 14;
      satCtx.beginPath();
      satCtx.ellipse(128, 64, 80, 24, -0.22, 0, Math.PI);
      satCtx.stroke();
    }
    this.textures['saturn'] = satCanvas.toDataURL();
  }

  private createPlanetBillboards(): void {
    if (!this.billboardCollection || !this.labelsCollection) return;

    const dummyPos = new Cesium.Cartesian3(0, 0, 0);
    const planetIds = ['mercury', 'venus', 'mars', 'jupiter', 'saturn'];

    planetIds.forEach(id => {
      const b = this.billboardCollection!.add({
        id: `planet-billboard-${id}`,
        position: dummyPos,
        image: this.textures[id],
        // Saturn is twice as wide as height due to rings representation
        width: id === 'saturn' ? 44 : 22,
        height: 22,
        disableDepthTestDistance: Number.POSITIVE_INFINITY
      });
      (b as any).planetId = id;
      this.planetBillboards.set(id, b);

      const label = this.labelsCollection!.add({
        position: dummyPos,
        text: id.toUpperCase(),
        font: 'bold 9pt Outfit, Inter, sans-serif',
        fillColor: Cesium.Color.WHITE,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
        pixelOffset: new Cesium.Cartesian3(0, -22, 0),
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        disableDepthTestDistance: Number.POSITIVE_INFINITY
      });
      (label as any).planetId = id;
      this.planetLabels.set(id, label);
    });
  }

  private loadHighResTextures(): void {
    const textureUrls: Record<string, string> = {
      mercury: 'https://solar-system-scope.github.io/textures/download/2k_mercury.jpg',
      venus: 'https://solar-system-scope.github.io/textures/download/2k_venus_atmosphere.jpg',
      mars: 'https://solar-system-scope.github.io/textures/download/2k_mars.jpg',
      jupiter: 'https://solar-system-scope.github.io/textures/download/2k_jupiter.jpg',
      saturn: 'https://solar-system-scope.github.io/textures/download/2k_saturn.jpg'
    };

    Object.entries(textureUrls).forEach(([id, url]) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        this.mapTextureToSphere(img, (dataUrl) => {
          this.textures[id] = dataUrl;
          const b = this.planetBillboards.get(id);
          if (b) {
            b.image = dataUrl as any;
          }
        }, id === 'saturn');
      };
      img.onerror = () => {
        console.warn(`Could not load texture for ${id}, using fallback procedural texture.`);
      };
      img.src = url;
    });
  }

  private mapTextureToSphere(
    img: HTMLImageElement, 
    onComplete: (dataUrl: string) => void,
    isSaturn: boolean = false
  ): void {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = isSaturn ? size * 2 : size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const r_sphere = 30; // radius of sphere inside canvas
    const cx = isSaturn ? size : size / 2;
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

        const nx = dx / R;
        const ny = -dy / R;
        const nz = dz / R;
        const lx = 0.577;
        const ly = 0.577;
        const lz = 0.577;
        const dot = Math.max(0.2, nx * lx + ny * ly + nz * lz); // ambient 0.2

        sData.data[idx] = Math.min(255, texData.data[tIdx] * (dot * 0.8 + 0.2));
        sData.data[idx + 1] = Math.min(255, texData.data[tIdx + 1] * (dot * 0.8 + 0.2));
        sData.data[idx + 2] = Math.min(255, texData.data[tIdx + 2] * (dot * 0.8 + 0.2));
        sData.data[idx + 3] = 255;
      }
    }
    sCtx.putImageData(sData, 0, 0);

    if (isSaturn) {
      // Draw back rings
      ctx.strokeStyle = 'rgba(212, 172, 13, 0.35)';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 96, 28, -0.22, Math.PI, 0);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(244, 208, 63, 0.6)';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 84, 24, -0.22, Math.PI, 0);
      ctx.stroke();

      // Draw planet sphere
      ctx.drawImage(sphereCanvas, cx - halfSize, cy - halfSize);

      // Draw front rings
      ctx.strokeStyle = 'rgba(244, 208, 63, 0.6)';
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 84, 24, -0.22, 0, Math.PI);
      ctx.stroke();
      ctx.strokeStyle = 'rgba(212, 172, 13, 0.35)';
      ctx.lineWidth = 14;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 96, 28, -0.22, 0, Math.PI);
      ctx.stroke();
    } else {
      ctx.drawImage(sphereCanvas, 0, 0);
    }

    onComplete(canvas.toDataURL());
  }

  protected onUpdate(
    date: Date, 
    observerLocation: ObserverLocation, 
    observerPosition: Cesium.Cartesian3
  ): void {
    if (!this.viewer || !this.billboardCollection) return;

    // Retrieve planet state from usePlanetStore
    let planetsData: Record<string, any> = {};
    try {
      const { planets } = require('@/modules/planets/store/usePlanetStore').usePlanetStore.getState();
      if (planets) planetsData = planets;
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

    // Zoom scale coefficient
    const currentFov = CameraController.currentFov;
    const zoomScale = Math.max(1.0, 60.0 / currentFov);
    const baseRadius = SkyDomeRadiusService.getAdaptiveRadius(currentFov);

    this.planetBillboards.forEach((b, id) => {
      const data = planetsData[id];
      if (!data) return;

      const trueAlt = data.altitude;
      const az = data.azimuth;

      // Apply atmospheric refraction (apparent coordinates)
      const refractedAlt = AtmosphereRefractionEngine.getRefractedAltitude(trueAlt);

      // Project coordinates in dome space using adaptive radius and refracted altitude
      const globalPos = CelestialProjectionEngine.altAzToCartesian(
        refractedAlt,
        az,
        observerPosition,
        baseRadius
      );

      b.position = globalPos;

      const label = this.planetLabels.get(id);
      if (label) {
        label.position = globalPos;
      }

      // Apply physical occlusion and cloud cover dimming
      const occlusion = ObserverVisibilityEngine.getOcclusionMultiplier(refractedAlt, az, horizonTheme);
      const cloudDimming = ObserverVisibilityEngine.getCloudDimmingMultiplier(cloudCover * 100.0);

      if (occlusion > 0.01 && this.isVisible) {
        b.show = true;

        // Apply physical horizon magnification (giant moon/sun illusion)
        const scaleMult = AtmosphereRefractionEngine.getHorizonScaleMultiplier(refractedAlt);

        // Scale sizes proportionally on zoom. Saturn width is 2x height
        const baseSize = 22;
        const widthScale = id === 'saturn' ? 2 : 1;
        b.width = baseSize * widthScale * Math.pow(zoomScale, 0.7) * scaleMult;
        b.height = baseSize * Math.pow(zoomScale, 0.7) * scaleMult;
        
        // Observe mode check
        let observeFade = 1.0;
        let isTarget = false;
        if (SkySceneService.isObserving) {
          isTarget = SkySceneService.observedObjectId === id;
          if (!isTarget) {
            observeFade = 0.15;
          }
        }

        // Apply sunset/sunrise scattered reddening
        const baseColor = AtmosphereRefractionEngine.getRefractedColor(Cesium.Color.WHITE, refractedAlt);
        b.color = baseColor.withAlpha(cloudDimming * occlusion * observeFade);

        if (label) {
          const isSelected = (SkySceneService as any).selectedObjectId === id;
          const isHovered = false;

          // Determine label visibility using AdaptiveLabelEngine
          const showLabelText = AdaptiveLabelEngine.shouldShowLabel(
            id,
            'planet',
            id === 'venus' ? -4.4 : id === 'jupiter' ? -2.2 : 0.5,
            isSelected || isTarget,
            isHovered,
            currentFov
          );

          label.show = showLabelText && (observeFade > 0.5 || isTarget);
          label.fillColor = Cesium.Color.WHITE.withAlpha(cloudDimming * occlusion * observeFade);
          label.pixelOffset = new Cesium.Cartesian3(0, -(b.height / 2 + 10), 0);
        }
      } else {
        b.show = false;
        if (label) label.show = false;
      }
    });
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
    this.planetBillboards.clear();
    this.planetLabels.clear();
  }
}
