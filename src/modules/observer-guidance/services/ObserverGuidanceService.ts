import { useLocationStore } from '../../location/store/useLocationStore';
import { useSkyCorrelationStore } from '../../sky-correlation/store/useSkyCorrelationStore';
import { useMoonStore } from '../../moon/store/useMoonStore';
import { usePlanetStore } from '../../planets/store/usePlanetStore';
import { useConstellationStore } from '../../constellations/store/useConstellationStore';
import { usePassStore } from '../../pass-predictions/store/usePassStore';
import { useWeatherStore } from '../../weather/store/useWeatherStore';

import { useObserverGuidanceStore } from '../store/useObserverGuidanceStore';
import { SkyDirectionTranslator } from './SkyDirectionTranslator';
import { SkyObjectGuidance, ObserverGuidanceReport } from '../types/observer-guidance.types';

class ObserverGuidanceServiceClass {
  private unsubscribeList: (() => void)[] = [];

  public initialize() {
    const trigger = () => this.generateGuidance();

    this.unsubscribeList.push(
      useLocationStore.subscribe((state, prevState) => {
        if (state.activeLocation !== prevState.activeLocation) trigger();
      }),
      useSkyCorrelationStore.subscribe((state, prevState) => {
        if (state.report !== prevState.report) trigger();
      })
    );

    // Initial run
    trigger();
  }

  private generateGuidance() {
    const correlation = useSkyCorrelationStore.getState().report;
    const { weather } = useWeatherStore.getState();
    const weatherMult = weather?.scoreMultiplier ?? 1.0;

    if (!correlation) return;

    const objects: SkyObjectGuidance[] = [];

    // 1. Moon
    const { moonData } = useMoonStore.getState();
    if (moonData && moonData.isVisible) {
      objects.push({
        id: 'moon',
        name: 'Moon',
        type: 'Moon',
        azimuth: moonData.azimuth,
        altitude: moonData.altitude,
        observationScore: moonData.observationScore * weatherMult,
        isBestTarget: correlation.bestTarget === 'Moon',
        visibilityStatus: 'Excellent' // simplify based on weather
      });
    }

    // 2. Planets
    const { planets } = usePlanetStore.getState();
    if (planets) {
      Object.values(planets).forEach(p => {
        if (p.isAboveHorizon) {
          objects.push({
            id: `planet-${p.name}`,
            name: p.name,
            type: 'Planet',
            azimuth: p.azimuth,
            altitude: p.altitude,
            observationScore: p.observationScore * weatherMult,
            isBestTarget: correlation.bestTarget === p.name,
            visibilityStatus: 'Good'
          });
        }
      });
    }

    // 3. Constellations
    const { visibleConstellations } = useConstellationStore.getState();
    if (visibleConstellations) {
      visibleConstellations.forEach(c => {
        if (c.isVisible) {
          objects.push({
            id: `constellation-${c.id}`,
            name: c.name,
            type: 'Constellation',
            azimuth: c.azimuth,
            altitude: c.altitude,
            observationScore: c.visibilityScore, // already weather-multiplied
            isBestTarget: correlation.bestTarget === c.name,
            visibilityStatus: 'Fair'
          });
        }
      });
    }

    // 4. Passes (ISS / Satellites)
    const { upcomingPasses } = usePassStore.getState();
    if (upcomingPasses) {
      const now = Date.now();
      upcomingPasses.forEach(p => {
        const isISS = p.satelliteId === '25544';
        const isCurrentlyVisible = new Date(p.startTime).getTime() < now && new Date(p.endTime).getTime() > now;
        
        // Include if it's currently overhead
        if (isCurrentlyVisible && (isISS || p.maxElevation > 40)) {
           objects.push({
             id: `pass-${p.passId}`,
             name: isISS ? 'ISS' : `Satellite ${p.satelliteId}`,
             type: isISS ? 'ISS' : 'Satellite',
             azimuth: 0, // Fallback since PassPredictionObject does not contain azimuth
             altitude: p.maxElevation, // approximate current
             observationScore: (isISS ? 10 : 7) * weatherMult,
             isBestTarget: correlation.bestTarget === (isISS ? 'ISS' : `Satellite ${p.satelliteId}`),
             visibilityStatus: 'Moving'
           });
        }
      });
    }

    // Sort objects by score for Ranking
    objects.sort((a, b) => b.observationScore - a.observationScore);

    const bestTargetObj = objects.find(o => o.isBestTarget) || objects[0] || null;

    const report: ObserverGuidanceReport = {
      bestTargetName: bestTargetObj ? bestTargetObj.name : 'None',
      bestTargetDirection: bestTargetObj ? SkyDirectionTranslator.getDirectionFromAzimuth(bestTargetObj.azimuth) : 'N/A',
      bestTargetElevation: bestTargetObj ? SkyDirectionTranslator.getElevationFromAltitude(bestTargetObj.altitude) : 'N/A',
      bestTargetInstruction: bestTargetObj ? SkyDirectionTranslator.generateInstruction(bestTargetObj.azimuth, bestTargetObj.altitude) : 'Wait for objects to rise above horizon.',
      bestTargetVisibility: weather ? weather.observationQuality : 'Unknown',
      bestTargetScore: bestTargetObj ? bestTargetObj.observationScore : 0,
      
      rankedObjects: objects,
      skyDomeObjects: objects.filter(o => o.altitude > 0)
    };

    useObserverGuidanceStore.getState().setReport(report);
  }

  public destroy() {
    this.unsubscribeList.forEach(unsub => unsub());
    this.unsubscribeList = [];
  }
}

export const ObserverGuidanceService = new ObserverGuidanceServiceClass();
