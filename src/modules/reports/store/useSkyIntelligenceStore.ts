import { create } from 'zustand';
import { UnifiedSkyReport } from '../types/sky-intelligence.types';

export interface SkyIntelligenceState {
  report: UnifiedSkyReport | null;
  setReport: (report: UnifiedSkyReport) => void;
}

export const useSkyIntelligenceStore = create<SkyIntelligenceState>((set) => ({
  report: null,
  setReport: (report) => set({ report }),
}));
