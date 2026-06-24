import { useMoonStore } from '../../moon/store/useMoonStore';
import { usePlanetStore } from '../../planets/store/usePlanetStore';
import { useConstellationStore } from '../../constellations/store/useConstellationStore';
import { useSatelliteStore } from '../../satellites/store/useSatelliteStore';
import { useISSStore } from '../../iss/store/useISSStore';
import { usePassStore } from '../../pass-predictions/store/usePassStore';
import { useObservationPlanningStore } from '../../reports/store/useObservationPlanningStore';
import { useWeatherStore } from '../../weather/store/useWeatherStore';
import { SkyDirectionEngine } from './SkyDirectionEngine';

export class OverheadObjectEngineClass {
  
  public generateRawData(latitude: number, longitude: number) {
    const { moonData } = useMoonStore.getState();
    const { planets } = usePlanetStore.getState();
    const { visibleConstellations } = useConstellationStore.getState();
    const { activeSatellites } = useSatelliteStore.getState();
    const { isTracking: issTracking } = useISSStore.getState();
    const { upcomingPasses } = usePassStore.getState();
    const { plan } = useObservationPlanningStore.getState();
    const { weather } = useWeatherStore.getState();

    const visibleMoon = moonData?.isVisible || false;
    const moonAltitude = moonData?.altitude || 0;
    
    const visiblePlanets = Object.values(planets || {})
      .filter(p => p.isAboveHorizon)
      .sort((a, b) => b.observationScore - a.observationScore)
      .map(p => p.name);

    const constellations = visibleConstellations.map(c => c.name);
    
    const visibleSatellites = activeSatellites.length;
    
    const upcoming = upcomingPasses ? upcomingPasses.filter(p => new Date(p.startTime).getTime() > Date.now()) : [];
    const upcomingCount = upcoming.length;
    
    const issPasses = upcoming.filter(p => p.satelliteId === '25544');
    // Consider ISS visible if it is currently passing or tracking
    const issCurrentlyPassing = issPasses.some(p => new Date(p.startTime).getTime() < Date.now() && new Date(p.endTime).getTime() > Date.now());
    const issVisible = issTracking || issCurrentlyPassing;

    let bestTarget = 'None';
    let bestDirection = 'N/A';

    // Retrieve best target from Observation Plan
    if (plan && plan.rankedTargets.length > 0) {
      const top = plan.rankedTargets[0];
      bestTarget = top.name;
      
      // Determine Azimuth for direction
      let bestAzimuth = null;
      if (top.type === 'Moon' && moonData) {
        bestAzimuth = moonData.azimuth;
      } else if (top.type === 'Planet' && planets) {
        const p = Object.values(planets).find(x => x.name === top.name);
        if (p) bestAzimuth = p.azimuth;
      } else if (top.type === ('Constellation' as any)) {
        const c = visibleConstellations.find(vc => vc.name === top.name);
        if (c) bestAzimuth = c.azimuth;
      } else if (top.type === 'ISS' || top.type === 'Satellite') {
        // If it's a pass, direction is usually defined by moving trajectory.
        bestDirection = 'Overhead';
      }

      if (bestAzimuth !== null) {
        bestDirection = SkyDirectionEngine.getDirectionFromAzimuth(bestAzimuth);
      }
    }

    const observationQuality = weather ? weather.observationQuality : plan ? plan.overallQuality : 'Unknown';

    return {
      latitude,
      longitude,
      visibleMoon,
      moonAltitude,
      visiblePlanets,
      visibleConstellations: constellations,
      visibleSatellites,
      upcomingPasses: upcomingCount,
      issVisible,
      bestTarget,
      bestDirection,
      observationQuality
    };
  }
}

export const OverheadObjectEngine = new OverheadObjectEngineClass();
