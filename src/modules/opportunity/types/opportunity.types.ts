export type OpportunitySeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type OpportunityCategory = 'MOON' | 'PLANET' | 'CONSTELLATION' | 'ISS' | 'SATELLITE' | 'WEATHER' | 'GENERAL';
export type ForecastQuality = 'POOR' | 'AVERAGE' | 'GOOD' | 'EXCELLENT';

export interface OpportunityObject {
  id: string;
  title: string;
  description: string;
  category: OpportunityCategory;
  severity: OpportunitySeverity;
  score: number;
  bestTime: number; // timestamp
  minutesUntil: number;
  confidence: 'Low' | 'Medium' | 'High';
  azimuth?: number;
  altitude?: number;
}
