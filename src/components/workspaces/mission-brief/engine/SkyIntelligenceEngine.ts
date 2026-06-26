import { useLocationStore } from '@/modules/location/store/useLocationStore';
import { useWeatherStore } from '@/modules/weather/store/useWeatherStore';
import { useMoonStore } from '@/modules/moon/store/useMoonStore';
import { usePlanetStore } from '@/modules/planets/store/usePlanetStore';
import { SkyIntelligenceModel } from '../MissionBrief.types';
import { OpportunityEngine } from './OpportunityEngine';
import { EventEngine } from './EventEngine';
import { RecommendationEngine } from './RecommendationEngine';
import { InsightEngine } from './InsightEngine';

export class SkyIntelligenceEngine {
  /**
   * Compiles the dynamic store states into a presentation-ready SkyIntelligenceModel.
   */
  public static compileModel(): SkyIntelligenceModel | null {
    const { activeLocation } = useLocationStore.getState();
    if (!activeLocation) return null;

    const { weather, error: weatherError } = useWeatherStore.getState();
    const { moonData } = useMoonStore.getState();
    const { planets } = usePlanetStore.getState();

    // 1. Determine Partial Telemetry and Observation Confidence
    const hasWeather = !!weather && !weatherError;
    const hasMoon = !!moonData;
    const hasPlanets = Object.keys(planets || {}).length > 0;

    let confidencePercentage = 100;
    let confidenceText: 'High' | 'Moderate' | 'Low' = 'High';
    let isPartialTelemetry = false;

    if (!hasWeather) {
      isPartialTelemetry = true;
      confidencePercentage = 60;
      confidenceText = 'Moderate';
    }

    if (!activeLocation) {
      confidencePercentage = 0;
      confidenceText = 'Low';
    }

    // 2. Score & Qualitative Rating
    let score = 70; // Default fallback if weather data is missing
    let qualitativeRating: 'Excellent' | 'Good' | 'Fair' | 'Poor' = 'Good';

    if (hasWeather && weather) {
      score = Math.round(weather.scoreMultiplier * 100);
      const q = weather.observationQuality;
      if (q === 'Excellent') qualitativeRating = 'Excellent';
      else if (q === 'Good') qualitativeRating = 'Good';
      else if (q === 'Average') qualitativeRating = 'Fair';
      else qualitativeRating = 'Poor';
    } else {
      // Celestial-only heuristic score
      let scoreAcc = 50;
      if (hasMoon && moonData) {
        if (!moonData.isVisible) scoreAcc += 20; // Moon set creates darker sky
        else scoreAcc += Math.round((1 - moonData.illumination) * 20); // Less moon is better
      }
      if (hasPlanets) {
        const visibleCount = Object.values(planets).filter(p => p.isAboveHorizon).length;
        scoreAcc += visibleCount * 5;
      }
      score = Math.min(100, scoreAcc);
      if (score >= 85) qualitativeRating = 'Excellent';
      else if (score >= 65) qualitativeRating = 'Good';
      else if (score >= 40) qualitativeRating = 'Fair';
      else qualitativeRating = 'Poor';
    }

    // 3. Explain "Why" (The reasoning checklist)
    const whyItems: string[] = [];
    if (hasWeather && weather) {
      if (weather.cloudCover < 15) {
        whyItems.push(`Clear skies (only ${weather.cloudCover}% cloud cover)`);
      } else {
        whyItems.push(`${weather.cloudCover}% cloud cover`);
      }
      whyItems.push(`Visibility: ${weather.visibilityKm} km`);
      if (weather.humidity < 60) {
        whyItems.push('Low atmospheric humidity');
      }
    } else {
      whyItems.push('Weather telemetry offline (using astronomical predictions)');
    }

    if (hasMoon && moonData) {
      if (!moonData.isVisible) {
        whyItems.push('No moonlight pollution (Moon is down)');
      } else {
        const illumPct = Math.round(moonData.illumination * 100);
        if (illumPct < 25) {
          whyItems.push(`Low moonlight intensity (${illumPct}%)`);
        } else {
          whyItems.push(`Significant moonlight pollution (${illumPct}%)`);
        }
      }
    }

    // 4. Observation Conditions Grid
    const metricsGrid = [
      {
        label: 'Cloud Cover',
        value: hasWeather && weather ? `${weather.cloudCover}%` : 'Offline',
        detail: hasWeather && weather ? weather.weatherCondition : 'Weather telemetry unavailable'
      },
      {
        label: 'Moon Illumination',
        value: hasMoon && moonData ? `${Math.round(moonData.illumination * 100)}%` : 'Unknown',
        detail: hasMoon && moonData ? moonData.phaseName : 'Celestial model unaligned'
      },
      {
        label: 'Visibility',
        value: hasWeather && weather ? `${weather.visibilityKm} km` : 'Offline',
        detail: hasWeather && weather ? 'Atmospheric range' : 'Sensor offline'
      },
      {
        label: 'Darkness Level',
        value: activeLocation.dayState,
        detail: activeLocation.dayState === 'Night' ? 'Deep-space viewing open' : 'Daylight scatter reduces contrast'
      }
    ];

    return {
      locationName: activeLocation.name || 'Unknown Location',
      dayState: activeLocation.dayState as 'Day' | 'Twilight' | 'Night',
      qualitativeRating,
      score,
      confidenceText,
      confidencePercentage,
      isPartialTelemetry,
      heroInsight: InsightEngine.getHeroInsight(),
      bestTarget: OpportunityEngine.getBestTarget(),
      whyItems,
      events: EventEngine.getChronologicalEvents(),
      metrics: metricsGrid,
      recommendations: RecommendationEngine.getActionableSteps(),
      warnings: RecommendationEngine.getWarnings(),
      lastUpdated: Date.now()
    };
  }
}
