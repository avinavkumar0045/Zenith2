import * as Cesium from 'cesium';
import { BaseSkyLayer } from './BaseSkyLayer';
import { ObserverLocation, HorizonTheme } from '../UserCentricView.types';
import { BRIGHT_STARS, generateProceduralStars } from '../assets/starCatalog';
import { CelestialProjectionEngine } from '../engine/CelestialProjectionEngine';
import { SkyDomeRadiusService } from '../engine/SkyDomeRadiusService';
import { CameraController } from '../services/CameraController';
import { ObserverVisibilityEngine } from '../engine/ObserverVisibilityEngine';
import { AtmosphereRefractionEngine } from '../engine/AtmosphereRefractionEngine';
import { SkySceneService } from '../services/SkySceneService';
import { HorizonLayer } from './HorizonLayer';

export class StarsLayer extends BaseSkyLayer {
  private starPoints: Cesium.PointPrimitiveCollection | null = null;
  private brightStarBillboards: Cesium.BillboardCollection | null = null;
  private proceduralStars = generateProceduralStars();
  private glowTextureUrl = '';

  constructor() {
    super('stars-layer');
  }

  protected onInitialize(): void {
    if (!this.viewer) return;

    // 1. Create a glowing star texture programmatically
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(16, 16, 1, 16, 16, 16);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
      grad.addColorStop(0.2, 'rgba(255, 255, 255, 0.8)');
      grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.2)');
      grad.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 32, 32);
    }
    this.glowTextureUrl = canvas.toDataURL();

    // 2. Initialize primitive collections
    this.starPoints = this.viewer.scene.primitives.add(new Cesium.PointPrimitiveCollection());
    this.brightStarBillboards = this.viewer.scene.primitives.add(new Cesium.BillboardCollection());
    
    // Add all stars initially to the collections
    this.populateStars();
  }

  private populateStars(): void {
    if (!this.viewer || !this.starPoints || !this.brightStarBillboards || !this.observerPosition) return;

    const dummyPos = new Cesium.Cartesian3(0, 0, 0);

    // Populate catalog stars
    BRIGHT_STARS.forEach((star) => {
      const baseColor = Cesium.Color.fromCssColorString(star.color);
      const isExtremelyBright = star.magnitude < 1.8;

      if (isExtremelyBright) {
        // Renders as a glowing billboard billboard
        const b = this.brightStarBillboards!.add({
          id: `star-${star.id}`,
          position: dummyPos,
          image: this.glowTextureUrl,
          color: baseColor,
          width: Math.max(12, (2.5 - star.magnitude) * 12),
          height: Math.max(12, (2.5 - star.magnitude) * 12),
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        });
        (b as any)._starData = star;
      } else {
        // Renders as a crisp point
        const p = this.starPoints!.add({
          id: `star-${star.id}`,
          position: dummyPos,
          color: baseColor,
          pixelSize: Math.max(2, (4.5 - star.magnitude) * 2.0),
          outlineWidth: 0,
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        });
        (p as any)._starData = star;
      }
    });

    // Populate procedural stars
    this.proceduralStars.forEach((star, index) => {
      const p = this.starPoints!.add({
        id: `procedural-star-${index}`,
        position: dummyPos,
        color: Cesium.Color.fromCssColorString('#ffffff'),
        pixelSize: Math.max(1.0, (7.0 - star.magnitude) * 0.8),
        outlineWidth: 0,
        disableDepthTestDistance: Number.POSITIVE_INFINITY
      });
      (p as any)._starData = star;
    });
  }

  protected onUpdate(
    date: Date, 
    observerLocation: ObserverLocation, 
    observerPosition: Cesium.Cartesian3
  ): void {
    if (!this.viewer || !this.starPoints || !this.brightStarBillboards) return;

    // Calculate dynamic adaptive radius based on camera FOV
    const fov = CameraController.currentFov;
    const baseRadius = SkyDomeRadiusService.getAdaptiveRadius(fov);
    const starRadius = baseRadius * 1.15;

    // Level-of-Detail (LOD) threshold based on FOV
    let lodMaxMag = 3.0; // LOD 0: wide eye mode, only show stars brighter than mag 3
    if (fov < 3.0) {
      lodMaxMag = 7.5; // LOD 2: telescope mode, show all stars down to mag 7.5
    } else if (fov < 20.0) {
      lodMaxMag = 4.8; // LOD 1: binocular mode, show medium stars down to mag 4.8
    }

    // Calculate visibility coefficients
    let cloudCover = 0.0; // 0 to 1
    let lightPollution = 3.0; // 1 to 9 (Bortle scale approximation)
    let moonIllumination = 0.0; // 0 to 1

    // Read weather details dynamically
    try {
      const { weather } = require('@/modules/weather/store/useWeatherStore').useWeatherStore.getState();
      if (weather) {
        cloudCover = (weather.cloudCover ?? 0) / 100.0;
        if (weather.observationQuality === 'Poor' || weather.observationQuality === 'Very Poor') {
          lightPollution = 7.0;
        } else if (weather.observationQuality === 'Excellent') {
          lightPollution = 2.0;
        }
      }
    } catch (e) {}

    // Read Moon illumination dynamically
    try {
      const { moonData } = require('@/modules/moon/store/useMoonStore').useMoonStore.getState();
      if (moonData) {
        moonIllumination = moonData.illumination ?? 0.0;
      }
    } catch (e) {}

    // Ambient sky brightness index (0 to 1)
    const skyBrightness = (lightPollution / 9.0) * 0.4 + moonIllumination * 0.4 + cloudCover * 0.2;
    // Dimmer stars fade out as background brightness rises
    const maxVisibleMag = 7.2 - skyBrightness * 4.5;

    // Fetch active horizon theme
    let horizonTheme: HorizonTheme = 'mountains';
    try {
      const horizonLayer = SkySceneService.getLayer<HorizonLayer>('horizon-layer');
      if (horizonLayer) {
        horizonTheme = horizonLayer.currentTheme;
      }
    } catch (e) {}

    // Fetch physical engines coefficients
    const daylightWashout = SkySceneService.showAtmosphere
      ? ObserverVisibilityEngine.getDaylightWashout(date, observerLocation.latitude, observerLocation.longitude)
      : 1.0;
    const cloudDimming = ObserverVisibilityEngine.getCloudDimmingMultiplier(cloudCover * 100.0);

    // Update Catalog Star Billboards (Bright Stars)
    const billboardCount = this.brightStarBillboards.length;
    for (let i = 0; i < billboardCount; i++) {
      const b = this.brightStarBillboards.get(i);
      const star = (b as any)._starData;
      if (!star) continue;

      // Calculate true coordinates
      const altAz = CelestialProjectionEngine.getAltAz(
        star.ra,
        star.dec,
        observerLocation.latitude,
        observerLocation.longitude,
        date
      );

      // Apply atmospheric refraction (apparent coordinates)
      const refractedAltitude = AtmosphereRefractionEngine.getRefractedAltitude(altAz.altitude);

      // Project coordinates using refracted altitude
      const globalPos = CelestialProjectionEngine.altAzToCartesian(
        refractedAltitude,
        altAz.azimuth,
        observerPosition,
        starRadius
      );
      
      b.position = globalPos;

      // Apply physical occlusion
      const occlusion = ObserverVisibilityEngine.getOcclusionMultiplier(refractedAltitude, altAz.azimuth, horizonTheme);
      const isBrightEnough = star.magnitude <= maxVisibleMag && star.magnitude <= lodMaxMag;

      let observeFade = 1.0;
      if (SkySceneService.isObserving) {
        observeFade = 0.15;
      }

      if (isBrightEnough && occlusion > 0.01 && daylightWashout > 0.01 && this.isVisible) {
        b.show = true;
        const magnitudeFade = Math.min(1.0, (maxVisibleMag - star.magnitude) / 1.5);
        const opacity = magnitudeFade * daylightWashout * cloudDimming * occlusion * observeFade;
        const baseColor = Cesium.Color.fromCssColorString(star.color);
        b.color = baseColor.withAlpha(opacity);
      } else {
        b.show = false;
      }
    }

    // Update Point Primitives (Dim stars)
    const pointCount = this.starPoints.length;
    for (let i = 0; i < pointCount; i++) {
      const p = this.starPoints.get(i);
      const star = (p as any)._starData;
      if (!star) continue;

      const altAz = CelestialProjectionEngine.getAltAz(
        star.ra,
        star.dec,
        observerLocation.latitude,
        observerLocation.longitude,
        date
      );

      const refractedAltitude = AtmosphereRefractionEngine.getRefractedAltitude(altAz.altitude);

      const globalPos = CelestialProjectionEngine.altAzToCartesian(
        refractedAltitude,
        altAz.azimuth,
        observerPosition,
        starRadius
      );

      p.position = globalPos;

      const occlusion = ObserverVisibilityEngine.getOcclusionMultiplier(refractedAltitude, altAz.azimuth, horizonTheme);
      const isBrightEnough = star.magnitude <= maxVisibleMag && star.magnitude <= lodMaxMag;

      let observeFade = 1.0;
      if (SkySceneService.isObserving) {
        observeFade = 0.15;
      }

      if (isBrightEnough && occlusion > 0.01 && daylightWashout > 0.01 && this.isVisible) {
        p.show = true;
        const magnitudeFade = Math.min(1.0, (maxVisibleMag - star.magnitude) / 1.0);
        // Altitude fade: dim near horizon due to extinction
        const altFade = refractedAltitude > 10 ? 1.0 : Math.max(0.0, (refractedAltitude + 2) / 12.0);
        const opacity = magnitudeFade * altFade * daylightWashout * cloudDimming * occlusion * observeFade;
        const baseColor = star.color ? Cesium.Color.fromCssColorString(star.color) : Cesium.Color.WHITE;
        p.color = baseColor.withAlpha(opacity);
      } else {
        p.show = false;
      }
    }
  }

  protected onShow(): void {
    if (this.starPoints) this.starPoints.show = true;
    if (this.brightStarBillboards) this.brightStarBillboards.show = true;
  }

  protected onHide(): void {
    if (this.starPoints) this.starPoints.show = false;
    if (this.brightStarBillboards) this.brightStarBillboards.show = false;
  }

  protected onDestroy(): void {
    if (!this.viewer) return;
    if (this.starPoints) {
      this.viewer.scene.primitives.remove(this.starPoints);
      this.starPoints = null;
    }
    if (this.brightStarBillboards) {
      this.viewer.scene.primitives.remove(this.brightStarBillboards);
      this.brightStarBillboards = null;
    }
  }
}
