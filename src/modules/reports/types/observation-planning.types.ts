export type ObservationQuality = 'Excellent' | 'Good' | 'Average' | 'Poor' | 'Hidden';

export interface ObservationWindow {
  visibilityStart: number; // timestamp
  visibilityEnd: number; // timestamp
  peakTime: number; // timestamp
  peakAltitude: number;
  durationMinutes: number;
}

export interface ObservationTarget {
  id: string;
  name: string;
  type: 'Planet' | 'Moon' | 'ISS' | 'Satellite';
  window: ObservationWindow | null;
  quality: ObservationQuality;
  score: number; // Base existing score
}

export interface ObservationAgendaItem {
  time: number; // formatted display time
  targetName: string;
  type: 'Planet' | 'Moon' | 'ISS' | 'Satellite';
  peakAltitude: number;
  quality: ObservationQuality;
}

export interface ObservationPlan {
  rankedTargets: ObservationTarget[];
  agenda: ObservationAgendaItem[];
  bestWindow: ObservationWindow | null;
  overallQuality: ObservationQuality;
  bestTargetTime: number | null;
}
