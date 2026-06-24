export class ConstellationZenithServiceClass {
  
  public calculateZenithDistance(altitude: number): number {
    return Math.abs(90 - altitude);
  }
  
}

export const ConstellationZenithService = new ConstellationZenithServiceClass();
