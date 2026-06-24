export class SkyDirectionEngineClass {
  
  public getDirectionFromAzimuth(azimuth: number): string {
    // Normalize azimuth just in case
    let normalizedAz = azimuth % 360;
    if (normalizedAz < 0) normalizedAz += 360;

    const directions = ['North', 'North-East', 'East', 'South-East', 'South', 'South-West', 'West', 'North-West'];
    
    // Each direction segment is 45 degrees. North is centered at 0 (or 360).
    // So North is 337.5 to 22.5.
    const index = Math.round(normalizedAz / 45) % 8;
    return directions[index];
  }
}

export const SkyDirectionEngine = new SkyDirectionEngineClass();
