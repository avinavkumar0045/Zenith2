import { ImmutableVisualizationState } from './Visualization.types';

export interface SearchableControlItem {
  key: keyof Omit<ImmutableVisualizationState, 'activeProfile' | 'cameraMode' | 'selectedTrackEntityId' | 'searchQuery'>;
  label: string;
  category: 'Objects' | 'Environment' | 'Paths' | 'Labels' | 'Analytics';
  description: string;
  tags: string[];
}

export const SEARCHABLE_CONTROLS: SearchableControlItem[] = [
  {
    key: 'showPlanets',
    label: 'Planets Visibility',
    category: 'Objects',
    description: 'Toggle rendering of planets on the globe.',
    tags: ['planets', 'solar', 'bodies', 'mercury', 'venus', 'mars', 'jupiter', 'saturn']
  },
  {
    key: 'showMoon',
    label: 'Moon Position',
    category: 'Objects',
    description: 'Toggle sub-lunar point rendering and moon status.',
    tags: ['moon', 'lunar', 'overhead', 'phases']
  },
  {
    key: 'showISS',
    label: 'ISS Tracker',
    category: 'Objects',
    description: 'Toggle International Space Station position beacon.',
    tags: ['iss', 'space station', 'satellites', 'orbit', '25544']
  },
  {
    key: 'showSatellites',
    label: 'Active Satellites',
    category: 'Objects',
    description: 'Show active communication and weather satellites.',
    tags: ['satellites', 'active', 'passes', 'payloads']
  },
  {
    key: 'showSpaceStations',
    label: 'Space Stations',
    category: 'Objects',
    description: 'Render orbital space stations other than ISS.',
    tags: ['stations', 'space stations', 'tiangong']
  },
  {
    key: 'showConstellations',
    label: 'Constellations',
    category: 'Objects',
    description: 'Toggle constellation sky correlation boundaries.',
    tags: ['constellations', 'asterism', 'starsign', 'mythology']
  },
  {
    key: 'showDeepSky',
    label: 'Deep Sky Objects',
    category: 'Objects',
    description: 'Display Messier catalog galaxies, clusters, and nebulae.',
    tags: ['dso', 'deep sky', 'nebula', 'galaxies', 'messier', 'andromeda']
  },
  {
    key: 'showDayNight',
    label: 'Day/Night Shadows',
    category: 'Environment',
    description: 'Toggle global lighting and solar shadow terminator.',
    tags: ['day', 'night', 'sun', 'shadow', 'lighting', 'terminator']
  },
  {
    key: 'showAtmosphere',
    label: 'Atmospheric Glow',
    category: 'Environment',
    description: 'Toggle rendering of Earth atmosphere scattering.',
    tags: ['atmosphere', 'glow', 'scattering', 'haze', 'airglow']
  },
  {
    key: 'showClouds',
    label: 'Clouds Simulation',
    category: 'Environment',
    description: 'Toggle cloud layers and weather coverage maps.',
    tags: ['clouds', 'weather', 'atmosphere', 'overcast', 'opacity']
  },
  {
    key: 'showWeather',
    label: 'Weather Systems',
    category: 'Environment',
    description: 'Toggle precipitation and temperature telemetry grid.',
    tags: ['weather', 'rain', 'climate', 'forecast']
  },
  {
    key: 'showStars',
    label: 'Stars Backdrop',
    category: 'Environment',
    description: 'Show stars background based on sidereal orientation.',
    tags: ['stars', 'backdrop', 'skybox', 'space']
  },
  {
    key: 'showMilkyWay',
    label: 'Milky Way Band',
    category: 'Environment',
    description: 'Render Milky Way galaxy dust lanes and structure.',
    tags: ['milky way', 'galaxy', 'milkyway', 'stars']
  },
  {
    key: 'showLightPollution',
    label: 'Light Pollution Overlay',
    category: 'Environment',
    description: 'Display skyglow index from cities (Bortle Scale).',
    tags: ['light pollution', 'bortle', 'city glow', 'skyglow']
  },
  {
    key: 'showGroundTracks',
    label: 'Ground Tracks',
    category: 'Paths',
    description: 'Draw satellite orbital paths projected on Earth surface.',
    tags: ['ground tracks', 'orbit', 'path', 'projection']
  },
  {
    key: 'showFutureOrbits',
    label: 'Future Orbits',
    category: 'Paths',
    description: 'Draw 3D forward-propagated orbital lines in space.',
    tags: ['future', 'orbit', 'path', 'propagation', 'prediction']
  },
  {
    key: 'showPastOrbits',
    label: 'Past Orbits',
    category: 'Paths',
    description: 'Draw 3D historical orbital paths representing decay.',
    tags: ['past', 'orbit', 'history', 'decay']
  },
  {
    key: 'showVisibilityCones',
    label: 'Visibility Cones',
    category: 'Paths',
    description: 'Show satellite sensor footprint cones (footprint radii).',
    tags: ['cones', 'visibility cone', 'footprint', 'coverage', 'sensor']
  },
  {
    key: 'showObserverHorizon',
    label: 'Observer Horizon Limit',
    category: 'Paths',
    description: 'Draw a circle representing local horizon observation range.',
    tags: ['horizon', 'observer', 'range', 'ground limit', 'cone']
  },
  {
    key: 'showPlanetLabels',
    label: 'Planet Labels',
    category: 'Labels',
    description: 'Toggle typographic tags over planet coordinates.',
    tags: ['planet', 'label', 'text', 'tags']
  },
  {
    key: 'showSatelliteLabels',
    label: 'Satellite Labels',
    category: 'Labels',
    description: 'Toggle names and NORAD IDs over satellite entities.',
    tags: ['satellite', 'label', 'norad', 'name']
  },
  {
    key: 'showConstellationLabels',
    label: 'Constellation Labels',
    category: 'Labels',
    description: 'Toggle names of astronomical constellations.',
    tags: ['constellation', 'label', 'name']
  },
  {
    key: 'showCities',
    label: 'Cities & Locations',
    category: 'Labels',
    description: 'Show location names on the Earth.',
    tags: ['cities', 'towns', 'locations', 'places']
  },
  {
    key: 'showCoordinates',
    label: 'Coordinate Readouts',
    category: 'Labels',
    description: 'Display active latitude and longitude readouts.',
    tags: ['coordinates', 'lat', 'lon', 'display']
  },
  {
    key: 'showGrid',
    label: 'Geographic Grid',
    category: 'Labels',
    description: 'Render coordinate latitude/longitude grid lines.',
    tags: ['grid', 'geographic', 'coordinate grid', 'lines']
  },
  {
    key: 'showObservationWindows',
    label: 'Observation Windows',
    category: 'Analytics',
    description: 'Toggle stargazing windows analytics overlays.',
    tags: ['window', 'stargazing', 'schedule', 'planning']
  },
  {
    key: 'showObservationScore',
    label: 'Sky Score Indicator',
    category: 'Analytics',
    description: 'Show calculated stargazing score markers.',
    tags: ['score', 'stargazing score', 'rating']
  },
  {
    key: 'showBestTarget',
    label: 'Best Target Marker',
    category: 'Analytics',
    description: 'Glow-highlight the top recommended target tonight.',
    tags: ['best', 'target', 'recommendation', 'highlight']
  },
  {
    key: 'showAltitudeLines',
    label: 'Altitude Markings',
    category: 'Analytics',
    description: 'Render local elevation altitude rings.',
    tags: ['altitude', 'elevation', 'degrees', 'ring']
  },
  {
    key: 'showAzimuthLines',
    label: 'Azimuth Markings',
    category: 'Analytics',
    description: 'Render horizontal bearing azimuth angle segments.',
    tags: ['azimuth', 'bearing', 'degrees']
  },
  {
    key: 'showDirectionGuides',
    label: 'Direction Guides',
    category: 'Analytics',
    description: 'Draw lines pointing towards cardinal directions (N, S, E, W).',
    tags: ['direction', 'guides', 'cardinal', 'north', 'south', 'east', 'west']
  }
];

export function filterControls(query: string): SearchableControlItem[] {
  const normQuery = query.toLowerCase().trim();
  if (!normQuery) return SEARCHABLE_CONTROLS;
  
  return SEARCHABLE_CONTROLS.filter(ctrl => {
    return ctrl.label.toLowerCase().includes(normQuery) ||
           ctrl.description.toLowerCase().includes(normQuery) ||
           ctrl.category.toLowerCase().includes(normQuery) ||
           ctrl.tags.some(tag => tag.includes(normQuery));
  });
}
