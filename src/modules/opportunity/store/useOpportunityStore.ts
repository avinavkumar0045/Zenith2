import { create } from 'zustand';
import { OpportunityObject, ForecastQuality } from '../types/opportunity.types';

export interface OpportunityState {
  opportunities: OpportunityObject[];
  bestOpportunity: OpportunityObject | null;
  forecastQuality: ForecastQuality;
  forecastSummary: string;
  loading: boolean;
  setOpportunityData: (
    opportunities: OpportunityObject[], 
    bestOpportunity: OpportunityObject | null, 
    forecastQuality: ForecastQuality, 
    forecastSummary: string
  ) => void;
  setLoading: (loading: boolean) => void;
}

export const useOpportunityStore = create<OpportunityState>((set) => ({
  opportunities: [],
  bestOpportunity: null,
  forecastQuality: 'AVERAGE',
  forecastSummary: '',
  loading: false,
  setOpportunityData: (opportunities, bestOpportunity, forecastQuality, forecastSummary) => set({ opportunities, bestOpportunity, forecastQuality, forecastSummary }),
  setLoading: (loading) => set({ loading })
}));
