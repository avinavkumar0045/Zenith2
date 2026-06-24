import { EventIntelligenceObject } from '../types/event-intelligence.types';

export class EventRankingEngineClass {
  
  public rankEvents(events: EventIntelligenceObject[]): EventIntelligenceObject[] {
    // Sort primarily by score descending, then by timestamp descending
    return [...events].sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return b.timestamp - a.timestamp;
    });
  }
}

export const EventRankingEngine = new EventRankingEngineClass();
