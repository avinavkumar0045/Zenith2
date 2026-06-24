import { create } from 'zustand';
import { ConstellationObject } from '../types/constellation.types';

export interface ConstellationState {
  constellations: ConstellationObject[];
  visibleConstellations: ConstellationObject[];
  bestConstellation: ConstellationObject | null;
  nearZenithConstellation: ConstellationObject | null;
  
  loading: boolean;
  error: string | null;

  setConstellations: (constellations: ConstellationObject[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useConstellationStore = create<ConstellationState>((set) => ({
  constellations: [],
  visibleConstellations: [],
  bestConstellation: null,
  nearZenithConstellation: null,
  
  loading: false,
  error: null,

  setConstellations: (constellations) => {
    const visible = constellations.filter(c => c.isVisible);
    
    // best positioned (highest score)
    let best = null;
    let maxScore = -1;
    visible.forEach(c => {
      if (c.visibilityScore > maxScore) {
        maxScore = c.visibilityScore;
        best = c;
      }
    });

    // nearest zenith (altitude closest to 90)
    let nearZenith = null;
    let minDistance = 90;
    visible.forEach(c => {
      const dist = Math.abs(90 - c.altitude);
      if (dist < minDistance) {
        minDistance = dist;
        nearZenith = c;
      }
    });

    set({
      constellations,
      visibleConstellations: visible,
      bestConstellation: best,
      nearZenithConstellation: nearZenith,
      loading: false
    });
  },

  setLoading: (loading) => set({ loading })
}));
