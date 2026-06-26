import { useMoonStore } from '@/modules/moon/store/useMoonStore';
import { usePlanetStore } from '@/modules/planets/store/usePlanetStore';
import { usePassStore } from '@/modules/pass-predictions/store/usePassStore';
import { SkyEvent } from '../MissionBrief.types';
import { getRelativeTimeLabel } from '../MissionBrief.utils';

export class EventEngine {
  private static parseTodayTime(timeStr: string | null): number | null {
    if (!timeStr) return null;
    const parts = timeStr.split(':');
    if (parts.length < 2) return null;
    const h = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10);
    if (isNaN(h) || isNaN(m)) return null;
    const d = new Date();
    d.setHours(h, m, 0, 0);
    if (d.getTime() < Date.now() - 1800000) {
      d.setDate(d.getDate() + 1);
    }
    return d.getTime();
  }

  /**
   * Compiles upcoming astronomical events and sorts them chronologically.
   */
  public static getChronologicalEvents(): SkyEvent[] {
    const events: SkyEvent[] = [];
    const now = Date.now();

    // 1. Moonrise & Moonset
    const { moonData } = useMoonStore.getState();
    if (moonData) {
      const riseTs = this.parseTodayTime(moonData.moonrise);
      if (riseTs && riseTs > now) {
        events.push({
          id: 'moonrise',
          name: 'Moonrise',
          timestamp: riseTs,
          timeLabel: getRelativeTimeLabel(riseTs)
        });
      }
      const setTs = this.parseTodayTime(moonData.moonset);
      if (setTs && setTs > now) {
        events.push({
          id: 'moonset',
          name: 'Moonset',
          timestamp: setTs,
          timeLabel: getRelativeTimeLabel(setTs)
        });
      }
    }

    // 2. ISS Pass
    const { upcomingPasses } = usePassStore.getState();
    if (upcomingPasses) {
      const issPasses = upcomingPasses.filter(
        p => p.satelliteId === '25544' && new Date(p.startTime).getTime() > now
      );
      if (issPasses.length > 0) {
        const nextPass = issPasses[0];
        const passTs = new Date(nextPass.startTime).getTime();
        events.push({
          id: 'iss-pass',
          name: 'ISS Pass',
          timestamp: passTs,
          timeLabel: getRelativeTimeLabel(passTs)
        });
      }
    }

    // 3. Planet Rises
    const { planets } = usePlanetStore.getState();
    if (planets) {
      Object.values(planets).forEach(p => {
        const riseTs = this.parseTodayTime(p.riseTime);
        if (riseTs && riseTs > now) {
          events.push({
            id: `rise-${p.id}`,
            name: `${p.name} Rise`,
            timestamp: riseTs,
            timeLabel: getRelativeTimeLabel(riseTs)
          });
        }
      });
    }

    // Sort chronologically by timestamp
    events.sort((a, b) => a.timestamp - b.timestamp);

    // Limit to next 4 events to maintain clean whitespace layout
    return events.slice(0, 4);
  }
}
