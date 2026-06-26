import * as Cesium from 'cesium';

export class AtmosphereRefractionEngineClass {
  /**
   * Calculates the refracted (apparent) altitude of a celestial object in degrees.
   * Light bends near the horizon, making objects appear slightly higher than their true geometric position.
   * Uses Bennett's formula for atmospheric refraction correction.
   * 
   * @param trueAltitudeDeg True geometric altitude of the object in degrees
   */
  public getRefractedAltitude(trueAltitudeDeg: number): number {
    if (trueAltitudeDeg < -2.0) {
      return trueAltitudeDeg; // No visual bending below the horizon limit
    }

    // Clamp to prevent negative or zero division in Bennett's formula
    const h = Math.max(0.001, trueAltitudeDeg);
    const term = h + 10.3 / (h + 5.11);
    const termRad = term * (Math.PI / 180.0);
    const deltaHMin = 1.02 / Math.tan(termRad);
    const deltaHDeg = deltaHMin / 60.0;

    return trueAltitudeDeg + deltaHDeg;
  }

  /**
   * Computes the "giant moon" scale multiplier (1.0 to 1.4) simulating the atmospheric illusion
   * where celestial bodies (Moon/Sun) appear larger near the horizon.
   */
  public getHorizonScaleMultiplier(altitudeDeg: number): number {
    if (altitudeDeg < -1.0) return 1.0;
    if (altitudeDeg > 15.0) return 1.0;

    // Scale starts at 1.4x at 0° altitude and drops linearly to 1.0x by 15° altitude
    const factor = Math.max(0.0, (15.0 - altitudeDeg) / 15.0);
    return 1.0 + factor * 0.4;
  }

  /**
   * Colors objects rising near the horizon with warm, scattered orange-red sunset/sunrise hues.
   */
  public getRefractedColor(baseColor: Cesium.Color, altitudeDeg: number): Cesium.Color {
    if (altitudeDeg < -1.0 || altitudeDeg > 12.0) return baseColor;

    // Shift to warm colors peaks at 0° altitude and fades out by 12° altitude
    const factor = Math.max(0.0, (12.0 - altitudeDeg) / 12.0);
    const warmColor = Cesium.Color.fromCssColorString('#e59866'); // scattered sunset orange

    return Cesium.Color.lerp(baseColor, warmColor, factor * 0.8, new Cesium.Color());
  }
}

export const AtmosphereRefractionEngine = new AtmosphereRefractionEngineClass();
