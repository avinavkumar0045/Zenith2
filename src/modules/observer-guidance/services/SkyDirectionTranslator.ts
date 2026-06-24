export class SkyDirectionTranslatorClass {
  
  public getDirectionFromAzimuth(azimuth: number): string {
    let normalizedAz = azimuth % 360;
    if (normalizedAz < 0) normalizedAz += 360;

    const directions = ['North', 'North-East', 'East', 'South-East', 'South', 'South-West', 'West', 'North-West'];
    const index = Math.round(normalizedAz / 45) % 8;
    return directions[index];
  }

  public getElevationFromAltitude(altitude: number): string {
    if (altitude < 0) return 'Below Horizon';
    if (altitude <= 10) return 'Very Low Above Horizon';
    if (altitude <= 25) return 'Low In Sky';
    if (altitude <= 45) return 'Mid Sky';
    if (altitude <= 70) return 'High In Sky';
    return 'Nearly Overhead';
  }

  public generateInstruction(azimuth: number, altitude: number): string {
    const direction = this.getDirectionFromAzimuth(azimuth);
    const elevation = this.getElevationFromAltitude(altitude);
    
    let elevationPhrase = '';
    if (altitude <= 10) elevationPhrase = 'very low above the horizon';
    else if (altitude <= 25) elevationPhrase = 'low above the horizon';
    else if (altitude <= 45) elevationPhrase = 'halfway up the sky';
    else if (altitude <= 70) elevationPhrase = 'high in the sky';
    else elevationPhrase = 'almost directly overhead';

    return `Face ${direction} and look ${elevationPhrase}.`;
  }
}

export const SkyDirectionTranslator = new SkyDirectionTranslatorClass();
