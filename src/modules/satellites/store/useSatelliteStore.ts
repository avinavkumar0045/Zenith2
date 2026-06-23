import { create } from 'zustand';
import { SatelliteObject, SatelliteCategory } from '../types/satellite.types';

interface SatelliteState {
  activeSatellites: SatelliteObject[];
  selectedSatellite: SatelliteObject | null;
  satelliteCategories: SatelliteCategory[];
  loading: boolean;
  errors: string | null;

  setSatellites: (satellites: SatelliteObject[]) => void;
  setSelectedSatellite: (satellite: SatelliteObject | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCategories: (categories: SatelliteCategory[]) => void;
}

export const useSatelliteStore = create<SatelliteState>((set) => ({
  activeSatellites: [],
  selectedSatellite: null,
  satelliteCategories: [
    { id: 'weather', name: 'Weather' },
    { id: 'stations', name: 'Space Stations' },
    { id: 'visual', name: 'Visual' },
    { id: 'active', name: 'Active Satellites' }
  ],
  loading: false,
  errors: null,

  setSatellites: (satellites) => set({ activeSatellites: satellites }),
  setSelectedSatellite: (satellite) => set({ selectedSatellite: satellite }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ errors: error }),
  setCategories: (categories) => set({ satelliteCategories: categories }),
}));
