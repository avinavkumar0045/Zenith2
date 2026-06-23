import { create } from 'zustand';
import { ISSObject } from '../types/iss.types';

interface ISSState {
  iss: ISSObject | null;
  loading: boolean;
  error: string | null;
  isTracking: boolean;

  setISS: (iss: ISSObject | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setIsTracking: (isTracking: boolean) => void;
}

export const useISSStore = create<ISSState>((set) => ({
  iss: null,
  loading: false,
  error: null,
  isTracking: false,

  setISS: (iss) => set({ iss }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setIsTracking: (isTracking) => set({ isTracking }),
}));
