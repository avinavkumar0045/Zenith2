import { create } from 'zustand';
import { OrbitIntelligenceObject } from '../types/orbit.types';

interface OrbitState {
  activeOrbit: OrbitIntelligenceObject | null;
  
  // Visibility toggles
  showPastOrbit: boolean;
  showFutureOrbit: boolean;
  showGroundTrack: boolean;
  
  // Actions
  setActiveOrbit: (orbit: OrbitIntelligenceObject | null) => void;
  togglePastOrbit: () => void;
  toggleFutureOrbit: () => void;
  toggleGroundTrack: () => void;
}

export const useOrbitStore = create<OrbitState>((set) => ({
  activeOrbit: null,
  showPastOrbit: true,
  showFutureOrbit: true,
  showGroundTrack: true,

  setActiveOrbit: (orbit) => set({ activeOrbit: orbit }),
  togglePastOrbit: () => set((state) => ({ showPastOrbit: !state.showPastOrbit })),
  toggleFutureOrbit: () => set((state) => ({ showFutureOrbit: !state.showFutureOrbit })),
  toggleGroundTrack: () => set((state) => ({ showGroundTrack: !state.showGroundTrack })),
}));
