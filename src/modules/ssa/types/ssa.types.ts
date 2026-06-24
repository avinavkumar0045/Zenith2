export interface SSAReport {
  spaceActivityIndex: number;
  environmentSummary: string;
  overheadAssets: string[];
  mostRelevantAsset: string;
  satelliteCount: number;
  visibleSatelliteCount: number;
  moonStatus: string;
  planetStatus: string;
  constellationStatus: string;
  issStatus: string;
  weatherStatus: string;
  observationQuality: string;
  spaceAwarenessSummary: string;
}
