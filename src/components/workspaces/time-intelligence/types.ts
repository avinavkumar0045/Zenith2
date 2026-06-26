import { create } from 'zustand';

export interface TimelineMarker {
  id: string;
  label: string;
  time: Date;
  type: 'iss' | 'moonrise' | 'moonset' | 'transit' | 'satellite' | 'weather' | 'twilight';
  relativeOffset: number; // Percentage offset along the 24h rail (0 - 100)
}

export interface ObservationWindow {
  id: string;
  targetName: string;
  startTime: Date;
  endTime: Date;
  quality: 'Excellent' | 'Good' | 'Fair' | 'Poor';
}

export interface UpcomingEvent {
  id: string;
  label: string;
  timeLabel: string; // e.g. "20:05", "03:40"
  relativeTime: string; // e.g. "in 12 min", "in 2 h"
  timestamp: number;
  type: 'observation-start' | 'observation-end' | 'iss-pass' | 'satellite-pass' | 'planet-peak' | 'moonrise' | 'moonset' | 'twilight';
}

export interface TimelineModel {
  currentTime: Date;
  selectedTime: Date;
  observationWindows: ObservationWindow[];
  upcomingEvents: UpcomingEvent[];
  timelineMarkers: TimelineMarker[];
  predictionConfidence: 'High' | 'Moderate' | 'Low';
  lastUpdated: number;
}

export interface TimeState {
  currentTime: Date;
  selectedTime: Date;
  isPlaying: boolean;
  playbackSpeed: number; // multiplier (e.g. 60 for 1 min/sec, 600, 3600)
  
  setCurrentTime: (time: Date) => void;
  setSelectedTime: (time: Date) => void;
  setPlaying: (playing: boolean) => void;
  setPlaybackSpeed: (speed: number) => void;
  resetToNow: () => void;
}

export const useTimeStore = create<TimeState>((set) => ({
  currentTime: new Date(),
  selectedTime: new Date(),
  isPlaying: false,
  playbackSpeed: 600, // Default 10 min/sec (good speed for visual rotation)

  setCurrentTime: (time) => set({ currentTime: time }),
  setSelectedTime: (time) => set({ selectedTime: time }),
  setPlaying: (playing) => set({ isPlaying: playing }),
  setPlaybackSpeed: (speed) => set({ playbackSpeed: speed }),
  resetToNow: () => {
    const now = new Date();
    set({ selectedTime: now, currentTime: now });
  }
}));
