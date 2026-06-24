import { create } from 'zustand';

export interface MoonPositionState {
  subLunarLatitude: number | null;
  subLunarLongitude: number | null;
  regionName: string | null;
  isVisibleFromLocation: boolean;
  lastUpdated: number | null;
  setMoonPosition: (lat: number, lon: number, region: string, isVisible: boolean) => void;
  clearMoonPosition: () => void;
}

export const useMoonPositionStore = create<MoonPositionState>((set) => ({
  subLunarLatitude: null,
  subLunarLongitude: null,
  regionName: null,
  isVisibleFromLocation: false,
  lastUpdated: null,
  setMoonPosition: (lat, lon, region, isVisible) => set({
    subLunarLatitude: lat,
    subLunarLongitude: lon,
    regionName: region,
    isVisibleFromLocation: isVisible,
    lastUpdated: Date.now()
  }),
  clearMoonPosition: () => set({
    subLunarLatitude: null,
    subLunarLongitude: null,
    regionName: null,
    isVisibleFromLocation: false,
    lastUpdated: null
  })
}));
