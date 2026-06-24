import { ObservationTarget } from '../types/observation-planning.types';

export class TargetRankingEngineClass {
  
  public rankTargets(targets: ObservationTarget[]): ObservationTarget[] {
    const qualityWeight: Record<string, number> = {
      'Excellent': 40,
      'Good': 30,
      'Average': 20,
      'Poor': 10,
      'Hidden': 0
    };

    return [...targets]
      .filter(t => t.quality !== 'Hidden' && t.window !== null)
      .sort((a, b) => {
        let scoreA = a.score * 5; // Base score weight
        let scoreB = b.score * 5;

        scoreA += qualityWeight[a.quality];
        scoreB += qualityWeight[b.quality];

        if (a.window && b.window) {
          scoreA += (a.window.peakAltitude / 90) * 20;
          scoreB += (b.window.peakAltitude / 90) * 20;
          
          // ISS Passes get a massive bonus because they are rare and fleeting
          if (a.type === 'ISS') scoreA += 50;
          if (b.type === 'ISS') scoreB += 50;
          
          if (a.type === 'Satellite') scoreA += 10;
          if (b.type === 'Satellite') scoreB += 10;
        }

        return scoreB - scoreA;
      });
  }
}

export const TargetRankingEngine = new TargetRankingEngineClass();
