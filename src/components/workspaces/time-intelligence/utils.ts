import { useEffect } from 'react';
import { useTimeStore } from './types';
import { PlanetPositionService } from '@/modules/planets/services/PlanetPositionService';
import { MoonPositionService } from '@/modules/moon/services/MoonPositionService';
import { MoonService } from '@/modules/moon/services/MoonService';
import { SatelliteService } from '@/modules/satellites/services/SatelliteService';
import { GlobeService } from '@/modules/globe/services/GlobeService';
import * as Cesium from 'cesium';

export function getGMST(date: Date): number {
  const jd = (date.getTime() / 86400000.0) + 2440587.5;
  const d = jd - 2451545.0; // days since J2000.0
  let gmst = 18.697374558 + 24.06570982441908 * d;
  gmst = gmst % 24;
  if (gmst < 0) gmst += 24;
  return gmst;
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function getRelativeTimeLabel(targetMs: number, baseMs: number): string {
  const diffMs = targetMs - baseMs;
  if (Math.abs(diffMs) < 60000) return 'now';
  
  const diffMin = Math.round(diffMs / 60000);
  if (Math.abs(diffMin) < 60) {
    return diffMin > 0 ? `in ${diffMin} min` : `${Math.abs(diffMin)} min ago`;
  }
  
  const diffHr = Math.round(diffMin / 60);
  return diffMin > 0 ? `in ${diffHr} h` : `${Math.abs(diffHr)} h ago`;
}

export function useTimeSynchronization() {
  const selectedTime = useTimeStore((state) => state.selectedTime);

  useEffect(() => {
    // 1. Recalculate planet positions
    PlanetPositionService.calculateAll(selectedTime);

    // 2. Recalculate moon positions and data
    MoonPositionService.calculateSubLunarPoint(selectedTime);
    MoonService.updateMoonData(selectedTime);

    // 3. Propagate satellites
    SatelliteService.propagateAllToTime(selectedTime);

    // 4. Update Cesium clock
    try {
      const viewer = GlobeService.getViewer();
      if (viewer && viewer.clock) {
        viewer.clock.currentTime = Cesium.JulianDate.fromDate(selectedTime);
        viewer.clock.shouldAnimate = false; // Timeline store drives the time progression, not Cesium's internal clock
      }
    } catch (e) {
      // GlobeService is not initialized yet or in server rendering
    }
  }, [selectedTime]);
}
