import { LocationIntelligenceObject } from '../../location/types/location.types';

export interface PlanetPositionRaw {
  ra: number; // degrees
  dec: number; // degrees
  distance: number; // AU
  altitude: number; // degrees
  azimuth: number; // degrees
}

export class PlanetCalculationServiceClass {
  // Orbital Elements for J2000.0
  private readonly elements = {
    sun:     { N: 0.0, i: 0.0, w: 282.9404, a: 1.000000, e: 0.016709, M_0: 356.0470, dM: 0.9856002585 },
    mercury: { N: 48.3313, i: 7.0047, w: 29.1241, a: 0.387098, e: 0.205635, M_0: 168.6562, dM: 4.0923344368 },
    venus:   { N: 76.6799, i: 3.3946, w: 54.8910, a: 0.723330, e: 0.006773, M_0: 48.0052,  dM: 1.6021302244 },
    mars:    { N: 49.5574, i: 1.8497, w: 286.5016, a: 1.523688, e: 0.093405, M_0: 18.6021,  dM: 0.5240207766 },
    jupiter: { N: 100.4542, i: 1.3030, w: 273.8777, a: 5.20256, e: 0.048498, M_0: 19.8950,  dM: 0.0830853001 },
    saturn:  { N: 113.6634, i: 2.4886, w: 339.3939, a: 9.55475, e: 0.055546, M_0: 316.9670, dM: 0.0334442282 }
  };

  private dtr(d: number): number { return d * Math.PI / 180.0; }
  private rtd(r: number): number { return r * 180.0 / Math.PI; }
  private rev(angle: number): number { return angle - Math.floor(angle / 360.0) * 360.0; }

  private getDaysSinceJ2000(date: Date): number {
    return (date.getTime() / 86400000) - 10957.5;
  }

  private solveKepler(M: number, e: number): number {
    const E = M + e * this.rtd(Math.sin(this.dtr(M))) * (1.0 + e * Math.cos(this.dtr(M)));
    let E1 = E;
    for (let i = 0; i < 5; i++) {
      const E0 = E1;
      const E0_rad = this.dtr(E0);
      E1 = E0 - (E0 - e * this.rtd(Math.sin(E0_rad)) - M) / (1 - e * Math.cos(E0_rad));
    }
    return E1;
  }

  private getHeliocentricCoords(planet: keyof typeof this.elements, d: number) {
    const el = this.elements[planet];
    const M = this.rev(el.M_0 + el.dM * d);
    const E = this.solveKepler(M, el.e);
    
    const E_rad = this.dtr(E);
    const xv = el.a * (Math.cos(E_rad) - el.e);
    const yv = el.a * (Math.sqrt(1.0 - el.e * el.e) * Math.sin(E_rad));
    
    const v = this.rtd(Math.atan2(yv, xv));
    const r = Math.sqrt(xv * xv + yv * yv);
    
    const N_rad = this.dtr(el.N);
    const w_rad = this.dtr(el.w);
    const i_rad = this.dtr(el.i);
    const vw_rad = this.dtr(v + el.w);
    
    const xh = r * (Math.cos(N_rad) * Math.cos(vw_rad) - Math.sin(N_rad) * Math.sin(vw_rad) * Math.cos(i_rad));
    const yh = r * (Math.sin(N_rad) * Math.cos(vw_rad) + Math.cos(N_rad) * Math.sin(vw_rad) * Math.cos(i_rad));
    const zh = r * (Math.sin(vw_rad) * Math.sin(i_rad));
    
    return { x: xh, y: yh, z: zh };
  }

  public calculatePosition(planetId: 'mercury' | 'venus' | 'mars' | 'jupiter' | 'saturn', location: LocationIntelligenceObject, date: Date = new Date()): PlanetPositionRaw {
    const d = this.getDaysSinceJ2000(date);
    
    // Heliocentric coords of Sun (Earth relative)
    const earthHelio = this.getHeliocentricCoords('sun', d);
    // Actually sun orbital elements in standard JPL give the Sun's position from Earth.
    // So Earth's position from Sun is -sun.x, -sun.y, -sun.z.
    const sunX = earthHelio.x * Math.cos(this.dtr(earthHelio.y)) // wait, sun elements give ecliptic coords directly? 
    // Standard elements for the Sun: xh, yh, zh are geocentric rectangular coordinates of the Sun.
    // Earth's heliocentric coords are exactly the opposite of the Sun's geocentric coords.
    
    // Actually, let's use standard Paul Schlyter's method:
    const sun = this.elements['sun'];
    const w_sun = sun.w;
    const a_sun = sun.a;
    const e_sun = sun.e;
    const M_sun = this.rev(sun.M_0 + sun.dM * d);
    const E_sun = this.solveKepler(M_sun, e_sun);
    const xv_sun = Math.cos(this.dtr(E_sun)) - e_sun;
    const yv_sun = Math.sin(this.dtr(E_sun)) * Math.sqrt(1 - e_sun * e_sun);
    const v_sun = this.rtd(Math.atan2(yv_sun, xv_sun));
    const r_sun = Math.sqrt(xv_sun * xv_sun + yv_sun * yv_sun);
    const lon_sun = this.rev(v_sun + w_sun); // Sun's true longitude
    
    const x_sun = r_sun * Math.cos(this.dtr(lon_sun));
    const y_sun = r_sun * Math.sin(this.dtr(lon_sun));
    // Earth's heliocentric coords:
    const x_earth = -x_sun;
    const y_earth = -y_sun;
    const z_earth = 0;

    // Planet Heliocentric
    const pHelio = this.getHeliocentricCoords(planetId, d);
    
    // Geocentric (Ecliptic)
    const x_geo = pHelio.x - x_earth;
    const y_geo = pHelio.y - y_earth;
    const z_geo = pHelio.z - z_earth;
    
    // Distance
    const dist = Math.sqrt(x_geo * x_geo + y_geo * y_geo + z_geo * z_geo);
    
    // Obliquity of ecliptic
    const oblecl = 23.4393 - 3.563e-7 * d;
    const oblecl_rad = this.dtr(oblecl);
    
    // Geocentric Equatorial (RA, Dec)
    const x_eq = x_geo;
    const y_eq = y_geo * Math.cos(oblecl_rad) - z_geo * Math.sin(oblecl_rad);
    const z_eq = y_geo * Math.sin(oblecl_rad) + z_geo * Math.cos(oblecl_rad);
    
    let ra = this.rtd(Math.atan2(y_eq, x_eq));
    ra = this.rev(ra);
    const dec = this.rtd(Math.atan2(z_eq, Math.sqrt(x_eq * x_eq + y_eq * y_eq)));
    
    // GMST (Greenwich Mean Sidereal Time)
    const LST_deg = this.rev(lon_sun + 180 + 15 * (date.getUTCHours() + date.getUTCMinutes() / 60.0 + date.getUTCSeconds() / 3600.0));
    // Actually, a more precise LST includes longitude:
    const local_LST = this.rev(LST_deg + location.longitude);
    
    // Hour Angle
    const HA = this.rev(local_LST - ra);
    
    // Topocentric Altitude & Azimuth
    const lat_rad = this.dtr(location.latitude);
    const dec_rad = this.dtr(dec);
    const HA_rad = this.dtr(HA);
    
    const x_hor = Math.cos(HA_rad) * Math.cos(dec_rad) * Math.sin(lat_rad) - Math.sin(dec_rad) * Math.cos(lat_rad);
    const y_hor = Math.sin(HA_rad) * Math.cos(dec_rad);
    const z_hor = Math.cos(HA_rad) * Math.cos(dec_rad) * Math.cos(lat_rad) + Math.sin(dec_rad) * Math.sin(lat_rad);
    
    const alt = this.rtd(Math.asin(z_hor));
    let az = this.rtd(Math.atan2(y_hor, x_hor)) + 180;
    az = this.rev(az);

    return { ra, dec, distance: dist, altitude: alt, azimuth: az };
  }

  public getTimes(planetId: 'mercury' | 'venus' | 'mars' | 'jupiter' | 'saturn', location: LocationIntelligenceObject, date: Date = new Date()): { rise: string | null, set: string | null } {
    // A simplified rise/set algorithm: Step through the day and find when altitude crosses 0
    // For performance, we'll just evaluate it at 1-hour intervals to find crossings, then refine to minute.
    const startOfDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    let rise: Date | null = null;
    let set: Date | null = null;
    
    let prevAlt = this.calculatePosition(planetId, location, startOfDay).altitude;
    
    for (let m = 30; m < 24 * 60; m += 30) {
      const d = new Date(startOfDay.getTime() + m * 60000);
      const alt = this.calculatePosition(planetId, location, d).altitude;
      
      if (prevAlt < 0 && alt >= 0) {
        rise = d; // Found roughly
      } else if (prevAlt >= 0 && alt < 0) {
        set = d; // Found roughly
      }
      prevAlt = alt;
    }
    
    const format = (d: Date | null) => {
      if (!d) return null;
      return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    return { rise: format(rise), set: format(set) };
  }
}

export const PlanetCalculationService = new PlanetCalculationServiceClass();
