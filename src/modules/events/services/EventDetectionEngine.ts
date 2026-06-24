import { EventIntelligenceObject } from '../types/event-intelligence.types';
import { useLocationStore } from '../../location/store/useLocationStore';
import { useMoonStore } from '../../moon/store/useMoonStore';
import { usePlanetStore } from '../../planets/store/usePlanetStore';
import { useConstellationStore } from '../../constellations/store/useConstellationStore';
import { usePassStore } from '../../pass-predictions/store/usePassStore';
import { useWeatherStore } from '../../weather/store/useWeatherStore';
import { useSkyIntelligenceStore } from '../../reports/store/useSkyIntelligenceStore';

export class EventDetectionEngineClass {
  
  public detectEvents(): EventIntelligenceObject[] {
    const events: EventIntelligenceObject[] = [];
    const now = Date.now();

    // 1. ISS and Satellite Events
    const { upcomingPasses } = usePassStore.getState();
    if (upcomingPasses) {
      upcomingPasses.forEach(pass => {
        const passStart = new Date(pass.startTime).getTime();
        const passEnd = new Date(pass.endTime).getTime();
        const isISS = pass.satelliteId === '25544';
        
        if (now < passStart) {
          const minutesToPass = Math.round((passStart - now) / 60000);
          if (minutesToPass <= 60) {
            events.push({
              id: `pass-${pass.passId}-upcoming`,
              title: isISS ? `ISS visible in ${minutesToPass} minutes` : `Satellite visible in ${minutesToPass} minutes`,
              description: `Peak elevation will be ${Math.round(pass.maxElevation)}°`,
              category: isISS ? 'ISS' : 'SATELLITE',
              severity: isISS ? 'PRIORITY' : 'INFO',
              score: isISS ? 100 + (60 - minutesToPass) : 50 + (60 - minutesToPass), // Transience score boost
              timestamp: now
            });
          }
        } else if (now >= passStart && now <= passEnd) {
          const minutesLeft = Math.round((passEnd - now) / 60000);
          events.push({
            id: `pass-${pass.passId}-active`,
            title: isISS ? 'ISS currently visible' : 'Satellite currently visible',
            description: `Pass ends in ${minutesLeft} minutes`,
            category: isISS ? 'ISS' : 'SATELLITE',
            severity: isISS ? 'PRIORITY' : 'IMPORTANT',
            score: isISS ? 200 : 150,
            timestamp: now
          });
        }
      });
    }

    // 2. Moon Events
    const { moonData } = useMoonStore.getState();
    if (moonData) {
      if (moonData.isVisible && moonData.altitude > 20) {
        events.push({
          id: 'moon-visible',
          title: `Moon visibility excellent`,
          description: `${moonData.phase} phase currently highly visible.`,
          category: 'MOON',
          severity: 'GOOD',
          score: 80,
          timestamp: now
        });
      } else if (!moonData.isVisible) {
        events.push({
          id: 'moon-hidden',
          title: `Moon below horizon`,
          description: `Wait for moonrise for lunar observation.`,
          category: 'MOON',
          severity: 'INFO',
          score: 20,
          timestamp: now
        });
      }
    }

    // 3. Planet Events
    const { planets } = usePlanetStore.getState();
    if (planets) {
      const visiblePlanets = Object.values(planets).filter(p => p.isAboveHorizon);
      if (visiblePlanets.length > 1) {
        events.push({
          id: 'planets-multiple',
          title: `Multiple planets visible tonight`,
          description: `${visiblePlanets.length} major planets currently visible.`,
          category: 'PLANET',
          severity: 'IMPORTANT',
          score: 85,
          timestamp: now
        });
      }
      
      const bestPlanet = visiblePlanets.sort((a, b) => b.observationScore - a.observationScore)[0];
      if (bestPlanet && bestPlanet.observationScore > 7) {
        events.push({
          id: `planet-best-${bestPlanet.name}`,
          title: `${bestPlanet.name} remains highly visible`,
          description: `Excellent conditions for observing ${bestPlanet.name}.`,
          category: 'PLANET',
          severity: 'GOOD',
          score: 75,
          timestamp: now
        });
      }
    }

    // 4. Constellation Events
    const { visibleConstellations } = useConstellationStore.getState();
    if (visibleConstellations && visibleConstellations.length > 0) {
      const topConstellation = visibleConstellations.sort((a, b) => b.visibilityScore - a.visibilityScore)[0];
      if (topConstellation && topConstellation.altitude > 60) {
        events.push({
          id: `constellation-zenith-${topConstellation.name}`,
          title: `${topConstellation.name} near zenith`,
          description: `Optimal positioning for this constellation.`,
          category: 'CONSTELLATION',
          severity: 'GOOD',
          score: 70,
          timestamp: now
        });
      }
    }

    // 5. Weather / General
    const { weather } = useWeatherStore.getState();
    if (weather) {
      if (weather.observationQuality === 'Excellent') {
        events.push({
          id: 'weather-excellent',
          title: `Clear skies detected`,
          description: `Perfect weather conditions for astronomy.`,
          category: 'WEATHER',
          severity: 'GOOD',
          score: 90,
          timestamp: now
        });
      } else if (weather.observationQuality === 'Poor') {
        events.push({
          id: 'weather-poor',
          title: `Poor observation conditions`,
          description: `Cloud cover or weather is restricting visibility.`,
          category: 'WEATHER',
          severity: 'IMPORTANT',
          score: 60,
          timestamp: now
        });
      }
    }

    return events;
  }
}

export const EventDetectionEngine = new EventDetectionEngineClass();
