import { useMoonStore } from '../../moon/store/useMoonStore';
import { usePlanetStore } from '../../planets/store/usePlanetStore';
import { usePassStore } from '../../pass-predictions/store/usePassStore';
import { useISSStore } from '../../iss/store/useISSStore';
import { useWeatherStore } from '../../weather/store/useWeatherStore';

export class SpaceActivityEngineClass {
  
  public calculateIndex(): number {
    let score = 0;

    const { moonData } = useMoonStore.getState();
    const { planets } = usePlanetStore.getState();
    const { upcomingPasses } = usePassStore.getState();
    const { isTracking: issTracking } = useISSStore.getState();
    const { weather } = useWeatherStore.getState();

    // Base score points
    if (moonData?.isVisible) score += 2;

    if (planets) {
      const visiblePlanetsCount = Object.values(planets).filter(p => p.isAboveHorizon).length;
      score += visiblePlanetsCount; // +1 each
    }

    // ISS Check
    const now = Date.now();
    let isIssPassing = issTracking;
    if (upcomingPasses) {
      isIssPassing = isIssPassing || upcomingPasses.some(p => p.satelliteId === '25544' && new Date(p.startTime).getTime() < now && new Date(p.endTime).getTime() > now);
    }
    if (isIssPassing) score += 3;

    // Strong satellite passes
    if (upcomingPasses) {
      const activeStrongPasses = upcomingPasses.filter(p => p.maxElevation > 40 && new Date(p.startTime).getTime() < now && new Date(p.endTime).getTime() > now).length;
      if (activeStrongPasses > 0) score += 2;
    }

    // Weather impact
    let weatherMult = 1.0;
    if (weather) {
      if (weather.observationQuality === 'Excellent') score += 2;
      else if (weather.observationQuality === 'Good') score += 1;
      
      weatherMult = weather.scoreMultiplier; // Use multiplier to penalize
    }

    // Apply weather penalty mapping
    score = score * weatherMult;

    // Normalize out of 10
    // Theoretically max could be 2 (Moon) + 5 (Planets) + 3 (ISS) + 2 (Passes) + 2 (Weather) = 14
    // We want a good active sky to be around 8-10.
    return Math.max(0, Math.min(10, score * (10 / 12)));
  }
}

export const SpaceActivityEngine = new SpaceActivityEngineClass();
