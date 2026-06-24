import { Cartesian3, Color, Entity } from 'cesium';
import { BaseLayer } from '../../globe/layers/BaseLayer';
import { usePlanetStore } from '../store/usePlanetStore';
import { GlobeService } from '../../globe/services/GlobeService';

export class PlanetGroundLayer extends BaseLayer {
  private unsubscribe: (() => void) | null = null;
  private planetEntities: Map<string, Entity> = new Map();

  constructor() {
    super('planet-ground-layer', 'Planet Ground Positions');
  }

  public initialize(): void {
    this.unsubscribe = usePlanetStore.subscribe((state, prevState) => {
      if (state.lastUpdated !== prevState.lastUpdated) {
        if (this.isVisible) {
          this.updatePlanetMarkers(state.planets);
        }
      }
    });
  }

  protected onShow(): void {
    const state = usePlanetStore.getState();
    this.updatePlanetMarkers(state.planets);
  }

  protected onHide(): void {
    const viewer = GlobeService.getViewer();
    if (viewer) {
      this.planetEntities.forEach(entity => viewer.entities.remove(entity));
      this.planetEntities.clear();
    }
  }

  protected onUpdate(time?: any): void {
    // State-driven
  }

  private updatePlanetMarkers(planets: Record<string, any>) {
    const viewer = GlobeService.getViewer();
    if (!viewer) return;

    // Remove old
    this.planetEntities.forEach(entity => viewer.entities.remove(entity));
    this.planetEntities.clear();

    const planetColors: Record<string, Color> = {
      mercury: Color.GRAY,
      venus: Color.LIGHTGOLDENRODYELLOW,
      mars: Color.ORANGERED,
      jupiter: Color.ORANGE,
      saturn: Color.PALEGOLDENROD
    };

    Object.values(planets).forEach(planet => {
      const lat = planet.subPlanetLatitude;
      const lon = planet.subPlanetLongitude;
      if (lat === undefined || lon === undefined) return;

      const entity = viewer.entities.add({
        id: `planet-ground-${planet.id}`,
        position: Cartesian3.fromDegrees(lon, lat, 0),
        point: {
          pixelSize: 10,
          color: planetColors[planet.id] || Color.WHITE,
          outlineColor: Color.WHITE,
          outlineWidth: 1,
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        },
        label: {
          text: planet.name.toUpperCase(),
          font: '10pt sans-serif',
          fillColor: planetColors[planet.id] || Color.WHITE,
          outlineColor: Color.BLACK,
          outlineWidth: 2,
          pixelOffset: new Cartesian3(0, -15, 0),
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        },
        description: `
          <div style="font-family: sans-serif;">
            <h4>${planet.name} Ground Position</h4>
            <p>Lat: ${lat.toFixed(4)}</p>
            <p>Lon: ${lon.toFixed(4)}</p>
          </div>
        `
      });

      this.planetEntities.set(planet.id, entity);
    });
  }

  public destroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.onHide();
  }
}
