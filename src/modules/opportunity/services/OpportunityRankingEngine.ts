import { OpportunityObject } from '../types/opportunity.types';

export class OpportunityRankingEngineClass {
  
  public rankOpportunities(opportunities: OpportunityObject[]): OpportunityObject[] {
    // Rank transient over persistent based on severity and score
    // ISS > SATELLITE > MOON > PLANET > CONSTELLATION
    
    return [...opportunities].sort((a, b) => {
      // 1. Severity/Score Check
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      
      // 2. Transience check (shorter time to event wins if scores are tied)
      if (a.minutesUntil > 0 && b.minutesUntil > 0) {
        return a.minutesUntil - b.minutesUntil;
      }

      return 0;
    });
  }
}

export const OpportunityRankingEngine = new OpportunityRankingEngineClass();
