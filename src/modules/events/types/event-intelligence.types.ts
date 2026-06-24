export type EventSeverity = 'INFO' | 'GOOD' | 'IMPORTANT' | 'PRIORITY';

export type EventCategory = 'ISS' | 'MOON' | 'PLANET' | 'CONSTELLATION' | 'SATELLITE' | 'WEATHER' | 'GENERAL';

export interface EventIntelligenceObject {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  severity: EventSeverity;
  score: number;
  timestamp: number;
}
