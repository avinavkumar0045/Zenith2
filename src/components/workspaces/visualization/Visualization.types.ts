import { create } from 'zustand';

export type VisualizationProfile = 'minimal' | 'observation' | 'satellite' | 'astrophotography' | 'everything' | 'custom';
export type CameraMode = 'free' | 'earth-lock' | 'follow-iss' | 'track-moon' | 'track-selected';

export interface ImmutableVisualizationState {
  // Profile
  activeProfile: VisualizationProfile;
  
  // Objects
  showPlanets: boolean;
  showMoon: boolean;
  showISS: boolean;
  showSatellites: boolean;
  showSpaceStations: boolean;
  showConstellations: boolean;
  showDeepSky: boolean;

  // Environment
  showDayNight: boolean;
  showAtmosphere: boolean;
  showClouds: boolean;
  showWeather: boolean;
  showStars: boolean;
  showMilkyWay: boolean;
  showLightPollution: boolean;

  // Orbital Paths
  showGroundTracks: boolean;
  showFutureOrbits: boolean;
  showPastOrbits: boolean;
  showVisibilityCones: boolean;
  showObserverHorizon: boolean;

  // Labels
  showPlanetLabels: boolean;
  showSatelliteLabels: boolean;
  showConstellationLabels: boolean;
  showCities: boolean;
  showCoordinates: boolean;
  showGrid: boolean;

  // Analytics
  showObservationWindows: boolean;
  showObservationScore: boolean;
  showBestTarget: boolean;
  showAltitudeLines: boolean;
  showAzimuthLines: boolean;
  showDirectionGuides: boolean;

  // Opacity (0 - 100)
  opacityClouds: number;
  opacityGroundTracks: number;
  opacityLabels: number;
  opacityGrid: number;
  opacityAtmosphere: number;

  // Camera
  cameraMode: CameraMode;
  selectedTrackEntityId: string | null;

  // Search filter
  searchQuery: string;
}

export interface VisualizationStore extends ImmutableVisualizationState {
  setProfile: (profile: VisualizationProfile) => void;
  toggleOption: (key: keyof Omit<ImmutableVisualizationState, 'activeProfile' | 'cameraMode' | 'selectedTrackEntityId' | 'searchQuery'>) => void;
  setOpacity: (key: 'opacityClouds' | 'opacityGroundTracks' | 'opacityLabels' | 'opacityGrid' | 'opacityAtmosphere', value: number) => void;
  setCameraMode: (mode: CameraMode, entityId?: string | null) => void;
  setSearchQuery: (query: string) => void;
}

export const PROFILE_PRESETS: Record<Exclude<VisualizationProfile, 'custom'>, Omit<ImmutableVisualizationState, 'activeProfile' | 'searchQuery'>> = {
  minimal: {
    showPlanets: false,
    showMoon: true,
    showISS: false,
    showSatellites: false,
    showSpaceStations: false,
    showConstellations: false,
    showDeepSky: false,
    showDayNight: true,
    showAtmosphere: true,
    showClouds: false,
    showWeather: false,
    showStars: false,
    showMilkyWay: false,
    showLightPollution: false,
    showGroundTracks: false,
    showFutureOrbits: false,
    showPastOrbits: false,
    showVisibilityCones: false,
    showObserverHorizon: false,
    showPlanetLabels: false,
    showSatelliteLabels: false,
    showConstellationLabels: false,
    showCities: false,
    showCoordinates: false,
    showGrid: false,
    showObservationWindows: false,
    showObservationScore: false,
    showBestTarget: false,
    showAltitudeLines: false,
    showAzimuthLines: false,
    showDirectionGuides: false,
    opacityClouds: 0,
    opacityGroundTracks: 0,
    opacityLabels: 0,
    opacityGrid: 0,
    opacityAtmosphere: 50,
    cameraMode: 'free',
    selectedTrackEntityId: null,
  },
  observation: {
    showPlanets: true,
    showMoon: true,
    showISS: false,
    showSatellites: false,
    showSpaceStations: false,
    showConstellations: true,
    showDeepSky: true,
    showDayNight: true,
    showAtmosphere: true,
    showClouds: true,
    showWeather: true,
    showStars: true,
    showMilkyWay: true,
    showLightPollution: true,
    showGroundTracks: false,
    showFutureOrbits: false,
    showPastOrbits: false,
    showVisibilityCones: false,
    showObserverHorizon: true,
    showPlanetLabels: true,
    showSatelliteLabels: false,
    showConstellationLabels: true,
    showCities: true,
    showCoordinates: false,
    showGrid: false,
    showObservationWindows: true,
    showObservationScore: true,
    showBestTarget: true,
    showAltitudeLines: true,
    showAzimuthLines: true,
    showDirectionGuides: true,
    opacityClouds: 70,
    opacityGroundTracks: 0,
    opacityLabels: 80,
    opacityGrid: 0,
    opacityAtmosphere: 60,
    cameraMode: 'free',
    selectedTrackEntityId: null,
  },
  satellite: {
    showPlanets: false,
    showMoon: false,
    showISS: true,
    showSatellites: true,
    showSpaceStations: true,
    showConstellations: false,
    showDeepSky: false,
    showDayNight: true,
    showAtmosphere: true,
    showClouds: false,
    showWeather: false,
    showStars: false,
    showMilkyWay: false,
    showLightPollution: false,
    showGroundTracks: true,
    showFutureOrbits: true,
    showPastOrbits: true,
    showVisibilityCones: true,
    showObserverHorizon: false,
    showPlanetLabels: false,
    showSatelliteLabels: true,
    showConstellationLabels: false,
    showCities: true,
    showCoordinates: true,
    showGrid: true,
    showObservationWindows: false,
    showObservationScore: false,
    showBestTarget: false,
    showAltitudeLines: false,
    showAzimuthLines: false,
    showDirectionGuides: true,
    opacityClouds: 0,
    opacityGroundTracks: 80,
    opacityLabels: 90,
    opacityGrid: 40,
    opacityAtmosphere: 50,
    cameraMode: 'follow-iss',
    selectedTrackEntityId: 'sat_25544',
  },
  astrophotography: {
    showPlanets: true,
    showMoon: true,
    showISS: false,
    showSatellites: false,
    showSpaceStations: false,
    showConstellations: true,
    showDeepSky: true,
    showDayNight: true,
    showAtmosphere: true,
    showClouds: true,
    showWeather: true,
    showStars: true,
    showMilkyWay: true,
    showLightPollution: true,
    showGroundTracks: false,
    showFutureOrbits: false,
    showPastOrbits: false,
    showVisibilityCones: false,
    showObserverHorizon: true,
    showPlanetLabels: false,
    showSatelliteLabels: false,
    showConstellationLabels: false,
    showCities: false,
    showCoordinates: false,
    showGrid: false,
    showObservationWindows: true,
    showObservationScore: false,
    showBestTarget: false,
    showAltitudeLines: true,
    showAzimuthLines: true,
    showDirectionGuides: false,
    opacityClouds: 30,
    opacityGroundTracks: 0,
    opacityLabels: 0,
    opacityGrid: 0,
    opacityAtmosphere: 40,
    cameraMode: 'free',
    selectedTrackEntityId: null,
  },
  everything: {
    showPlanets: true,
    showMoon: true,
    showISS: true,
    showSatellites: true,
    showSpaceStations: true,
    showConstellations: true,
    showDeepSky: true,
    showDayNight: true,
    showAtmosphere: true,
    showClouds: true,
    showWeather: true,
    showStars: true,
    showMilkyWay: true,
    showLightPollution: true,
    showGroundTracks: true,
    showFutureOrbits: true,
    showPastOrbits: true,
    showVisibilityCones: true,
    showObserverHorizon: true,
    showPlanetLabels: true,
    showSatelliteLabels: true,
    showConstellationLabels: true,
    showCities: true,
    showCoordinates: true,
    showGrid: true,
    showObservationWindows: true,
    showObservationScore: true,
    showBestTarget: true,
    showAltitudeLines: true,
    showAzimuthLines: true,
    showDirectionGuides: true,
    opacityClouds: 80,
    opacityGroundTracks: 80,
    opacityLabels: 90,
    opacityGrid: 60,
    opacityAtmosphere: 70,
    cameraMode: 'free',
    selectedTrackEntityId: null,
  },
};

export const useVisualizationStore = create<VisualizationStore>((set) => ({
  // Initial default: observation profile
  activeProfile: 'observation',
  ...PROFILE_PRESETS.observation,
  searchQuery: '',

  setProfile: (profile) => set((state) => {
    if (profile === 'custom') return { activeProfile: 'custom' };
    return {
      activeProfile: profile,
      ...PROFILE_PRESETS[profile],
    };
  }),

  toggleOption: (key) => set((state) => {
    const nextVal = !state[key];
    
    // Changing an option transitions the profile to "custom"
    return {
      [key]: nextVal,
      activeProfile: 'custom',
    };
  }),

  setOpacity: (key, value) => set((state) => {
    return {
      [key]: value,
      activeProfile: 'custom',
    };
  }),

  setCameraMode: (mode, entityId = null) => set((state) => {
    return {
      cameraMode: mode,
      selectedTrackEntityId: entityId,
      activeProfile: 'custom',
    };
  }),

  setSearchQuery: (query) => set({ searchQuery: query }),
}));
