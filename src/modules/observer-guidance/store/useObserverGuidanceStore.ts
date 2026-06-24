import { create } from 'zustand';
import { ObserverGuidanceReport } from '../types/observer-guidance.types';

export interface ObserverGuidanceState {
  report: ObserverGuidanceReport | null;
  loading: boolean;
  setReport: (report: ObserverGuidanceReport | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useObserverGuidanceStore = create<ObserverGuidanceState>((set) => ({
  report: null,
  loading: false,
  setReport: (report) => set({ report }),
  setLoading: (loading) => set({ loading })
}));
