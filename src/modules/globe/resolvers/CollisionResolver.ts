import * as Cesium from 'cesium';

interface LabelRect {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

/**
 * Projects entity labels to screen space and determines if they overlap.
 * Mutates label.show in place for non-overlapping entities based on priority.
 * 
 * @param sortedEntities Entities with labels, sorted by priority descending (highest priority first).
 * @param scene Cesium scene used for projection.
 * @param julianDate Current JulianDate for value evaluations.
 */
export function resolveLabelCollisions(
  sortedEntities: Cesium.Entity[],
  scene: Cesium.Scene,
  julianDate: Cesium.JulianDate
): void {
  const acceptedRects: LabelRect[] = [];

  sortedEntities.forEach((entity) => {
    // If zoom-based checks already hid it, skip collision checking and keep hidden
    if (!(entity as any)._zoomShowLabel) {
      if (entity.label) {
        entity.label.show = false as any;
      }
      return;
    }

    const position = entity.position?.getValue(julianDate);
    if (!position) {
      if (entity.label) entity.label.show = false as any;
      return;
    }

    // Project 3D coordinate to screen coordinates
    const screenPos = Cesium.SceneTransforms.worldToWindowCoordinates(scene, position);
    if (!screenPos) {
      if (entity.label) entity.label.show = false as any;
      return;
    }

    // Estimate label bounding box size
    const text = entity.label?.text?.getValue(julianDate) || entity.name || "";
    const charCount = text.length;
    const width = charCount * 8 + 12; // ~8px per character + padding
    const height = 18;

    // Retrieve pixelOffset if configured
    const pixelOffset = entity.label?.pixelOffset?.getValue(julianDate) || new Cesium.Cartesian2(0, 0);

    const x = screenPos.x + pixelOffset.x;
    const y = screenPos.y + pixelOffset.y;

    const rect: LabelRect = {
      left: x - width / 2 - 6, // extra 6px horizontal safety buffer
      right: x + width / 2 + 6,
      top: y - height / 2 - 4, // extra 4px vertical safety buffer
      bottom: y + height / 2 + 4
    };

    // Check collision with already accepted higher-priority labels
    const hasCollision = acceptedRects.some((r) => {
      return !(
        rect.left > r.right ||
        rect.right < r.left ||
        rect.top > r.bottom ||
        rect.bottom < r.top
      );
    });

    if (hasCollision) {
      if (entity.label) entity.label.show = false as any;
    } else {
      if (entity.label) {
        entity.label.show = true as any;
        
        // Dynamic Opacity and Color Hierarchy based on priority
        const priority = (entity as any)._priority || 0;
        let baseColor = Cesium.Color.WHITE;
        let alpha = 1.0;

        if (priority >= 95) {
          // Current Location (100) & ISS (95) - 100% Opacity
          baseColor = Cesium.Color.WHITE;
          alpha = 1.0;
        } else if (priority === 90) {
          // Moon - 90% Opacity
          baseColor = Cesium.Color.WHITE;
          alpha = 0.9;
        } else if (priority === 85) {
          // Major Planets - 70% Opacity with very soft sky-blue tint
          baseColor = Cesium.Color.fromCssColorString('#e0f2fe'); 
          alpha = 0.7;
        } else if (priority >= 70) {
          // Space Stations & Weather Satellites - 60% Opacity with soft warm tint
          baseColor = Cesium.Color.fromCssColorString('#fef08a');
          alpha = 0.6;
        } else {
          // Communication & Other Satellites - 45% Opacity with muted grey
          baseColor = Cesium.Color.fromCssColorString('#e5e7eb');
          alpha = 0.45;
        }

        entity.label.fillColor = baseColor.withAlpha(alpha) as any;
        entity.label.outlineColor = Cesium.Color.BLACK.withAlpha(alpha * 0.8) as any;
      }
      acceptedRects.push(rect);
    }
  });
}
