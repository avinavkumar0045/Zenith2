import { create } from 'zustand';
import { SSAReport } from '../types/ssa.types';

export interface SSAState {
  report: SSAReport | null;
  loading: boolean;
  setReport: (report: SSAReport | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useSSAStore = create<SSAState>((set) => ({
  report: null,
  loading: false,
  setReport: (report) => set({ report }),
  setLoading: (loading) => set({ loading })
}));
