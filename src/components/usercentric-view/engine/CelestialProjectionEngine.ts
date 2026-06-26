import * as Cesium from 'cesium';

export class CelestialProjectionEngineClass {
  
  /**
   * Computes the Horizontal coordinates (Altitude and Azimuth) for a given RA and Dec
   * at the observer's coordinates and selected date/time.
   * 
   * @param raHours Right Ascension in hours (0 to 24)
   * @param decDegrees Declination in degrees (-90 to +90)
   * @param latDegrees Observer Latitude in degrees (-90 to +90)
   * @param lonDegrees Observer Longitude in degrees (-180 to +180)
   * @param date Date object representing observation time
   */
  public getAltAz(
    raHours: number, 
    decDegrees: number, 
    latDegrees: number, 
    lonDegrees: number, 
    date: Date
  ): { altitude: number, azimuth: number } {
    // 1. Julian Date
    const jd = (date.getTime() / 86400000.0) + 2440587.5;
    
    // 2. Greenwich Mean Sidereal Time (GMST) in hours
    const d = jd - 2451545.0; // days since J2000.0
    let gmst = 18.697374558 + 24.06570982441908 * d;
    gmst = gmst % 24;
    if (gmst < 0) gmst += 24;

    // 3. Local Sidereal Time (LST) in hours
    let lst = gmst + (lonDegrees / 15.0);
    lst = lst % 24;
    if (lst < 0) lst += 24;

    // 4. Hour Angle (HA) in hours
    let haHours = lst - raHours;
    if (haHours < -12) haHours += 24;
    if (haHours > 12) haHours -= 24;

    // Convert to radians
    const deg2rad = Math.PI / 180;
    const rad2deg = 180 / Math.PI;

    const haRad = (haHours * 15) * deg2rad;
    const decRad = decDegrees * deg2rad;
    const latRad = latDegrees * deg2rad;

    // 5. Calculate Altitude
    const sinAlt = Math.sin(decRad) * Math.sin(latRad) + Math.cos(decRad) * Math.cos(latRad) * Math.cos(haRad);
    const altRad = Math.asin(Math.max(-1, Math.min(1, sinAlt)));
    const altitude = altRad * rad2deg;

    // 6. Calculate Azimuth
    const cosAz = (Math.sin(decRad) - Math.sin(altRad) * Math.sin(latRad)) / (Math.cos(altRad) * Math.cos(latRad));
    let azRad = Math.acos(Math.max(-1, Math.min(1, cosAz))); // clamp to prevent NaN on rounding errors

    if (Math.sin(haRad) > 0) {
      azRad = 2 * Math.PI - azRad;
    }
    const azimuth = azRad * rad2deg;

    return { altitude, azimuth };
  }

  /**
   * Translates Altitude and Azimuth coordinates to a global Cartesian3 coordinate 
   * placed on a virtual dome of a specific radius around the observer's ECEF coordinates.
   * 
   * @param altDegrees Altitude in degrees (-90 to 90)
   * @param azDegrees Azimuth in degrees (0 to 360, 0=North, 90=East, 180=South, 270=West)
   * @param observerPosition Cartesian3 coordinate of the observer on Earth's surface
   * @param radius Radius of the celestial dome in meters (default 200,000m)
   */
  public altAzToCartesian(
    altDegrees: number,
    azDegrees: number,
    observerPosition: Cesium.Cartesian3,
    radius: number = 200000.0
  ): Cesium.Cartesian3 {
    const altRad = altDegrees * (Math.PI / 180.0);
    const azRad = azDegrees * (Math.PI / 180.0);

    // Calculate position in the local East-North-Up coordinate frame
    // X is East, Y is North, Z is Up
    const xEnu = Math.cos(altRad) * Math.sin(azRad);
    const yEnu = Math.cos(altRad) * Math.cos(azRad);
    const zEnu = Math.sin(altRad);

    const localOffset = new Cesium.Cartesian3(xEnu * radius, yEnu * radius, zEnu * radius);

    // Transform local offset to the global Earth-Centered, Earth-Fixed (ECEF) coordinates
    const enuMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(observerPosition);
    return Cesium.Matrix4.multiplyByPoint(enuMatrix, localOffset, new Cesium.Cartesian3());
  }

  /**
   * Computes the Altitude and Azimuth of an object relative to the observer 
   * using their global ECEF Cartesian3 coordinates.
   */
  public getAltAzFromCartesian(
    targetPosition: Cesium.Cartesian3,
    observerPosition: Cesium.Cartesian3
  ): { altitude: number; azimuth: number } {
    // 1. Get vector from observer to target
    const ecefVector = Cesium.Cartesian3.subtract(targetPosition, observerPosition, new Cesium.Cartesian3());
    const distance = Cesium.Cartesian3.magnitude(ecefVector);

    if (distance < 0.1) {
      return { altitude: 90.0, azimuth: 0.0 }; // Right overhead
    }

    // 2. Transform this vector to local East-North-Up frame at observer position
    const enuMatrix = Cesium.Transforms.eastNorthUpToFixedFrame(observerPosition);
    const invEnuMatrix = Cesium.Matrix4.inverse(enuMatrix, new Cesium.Matrix4());
    
    // Multiply matrix by vector (treating it as a point offset)
    const localDir = Cesium.Matrix4.multiplyByPointAsVector(invEnuMatrix, ecefVector, new Cesium.Cartesian3());

    // 3. Compute spherical angles in the local frame
    // X is East, Y is North, Z is Up
    const altRad = Math.asin(Math.max(-1.0, Math.min(1.0, localDir.z / distance)));
    const alt = altRad * (180.0 / Math.PI);

    let azRad = Math.atan2(localDir.x, localDir.y); // angle clockwise from Y (North)
    if (azRad < 0) {
      azRad += Math.PI * 2;
    }
    const az = azRad * (180.0 / Math.PI);

    return { altitude: alt, azimuth: az };
  }

  /**
   * Directly projects an RA and Dec coordinate pair to global Cartesian3 relative to the observer.
   */
  public projectCelestial(
    raHours: number,
    decDegrees: number,
    latDegrees: number,
    lonDegrees: number,
    date: Date,
    observerPosition: Cesium.Cartesian3,
    radius: number = 200000.0
  ): Cesium.Cartesian3 {
    const { altitude, azimuth } = this.getAltAz(raHours, decDegrees, latDegrees, lonDegrees, date);
    return this.altAzToCartesian(altitude, azimuth, observerPosition, radius);
  }
}

export const CelestialProjectionEngine = new CelestialProjectionEngineClass();
