import * as SunCalc from 'suncalc';
import { UpcomingEvent, ObservationWindow } from '../types';
import { useLocationStore } from '@/modules/location/store/useLocationStore';
import { usePlanetStore } from '@/modules/planets/store/usePlanetStore';
import { usePassStore } from '@/modules/pass-predictions/store/usePassStore';
import { useMoonStore } from '@/modules/moon/store/useMoonStore';
import { getRelativeTimeLabel, formatTime } from '../utils';

export class EventResolver {
  /**
   * Compiles upcoming predicted events and observation windows into a chronological list.
   */
  public static resolveUpcomingEvents(
    selectedTime: Date,
    observationWindows: ObservationWindow[]
  ): UpcomingEvent[] {
    const { activeLocation } = useLocationStore.getState();
    if (!activeLocation) return [];

    const lat = activeLocation.latitude;
    const lon = activeLocation.longitude;
    const baseTimeMs = selectedTime.getTime();

    const rawEvents: { time: Date; label: string; type: UpcomingEvent['type'] }[] = [];

    // 1. Add Observation Starts / Ends from calculated windows
    observationWindows.forEach((win) => {
      if (win.startTime.getTime() >= baseTimeMs) {
        rawEvents.push({
          time: win.startTime,
          label: `${win.targetName} Observation Starts`,
          type: 'observation-start'
        });
      }
      if (win.endTime.getTime() >= baseTimeMs) {
        rawEvents.push({
          time: win.endTime,
          label: `${win.targetName} Observation Ends`,
          type: 'observation-end'
        });
      }
    });

    // 2. Add Planet Peaks (Meridian transits)
    const planets = usePlanetStore.getState().planets;
    if (planets) {
      Object.values(planets).forEach((p) => {
        // Approximate peak/transit time: if rise and set times are available
        // transit is roughly halfway between rise and set.
        // For a simpler approach, we can get SunCalc twilight times, or use rise/set from planets.
        if (p.riseTime) {
          const [riseH, riseM] = p.riseTime.split(':').map(Number);
          const transitTime = new Date(selectedTime);
          transitTime.setHours(riseH + 6); // Rough approximation (transit is ~6h after rise)
          transitTime.setMinutes(riseM);
          if (transitTime.getTime() >= baseTimeMs && transitTime.getTime() < baseTimeMs + 24 * 3600000) {
            rawEvents.push({
              time: transitTime,
              label: `${p.name} Meridian Peak`,
              type: 'planet-peak'
            });
          }
        }
      });
    }

    // 3. Add Moonrise / Moonset
    const moon = useMoonStore.getState().moonData;
    if (moon) {
      if (moon.moonrise) {
        const [riseH, riseM] = moon.moonrise.split(':').map(Number);
        const t = new Date(selectedTime);
        t.setHours(riseH, riseM, 0, 0);
        if (t.getTime() >= baseTimeMs && t.getTime() < baseTimeMs + 24 * 3600000) {
          rawEvents.push({
            time: t,
            label: 'Moonrise',
            type: 'moonrise'
          });
        }
      }
      if (moon.moonset) {
        const [setH, setM] = moon.moonset.split(':').map(Number);
        const t = new Date(selectedTime);
        t.setHours(setH, setM, 0, 0);
        if (t.getTime() >= baseTimeMs && t.getTime() < baseTimeMs + 24 * 3600000) {
          rawEvents.push({
            time: t,
            label: 'Moonset',
            type: 'moonset'
          });
        }
      }
    }

    // 4. Add Twilight Transitions
    const sunTimes = SunCalc.getTimes(selectedTime, lat, lon);
    if (sunTimes.sunset && !isNaN(sunTimes.sunset.getTime()) && sunTimes.sunset.getTime() >= baseTimeMs) {
      rawEvents.push({
        time: sunTimes.sunset,
        label: 'Sunset (Golden Hour)',
        type: 'twilight'
      });
    }
    if (sunTimes.nadir && !isNaN(sunTimes.nadir.getTime()) && sunTimes.nadir.getTime() >= baseTimeMs) {
      rawEvents.push({
        time: sunTimes.nadir,
        label: 'Peak Darkness (Nadir)',
        type: 'twilight'
      });
    }
    if (sunTimes.sunrise && !isNaN(sunTimes.sunrise.getTime()) && sunTimes.sunrise.getTime() >= baseTimeMs) {
      rawEvents.push({
        time: sunTimes.sunrise,
        label: 'Sunrise',
        type: 'twilight'
      });
    }

    // 5. Add Satellite / ISS Passes from pass store
    const upcomingPasses = usePassStore.getState().upcomingPasses;
    if (upcomingPasses) {
      upcomingPasses.forEach((pass) => {
        const passStart = new Date(pass.startTime);
        if (passStart.getTime() >= baseTimeMs && passStart.getTime() < baseTimeMs + 12 * 3600000) {
          const isISS = pass.satelliteId === '25544';
          rawEvents.push({
            time: passStart,
            label: isISS ? 'ISS Pass' : `Satellite ${pass.satelliteId} Pass`,
            type: isISS ? 'iss-pass' : 'satellite-pass'
          });
        }
      });
    }

    // Sort chronologically
    rawEvents.sort((a, b) => a.time.getTime() - b.time.getTime());

    // Map to UpcomingEvent
    return rawEvents.map((evt, idx) => ({
      id: `evt_${evt.type}_${idx}`,
      label: evt.label,
      timeLabel: formatTime(evt.time),
      relativeTime: getRelativeTimeLabel(evt.time.getTime(), baseTimeMs),
      timestamp: evt.time.getTime(),
      type: evt.type
    }));
  }
}
