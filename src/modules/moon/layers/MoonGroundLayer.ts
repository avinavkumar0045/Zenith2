import { Cartesian3, Color, Entity } from 'cesium';
import { BaseLayer } from '../../globe/layers/BaseLayer';
import { useMoonPositionStore } from '../store/useMoonPositionStore';
import { GlobeService } from '../../globe/services/GlobeService';

export class MoonGroundLayer extends BaseLayer {
  private unsubscribe: (() => void) | null = null;
  private moonEntity: Entity | null = null;

  constructor() {
    super('moon-ground-layer', 'Moon Ground Position');
  }

  public initialize(): void {
    this.unsubscribe = useMoonPositionStore.subscribe((state, prevState) => {
      if (
        state.subLunarLatitude !== prevState.subLunarLatitude ||
        state.subLunarLongitude !== prevState.subLunarLongitude ||
        state.isVisibleFromLocation !== prevState.isVisibleFromLocation
      ) {
        if (this.isVisible) {
          this.updateMoonMarker(state.subLunarLatitude, state.subLunarLongitude, state.regionName, state.isVisibleFromLocation);
        }
      }
    });
  }

  protected onShow(): void {
    const state = useMoonPositionStore.getState();
    this.updateMoonMarker(state.subLunarLatitude, state.subLunarLongitude, state.regionName, state.isVisibleFromLocation);
  }

  protected onHide(): void {
    const viewer = GlobeService.getViewer();
    if (this.moonEntity && viewer) {
      viewer.entities.remove(this.moonEntity);
      this.moonEntity = null;
    }
  }

  protected onUpdate(time?: any): void {
    // No continuous updates needed, state-driven via Zustand
  }

  private updateMoonMarker(lat: number | null, lon: number | null, regionName: string | null, isVisible: boolean) {
    const viewer = GlobeService.getViewer();
    if (!viewer) return;

    if (this.moonEntity) {
      viewer.entities.remove(this.moonEntity);
      this.moonEntity = null;
    }

    if (lat === null || lon === null) return;

    this.moonEntity = viewer.entities.add({
      id: 'moon-ground-position',
      position: Cartesian3.fromDegrees(lon, lat, 0),
      point: {
        pixelSize: 15,
        color: Color.WHITE,
        outlineColor: Color.LIGHTGRAY,
        outlineWidth: 2,
        disableDepthTestDistance: Number.POSITIVE_INFINITY
      },
      label: {
        text: 'MOON OVERHEAD',
        font: '12pt sans-serif',
        fillColor: Color.WHITE,
        outlineColor: Color.BLACK,
        outlineWidth: 2,
        pixelOffset: new Cartesian3(0, -20, 0),
        disableDepthTestDistance: Number.POSITIVE_INFINITY
      },
      description: `
        <div style="font-family: sans-serif;">
          <h4>Moon Ground Position</h4>
          <p>Lat: ${lat.toFixed(4)}</p>
          <p>Lon: ${lon.toFixed(4)}</p>
          <p>Region: ${regionName || 'Calculating...'}</p>
        </div>
      `
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
