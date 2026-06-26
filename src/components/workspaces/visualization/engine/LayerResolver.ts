import { ImmutableVisualizationState } from '../Visualization.types';

export class LayerResolver {
  /**
   * Resolves dependencies and conflicts between visualization layers pure-functionally.
   * Returns a resolved immutable state.
   */
  public static resolveLayers(state: ImmutableVisualizationState): ImmutableVisualizationState {
    const resolved = { ...state };

    // 1. Observation Windows / Score / Best Target require planets, moon, day-night lighting, and weather
    if (state.showObservationWindows || state.showObservationScore || state.showBestTarget) {
      resolved.showPlanets = true;
      resolved.showMoon = true;
      resolved.showDayNight = true;
      resolved.showWeather = true;
    }

    // 2. Paths (ground tracks, orbits, visibility cones) require either satellites or ISS
    if (state.showGroundTracks || state.showFutureOrbits || state.showPastOrbits || state.showVisibilityCones) {
      if (!state.showSatellites && !state.showISS) {
        // Default to showing ISS if paths are enabled but parent objects are off
        resolved.showISS = true;
      }
    }

    // 3. Label toggles require their parent objects to be visible
    if (state.showPlanetLabels && !resolved.showPlanets) {
      resolved.showPlanets = true;
    }
    if (state.showSatelliteLabels && !resolved.showSatellites && !resolved.showISS) {
      resolved.showISS = true;
    }
    if (state.showConstellationLabels && !resolved.showConstellations) {
      resolved.showConstellations = true;
    }

    // 4. Handle opacities based on visibility toggles
    // If a layer is toggled off, its effective rendering opacity is zeroed
    if (!resolved.showClouds) resolved.opacityClouds = 0;
    if (!resolved.showGroundTracks && !resolved.showFutureOrbits && !resolved.showPastOrbits) {
      resolved.opacityGroundTracks = 0;
    }
    if (!resolved.showPlanetLabels && !resolved.showSatelliteLabels && !resolved.showConstellationLabels) {
      resolved.opacityLabels = 0;
    }
    if (!resolved.showGrid) resolved.opacityGrid = 0;
    if (!resolved.showAtmosphere) resolved.opacityAtmosphere = 0;

    return resolved;
  }
}
