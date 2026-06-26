import * as SunCalc from 'suncalc';
import { PlanetCalculationService } from '@/modules/planets/services/PlanetCalculationService';
import { OrbitService } from '@/modules/satellites/services/OrbitService';
import { calculateSatelliteAltAz, calculateAltAzForEquatorial } from '@/components/workspaces/celestial-explorer/CelestialExplorer.utils';
import { DEEP_SKY_CATALOG, DeepSkyCatalogItem } from '@/components/workspaces/celestial-explorer/engine/ExplorerEngine';

export class VisibilityEngine {
  /**
   * Calculates planet visibility parameters at a specific time and location.
   */
  public static getPlanetVisibility(
    planetId: 'mercury' | 'venus' | 'mars' | 'jupiter' | 'saturn',
    lat: number,
    lon: number,
    date: Date
  ): { altitude: number; azimuth: number; isVisible: boolean } {
    const mockLoc = { latitude: lat, longitude: lon, id: 'temp', name: 'temp', country: 'temp', timezone: 'UTC', localTime: '', dayState: 'Night', sunrise: '', sunset: '', twilight: '', source: 'temp', timestamp: 0 };
    const pos = PlanetCalculationService.calculatePosition(planetId, mockLoc, date);
    return {
      altitude: pos.altitude,
      azimuth: pos.azimuth,
      isVisible: pos.altitude > 0
    };
  }

  /**
   * Calculates moon visibility parameters.
   */
  public static getMoonVisibility(
    lat: number,
    lon: number,
    date: Date
  ): { altitude: number; azimuth: number; illumination: number; isVisible: boolean } {
    const pos = SunCalc.getMoonPosition(date, lat, lon);
    const illum = SunCalc.getMoonIllumination(date);
    const altitude = pos.altitude * (180 / Math.PI);
    const azimuth = (pos.azimuth * (180 / Math.PI) + 180 + 360) % 360;
    return {
      altitude,
      azimuth,
      illumination: illum.fraction,
      isVisible: altitude > 0
    };
  }

  /**
   * Calculates satellite visibility parameters.
   */
  public static getSatelliteVisibility(
    sat: any, // SatelliteObject
    lat: number,
    lon: number,
    date: Date
  ): { altitude: number; azimuth: number; isVisible: boolean } {
    const prop = OrbitService.propagateSatellite(sat, date);
    const altAz = calculateSatelliteAltAz(lat, lon, prop.latitude, prop.longitude, prop.altitude);
    return {
      altitude: altAz.altitude,
      azimuth: altAz.azimuth,
      isVisible: altAz.altitude > 0
    };
  }

  /**
   * Calculates deep sky object visibility parameters.
   */
  public static getDeepSkyVisibility(
    dso: DeepSkyCatalogItem,
    lat: number,
    lon: number,
    date: Date
  ): { altitude: number; azimuth: number; isVisible: boolean } {
    const altAz = calculateAltAzForEquatorial(dso.rightAscension, dso.declination, lat, lon, date);
    return {
      altitude: altAz.altitude,
      azimuth: altAz.azimuth,
      isVisible: altAz.altitude > 0
    };
  }
}
