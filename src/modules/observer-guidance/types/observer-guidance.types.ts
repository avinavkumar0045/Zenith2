export interface SkyObjectGuidance {
  id: string;
  name: string;
  type: 'Planet' | 'Moon' | 'ISS' | 'Satellite' | 'Constellation';
  azimuth: number;
  altitude: number;
  observationScore: number; // 0-10
  isBestTarget: boolean;
  visibilityStatus: string;
}

export interface ObserverGuidanceReport {
  bestTargetName: string;
  bestTargetDirection: string;
  bestTargetElevation: string;
  bestTargetInstruction: string;
  bestTargetVisibility: string;
  bestTargetScore: number;
  
  rankedObjects: SkyObjectGuidance[];
  skyDomeObjects: SkyObjectGuidance[];
}
