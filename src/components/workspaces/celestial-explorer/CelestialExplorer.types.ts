import { create } from 'zustand';

export type ExplorerCategory = 'planets' | 'moon' | 'stations' | 'satellites' | 'constellations' | 'deep-sky';

export interface ExplorerObject {
  id: string;
  name: string;
  type: ExplorerCategory;
  visibilityState: string; // e.g., "Visible", "Below Horizon", "In Orbit"
  observationRating: number; // 0 to 10 scale
  bestObservationTime: string | null;
  direction: string; // e.g., "NE", "SW", "N"
  altitude: number; // elevation angle in degrees
  description: string;
  coordinates: {
    latitude: number;
    longitude: number;
    altitude?: number; // altitude in meters or km
  };
  originalData?: any;
}

export interface ExplorerModel {
  allObjects: ExplorerObject[];
  featuredObjects: ExplorerObject[];
  categoryCounts: Record<ExplorerCategory | 'all', number>;
  lastUpdated: number;
}

export interface CelestialExplorerState {
  searchQuery: string;
  activeCategory: ExplorerCategory | 'all';
  selectedObjectId: string | null;
  keyboardFocusIndex: number;

  setSearchQuery: (query: string) => void;
  setActiveCategory: (category: ExplorerCategory | 'all') => void;
  setSelectedObjectId: (id: string | null) => void;
  setKeyboardFocusIndex: (index: number) => void;
  resetStore: () => void;
}

export const useCelestialExplorerStore = create<CelestialExplorerState>((set) => ({
  searchQuery: '',
  activeCategory: 'all',
  selectedObjectId: null,
  keyboardFocusIndex: -1,

  setSearchQuery: (query) => set({ searchQuery: query, keyboardFocusIndex: -1 }),
  setActiveCategory: (category) => set({ activeCategory: category, keyboardFocusIndex: -1 }),
  setSelectedObjectId: (id) => set({ selectedObjectId: id }),
  setKeyboardFocusIndex: (index) => set({ keyboardFocusIndex: index }),
  resetStore: () => set({ searchQuery: '', activeCategory: 'all', selectedObjectId: null, keyboardFocusIndex: -1 }),
}));
