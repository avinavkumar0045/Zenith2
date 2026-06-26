import { ExplorerObject } from '../CelestialExplorer.types';

export class RankingEngine {
  /**
   * Dynamically ranks and sorts celestial objects based on current visibility,
   * observation quality score, altitude elevation, and astronomical interest.
   */
  public static rankObjects(objects: ExplorerObject[]): ExplorerObject[] {
    return [...objects].sort((a, b) => {
      // 1. Prioritize visible (above horizon) objects over below horizon
      const aIsVisible = a.visibilityState !== 'Below Horizon' && a.altitude > 0;
      const bIsVisible = b.visibilityState !== 'Below Horizon' && b.altitude > 0;

      if (aIsVisible && !bIsVisible) return -1;
      if (!aIsVisible && bIsVisible) return 1;

      // 2. Sort by observation score (higher ratings first)
      if (a.observationRating !== b.observationRating) {
        return b.observationRating - a.observationRating;
      }

      // 3. Sort by altitude if both are visible (higher elevation is better for tracking/clearness)
      if (aIsVisible && bIsVisible && Math.abs(a.altitude - b.altitude) > 0.1) {
        return b.altitude - a.altitude;
      }

      // 4. Sort by importance of object category
      const typePriority: Record<string, number> = {
        planets: 6,
        moon: 5,
        stations: 4,
        constellations: 3,
        'deep-sky': 2,
        satellites: 1,
      };

      const aPriority = typePriority[a.type] ?? 0;
      const bPriority = typePriority[b.type] ?? 0;

      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }

      // 5. Final fallback to altitude (absolute height)
      return b.altitude - a.altitude;
    });
  }
}
