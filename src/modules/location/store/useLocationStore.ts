import { create } from 'zustand';
import { LocationIntelligenceObject } from '../types/location.types';

interface LocationState {
  activeLocation: LocationIntelligenceObject | null;
  recentLocations: LocationIntelligenceObject[];
  setLocation: (location: LocationIntelligenceObject) => void;
  clearLocation: () => void;
  addRecentLocation: (location: LocationIntelligenceObject) => void;
  restoreLocation: (location: LocationIntelligenceObject) => void;
}

const MAX_RECENT_LOCATIONS = 10;

export const useLocationStore = create<LocationState>((set, get) => ({
  activeLocation: null,
  recentLocations: [],

  setLocation: (location) => {
    set({ activeLocation: location });
    get().addRecentLocation(location);
  },

  clearLocation: () => {
    set({ activeLocation: null });
  },

  addRecentLocation: (location) => {
    set((state) => {
      // Remove if it already exists to avoid duplicates
      const filtered = state.recentLocations.filter(loc => loc.id !== location.id);
      const newRecent = [location, ...filtered].slice(0, MAX_RECENT_LOCATIONS);
      
      // Attempt to persist to local storage
      if (typeof window !== 'undefined') {
        localStorage.setItem('zenith_recent_locations', JSON.stringify(newRecent));
      }

      return { recentLocations: newRecent };
    });
  },

  restoreLocation: (location) => {
    set({ activeLocation: location });
    // Doesn't necessarily re-add to top of recent
  }
}));

// Initialize recent locations from local storage if in browser
if (typeof window !== 'undefined') {
  try {
    const stored = localStorage.getItem('zenith_recent_locations');
    if (stored) {
      useLocationStore.setState({ recentLocations: JSON.parse(stored) });
    }
  } catch (e) {
    console.error("Failed to load recent locations", e);
  }
}
