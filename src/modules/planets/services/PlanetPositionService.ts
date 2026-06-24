import { useLocationStore } from '../../location/store/useLocationStore';
import { usePlanetStore } from '../store/usePlanetStore';
import { PlanetCalculationService } from './PlanetCalculationService';
import { PlanetObservationService } from './PlanetObservationService';
import { PlanetId, PlanetIntelligenceObject } from '../types/planet.types';
import { eventBus } from '../../location/utils/EventBus';

class PlanetPositionServiceClass {
  private readonly planets: { id: PlanetId, name: string }[] = [
    { id: 'mercury', name: 'Mercury' },
    { id: 'venus', name: 'Venus' },
    { id: 'mars', name: 'Mars' },
    { id: 'jupiter', name: 'Jupiter' },
    { id: 'saturn', name: 'Saturn' }
  ];

  public initialize() {
    eventBus.on('locationChanged', () => {
      this.calculateAll();
    });
    
    // Initial calculate
    this.calculateAll();
  }

  public calculateAll() {
    const { activeLocation } = useLocationStore.getState();
    if (!activeLocation) return;

    usePlanetStore.getState().setLoading(true);
    
    const now = new Date();
    const newPlanets: Record<PlanetId, PlanetIntelligenceObject> = {} as Record<PlanetId, PlanetIntelligenceObject>;

    for (const p of this.planets) {
      const pos = PlanetCalculationService.calculatePosition(p.id, activeLocation, now);
      const times = PlanetCalculationService.getTimes(p.id, activeLocation, now);
      
      const isVisible = pos.altitude > 0;
      const score = PlanetObservationService.calculateScore(p.id, pos.altitude, isVisible);
      
      // Calculate Sub-Planet Point from RA/Dec directly
      const subLat = pos.dec;
      
      // GMST using an approximation similar to what we used
      const d = (now.getTime() / 86400000) - 10957.5;
      const sunM = 356.0470 + 0.9856002585 * d;
      const sunLon = sunM + 282.9404; // Very approximate, but adequate for GMST
      const gmstDeg = (sunLon + 180 + 15 * (now.getUTCHours() + now.getUTCMinutes() / 60.0 + now.getUTCSeconds() / 3600.0)) % 360;
      
      let subLon = pos.ra - gmstDeg;
      if (subLon > 180) subLon -= 360;
      if (subLon < -180) subLon += 360;

      newPlanets[p.id] = {
        id: p.id,
        name: p.name,
        visible: isVisible,
        altitude: pos.altitude,
        azimuth: pos.azimuth,
        riseTime: times.rise,
        setTime: times.set,
        distance: pos.distance,
        observationScore: score,
        isAboveHorizon: isVisible,
        subPlanetLatitude: subLat,
        subPlanetLongitude: subLon,
        lastUpdated: Date.now()
      };
    }

    usePlanetStore.getState().setPlanets(newPlanets);
    usePlanetStore.getState().setLoading(false);
  }

  public destroy() {
    eventBus.off('locationChanged');
  }
}

export const PlanetPositionService = new PlanetPositionServiceClass();
