import { ILayer } from './layers/ILayer';
import { DayNightLayer } from './layers/DayNightLayer';
import { SatelliteLayer } from './layers/SatelliteLayer';
import { LocationLayer } from './layers/LocationLayer';
import { OrbitLayer } from './layers/OrbitLayer';
import { PlanetLayer } from './layers/PlanetLayer';
import { MoonLayer } from './layers/MoonLayer';
import { HeatmapLayer } from './layers/HeatmapLayer';
import { ISSLayer } from '../iss/layers/ISSLayer';

/**
 * A central registry of all available layer classes.
 * Modules can request the instantiation of these layers via the LayerManager.
 */
export const LayerRegistry: Record<string, new () => ILayer> = {
  'day-night': DayNightLayer,
  'satellites': SatelliteLayer,
  'locations': LocationLayer,
  'orbits': OrbitLayer,
  'planets': PlanetLayer,
  'moon': MoonLayer,
  'heatmap': HeatmapLayer,
  'iss': ISSLayer,
};
