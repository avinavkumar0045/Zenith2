export class ConstellationVisibilityServiceClass {
  
  // Computes Altitude and Azimuth for a given RA/Dec and observer location
  public calculatePosition(
    raHours: number, 
    decDegrees: number, 
    latDegrees: number, 
    lonDegrees: number, 
    date: Date
  ): { altitude: number, azimuth: number } {
    
    // 1. Julian Date
    const jd = this.getJulianDate(date);
    
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
    const altRad = Math.asin(sinAlt);
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

  private getJulianDate(date: Date): number {
    return (date.getTime() / 86400000.0) + 2440587.5;
  }
}

export const ConstellationVisibilityService = new ConstellationVisibilityServiceClass();
