import { create } from 'zustand';
import { SkyCorrelationReport } from '../types/sky-correlation.types';

export interface SkyCorrelationState {
  report: SkyCorrelationReport | null;
  loading: boolean;
  setReport: (report: SkyCorrelationReport | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useSkyCorrelationStore = create<SkyCorrelationState>((set) => ({
  report: null,
  loading: false,
  setReport: (report) => set({ report }),
  setLoading: (loading) => set({ loading })
}));
