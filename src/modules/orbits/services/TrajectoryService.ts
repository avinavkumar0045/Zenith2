import { OrbitService } from '../../satellites/services/OrbitService';
import { SatelliteObject } from '../../satellites/types/satellite.types';
import { OrbitPoint } from '../types/orbit.types';

class TrajectoryServiceClass {
  
  /**
   * Generates an array of orbital points for a given time range.
   * @param satellite The target satellite
   * @param pastMinutes How many minutes into the past to calculate
   * @param futureMinutes How many minutes into the future to calculate
   * @param stepMinutes Interval between points
   */
  public generateTrajectory(satellite: SatelliteObject, pastMinutes: number = 30, futureMinutes: number = 90, stepMinutes: number = 2): { past: OrbitPoint[], future: OrbitPoint[] } {
    const past: OrbitPoint[] = [];
    const future: OrbitPoint[] = [];
    
    if (!satellite.tleLine1 || !satellite.tleLine2) return { past, future };

    const nowMs = Date.now();
    const msPerMinute = 60000;

    // Generate Past
    for (let i = pastMinutes; i > 0; i -= stepMinutes) {
      const targetTime = new Date(nowMs - (i * msPerMinute));
      const point = OrbitService.propagateSatellite(satellite, targetTime);
      past.push({
        latitude: point.latitude,
        longitude: point.longitude,
        altitude: point.altitude,
        timestamp: point.timestamp
      });
    }

    // Generate Future
    for (let i = 0; i <= futureMinutes; i += stepMinutes) {
      const targetTime = new Date(nowMs + (i * msPerMinute));
      const point = OrbitService.propagateSatellite(satellite, targetTime);
      future.push({
        latitude: point.latitude,
        longitude: point.longitude,
        altitude: point.altitude,
        timestamp: point.timestamp
      });
    }

    return { past, future };
  }
}

export const TrajectoryService = new TrajectoryServiceClass();
