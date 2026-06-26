import { useWeatherStore } from '@/modules/weather/store/useWeatherStore';
import { usePassStore } from '@/modules/pass-predictions/store/usePassStore';
import { OpportunityEngine } from './OpportunityEngine';
import { RecommendationEngine } from './RecommendationEngine';

export interface HeroInsightData {
  headline: string;
  target: string | null;
  detail: string;
}

export class InsightEngine {
  /**
   * Resolves exactly one high-priority hero insight.
   * Priority: Critical Alert > ISS > Best Target > Recommendation > General
   */
  public static getHeroInsight(): HeroInsightData {
    const now = Date.now();

    // 1. Critical weather alert
    const { weather } = useWeatherStore.getState();
    if (weather && weather.scoreMultiplier < 0.3) {
      return {
        headline: 'Observation Alert',
        target: null,
        detail: `${weather.weatherCondition} limits visibility tonight`,
      };
    }

    // 2. Imminent ISS pass
    const { upcomingPasses } = usePassStore.getState();
    if (upcomingPasses) {
      const upcomingIss = upcomingPasses.filter(
        p => p.satelliteId === '25544' && new Date(p.startTime).getTime() > now
      );
      if (upcomingIss.length > 0) {
        const nextStart = new Date(upcomingIss[0].startTime).getTime();
        const diffMin = Math.round((nextStart - now) / 60000);
        if (diffMin <= 15 && diffMin > 0) {
          return {
            headline: 'ISS Overhead',
            target: null,
            detail: `Passing in ${diffMin} minute${diffMin === 1 ? '' : 's'}`,
          };
        }
      }
    }

    // 3. Best observation target
    const bestTarget = OpportunityEngine.getBestTarget();
    if (bestTarget) {
      return {
        headline: "Tonight's Best Target",
        target: bestTarget.name,
        detail: bestTarget.reason,
      };
    }

    // 4. First actionable recommendation
    const recs = RecommendationEngine.getActionableSteps();
    if (recs.length > 0) {
      return {
        headline: 'Recommendation',
        target: null,
        detail: recs[0],
      };
    }

    // 5. General sky summary fallback
    if (weather) {
      return {
        headline: 'Sky Conditions',
        target: null,
        detail: `${weather.observationQuality} · ${weather.weatherCondition}`,
      };
    }

    return {
      headline: 'System Ready',
      target: null,
      detail: 'Standing by for coordinate alignment',
    };
  }
}
