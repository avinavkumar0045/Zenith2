import { create } from 'zustand';
import { PassPredictionObject } from '../types/pass.types';

interface PassState {
  upcomingPasses: PassPredictionObject[];
  selectedPass: PassPredictionObject | null;
  loading: boolean;
  error: string | null;

  setPasses: (passes: PassPredictionObject[]) => void;
  setSelectedPass: (pass: PassPredictionObject | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const usePassStore = create<PassState>((set) => ({
  upcomingPasses: [],
  selectedPass: null,
  loading: false,
  error: null,

  setPasses: (passes) => set({ upcomingPasses: passes, selectedPass: passes.length > 0 ? passes[0] : null }),
  setSelectedPass: (pass) => set({ selectedPass: pass }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
