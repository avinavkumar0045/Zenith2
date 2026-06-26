export class SkyDomeRadiusServiceClass {
  private defaultRadius = 350000.0;

  /**
   * Calculates the adaptive radius in meters based on the camera FOV.
   * As the field of view narrows (zoomed in), the dome expands to prevent
   * billboard rendering clipping and wobble, up to a precision-capped ceiling.
   * 
   * @param fovDegrees Current camera Field of View in degrees
   */
  public getAdaptiveRadius(fovDegrees: number): number {
    const fov = Math.max(0.1, Math.min(60.0, fovDegrees));
    // As FOV shrinks from 60 to 0.3, the factor grows.
    const factor = 1.0 + (60.0 / fov) * 0.15;
    return Math.min(2500000.0, this.defaultRadius * factor);
  }

  public getDefaultRadius(): number {
    return this.defaultRadius;
  }
}

export const SkyDomeRadiusService = new SkyDomeRadiusServiceClass();
export default SkyDomeRadiusService;
