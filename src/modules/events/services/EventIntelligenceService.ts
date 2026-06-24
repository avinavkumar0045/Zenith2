import { useLocationStore } from '../../location/store/useLocationStore';
import { useMoonStore } from '../../moon/store/useMoonStore';
import { usePlanetStore } from '../../planets/store/usePlanetStore';
import { useConstellationStore } from '../../constellations/store/useConstellationStore';
import { useSatelliteStore } from '../../satellites/store/useSatelliteStore';
import { useISSStore } from '../../iss/store/useISSStore';
import { usePassStore } from '../../pass-predictions/store/usePassStore';
import { useWeatherStore } from '../../weather/store/useWeatherStore';

import { useEventStore } from '../store/useEventStore';
import { EventDetectionEngine } from './EventDetectionEngine';
import { EventRankingEngine } from './EventRankingEngine';
import { EventSummaryEngine } from './EventSummaryEngine';

class EventIntelligenceServiceClass {
  private unsubscribeList: (() => void)[] = [];

  public initialize() {
    const trigger = () => this.generateEvents();

    this.unsubscribeList.push(
      useLocationStore.subscribe((state, prevState) => {
        if (state.activeLocation !== prevState.activeLocation) trigger();
      }),
      useMoonStore.subscribe((state, prevState) => {
        if (state.lastUpdated !== prevState.lastUpdated) trigger();
      }),
      usePlanetStore.subscribe((state, prevState) => {
        if (state.lastUpdated !== prevState.lastUpdated) trigger();
      }),
      useConstellationStore.subscribe((state, prevState) => {
        if (state.visibleConstellations !== prevState.visibleConstellations) trigger();
      }),
      useSatelliteStore.subscribe((state, prevState) => {
        if (state.activeSatellites !== prevState.activeSatellites) trigger();
      }),
      useISSStore.subscribe((state, prevState) => {
        if (state.isTracking !== prevState.isTracking) trigger();
      }),
      usePassStore.subscribe((state, prevState) => {
        if (state.upcomingPasses !== prevState.upcomingPasses) trigger();
      }),
      useWeatherStore.subscribe((state, prevState) => {
        if (state.weather?.updatedAt !== prevState.weather?.updatedAt) trigger();
      })
    );

    // Initial run
    trigger();
  }

  private generateEvents() {
    const rawEvents = EventDetectionEngine.detectEvents();
    const rankedEvents = EventRankingEngine.rankEvents(rawEvents);
    const { topEvent, importantEvents } = EventSummaryEngine.summarizeEvents(rankedEvents);

    useEventStore.getState().setEventsData(rankedEvents, topEvent, importantEvents);
  }

  public destroy() {
    this.unsubscribeList.forEach(unsub => unsub());
    this.unsubscribeList = [];
  }
}

export const EventIntelligenceService = new EventIntelligenceServiceClass();
