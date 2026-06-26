import * as SunCalc from 'suncalc';
import { TimelineMarker } from '../types';
import { useLocationStore } from '@/modules/location/store/useLocationStore';
import { useMoonStore } from '@/modules/moon/store/useMoonStore';
import { usePassStore } from '@/modules/pass-predictions/store/usePassStore';

export interface TimeAnchor {
  id: string;
  label: string;
  time: Date;
  offset: number; // 0-100 along the 24h rail
}

export class TimelineEngine {
  /**
   * Curates product-oriented time anchors for the 24-hour timeline rail.
   */
  public static compileTimeAnchors(currentTime: Date): TimeAnchor[] {
    const { activeLocation } = useLocationStore.getState();
    if (!activeLocation) return [];

    const lat = activeLocation.latitude;
    const lon = activeLocation.longitude;
    const baseTimeMs = currentTime.getTime();
    const dayMs = 24 * 3600 * 1000;

    const anchors: { label: string; time: Date }[] = [
      { label: 'NOW', time: currentTime }
    ];

    // Sunset & nadir
    const sunTimes = SunCalc.getTimes(currentTime, lat, lon);
    if (sunTimes.sunset && !isNaN(sunTimes.sunset.getTime())) {
      anchors.push({ label: 'SUNSET', time: sunTimes.sunset });
    }
    
    // Golden Hour (civil dusk transition)
    if (sunTimes.dusk && !isNaN(sunTimes.dusk.getTime())) {
      anchors.push({ label: 'GOLDEN HOUR', time: sunTimes.dusk });
    }
    
    // Peak Darkness (Nadir)
    if (sunTimes.nadir && !isNaN(sunTimes.nadir.getTime())) {
      anchors.push({ label: 'PEAK DARKNESS', time: sunTimes.nadir });
    }

    // Moonrise
    const moon = useMoonStore.getState().moonData;
    if (moon && moon.moonrise) {
      const [h, m] = moon.moonrise.split(':').map(Number);
      const t = new Date(currentTime);
      t.setHours(h, m, 0, 0);
      anchors.push({ label: 'MOONRISE', time: t });
    } else {
      const moonTimes = SunCalc.getMoonTimes(currentTime, lat, lon);
      if (moonTimes.rise) {
        anchors.push({ label: 'MOONRISE', time: moonTimes.rise });
      }
    }

    // Next ISS Pass
    const upcomingPasses = usePassStore.getState().upcomingPasses;
    if (upcomingPasses) {
      const issPass = upcomingPasses.find(p => p.satelliteId === '25544' && new Date(p.startTime).getTime() >= baseTimeMs);
      if (issPass) {
        anchors.push({ label: 'NEXT ISS PASS', time: new Date(issPass.startTime) });
      }
    }

    // Tomorrow (+24 hours)
    anchors.push({ label: 'TOMORROW', time: new Date(baseTimeMs + dayMs) });

    // Filter anchors to only include those within the 24h window (or now) and compute their offsets
    return anchors
      .map((anchor) => {
        let offset = ((anchor.time.getTime() - baseTimeMs) / dayMs) * 100;
        
        // Wrap or clamp slightly if out of range, but within J24h is desired
        if (offset < 0) offset = 0;
        if (offset > 100) offset = 100;

        return {
          id: `anchor_${anchor.label.toLowerCase().replace(/\s+/g, '_')}`,
          label: anchor.label,
          time: anchor.time,
          offset
        };
      })
      .sort((a, b) => a.offset - b.offset);
  }

  /**
   * Translates upcoming chronological events into markers plotted onto the horizontal timeline rail.
   */
  public static compileTimelineMarkers(currentTime: Date, upcomingEvents: any[]): TimelineMarker[] {
    const baseTimeMs = currentTime.getTime();
    const dayMs = 24 * 3600 * 1000;

    const markers: TimelineMarker[] = [];

    upcomingEvents.forEach((evt) => {
      const offset = ((evt.timestamp - baseTimeMs) / dayMs) * 100;
      if (offset >= 0 && offset <= 100) {
        let type: TimelineMarker['type'] = 'satellite';
        if (evt.type === 'iss-pass') type = 'iss';
        else if (evt.type === 'moonrise') type = 'moonrise';
        else if (evt.type === 'moonset') type = 'moonset';
        else if (evt.type === 'planet-peak') type = 'transit';
        else if (evt.type === 'twilight') type = 'twilight';
        else if (evt.type === 'observation-start' || evt.type === 'observation-end') type = 'weather';

        markers.push({
          id: `marker_${evt.id}`,
          label: evt.label,
          time: new Date(evt.timestamp),
          type,
          relativeOffset: offset
        });
      }
    });

    return markers;
  }
}
