import { BaseLayer } from './BaseLayer';
import { GlobeService } from '../services/GlobeService';

export class DayNightLayer extends BaseLayer {
  constructor() {
    super('day-night-layer', 'Day/Night Atmospheric Layer');
  }

  public initialize(): void {
    // Initialization logic if any specific primitives need to be created.
    // For now, we rely on Cesium's built-in globe lighting.
  }

  protected onShow(): void {
    GlobeService.enableLighting(true);
  }

  protected onHide(): void {
    GlobeService.enableLighting(false);
  }

  protected onUpdate(time?: any): void {
    // The sun's position is automatically updated by Cesium based on simulation time.
  }

  public destroy(): void {
    this.hide();
  }
}
