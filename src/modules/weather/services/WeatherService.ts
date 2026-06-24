import { useLocationStore } from '../../location/store/useLocationStore';
import { useWeatherStore } from '../store/useWeatherStore';
import { OpenMeteoProvider } from '../providers/OpenMeteoProvider';
import { ObservationConditionsEngine } from './ObservationConditionsEngine';

class WeatherServiceClass {
  private provider = new OpenMeteoProvider();
  private unsubscribeLocation: (() => void) | null = null;
  private currentLat: number | null = null;
  private currentLon: number | null = null;

  public initialize() {
    this.unsubscribeLocation = useLocationStore.subscribe((state, prevState) => {
      const loc = state.activeLocation;
      if (loc) {
        // Only fetch if location actually changed significantly to avoid spam
        if (this.currentLat !== loc.latitude || this.currentLon !== loc.longitude) {
          this.currentLat = loc.latitude;
          this.currentLon = loc.longitude;
          this.fetchWeather(loc.latitude, loc.longitude);
        }
      } else {
        useWeatherStore.getState().setWeather(null);
        this.currentLat = null;
        this.currentLon = null;
      }
    });

    // Initial check
    const active = useLocationStore.getState().activeLocation;
    if (active) {
      this.currentLat = active.latitude;
      this.currentLon = active.longitude;
      this.fetchWeather(active.latitude, active.longitude);
    }
  }

  private async fetchWeather(lat: number, lon: number) {
    const store = useWeatherStore.getState();
    store.setLoading(true);

    try {
      const raw = await this.provider.fetchCurrentWeather(lat, lon);
      const astronomicalWeather = ObservationConditionsEngine.evaluateConditions(lat, lon, raw);
      store.setWeather(astronomicalWeather);
    } catch (err: any) {
      console.error("Failed to fetch weather:", err);
      store.setError(err.message || 'Unknown weather error');
    } finally {
      store.setLoading(false);
    }
  }

  public destroy() {
    if (this.unsubscribeLocation) {
      this.unsubscribeLocation();
      this.unsubscribeLocation = null;
    }
  }
}

export const WeatherService = new WeatherServiceClass();
