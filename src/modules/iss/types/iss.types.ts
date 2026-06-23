import { SatelliteObject } from '../../satellites/types/satellite.types';

export interface ISSObject extends SatelliteObject {
  crewCount: number | null;
}
