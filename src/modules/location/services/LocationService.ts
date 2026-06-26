import { LocationIntelligenceObject } from '../types/location.types';
import { GeocodingService, GeocodingResult } from './GeocodingService';
import { DayNightService } from './DayNightService';
import { useLocationStore } from '../store/useLocationStore';
import { eventBus } from '../utils/EventBus';

class LocationServiceClass {
  constructor() {
    eventBus.on('globeClicked', (coords) => {
      if (coords) {
        this.setLocationFromCoordinates(coords.latitude, coords.longitude, 'Globe Click');
      }
    });
  }
  
  /**
   * Prompts browser for geolocation, geocodes it, and sets it as active location.
   */
  public async requestBrowserLocation(): Promise<void> {
    if (!navigator.geolocation) {
      console.warn("Geolocation is not supported by this browser.");
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      await this.setLocationFromCoordinates(position.coords.latitude, position.coords.longitude, 'Browser Geolocation');
    } catch (error) {
      console.warn("Geolocation permission denied or failed.", error);
    }
  }

  /**
   * Resolves coordinates, builds intelligence object, and updates store.
   */
  public async setLocationFromCoordinates(lat: number, lon: number, source: string): Promise<LocationIntelligenceObject | null> {
    const geoData = await GeocodingService.reverse(lat, lon);
    const name = geoData ? geoData.name : `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    const country = geoData ? geoData.country : 'Unknown';
    
    return this.buildAndSetLocation({
      latitude: lat,
      longitude: lon,
      name,
      country,
      source
    });
  }

  /**
   * Resolves a search result, builds intelligence object, and updates store.
   */
  public async setLocationFromResult(result: GeocodingResult): Promise<LocationIntelligenceObject> {
    return this.buildAndSetLocation(result);
  }

  private buildAndSetLocation(data: { latitude: number, longitude: number, name: string, country: string, source: string }): LocationIntelligenceObject {
    const dayNightData = DayNightService.getDayNightData(data.latitude, data.longitude);
    
    // Attempt to get timezone
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone; // fallback to local
    // In a real prod app, use a timezone API or library like geo-tz. We fallback to local tz string for now.
    
    const localTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    const locationObj: LocationIntelligenceObject = {
      id: `${data.latitude},${data.longitude}`,
      name: data.name,
      country: data.country,
      latitude: data.latitude,
      longitude: data.longitude,
      timezone: tz,
      localTime,
      dayState: dayNightData.dayState,
      sunrise: dayNightData.sunrise,
      sunset: dayNightData.sunset,
      twilight: dayNightData.twilight,
      source: data.source,
      timestamp: Date.now()
    };

    // Update Store
    useLocationStore.getState().setLocation(locationObj);

    // Emit Event
    eventBus.emit('locationChanged', locationObj);

    return locationObj;
  }
}

export const LocationService = new LocationServiceClass();
