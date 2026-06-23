import { create } from 'zustand';

interface AppState {
  isGlobeReady: boolean;
  setGlobeReady: (ready: boolean) => void;
  currentView: 'home' | 'explore' | 'analyze';
  setCurrentView: (view: 'home' | 'explore' | 'analyze') => void;
}

export const useAppStore = create<AppState>((set) => ({
  isGlobeReady: false,
  setGlobeReady: (ready) => set({ isGlobeReady: ready }),
  currentView: 'home',
  setCurrentView: (view) => set({ currentView: view }),
}));
