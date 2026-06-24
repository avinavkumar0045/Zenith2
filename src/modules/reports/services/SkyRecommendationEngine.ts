import { useLocationStore } from '../../location/store/useLocationStore';
import { useMoonStore } from '../../moon/store/useMoonStore';
import { usePlanetStore } from '../../planets/store/usePlanetStore';
import { usePassStore } from '../../pass-predictions/store/usePassStore';
import { useISSStore } from '../../iss/store/useISSStore';
import { useSatelliteStore } from '../../satellites/store/useSatelliteStore';
import * as SunCalc from 'suncalc';

export class SkyRecommendationEngineClass {
  
  public getBestTarget(): { name: string; reason: string } | null {
    const { planets } = usePlanetStore.getState();
    const { moonData } = useMoonStore.getState();
    const { upcomingPasses } = usePassStore.getState();

    let bestTarget = null;
    let maxScore = -1;

    // 1. Check Planets
    Object.values(planets || {}).forEach(p => {
      if (p.isAboveHorizon && p.observationScore > maxScore) {
        maxScore = p.observationScore;
        bestTarget = { name: p.name, reason: `Highest visibility score and elevation.` };
      }
    });

    // 2. Check ISS / Satellite Passes
    if (upcomingPasses && upcomingPasses.length > 0) {
      const now = Date.now();
      const upcoming = upcomingPasses.filter(p => new Date(p.startTime).getTime() > now && new Date(p.startTime).getTime() - now < 3600000); // within 1 hour
      if (upcoming.length > 0) {
        const bestPass = upcoming.reduce((prev, current) => (prev.maxElevation > current.maxElevation) ? prev : current);
        if (bestPass.maxElevation > 40 && maxScore < 9) { // Strong pass
          const name = bestPass.satelliteId === '25544' ? 'ISS' : `Satellite ${bestPass.satelliteId}`;
          const minAway = Math.round((new Date(bestPass.startTime).getTime() - now) / 60000);
          bestTarget = { name, reason: `Strong pass expected within ${minAway} minutes.` };
          maxScore = 10; // Override
        }
      }
    }

    // 3. Check Moon if nothing else is amazing
    if (maxScore < 8 && moonData?.isVisible && moonData.altitude && moonData.altitude > 20) {
      bestTarget = { name: 'Moon', reason: 'Well positioned and easily observable.' };
    }

    return bestTarget;
  }

  public getRecommendations(): string[] {
    const recs: string[] = [];
    const { activeLocation } = useLocationStore.getState();
    const { planets } = usePlanetStore.getState();
    const { upcomingPasses } = usePassStore.getState();
    const { moonData } = useMoonStore.getState();
    const bestTarget = this.getBestTarget();

    if (!activeLocation) return recs;

    const sunPos = SunCalc.getPosition(new Date(), activeLocation.latitude, activeLocation.longitude);
    const sunAlt = sunPos.altitude * 180 / Math.PI;
    const dayState = sunAlt > 0 ? 'Day' : (sunAlt > -18 ? 'Twilight' : 'Night');

    if (dayState === 'Day') {
      recs.push("Observation quality is reduced by daylight.");
    }

    if (bestTarget && bestTarget.name !== 'Moon') {
      if (bestTarget.name === 'ISS' || bestTarget.name.startsWith('Satellite')) {
        recs.push(`${bestTarget.name} visibility will be excellent shortly.`);
      } else {
        recs.push(`${bestTarget.name} is currently the best planetary observation target.`);
      }
    }

    const visiblePlanets = Object.values(planets || {}).filter(p => p.isAboveHorizon);
    if (visiblePlanets.length > 2) {
      recs.push("Multiple planets are visible. Great time for planetary observation.");
    }

    if (moonData?.isVisible && moonData.phaseName.toLowerCase().includes('full')) {
      recs.push("Moon brightness may reduce faint-object visibility.");
    }

    if (upcomingPasses && upcomingPasses.length >= 3) {
      recs.push("Strong satellite activity is expected this evening.");
    }

    return recs;
  }

  public getWarnings(): string[] {
    const warnings: string[] = [];
    const { planets } = usePlanetStore.getState();
    const { moonData } = useMoonStore.getState();
    const { activeLocation } = useLocationStore.getState();
    const { upcomingPasses } = usePassStore.getState();

    if (!activeLocation) return warnings;

    const sunPos = SunCalc.getPosition(new Date(), activeLocation.latitude, activeLocation.longitude);
    const sunAlt = sunPos.altitude * 180 / Math.PI;
    const dayState = sunAlt > 0 ? 'Day' : (sunAlt > -18 ? 'Twilight' : 'Night');

    const visiblePlanets = Object.values(planets || {}).filter(p => p.isAboveHorizon);

    if (!moonData?.isVisible) {
      warnings.push("Moon is below the horizon.");
    }

    if (visiblePlanets.length === 0 && dayState !== 'Day') {
      warnings.push("All major planets are below the horizon.");
    }

    if (dayState === 'Night' && (!upcomingPasses || upcomingPasses.length === 0)) {
      warnings.push("No significant satellite passes detected.");
    }

    if (!moonData?.isVisible && visiblePlanets.length === 0 && (!upcomingPasses || upcomingPasses.length === 0)) {
      warnings.push("No visible targets available currently.");
    }

    return warnings;
  }
}

export const SkyRecommendationEngine = new SkyRecommendationEngineClass();
