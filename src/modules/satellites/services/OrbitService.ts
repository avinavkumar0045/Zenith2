import * as satellite from 'satellite.js';
import { SatelliteObject } from '../types/satellite.types';

class OrbitServiceClass {
  
  /**
   * Parses a TLE into a SatelliteObject.
   */
  public parseTLE(name: string, tleLine1: string, tleLine2: string, category: string, source: string): SatelliteObject | null {
    try {
      const satrec = satellite.twoline2satrec(tleLine1, tleLine2);
      
      // Attempt propagation right now to get initial coords
      const now = new Date();
      const positionAndVelocity = satellite.propagate(satrec, now);
      
      const positionEci = positionAndVelocity.position;
      const velocityEci = positionAndVelocity.velocity;

      if (!positionEci) {
        return null; // Satellite might be decayed or data is invalid
      }

      // Calculate coordinates
      const gmst = satellite.gstime(now);
      const positionGd = satellite.eciToGeodetic(positionEci, gmst);
      
      const longitude = satellite.degreesLong(positionGd.longitude);
      const latitude = satellite.degreesLat(positionGd.latitude);
      const altitude = positionGd.height * 1000; // Convert km to meters for standard metric usage

      // Calculate approximate velocity in km/s
      const velocity = Math.sqrt(
        Math.pow(velocityEci.x, 2) +
        Math.pow(velocityEci.y, 2) +
        Math.pow(velocityEci.z, 2)
      );

      // Parse NORAD ID from line 1
      const noradId = parseInt(tleLine1.substring(2, 7).trim(), 10) || 0;
      
      // Parse inclination from line 2
      const inclination = parseFloat(tleLine2.substring(8, 16).trim()) || 0;

      return {
        id: `sat_${noradId}`,
        noradId,
        name: name.trim(),
        category,
        latitude,
        longitude,
        altitude,
        velocity,
        inclination,
        source,
        timestamp: Date.now(),
        tleLine1,
        tleLine2
      };
    } catch (error) {
      console.warn(`Failed to parse TLE for ${name}`);
      return null;
    }
  }

  /**
   * Propagates an existing SatelliteObject to a new time and returns updated coordinates.
   */
  public propagateSatellite(sat: SatelliteObject, date: Date = new Date()): SatelliteObject {
    if (!sat.tleLine1 || !sat.tleLine2) return sat;
    
    try {
      const satrec = satellite.twoline2satrec(sat.tleLine1, sat.tleLine2);
      const positionAndVelocity = satellite.propagate(satrec, date);
      
      if (!positionAndVelocity.position) return sat;

      const gmst = satellite.gstime(date);
      const positionGd = satellite.eciToGeodetic(positionAndVelocity.position, gmst);
      
      return {
        ...sat,
        latitude: satellite.degreesLat(positionGd.latitude),
        longitude: satellite.degreesLong(positionGd.longitude),
        altitude: positionGd.height * 1000,
        timestamp: date.getTime()
      };
    } catch (e) {
      return sat;
    }
  }
}

export const OrbitService = new OrbitServiceClass();
