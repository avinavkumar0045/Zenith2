export class AdaptiveLabelEngineClass {
  /**
   * Evaluates whether a label should be rendered for a given sky entity,
   * dynamically keeping the screen clutter-free.
   * 
   * @param id The object identifier
   * @param type The celestial type
   * @param magnitude The magnitude of the object (smaller is brighter)
   * @param isSelected Whether the object is selected
   * @param isHovered Whether the cursor is hovering over the object
   * @param currentFov Current camera Field of View in degrees
   */
  public shouldShowLabel(
    id: string,
    type: 'star' | 'planet' | 'moon' | 'satellite' | 'deepsky',
    magnitude: number,
    isSelected: boolean,
    isHovered: boolean,
    currentFov: number
  ): boolean {
    // Selected or hovered items ALWAYS show labels
    if (isSelected || isHovered) {
      return true;
    }

    switch (type) {
      case 'planet':
      case 'moon':
        // Planets are high interest; show them except in extremely zoomed-out views
        return currentFov < 50.0;

      case 'satellite':
        // Satellites move rapidly and can easily clutter the sky. Only show when zoomed in
        return currentFov < 15.0;

      case 'deepsky':
        // Messier and Deep Sky Objects are small; only show labels when zoomed
        return currentFov < 20.0;

      case 'star':
        // Gated based on Field of View (zoom level)
        if (currentFov >= 45.0) {
          // Wide angle: show only first magnitude landmarks (Sirius, Betelgeuse, etc.)
          return magnitude < 1.8;
        } else if (currentFov >= 15.0) {
          // Medium zoom: show stars down to magnitude 3.2
          return magnitude < 3.2;
        } else {
          // Telescope zoom: show more catalog stars down to magnitude 5.8
          return magnitude < 5.8;
        }

      default:
        return false;
    }
  }
}

export const AdaptiveLabelEngine = new AdaptiveLabelEngineClass();
