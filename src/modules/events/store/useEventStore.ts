import { create } from 'zustand';
import { EventIntelligenceObject } from '../types/event-intelligence.types';

export interface EventState {
  events: EventIntelligenceObject[];
  topEvent: EventIntelligenceObject | null;
  importantEvents: EventIntelligenceObject[];
  loading: boolean;
  setEventsData: (events: EventIntelligenceObject[], topEvent: EventIntelligenceObject | null, importantEvents: EventIntelligenceObject[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useEventStore = create<EventState>((set) => ({
  events: [],
  topEvent: null,
  importantEvents: [],
  loading: false,
  setEventsData: (events, topEvent, importantEvents) => set({ events, topEvent, importantEvents }),
  setLoading: (loading) => set({ loading })
}));
