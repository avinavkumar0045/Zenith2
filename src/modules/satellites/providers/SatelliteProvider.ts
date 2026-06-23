import { SatelliteObject } from '../types/satellite.types';

export interface SatelliteProvider {
  /**
   * Fetches satellites by category or query
   */
  fetchSatellites(category: string): Promise<SatelliteObject[]>;
}
