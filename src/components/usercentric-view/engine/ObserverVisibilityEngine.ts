import * as SunCalc from 'suncalc';
import { HorizonTheme } from '../UserCentricView.types';

export class ObserverVisibilityEngineClass {
  /**
   * Computes the elevation height of the horizon silhouette (in degrees) for a given theme and azimuth.
   * Matches the visual peaks and valleys of the procedurally generated horizon billboards.
   * 
   * @param theme The current horizon silhouette theme
   * @param azimuth Azimuth angle in degrees (0 = North, 90 = East, etc.)
   */
  public getHorizonElevation(theme: HorizonTheme, azimuth: number): number {
    const normalizedAz = ((azimuth % 360) + 360) % 360;
    
    // Each horizon panel covers 30 degrees of azimuth.
    // The panel texture is 512px wide.
    const panelAz = normalizedAz % 30;
    const x = (panelAz / 30) * 512;

    let y = 128; // default to bottom of canvas (no profile elevation)

    if (theme === 'mountains') {
      // Peaks defined in HorizonLayer
      const peaks = [
        [0, 70], [40, 45], [90, 85], [140, 30], [200, 75], 
        [260, 40], [320, 90], [390, 25], [450, 70], [512, 50]
      ];
      
      // Interpolate y coordinate along mountain segments
      for (let i = 0; i < peaks.length - 1; i++) {
        if (x >= peaks[i][0] && x <= peaks[i+1][0]) {
          const t = (x - peaks[i][0]) / (peaks[i+1][0] - peaks[i][0]);
          y = peaks[i][1] + t * (peaks[i+1][1] - peaks[i][1]);
          break;
        }
      }
    } 
    else if (theme === 'forest') {
      // Deterministic pseudo-random forest skyline using trigonometric combination
      const noise = Math.sin(x * 0.12) * Math.cos(x * 0.07) * 22 + Math.sin(x * 0.45) * 6;
      const treeHeight = 65 + noise; // average height 65px
      y = 128 - treeHeight;
    } 
    else if (theme === 'city') {
      // Blocky skyscraper skyline using step-wise modular function
      const step = Math.floor(x / 32);
      const randHeight = 35 + ((step * 23) % 65);
      y = 128 - randHeight;
    } 
    else if (theme === 'ocean') {
      // Small horizontal waves at y=95px
      y = 95 + Math.sin(x * 0.15) * 1.5;
    } 
    else if (theme === 'desert') {
      // Smooth sweeping sand dunes using low frequency sinusoids
      const duneHeight = 50 + Math.sin(x * 0.012) * 12 + Math.cos(x * 0.024) * 7;
      y = 128 - duneHeight;
    }

    // Convert pixel y coordinate back to degrees:
    // Billboard panels start at -0.8° altitude and have 8.0° vertical size
    // y = 0 maps to top (-0.8 + 8 = 7.2°), y = 128 maps to bottom (-0.8°)
    const elevation = -0.8 + 8.0 * (128 - y) / 128;
    return elevation;
  }

  /**
   * Returns a visibility multiplier (0.0 to 1.0) based on horizon silhouette occlusion.
   * If target is below the horizon silhouette, returns 0. Fades smoothly over 1 degree.
   */
  public getOcclusionMultiplier(altitude: number, azimuth: number, theme: HorizonTheme): number {
    const horizonElevation = this.getHorizonElevation(theme, azimuth);
    if (altitude < horizonElevation) {
      return 0.0;
    }
    // Blend smoothly from 0.0 to 1.0 over a 1 degree buffer above the silhouette line
    if (altitude < horizonElevation + 1.0) {
      return altitude - horizonElevation;
    }
    return 1.0;
  }

  /**
   * Returns a visibility multiplier (0.15 to 1.0) based on cloud cover,
   * simulating stars and planets fading/getting occluded by floating clouds.
   */
  public getCloudDimmingMultiplier(cloudCoverPercent: number): number {
    return Math.max(0.15, 1.0 - (cloudCoverPercent / 100.0) * 0.85);
  }

  /**
   * Returns a visibility multiplier (0.0 to 1.0) based on daylight sky washout.
   * Simulates atmospheric Rayleigh scattering. Stars wash out during twilight and day.
   */
  public getDaylightWashoutMultiplier(sunAltitudeDeg: number): number {
    // Sun above civil twilight limit: fully washed out (0% visibility for stars/DSOs)
    if (sunAltitudeDeg > -6.0) {
      return 0.0;
    }
    // Sun below astronomical twilight limit: fully clear (100% visibility)
    if (sunAltitudeDeg <= -18.0) {
      return 1.0;
    }
    // Linear fade between astronomical twilight (-18°) and civil twilight (-6°)
    const ratio = (sunAltitudeDeg - (-6.0)) / (-12.0);
    return Math.max(0.0, Math.min(1.0, ratio));
  }

  /**
   * Automatically calculates Sun altitude and returns the daylight washout multiplier.
   */
  public getDaylightWashout(date: Date, latitude: number, longitude: number): number {
    const sunPos = SunCalc.getPosition(date, latitude, longitude);
    const sunAltDeg = sunPos.altitude * (180.0 / Math.PI);
    return this.getDaylightWashoutMultiplier(sunAltDeg);
  }
}

export const ObserverVisibilityEngine = new ObserverVisibilityEngineClass();
