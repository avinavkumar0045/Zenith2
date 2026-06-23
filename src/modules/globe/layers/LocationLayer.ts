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
          color: '#3b82f6', // Zenith Accent Blue
          size: 12
        };

        const entityOptions = MarkerService.createGenericMarker(markerOptions);
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

  protected onUpdate(time?: any): void {}

  public destroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
    const viewer = GlobeService.getViewer();
    viewer.dataSources.remove(this.dataSource, true);
  }
}
