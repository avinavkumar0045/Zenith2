import { useLocationStore } from '../../location/store/useLocationStore';
import { useMoonStore } from '../../moon/store/useMoonStore';
import { usePlanetStore } from '../../planets/store/usePlanetStore';
import { useConstellationStore } from '../../constellations/store/useConstellationStore';
import { usePassStore } from '../../pass-predictions/store/usePassStore';
import { useWeatherStore } from '../../weather/store/useWeatherStore';

import { useOpportunityStore } from '../store/useOpportunityStore';
import { OpportunityDetectionEngine } from './OpportunityDetectionEngine';
import { OpportunityRankingEngine } from './OpportunityRankingEngine';
import { OpportunityForecastEngine } from './OpportunityForecastEngine';

class OpportunityIntelligenceServiceClass {
  private unsubscribeList: (() => void)[] = [];

  public initialize() {
    const trigger = () => this.generateOpportunities();

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

  private generateOpportunities() {
    const rawOps = OpportunityDetectionEngine.detectOpportunities();
    const rankedOps = OpportunityRankingEngine.rankOpportunities(rawOps);
    
    const bestOpportunity = rankedOps.length > 0 ? rankedOps[0] : null;
    const forecast = OpportunityForecastEngine.generateForecast(rankedOps);

    useOpportunityStore.getState().setOpportunityData(
      rankedOps,
      bestOpportunity,
      forecast.quality,
      forecast.summary
    );
  }

  public destroy() {
    this.unsubscribeList.forEach(unsub => unsub());
    this.unsubscribeList = [];
  }
}

export const OpportunityIntelligenceService = new OpportunityIntelligenceServiceClass();
