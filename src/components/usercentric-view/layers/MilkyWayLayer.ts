import * as Cesium from 'cesium';
import { BaseSkyLayer } from './BaseSkyLayer';
import { ObserverLocation } from '../UserCentricView.types';
import { CelestialProjectionEngine } from '../engine/CelestialProjectionEngine';
import { SkyDomeRadiusService } from '../engine/SkyDomeRadiusService';
import { CameraController } from '../services/CameraController';

export class MilkyWayLayer extends BaseSkyLayer {
  private billboardCollection: Cesium.BillboardCollection | null = null;
  private mwPoints: { ra: number; dec: number; scale: number; opacityMult: number }[] = [];
  private dustTextureUrl = '';

  constructor() {
    super('milky-way-layer');
  }

  protected onInitialize(): void {
    if (!this.viewer) return;

    this.billboardCollection = this.viewer.scene.primitives.add(new Cesium.BillboardCollection());

    // 1. Generate a soft, fuzzy dust texture programmatically
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Draw a blurred horizontal ellipse representing dust clouds
      const grad = ctx.createRadialGradient(64, 32, 2, 64, 32, 48);
      grad.addColorStop(0, 'rgba(230, 215, 255, 0.28)'); // slightly purplish white core
      grad.addColorStop(0.3, 'rgba(215, 200, 255, 0.14)');
      grad.addColorStop(0.7, 'rgba(150, 150, 200, 0.04)');
      grad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');
      
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 128, 64);
    }
    this.dustTextureUrl = canvas.toDataURL();

    // 2. Generate points along the galactic plane using spherical trigonometry
    const inc = 62.87 * Math.PI / 180; // Galactic plane inclination to celestial equator
    const node = 282.86 * Math.PI / 180; // RA of ascending node

    const pointsCount = 72; // Overlapping segments for a continuous fuzzy band
    for (let i = 0; i < pointsCount; i++) {
      const u = (i / pointsCount) * Math.PI * 2;
      
      // Local coordinate system tilted by inclination
      const x = Math.cos(u);
      const y = Math.sin(u) * Math.cos(inc);
      const z = Math.sin(u) * Math.sin(inc);
      
      // Rotate by ascending node angle around Z axis
      const xEq = x * Math.cos(node) - y * Math.sin(node);
      const yEq = x * Math.sin(node) + y * Math.cos(node);
      const zEq = z;

      let raRad = Math.atan2(yEq, xEq);
      if (raRad < 0) raRad += Math.PI * 2;
      const decRad = Math.asin(Math.max(-1.0, Math.min(1.0, zEq)));

      const raHours = (raRad * 180 / Math.PI) / 15.0;
      const decDegrees = decRad * 180 / Math.PI;

      // Add variation to size and brightness to simulate stellar density changes
      // The galactic center is at longitude l = 0 (approximately near u = 0 or u = 2pi)
      // Scorpius/Sagittarius is brightest, Monoceros is dimmest (u = pi)
      const distFromCenter = Math.min(u, Math.PI * 2 - u); // 0 at center, pi at anticenter
      const centerFactor = Math.cos(distFromCenter / 2.0); // 1 at center, 0 at anticenter
      
      const scale = 2.0 + centerFactor * 2.5; // wider at center
      const opacityMult = 0.4 + centerFactor * 0.6; // brighter at center

      this.mwPoints.push({
        ra: raHours,
        dec: decDegrees,
        scale,
        opacityMult
      });

      // Add billboard primitive
      if (this.billboardCollection) {
        this.billboardCollection.add({
          id: `mw-cloud-${i}`,
          position: new Cesium.Cartesian3(0, 0, 0),
          image: this.dustTextureUrl,
          width: 120000, // Large sizes to overlap smoothly
          height: 60000,
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        });
      }
    }
  }

  protected onUpdate(
    date: Date, 
    observerLocation: ObserverLocation, 
    observerPosition: Cesium.Cartesian3
  ): void {
    if (!this.viewer || !this.billboardCollection) return;

    let cloudCover = 0.0;
    try {
      const { weather } = require('@/modules/weather/store/useWeatherStore').useWeatherStore.getState();
      if (weather) cloudCover = (weather.cloudCover ?? 0) / 100.0;
    } catch (e) {}

    let moonIllumination = 0.0;
    try {
      const { moonData } = require('@/modules/moon/store/useMoonStore').useMoonStore.getState();
      if (moonData) moonIllumination = moonData.illumination ?? 0.0;
    } catch (e) {}

    // Light pollution and weather fade out the Milky Way very quickly
    let lightPollution = 3.0; // default Bortle 3
    try {
      const { weather } = require('@/modules/weather/store/useWeatherStore').useWeatherStore.getState();
      if (weather && (weather.observationQuality === 'Poor' || weather.observationQuality === 'Very Poor')) {
        lightPollution = 7.0;
      }
    } catch (e) {}

    // Ambient brightness index
    const skyBrightness = (lightPollution / 9.0) * 0.5 + moonIllumination * 0.4 + cloudCover * 0.3;
    // Milky Way is highly sensitive to background sky glow
    const globalOpacity = Math.max(0.0, 1.0 - skyBrightness * 1.8) * (1.0 - cloudCover);

    const currentFov = CameraController.currentFov;
    const baseRadius = SkyDomeRadiusService.getAdaptiveRadius(currentFov);
    const mwRadius = baseRadius * 1.12; // sits just behind stars

    const count = this.mwPoints.length;
    for (let i = 0; i < count; i++) {
      const p = this.mwPoints[i];
      const b = this.billboardCollection.get(i);
      
      const altAz = CelestialProjectionEngine.getAltAz(
        p.ra,
        p.dec,
        observerLocation.latitude,
        observerLocation.longitude,
        date
      );

      // Project billboard onto dome surface using adaptive radius
      const globalPos = CelestialProjectionEngine.altAzToCartesian(
        altAz.altitude,
        altAz.azimuth,
        observerPosition,
        mwRadius
      );

      b.position = globalPos;

      const isAboveHorizon = altAz.altitude > -5.0;

      if (isAboveHorizon && globalOpacity > 0.02 && this.isVisible) {
        b.show = true;
        
        // Altitude fade to simulate atmosphere extinction near horizon
        const altFade = altAz.altitude > 15 ? 1.0 : Math.max(0.0, (altAz.altitude + 5) / 20.0);
        const finalOpacity = globalOpacity * p.opacityMult * altFade;

        b.color = Cesium.Color.WHITE.withAlpha(finalOpacity);
        // Scale billboard dimensions based on its custom scale factor
        b.width = 110000 * p.scale;
        b.height = 55000 * p.scale;
      } else {
        b.show = false;
      }
    }
  }

  protected onShow(): void {
    if (this.billboardCollection) this.billboardCollection.show = true;
  }

  protected onHide(): void {
    if (this.billboardCollection) this.billboardCollection.show = false;
  }

  protected onDestroy(): void {
    if (!this.viewer) return;
    if (this.billboardCollection) {
      this.viewer.scene.primitives.remove(this.billboardCollection);
      this.billboardCollection = null;
    }
  }
}
