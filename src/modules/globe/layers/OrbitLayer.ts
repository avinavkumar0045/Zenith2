import { BaseLayer } from './BaseLayer';
import { GlobeService } from '../services/GlobeService';
import { useOrbitStore } from '../../orbits/store/useOrbitStore';
import { OrbitVisualizationService } from '../../orbits/services/OrbitVisualizationService';
import { OrbitTheme } from '../../orbits/utils/OrbitTheme';
import { OrbitIntelligenceObject, OrbitPoint } from '../../orbits/types/orbit.types';
import * as Cesium from 'cesium';

export class OrbitLayer extends BaseLayer {
  private dataSource: Cesium.CustomDataSource;
  private unsubscribeStore: (() => void) | null = null;

  constructor() {
    super('orbit-layer', 'Orbits');
    this.dataSource = new Cesium.CustomDataSource(this.name);
  }

  public initialize(): void {
    const viewer = GlobeService.getViewer();
    viewer.dataSources.add(this.dataSource);

    // Startup the orchestrator
    OrbitVisualizationService.initialize();

    // Subscribe to orbit state changes
    this.unsubscribeStore = useOrbitStore.subscribe((state) => {
      if (!this.isVisible) return;
      this.renderOrbits(state);
    });
  }

  private renderOrbits(state: any) {
    this.dataSource.entities.removeAll();
    const orbit: OrbitIntelligenceObject | null = state.activeOrbit;

    if (!orbit) return;

    const baseColorHex = OrbitTheme.getColorForCategory(orbit.category);
    const color = Cesium.Color.fromCssColorString(baseColorHex);

    // Render Past Orbit
    if (state.showPastOrbit && orbit.pastOrbitPoints.length > 0) {
      const positions = this.toCartesianArray(orbit.pastOrbitPoints);
      this.dataSource.entities.add({
        id: `orbit_past_${orbit.satelliteId}`,
        polyline: {
          positions,
          width: 2,
          material: new Cesium.PolylineDashMaterialProperty({
            color: color.withAlpha(0.3),
            dashLength: 16.0,
          }),
        }
      });
    }

    // Render Future Orbit
    if (state.showFutureOrbit && orbit.futureOrbitPoints.length > 0) {
      const positions = this.toCartesianArray(orbit.futureOrbitPoints);
      this.dataSource.entities.add({
        id: `orbit_future_${orbit.satelliteId}`,
        polyline: {
          positions,
          width: 5,
          material: new Cesium.PolylineGlowMaterialProperty({
            glowPower: 0.2,
            taperPower: 1,
            color: color.withAlpha(0.9),
          }),
        }
      });
    }

    // Render Ground Track
    if (state.showGroundTrack && orbit.groundTrackPoints.length > 0) {
      const positions = this.toCartesianArray(orbit.groundTrackPoints);
      this.dataSource.entities.add({
        id: `orbit_ground_${orbit.satelliteId}`,
        polyline: {
          positions,
          width: 2,
          clampToGround: true,
          material: color.withAlpha(0.5),
        }
      });
    }
  }

  private toCartesianArray(points: OrbitPoint[]): Cesium.Cartesian3[] {
    return points.map(p => Cesium.Cartesian3.fromDegrees(p.longitude, p.latitude, p.altitude));
  }

  protected onShow(): void {
    this.dataSource.show = true;
    this.renderOrbits(useOrbitStore.getState());
  }

  protected onHide(): void {
    this.dataSource.show = false;
  }

  protected onUpdate(time?: any): void {}

  public destroy(): void {
    if (this.unsubscribeStore) this.unsubscribeStore();
    OrbitVisualizationService.destroy();
    
    const viewer = GlobeService.getViewer();
    viewer.dataSources.remove(this.dataSource, true);
  }
}
