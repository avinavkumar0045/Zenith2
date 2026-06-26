export function getDirectionLabel(azimuthDegrees: number): string {
  const deg = ((azimuthDegrees % 360) + 360) % 360;
  const index = Math.round(deg / 45) % 8;
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  return directions[index];
}

export function getGMST(date: Date): number {
  const jd = (date.getTime() / 86400000.0) + 2440587.5;
  const d = jd - 2451545.0; // days since J2000.0
  let gmst = 18.697374558 + 24.06570982441908 * d;
  gmst = gmst % 24;
  if (gmst < 0) gmst += 24;
  return gmst;
}

/**
 * Calculates the Earth sub-point (latitude/longitude) where a celestial object
 * with given Right Ascension (hours) and Declination (degrees) is directly overhead.
 */
export function getSubPointFromEquatorial(
  raHours: number,
  decDegrees: number,
  date: Date = new Date()
): { latitude: number; longitude: number } {
  const gmst = getGMST(date);
  let lon = 15.0 * (raHours - gmst);
  
  // Normalize longitude to [-180, 180]
  lon = ((lon + 180) % 360 + 360) % 360 - 180;
  
  // Latitude is exactly declination
  const lat = Math.max(-90, Math.min(90, decDegrees));
  
  return { latitude: lat, longitude: lon };
}

/**
 * Computes horizontal coordinates (Altitude and Azimuth) for an RA/Dec object
 * observed from a given location on Earth.
 */
export function calculateAltAzForEquatorial(
  raHours: number,
  decDegrees: number,
  latDegrees: number,
  lonDegrees: number,
  date: Date = new Date()
): { altitude: number; azimuth: number } {
  const gmst = getGMST(date);
  
  let lst = gmst + (lonDegrees / 15.0);
  lst = lst % 24;
  if (lst < 0) lst += 24;
  
  let haHours = lst - raHours;
  if (haHours < -12) haHours += 24;
  if (haHours > 12) haHours -= 24;
  
  const deg2rad = Math.PI / 180;
  const rad2deg = 180 / Math.PI;
  
  const haRad = (haHours * 15) * deg2rad;
  const decRad = decDegrees * deg2rad;
  const latRad = latDegrees * deg2rad;
  
  const sinAlt = Math.sin(decRad) * Math.sin(latRad) + Math.cos(decRad) * Math.cos(latRad) * Math.cos(haRad);
  const altRad = Math.asin(Math.max(-1, Math.min(1, sinAlt)));
  const altitude = altRad * rad2deg;
  
  const cosAz = (Math.sin(decRad) - Math.sin(altRad) * Math.sin(latRad)) / (Math.cos(altRad) * Math.cos(latRad));
  let azRad = Math.acos(Math.max(-1, Math.min(1, cosAz)));
  
  if (Math.sin(haRad) > 0) {
    azRad = 2 * Math.PI - azRad;
  }
  const azimuth = azRad * rad2deg;
  
  return { altitude, azimuth };
}

/**
 * Computes Elevation (altitude) and Azimuth of a satellite in orbit from the viewpoint
 * of an observer on Earth using geocentric Cartesian coordinates.
 */
export function calculateSatelliteAltAz(
  obsLat: number,
  obsLon: number,
  satLat: number,
  satLon: number,
  satAltMeters: number
): { altitude: number; azimuth: number } {
  const deg2rad = Math.PI / 180;
  const rad2deg = 180 / Math.PI;

  const Re = 6378137.0; // WGS-84 semi-major axis

  // 1. Observer position in geocentric coordinates
  const obsLatRad = obsLat * deg2rad;
  const obsLonRad = obsLon * deg2rad;
  const cosObsLat = Math.cos(obsLatRad);
  const sinObsLat = Math.sin(obsLatRad);
  const cosObsLon = Math.cos(obsLonRad);
  const sinObsLon = Math.sin(obsLonRad);

  const xObs = Re * cosObsLat * cosObsLon;
  const yObs = Re * cosObsLat * sinObsLon;
  const zObs = Re * sinObsLat;

  // 2. Satellite position in geocentric coordinates
  const satLatRad = satLat * deg2rad;
  const satLonRad = satLon * deg2rad;
  const Rs = Re + satAltMeters;
  const cosSatLat = Math.cos(satLatRad);
  const sinSatLat = Math.sin(satLatRad);
  const cosSatLon = Math.cos(satLonRad);
  const sinSatLon = Math.sin(satLonRad);

  const xSat = Rs * cosSatLat * cosSatLon;
  const ySat = Rs * cosSatLat * sinSatLon;
  const zSat = Rs * sinSatLat;

  // 3. Slant range vector
  const rx = xSat - xObs;
  const ry = ySat - yObs;
  const rz = zSat - zObs;

  // 4. Local ENU coordinate basis at observer location
  // East vector
  const ex = -sinObsLon;
  const ey = cosObsLon;
  const ez = 0;

  // North vector
  const nx = -sinObsLat * cosObsLon;
  const ny = -sinObsLat * sinObsLon;
  const nz = cosObsLat;

  // Up (Zenith) vector
  const ux = cosObsLat * cosObsLon;
  const uy = cosObsLat * sinObsLon;
  const uz = sinObsLat;

  // 5. Project range vector onto ENU basis
  const rEast = rx * ex + ry * ey + rz * ez;
  const rNorth = rx * nx + ry * ny + rz * nz;
  const rUp = rx * ux + ry * uy + rz * uz;

  // 6. Compute Elevation and Azimuth
  const slantRange = Math.sqrt(rEast * rEast + rNorth * rNorth + rUp * rUp);
  
  if (slantRange < 1.0) {
    return { altitude: 90, azimuth: 0 };
  }

  const elevation = Math.asin(rUp / slantRange) * rad2deg;
  let azimuth = Math.atan2(rEast, rNorth) * rad2deg;
  azimuth = (azimuth + 360) % 360;

  return { altitude: elevation, azimuth };
}
