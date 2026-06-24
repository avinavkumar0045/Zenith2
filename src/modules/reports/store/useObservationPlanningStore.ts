import { create } from 'zustand';
import { ObservationPlan } from '../types/observation-planning.types';

export interface ObservationPlanningState {
  plan: ObservationPlan | null;
  loading: boolean;
  setPlan: (plan: ObservationPlan) => void;
  setLoading: (loading: boolean) => void;
}

export const useObservationPlanningStore = create<ObservationPlanningState>((set) => ({
  plan: null,
  loading: false,
  setPlan: (plan) => set({ plan, loading: false }),
  setLoading: (loading) => set({ loading }),
}));
