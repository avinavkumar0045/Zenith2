import { create } from 'zustand';
import { MoonIntelligenceObject } from '../types/moon.types';

interface MoonState {
  moonData: MoonIntelligenceObject | null;
  loading: boolean;
  lastUpdated: number | null;
  setMoonData: (data: MoonIntelligenceObject | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useMoonStore = create<MoonState>((set) => ({
  moonData: null,
  loading: false,
  lastUpdated: null,
  setMoonData: (data) => set({ moonData: data, lastUpdated: Date.now() }),
  setLoading: (loading) => set({ loading }),
}));
