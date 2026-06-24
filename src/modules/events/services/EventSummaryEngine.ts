import { EventIntelligenceObject } from '../types/event-intelligence.types';

export class EventSummaryEngineClass {
  
  public summarizeEvents(rankedEvents: EventIntelligenceObject[]): { topEvent: EventIntelligenceObject | null, importantEvents: EventIntelligenceObject[] } {
    if (rankedEvents.length === 0) {
      return { topEvent: null, importantEvents: [] };
    }

    const topEvent = rankedEvents[0];
    
    // Grab the next 4 events to make a max of 5 displayed total
    const importantEvents = rankedEvents.slice(1, 5);

    return { topEvent, importantEvents };
  }
}

export const EventSummaryEngine = new EventSummaryEngineClass();
