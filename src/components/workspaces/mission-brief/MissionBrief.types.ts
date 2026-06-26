export interface SkyEvent {
  id: string;
  name: string;
  timeLabel: string; // e.g., "in 6 min" or "20:41"
  timestamp: number;
}

export interface ObservationMetric {
  label: string;
  value: string;
  detail: string;
}

export interface SkyIntelligenceModel {
  locationName: string;
  dayState: 'Day' | 'Twilight' | 'Night';
  qualitativeRating: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  score: number; // 0 to 100
  confidenceText: 'High' | 'Moderate' | 'Low';
  confidencePercentage: number; // e.g. 92
  isPartialTelemetry: boolean;
  heroInsight: { headline: string; target: string | null; detail: string };
  bestTarget: {
    name: string;
    reason: string;
  } | null;
  whyItems: string[];
  events: SkyEvent[];
  metrics: ObservationMetric[];
  recommendations: string[];
  warnings: string[];
  lastUpdated: number;
}

export interface MissionBriefDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface MissionBriefHeaderProps {
  onClose: () => void;
  lastUpdated: number | null;
}
