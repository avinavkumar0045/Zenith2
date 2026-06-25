import { BaseLayer } from './BaseLayer';
import { GlobeService } from '../services/GlobeService';
import { CameraService } from '../services/CameraService';
import { MarkerService } from '../services/MarkerService';
import { eventBus } from '../../location/utils/EventBus';
import { LocationIntelligenceObject } from '../../location/types/location.types';
import * as Cesium from 'cesium';

export class LocationLayer extends BaseLayer {
  private dataSource: Cesium.CustomDataSource;
  private currentMarkerId: string | null = null;
  private unsubscribe: (() => void) | null = null;

  constructor() {
    super('location-layer', 'Locations');
    this.dataSource = new Cesium.CustomDataSource(this.name);
  }

  public initialize(): void {
    const viewer = GlobeService.getViewer();
    viewer.dataSources.add(this.dataSource);

    // Listen to location changes
    const handler = (location: LocationIntelligenceObject | null) => {
      this.dataSource.entities.removeAll();
      this.currentMarkerId = null;

      if (location) {
        const markerOptions = {
          id: `loc_${location.id}`,
          name: location.name,
          latitude: location.latitude,
          longitude: location.longitude,
          color: '#22d3ee', // Signature Neon Cyan
          size: 8
        };

        const entityOptions = MarkerService.createGenericMarker(markerOptions);
        if (entityOptions.point) {
          entityOptions.point.outlineColor = Cesium.Color.fromCssColorString('rgba(34, 211, 238, 0.35)') as any;
          entityOptions.point.outlineWidth = 5 as any;
        }
        this.dataSource.entities.add(entityOptions);
        this.currentMarkerId = markerOptions.id;
        
        CameraService.focusLocation(location.longitude, location.latitude, 5000000.0);
      }
    };

    eventBus.on('locationChanged', handler);
    this.unsubscribe = () => eventBus.off('locationChanged', handler);
  }

  protected onShow(): void {
    this.dataSource.show = true;
  }

  protected onHide(): void {
    this.dataSource.show = false;
  }

  protected onUpdate(time?: any): void {
    if (this.currentMarkerId) {
      const entity = this.dataSource.entities.getById(this.currentMarkerId);
      if (entity && entity.point) {
        const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
          entity.point.outlineWidth = 4 as any;
          entity.point.pixelSize = 8 as any;
        } else {
          // Solid 8px core, oscillate outline (pulsing halo/ripple) between 3px and 11px
          const osc = Math.sin(Date.now() * 0.004) * 4 + 7;
          entity.point.outlineWidth = osc as any;
          entity.point.pixelSize = 8 as any;
        }
      }
    }
  }

  public destroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    const viewer = GlobeService.getViewer();
    viewer.dataSources.remove(this.dataSource, true);
  }
}
