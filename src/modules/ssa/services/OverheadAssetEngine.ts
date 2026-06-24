import { useMoonStore } from '../../moon/store/useMoonStore';
import { usePlanetStore } from '../../planets/store/usePlanetStore';
import { useConstellationStore } from '../../constellations/store/useConstellationStore';
import { useSatelliteStore } from '../../satellites/store/useSatelliteStore';
import { usePassStore } from '../../pass-predictions/store/usePassStore';

export class OverheadAssetEngineClass {
  
  public getRankedAssets(): string[] {
    const assets: { name: string; score: number }[] = [];

    const { moonData } = useMoonStore.getState();
    const { planets } = usePlanetStore.getState();
    const { visibleConstellations } = useConstellationStore.getState();
    const { upcomingPasses } = usePassStore.getState();

    // 1. Moon
    if (moonData?.isVisible) {
      assets.push({ name: 'Moon', score: moonData.observationScore + 2 }); // Moon priority bonus
    }

    // 2. Planets
    if (planets) {
      Object.values(planets).forEach(p => {
        if (p.isAboveHorizon) {
          assets.push({ name: p.name, score: p.observationScore + 1 });
        }
      });
    }

    // 3. Constellations
    if (visibleConstellations) {
      visibleConstellations.forEach(c => {
        assets.push({ name: c.name, score: c.visibilityScore });
      });
    }

    // 4. Satellites / ISS
    if (upcomingPasses) {
      const now = Date.now();
      upcomingPasses.forEach(p => {
        const isCurrentlyVisible = new Date(p.startTime).getTime() < now && new Date(p.endTime).getTime() > now;
        if (isCurrentlyVisible && p.maxElevation > 40) {
          const isISS = p.satelliteId === '25544';
          assets.push({
            name: isISS ? 'ISS' : `Satellite ${p.satelliteId}`,
            score: isISS ? 10 : 7
          });
        }
      });
    }

    // Sort by score descending
    assets.sort((a, b) => b.score - a.score);

    // Return just the names
    return assets.map(a => a.name);
  }
}

export const OverheadAssetEngine = new OverheadAssetEngineClass();
