import { OpportunityObject } from '../types/opportunity.types';
import { usePassStore } from '../../pass-predictions/store/usePassStore';
import { useMoonStore } from '../../moon/store/useMoonStore';
import { usePlanetStore } from '../../planets/store/usePlanetStore';
import { useConstellationStore } from '../../constellations/store/useConstellationStore';
import { useWeatherStore } from '../../weather/store/useWeatherStore';

export class OpportunityDetectionEngineClass {
  
  public detectOpportunities(): OpportunityObject[] {
    const opportunities: OpportunityObject[] = [];
    const now = Date.now();
    const SIX_HOURS_MS = 6 * 60 * 60 * 1000;
    const horizonEnd = now + SIX_HOURS_MS;

    const { weather } = useWeatherStore.getState();
    const weatherConfidence = weather ? (weather.observationQuality === 'Excellent' || weather.observationQuality === 'Good' ? 'High' : 'Low') : 'Medium';

    // 1. Pass Predictions (ISS & Satellites)
    const { upcomingPasses } = usePassStore.getState();
    if (upcomingPasses) {
      upcomingPasses.forEach(pass => {
        const passStart = new Date(pass.startTime).getTime();
        const passPeak = new Date(pass.peakTime).getTime();
        
        if (passStart > now && passStart < horizonEnd) {
          const isISS = pass.satelliteId === '25544';
          const minutesUntil = Math.round((passStart - now) / 60000);
          
          opportunities.push({
            id: `opp-pass-${pass.passId}`,
            title: isISS ? 'ISS Transit' : `Satellite Pass`,
            description: isISS ? 'Optimal ISS viewing window' : 'Bright satellite pass',
            category: isISS ? 'ISS' : 'SATELLITE',
            severity: isISS ? 'CRITICAL' : 'MEDIUM',
            score: isISS ? 100 : 70,
            bestTime: passPeak,
            minutesUntil,
            confidence: weatherConfidence,
            azimuth: 0, // Fallback since PassPredictionObject does not contain azimuth
            altitude: pass.maxElevation
          });
        }
      });
    }

    // 2. Moon
    const { moonData } = useMoonStore.getState();
    // Assuming moon is persistent if visible. If not visible, we don't have accurate rise time in moonData directly without observation plan,
    // so we'll just check if it's currently highly observable.
    if (moonData && moonData.isVisible && moonData.altitude > 10) {
      opportunities.push({
        id: 'opp-moon',
        title: 'Lunar Observation',
        description: 'Moon is well positioned for observation.',
        category: 'MOON',
        severity: 'HIGH',
        score: 85,
        bestTime: now, // Currently best
        minutesUntil: 0,
        confidence: weatherConfidence,
        azimuth: moonData.azimuth,
        altitude: moonData.altitude
      });
    }

    // 3. Planets
    const { planets } = usePlanetStore.getState();
    if (planets) {
      Object.values(planets).forEach(p => {
        if (p.isAboveHorizon && p.observationScore > 6) {
          opportunities.push({
            id: `opp-planet-${p.name}`,
            title: `${p.name} Observation`,
            description: `Excellent conditions to view ${p.name}.`,
            category: 'PLANET',
            severity: 'HIGH',
            score: 80,
            bestTime: now,
            minutesUntil: 0,
            confidence: weatherConfidence,
            azimuth: p.azimuth,
            altitude: p.altitude
          });
        }
      });
    }

    // 4. Constellations
    const { visibleConstellations } = useConstellationStore.getState();
    if (visibleConstellations) {
      visibleConstellations.forEach(c => {
        if (c.visibilityScore > 8) {
          opportunities.push({
            id: `opp-constellation-${c.name}`,
            title: `${c.name} Near Zenith`,
            description: `${c.name} is ideally positioned for viewing.`,
            category: 'CONSTELLATION',
            severity: 'MEDIUM',
            score: 65,
            bestTime: now,
            minutesUntil: 0,
            confidence: weatherConfidence,
            azimuth: c.azimuth,
            altitude: c.altitude
          });
        }
      });
    }

    return opportunities;
  }
}

export const OpportunityDetectionEngine = new OpportunityDetectionEngineClass();
