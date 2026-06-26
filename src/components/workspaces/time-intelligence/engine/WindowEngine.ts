import * as SunCalc from 'suncalc';
import { useWeatherStore } from '@/modules/weather/store/useWeatherStore';
import { ObservationWindow } from '../types';
import { VisibilityEngine } from './VisibilityEngine';
import { DEEP_SKY_CATALOG } from '@/components/workspaces/celestial-explorer/engine/ExplorerEngine';

export class WindowEngine {
  /**
   * Scans the next 24 hours in 15-minute steps to resolve the best contiguous
   * observation window for a specific target based on altitude, darkness, clouds, and Moon.
   */
  public static calculateObservationWindow(
    targetId: string,
    targetName: string,
    targetType: 'planets' | 'moon' | 'stations' | 'satellites' | 'constellations' | 'deep-sky',
    lat: number,
    lon: number,
    baseDate: Date
  ): ObservationWindow | null {
    const stepsCount = 96; // 24 hours / 15 mins = 96 steps
    const stepMs = 15 * 60000;
    
    const weather = useWeatherStore.getState().weather;
    const baseCloudCover = weather ? weather.cloudCover : 20;

    let bestStart: Date | null = null;
    let bestEnd: Date | null = null;
    let maxContiguousDuration = 0;
    
    let currentStart: Date | null = null;
    let currentDuration = 0;

    for (let i = 0; i < stepsCount; i++) {
      const stepDate = new Date(baseDate.getTime() + i * stepMs);
      
      // 1. Calculate Sun altitude (Darkness Constraint)
      const sunPos = SunCalc.getPosition(stepDate, lat, lon);
      const sunAlt = sunPos.altitude * (180 / Math.PI);
      const isDark = sunAlt < -6; // Civil twilight or darker

      if (!isDark) {
        if (currentStart) {
          if (currentDuration > maxContiguousDuration) {
            maxContiguousDuration = currentDuration;
            bestStart = currentStart;
            bestEnd = new Date(stepDate.getTime() - stepMs);
          }
          currentStart = null;
          currentDuration = 0;
        }
        continue;
      }

      // 2. Calculate target altitude
      let altitude = 0;
      let targetVisible = false;

      if (targetType === 'planets') {
        const pId = targetId.replace('planet_', '') as any;
        const v = VisibilityEngine.getPlanetVisibility(pId, lat, lon, stepDate);
        altitude = v.altitude;
        targetVisible = v.isVisible;
      } else if (targetType === 'moon') {
        const v = VisibilityEngine.getMoonVisibility(lat, lon, stepDate);
        altitude = v.altitude;
        targetVisible = v.isVisible;
      } else if (targetType === 'deep-sky') {
        const dsoId = targetId.replace('deepsky_', '');
        const dso = DEEP_SKY_CATALOG.find(d => d.id === dsoId);
        if (dso) {
          const v = VisibilityEngine.getDeepSkyVisibility(dso, lat, lon, stepDate);
          altitude = v.altitude;
          targetVisible = v.isVisible;
        }
      } else {
        // Satellites/stations: just check generic visibility
        targetVisible = altitude > 10; 
      }

      // 3. Simulated clouds (sine wave simulation for organic weather trends)
      const hr = stepDate.getHours();
      const simulatedCloudCover = Math.max(0, Math.min(100, baseCloudCover + Math.sin(hr / 3.0) * 15.0));

      const isClear = simulatedCloudCover < 45;
      const isAboveHorizon = altitude > 10;

      // Observe criteria: target is visible, above 10 deg, sky is clear and dark
      const isGoodStep = targetVisible && isAboveHorizon && isClear;

      if (isGoodStep) {
        if (!currentStart) {
          currentStart = stepDate;
        }
        currentDuration += 15;
      } else {
        if (currentStart) {
          if (currentDuration > maxContiguousDuration) {
            maxContiguousDuration = currentDuration;
            bestStart = currentStart;
            bestEnd = new Date(stepDate.getTime() - stepMs);
          }
          currentStart = null;
          currentDuration = 0;
        }
      }
    }

    // Capture last block if active
    if (currentStart && currentDuration > maxContiguousDuration) {
      maxContiguousDuration = currentDuration;
      bestStart = currentStart;
      bestEnd = new Date(baseDate.getTime() + (stepsCount - 1) * stepMs);
    }

    if (bestStart && bestEnd && maxContiguousDuration >= 30) { // Require at least 30 mins window
      // Determine overall quality
      let quality: 'Excellent' | 'Good' | 'Fair' | 'Poor' = 'Good';
      if (baseCloudCover < 15) quality = 'Excellent';
      else if (baseCloudCover < 30) quality = 'Good';
      else if (baseCloudCover < 50) quality = 'Fair';
      else quality = 'Poor';

      return {
        id: `window_${targetId}`,
        targetName,
        startTime: bestStart,
        endTime: bestEnd,
        quality
      };
    }

    return null;
  }
}
