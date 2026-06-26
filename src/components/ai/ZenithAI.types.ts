import { CameraMode } from '../workspaces/visualization/Visualization.types';

export type AIIntentType = 'observe' | 'explore' | 'explain' | 'predict' | 'compare' | 'navigate' | 'configure' | 'plan';

export interface AIContext {
  location: {
    latitude: number;
    longitude: number;
    name: string;
  } | null;
  weather: {
    condition: string;
    cloudCover: number; // percentage
    temperature: number; // Celsius
    scoreMultiplier: number;
  } | null;
  timeline: {
    currentTime: string;
    selectedTime: string;
    isPlaying: boolean;
    playbackSpeed: number;
  };
  visualization: {
    activeProfile: string;
    showPlanets: boolean;
    showMoon: boolean;
    showISS: boolean;
    showSatellites: boolean;
    showAtmosphere: boolean;
    showClouds: boolean;
    showGroundTracks: boolean;
    showGrid: boolean;
  };
  selectedObject: {
    id: string;
    name: string;
    type: string;
  } | null;
  activeSession: {
    targetId: string;
    targetName: string;
    startTime: string;
    durationMinutes: number;
  } | null;
  userGoal: string | null;
}

export interface AIAction {
  id: string;
  label: string;
  description: string;
  type: 'focus' | 'open_timeline' | 'apply_preset' | 'open_workspace' | 'start_session' | 'pin_event' | 'set_speed' | 'step_time' | 'step' | 'feed' | 'visualization';
  payload: any;
  status?: 'pending' | 'executing' | 'completed' | 'failed';
  result?: string;
}

export interface Task {
  id: string;
  agentId: string;
  description: string;
  status: 'pending' | 'planning' | 'executing' | 'completed' | 'failed';
  actions: AIAction[];
  result?: AgentResult;
}

export interface AgentResult {
  explanation: string;
  actions: AIAction[];
  confidence: number; // percentage (0 - 100)
  recommendations: string[];
  explainabilityLogs?: string[];
}

export interface PlanTarget {
  id: string;
  name: string;
  type: string;
  windowLabel: string;
  quality: string;
  score: number;
  reasoning: string;
}

export interface AISessionPlan {
  title: string;
  targets: PlanTarget[];
  confidence: number;
  weatherSummary: string;
  overallQuality: string;
  suggestedDuration: number;
}

export interface Message {
  id: string;
  sender: 'user' | 'ai' | 'system';
  text: string;
  timestamp: string;
  status?: 'thinking' | 'analyzing' | 'planning' | 'done';
  activeReasoningStep?: string;
  actions?: AIAction[];
  plan?: AISessionPlan;
}
