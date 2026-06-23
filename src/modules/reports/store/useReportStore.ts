import { create } from 'zustand';
import { CelestialReportObject } from '../types/report.types';

interface ReportState {
  report: CelestialReportObject | null;
  loading: boolean;
  
  setReport: (report: CelestialReportObject | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useReportStore = create<ReportState>((set) => ({
  report: null,
  loading: false,

  setReport: (report) => set({ report }),
  setLoading: (loading) => set({ loading }),
}));
