import * as Cesium from 'cesium';
import * as SunCalc from 'suncalc';
import { BaseSkyLayer } from './BaseSkyLayer';
import { ObserverLocation } from '../UserCentricView.types';

interface SkyColor {
  zenith: string;
  horizon: string;
  alpha: number;
}

/**
 * AtmosphereLayer — CSS Gradient Overlay approach.
 * 
 * Instead of rendering an EllipsoidGeometry dome (which has fatal depth/culling/texture issues
 * when the camera is inside it), this layer creates a simple CSS gradient <div> overlay that 
 * sits on top of the Cesium canvas but behind the HUD.
 * 
 * The gradient color/opacity changes based on the Sun's altitude:
 *   - Daytime: Blue sky gradient (opaque)
 *   - Sunset/Sunrise: Orange-purple gradient
 *   - Night: Fully transparent (stars shine through)
 * 
 * This is how professional planetarium apps (Stellarium, Sky Guide) handle atmosphere —
 * as a 2D screen-space effect, not a 3D geometry.
 */
export class AtmosphereLayer extends BaseSkyLayer {
  private overlayDiv: HTMLDivElement | null = null;
  private lastSunAltitude = -999;
  private lastCloudCover = -1;

  constructor() {
    super('atmosphere-layer');
  }

  protected onInitialize(): void {
    if (!this.viewer) return;

    // Create the CSS overlay div
    this.overlayDiv = document.createElement('div');
    this.overlayDiv.id = 'atmosphere-overlay';
    this.overlayDiv.style.cssText = `
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
      transition: opacity 0.8s ease-out;
      opacity: 0;
    `;

    // Insert the overlay into the Cesium viewer's container
    // This places it above the canvas but below the React HUD (z-index: 10)
    this.viewer.container.appendChild(this.overlayDiv);
  }

  /**
   * Compute sky color palette based on Sun altitude in degrees.
   * Uses physically-motivated color stops matching real atmospheric scattering.
   */
  private getAtmosphereColor(sunAltDeg: number): SkyColor {
    const colors = {
      day:           { zenith: '#0a3070', horizon: '#7cd1f9', alpha: 0.85 },
      goldenHour:    { zenith: '#141854', horizon: '#e67e22', alpha: 0.75 },
      blueHour:      { zenith: '#060a1d', horizon: '#2e41a6', alpha: 0.55 },
      civil:         { zenith: '#040717', horizon: '#151d2b', alpha: 0.40 },
      nautical:      { zenith: '#02030d', horizon: '#081426', alpha: 0.20 },
      astronomical:  { zenith: '#010105', horizon: '#020412', alpha: 0.08 },
      night:         { zenith: '#000000', horizon: '#000000', alpha: 0.0 }
    };

    const lerpColor = (c1: string, c2: string, t: number): string => {
      const r1 = parseInt(c1.substring(1, 3), 16);
      const g1 = parseInt(c1.substring(3, 5), 16);
      const b1 = parseInt(c1.substring(5, 7), 16);

      const r2 = parseInt(c2.substring(1, 3), 16);
      const g2 = parseInt(c2.substring(3, 5), 16);
      const b2 = parseInt(c2.substring(5, 7), 16);

      const r = Math.round(r1 + (r2 - r1) * t);
      const g = Math.round(g1 + (g2 - g1) * t);
      const b = Math.round(b1 + (b2 - b1) * t);

      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    };

    const lerpSky = (a: SkyColor, b: SkyColor, t: number): SkyColor => ({
      zenith: lerpColor(a.zenith, b.zenith, t),
      horizon: lerpColor(a.horizon, b.horizon, t),
      alpha: a.alpha + (b.alpha - a.alpha) * t
    });

    if (sunAltDeg > 6) {
      return colors.day;
    } 
    else if (sunAltDeg > -4) {
      const t = (sunAltDeg - (-4)) / 10.0;
      return lerpSky(colors.goldenHour, colors.day, t);
    } 
    else if (sunAltDeg > -6) {
      const t = (sunAltDeg - (-6)) / 2.0;
      return lerpSky(colors.blueHour, colors.goldenHour, t);
    } 
    else if (sunAltDeg > -12) {
      const t = (sunAltDeg - (-12)) / 6.0;
      return lerpSky(colors.nautical, colors.blueHour, t);
    } 
    else if (sunAltDeg > -18) {
      const t = (sunAltDeg - (-18)) / 6.0;
      return lerpSky(colors.astronomical, colors.nautical, t);
    } 
    else {
      return colors.night;
    }
  }

  protected onUpdate(
    date: Date, 
    observerLocation: ObserverLocation, 
    observerPosition: Cesium.Cartesian3
  ): void {
    if (!this.overlayDiv) return;

    // 1. Calculate Sun Altitude
    const sunPos = SunCalc.getPosition(date, observerLocation.latitude, observerLocation.longitude);
    const sunAltDeg = sunPos.altitude * (180.0 / Math.PI);

    // 2. Read cloud cover
    let cloudCover = 0.0;
    try {
      const { weather } = require('@/modules/weather/store/useWeatherStore').useWeatherStore.getState();
      if (weather) cloudCover = (weather.cloudCover ?? 0) / 100.0;
    } catch (e) {}

    // Only update DOM when values actually change (avoid layout thrashing)
    if (Math.abs(this.lastSunAltitude - sunAltDeg) < 0.1 && Math.abs(this.lastCloudCover - cloudCover) < 0.05) {
      return;
    }
    this.lastSunAltitude = sunAltDeg;
    this.lastCloudCover = cloudCover;

    const skyColor = this.getAtmosphereColor(sunAltDeg);

    // Compute the Sun's azimuth for the gradient direction
    // The sun glow should appear at the horizon where the sun actually is
    const sunAzDeg = (sunPos.azimuth * 180.0 / Math.PI + 180) % 360; // SunCalc azimuth: 0=south, convert to CSS angle

    // Apply cloud cover modification: clouds gray out the sky
    let zenith = skyColor.zenith;
    let horizon = skyColor.horizon;
    let alpha = skyColor.alpha;

    if (cloudCover > 0.05) {
      const t = Math.min(1.0, cloudCover * 1.5);
      const lerpColor = (c1: string, c2: string, ratio: number): string => {
        const r1 = parseInt(c1.substring(1, 3), 16);
        const g1 = parseInt(c1.substring(3, 5), 16);
        const b1 = parseInt(c1.substring(5, 7), 16);
        const r2 = parseInt(c2.substring(1, 3), 16);
        const g2 = parseInt(c2.substring(3, 5), 16);
        const b2 = parseInt(c2.substring(5, 7), 16);
        const r = Math.round(r1 + (r2 - r1) * ratio);
        const g = Math.round(g1 + (g2 - g1) * ratio);
        const b = Math.round(b1 + (b2 - b1) * ratio);
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      };

      zenith = lerpColor(zenith, '#121a22', t);
      horizon = lerpColor(horizon, '#24323f', t);
      alpha = Math.max(alpha, 0.4 * t);
    }

    // Set the CSS gradient — top is zenith, bottom is horizon
    this.overlayDiv.style.background = `linear-gradient(to bottom, ${zenith} 0%, ${horizon} 85%, ${horizon} 100%)`;
    this.overlayDiv.style.opacity = String(alpha);
  }

  protected onShow(): void {
    if (this.overlayDiv) {
      this.overlayDiv.style.display = 'block';
    }
  }

  protected onHide(): void {
    if (this.overlayDiv) {
      this.overlayDiv.style.display = 'none';
    }
  }

  protected onDestroy(): void {
    if (this.overlayDiv && this.overlayDiv.parentElement) {
      this.overlayDiv.parentElement.removeChild(this.overlayDiv);
      this.overlayDiv = null;
    }
  }
}
