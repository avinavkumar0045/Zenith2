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
  private currentHaloId: string | null = null;
  private currentRadius: number = 100000.0;
  private currentAlpha: number = 0.1;
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
      this.currentHaloId = null;

      if (location) {
        const markerOptions = {
          id: `loc_${location.id}`,
          name: location.name,
          latitude: location.latitude,
          longitude: location.longitude,
          color: '#22d3ee', // Signature Neon Cyan
          size: 6
        };

        const entityOptions = MarkerService.createGenericMarker(markerOptions);
        if (entityOptions.point) {
          entityOptions.point.outlineColor = Cesium.Color.fromCssColorString('rgba(34, 211, 238, 0.4)') as any;
          entityOptions.point.outlineWidth = 4 as any;
          entityOptions.point.color = Cesium.Color.WHITE as any; // White core
          entityOptions.point.pixelSize = 6 as any; // small sharp core
        }
        
        const pointEntity = this.dataSource.entities.add(entityOptions);
        this.currentMarkerId = pointEntity.id;

        // Branded Zenith Surface Halo Ring (concentric ripple)
        const haloEntity = this.dataSource.entities.add({
          id: `loc_halo_${location.id}`,
          position: Cesium.Cartesian3.fromDegrees(location.longitude, location.latitude),
          ellipse: {
            semiMajorAxis: new Cesium.CallbackProperty(() => {
              return this.currentRadius;
            }, false),
            semiMinorAxis: new Cesium.CallbackProperty(() => {
              // Ensure minor axis is strictly less than major axis to avoid Cesium DeveloperErrors
              return Math.max(0.1, this.currentRadius - 1.0);
            }, false),
            material: new Cesium.ColorMaterialProperty(new Cesium.CallbackProperty(() => {
              return Cesium.Color.fromCssColorString(`rgba(34, 211, 238, ${this.currentAlpha})`);
            }, false)),
            outline: true,
            outlineColor: new Cesium.CallbackProperty(() => {
              // Scale outline alpha matching the fill alpha
              const outlineAlpha = Math.min(1.0, this.currentAlpha * 5.0);
              return Cesium.Color.fromCssColorString(`rgba(34, 211, 238, ${outlineAlpha})`);
            }, false),
            outlineWidth: 2,
            height: 0
          }
        });
        this.currentHaloId = haloEntity.id;
        
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
    const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    // 1. Update dynamic metrics cached for CallbackProperties
    if (prefersReducedMotion) {
      this.currentRadius = 100000.0;
      this.currentAlpha = 0.1;
    } else {
      const phase = Math.sin(Date.now() * 0.003);
      this.currentRadius = 100000.0 + phase * 35000.0;
      this.currentAlpha = 0.1 - phase * 0.04;
    }

    // 2. Update core marker sizing/glow outline
    if (this.currentMarkerId) {
      const entity = this.dataSource.entities.getById(this.currentMarkerId);
      if (entity && entity.point) {
        if (prefersReducedMotion) {
          entity.point.outlineWidth = 3 as any;
          entity.point.pixelSize = 6 as any;
        } else {
          const osc = Math.sin(Date.now() * 0.005) * 3 + 6;
          entity.point.outlineWidth = osc as any;
          entity.point.pixelSize = 6 as any;
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
