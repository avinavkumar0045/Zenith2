import { create } from 'zustand';
import { PlanetId, PlanetIntelligenceObject } from '../types/planet.types';

export interface PlanetState {
  planets: Record<PlanetId, PlanetIntelligenceObject>;
  selectedPlanet: PlanetId | null;
  loading: boolean;
  lastUpdated: number | null;
  
  setPlanets: (planets: Record<PlanetId, PlanetIntelligenceObject>) => void;
  setSelectedPlanet: (id: PlanetId | null) => void;
  setLoading: (loading: boolean) => void;
}

export const usePlanetStore = create<PlanetState>((set) => ({
  planets: {} as Record<PlanetId, PlanetIntelligenceObject>,
  selectedPlanet: null,
  loading: false,
  lastUpdated: null,
  
  setPlanets: (planets) => set({ planets, lastUpdated: Date.now() }),
  setSelectedPlanet: (id) => set({ selectedPlanet: id }),
  setLoading: (loading) => set({ loading })
}));
