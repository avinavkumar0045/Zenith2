import * as SunCalc from 'suncalc';
import { GeocodingService } from '../../location/services/GeocodingService';
import { useMoonPositionStore } from '../store/useMoonPositionStore';
import { useMoonStore } from '../store/useMoonStore';
import { eventBus } from '../../location/utils/EventBus';

class MoonPositionServiceClass {
  public initialize() {
    // We update when location changes or when moon data refreshes
    eventBus.on('locationChanged', () => {
      this.calculateSubLunarPoint();
    });

    eventBus.on('moonUpdated', () => {
      this.calculateSubLunarPoint();
    });

    // Initial run
    this.calculateSubLunarPoint();
  }

  public async calculateSubLunarPoint(date: Date = new Date()) {
    
    // We calculate horizontal coordinates from the intersection of Equator & Prime Meridian
    // This allows us to map topocentric altitude/azimuth to declination/Right Ascension
    const pos = SunCalc.getMoonPosition(date, 0, 0);
    
    // SunCalc returns altitude in degrees and azimuth relative to South
    const hDeg = pos.altitude; 
    const azimuthSuncalcDeg = pos.azimuth; 
    const ADeg = azimuthSuncalcDeg + 180; // Convert to North-based azimuth

    // Convert to radians for Math trig functions
    const h = hDeg * Math.PI / 180;
    const A = ADeg * Math.PI / 180;

    // 1. Calculate Declination (Sub-Lunar Latitude)
    const dec = Math.asin(Math.cos(h) * Math.cos(A));
    const subLunarLat = dec * 180 / Math.PI;

    // 2. Calculate Hour Angle (H) to derive Sub-Lunar Longitude
    const sinH = Math.sin(A) * Math.cos(h) / Math.cos(dec);
    const cosH = Math.sin(h) / Math.cos(dec);
    const H = Math.atan2(sinH, cosH);

    let subLunarLon = -H * 180 / Math.PI;

    // Normalize longitude to -180 to +180
    if (subLunarLon > 180) subLunarLon -= 360;
    if (subLunarLon < -180) subLunarLon += 360;

    // Resolve visibility from current location using existing Phase 6A logic
    const { moonData } = useMoonStore.getState();
    const isVisible = moonData ? moonData.isVisible : false;

    // Resolve geographical region
    let regionName = `Above Coordinates: ${subLunarLat.toFixed(4)}, ${subLunarLon.toFixed(4)}`;
    try {
      const reverseResult = await GeocodingService.reverse(subLunarLat, subLunarLon);
      if (reverseResult) {
        // Favor country or oceans
        if (reverseResult.country !== 'Unknown') {
          regionName = reverseResult.country;
        } else if (reverseResult.name !== 'Unknown Location') {
          regionName = reverseResult.name;
        }
      }
    } catch (e) {
      console.error("Failed to reverse geocode sub-lunar point");
    }

    // Check Ocean regions (Nominatim often returns empty for deep ocean)
    // A simple heuristic for empty land results is to label it an Ocean
    if (regionName.startsWith('Above Coordinates:')) {
       // Rough approximation if it failed reverse geocoding
       regionName = this.guessOceanRegion(subLunarLat, subLunarLon);
    }

    useMoonPositionStore.getState().setMoonPosition(subLunarLat, subLunarLon, regionName, isVisible);
  }

  private guessOceanRegion(lat: number, lon: number): string {
    if (lat > 60) return "Arctic Ocean";
    if (lat < -60) return "Southern Ocean";
    if (lon > -60 && lon < 20) return "Atlantic Ocean";
    if (lon >= 20 && lon < 120) return "Indian Ocean";
    return "Pacific Ocean";
  }

  public destroy() {
    eventBus.off('locationChanged');
    eventBus.off('moonUpdated');
  }
}

export const MoonPositionService = new MoonPositionServiceClass();
