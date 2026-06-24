import { useLocationStore } from '../../location/store/useLocationStore';
import { useMoonStore } from '../../moon/store/useMoonStore';
import { usePlanetStore } from '../../planets/store/usePlanetStore';
import { usePassStore } from '../../pass-predictions/store/usePassStore';
import { useWeatherStore } from '../../weather/store/useWeatherStore';
import * as SunCalc from 'suncalc';

export class SkyObservationScoreEngineClass {
  public calculateScore(): number {
    let score = 0;
    
    const { activeLocation } = useLocationStore.getState();
    const { moonData } = useMoonStore.getState();
    const { planets } = usePlanetStore.getState();
    const { upcomingPasses } = usePassStore.getState();
    const { weather } = useWeatherStore.getState();

    if (!activeLocation) return 0;

    // Calculate day state
    const sunPos = SunCalc.getPosition(new Date(), activeLocation.latitude, activeLocation.longitude);
    const sunAlt = sunPos.altitude * 180 / Math.PI;
    const dayState = sunAlt > 0 ? 'Day' : (sunAlt > -18 ? 'Twilight' : 'Night');

    // Base daylight penalty
    if (dayState === 'Day') {
      return 2; // Rarely worth observing during full day unless a bright planet is visible
    }

    if (dayState === 'Twilight') {
      score += 3;
    } else {
      score += 5; // Night starts with a solid baseline
    }

    // Moon factors
    if (moonData?.isVisible && moonData.altitude !== null && moonData.altitude > 10) {
      score += 2; // Moon is a good target
    }

    // Planet factors
    let highScorePlanets = 0;
    Object.values(planets || {}).forEach(p => {
      if (p.isAboveHorizon && p.observationScore >= 7) {
        highScorePlanets += 1;
      }
    });

    if (highScorePlanets > 0) {
      score += Math.min(3, highScorePlanets); // Up to +3 for good planets
    }

    // Pass Prediction factors
    if (upcomingPasses && upcomingPasses.length > 0) {
      const imminentPasses = upcomingPasses.filter(p => new Date(p.startTime).getTime() - Date.now() < 3600000 * 2); // next 2 hours
      if (imminentPasses.length > 0) {
        score += 2; // Good satellite activity
      }
    }

    // Weather penalty
    if (weather) {
      score *= weather.scoreMultiplier;
    }

    return Math.min(10, Math.max(0, score));
  }
}

export const SkyObservationScoreEngine = new SkyObservationScoreEngineClass();
