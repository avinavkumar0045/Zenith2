import { create } from 'zustand';

export interface ObservationSession {
  targetId: string;
  targetName: string;
  startTime: string;
  durationMinutes: number;
  notes: string[];
}

export interface SessionMemoryState {
  activeSession: ObservationSession | null;
  pinnedEvents: any[];
  recentActions: string[];
  
  startSession: (targetId: string, targetName: string) => void;
  stopSession: () => void;
  addNoteToSession: (note: string) => void;
  pinEvent: (event: any) => void;
  logAction: (action: string) => void;
  clearMemory: () => void;
}

export const useSessionMemoryStore = create<SessionMemoryState>((set) => ({
  activeSession: null,
  pinnedEvents: [],
  recentActions: [],

  startSession: (targetId, targetName) => set((state) => {
    const actionDesc = `Started active observation session for ${targetName}`;
    return {
      activeSession: {
        targetId,
        targetName,
        startTime: new Date().toISOString(),
        durationMinutes: 0,
        notes: [`Session started for tracking ${targetName}`]
      },
      recentActions: [actionDesc, ...state.recentActions].slice(0, 20)
    };
  }),

  stopSession: () => set((state) => {
    if (!state.activeSession) return {};
    const actionDesc = `Ended observation session for ${state.activeSession.targetName}`;
    return {
      activeSession: null,
      recentActions: [actionDesc, ...state.recentActions].slice(0, 20)
    };
  }),

  addNoteToSession: (note) => set((state) => {
    if (!state.activeSession) return {};
    return {
      activeSession: {
        ...state.activeSession,
        notes: [...state.activeSession.notes, note]
      }
    };
  }),

  pinEvent: (event) => set((state) => {
    const actionDesc = `Pinned event to observation log: ${event.label}`;
    
    // Avoid double pinning
    const exists = state.pinnedEvents.some(e => e.id === event.id);
    if (exists) return {};

    return {
      pinnedEvents: [...state.pinnedEvents, event],
      recentActions: [actionDesc, ...state.recentActions].slice(0, 20)
    };
  }),

  logAction: (action) => set((state) => ({
    recentActions: [action, ...state.recentActions].slice(0, 20)
  })),

  clearMemory: () => set({
    activeSession: null,
    pinnedEvents: [],
    recentActions: []
  })
}));
