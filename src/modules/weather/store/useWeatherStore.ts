import { create } from 'zustand';
import { AstronomicalWeatherObject } from '../types/weather.types';

export interface WeatherState {
  weather: AstronomicalWeatherObject | null;
  loading: boolean;
  error: string | null;
  
  setWeather: (weather: AstronomicalWeatherObject | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useWeatherStore = create<WeatherState>((set) => ({
  weather: null,
  loading: false,
  error: null,

  setWeather: (weather) => set({ weather, error: null }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
}));
