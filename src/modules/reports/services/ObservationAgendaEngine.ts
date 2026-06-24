import { ObservationTarget, ObservationAgendaItem } from '../types/observation-planning.types';

export class ObservationAgendaEngineClass {
  
  public generateAgenda(rankedTargets: ObservationTarget[]): ObservationAgendaItem[] {
    const agenda: ObservationAgendaItem[] = [];

    // Filter to top targets to prevent agenda bloat
    const topTargets = rankedTargets.slice(0, 8);

    topTargets.forEach(t => {
      if (t.window && t.quality !== 'Hidden') {
        agenda.push({
          time: t.window.peakTime,
          targetName: t.name,
          type: t.type,
          peakAltitude: t.window.peakAltitude,
          quality: t.quality
        });
      }
    });

    // Sort ascending by peak time
    return agenda.sort((a, b) => a.time - b.time);
  }
}

export const ObservationAgendaEngine = new ObservationAgendaEngineClass();
