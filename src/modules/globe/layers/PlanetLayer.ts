import { BaseLayer } from './BaseLayer';
import { GlobeService } from '../services/GlobeService';
import * as Cesium from 'cesium';

export class PlanetLayer extends BaseLayer {
  private dataSource: Cesium.CustomDataSource;

  constructor() {
    super('planet-layer', 'Planets');
    this.dataSource = new Cesium.CustomDataSource(this.name);
  }

  public initialize(): void {
    const viewer = GlobeService.getViewer();
    viewer.dataSources.add(this.dataSource);
  }

  protected onShow(): void {
    this.dataSource.show = true;
  }

  protected onHide(): void {
    this.dataSource.show = false;
  }

  protected onUpdate(time?: any): void {}

  public destroy(): void {
    const viewer = GlobeService.getViewer();
    viewer.dataSources.remove(this.dataSource, true);
  }
}
