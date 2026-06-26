import { useVisualizationStore, VisualizationProfile } from '@/components/workspaces/visualization/Visualization.types';

export class VisualizationAPI {
  public static getProfile(): VisualizationProfile {
    return useVisualizationStore.getState().activeProfile;
  }

  public static setProfile(profile: VisualizationProfile) {
    useVisualizationStore.getState().setProfile(profile);
  }

  public static toggleLayer(key: any) {
    useVisualizationStore.getState().toggleOption(key);
  }

  public static setOpacity(key: any, value: number) {
    useVisualizationStore.getState().setOpacity(key, value);
  }

  public static getLayersState() {
    const state = useVisualizationStore.getState();
    return {
      activeProfile: state.activeProfile,
      showPlanets: state.showPlanets,
      showMoon: state.showMoon,
      showISS: state.showISS,
      showSatellites: state.showSatellites,
      showAtmosphere: state.showAtmosphere,
      showClouds: state.showClouds,
      showGroundTracks: state.showGroundTracks,
      showGrid: state.showGrid,
      opacityClouds: state.opacityClouds,
      opacityGroundTracks: state.opacityGroundTracks,
      opacityLabels: state.opacityLabels,
      opacityGrid: state.opacityGrid,
      opacityAtmosphere: state.opacityAtmosphere
    };
  }
}
