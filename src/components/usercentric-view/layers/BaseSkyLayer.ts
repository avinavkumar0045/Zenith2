import * as Cesium from 'cesium';
import { ObserverLocation } from '../UserCentricView.types';

export abstract class BaseSkyLayer {
  public name: string;
  public isVisible = true;
  protected viewer: Cesium.Viewer | null = null;
  protected observerPosition: Cesium.Cartesian3 | null = null;

  constructor(name: string) {
    this.name = name;
  }

  public initialize(viewer: Cesium.Viewer, observerPosition: Cesium.Cartesian3): void {
    this.viewer = viewer;
    this.observerPosition = observerPosition;
    this.onInitialize();
  }

  public update(date: Date, observerLocation: ObserverLocation, observerPosition: Cesium.Cartesian3): void {
    if (!this.isVisible || !this.viewer) return;
    this.onUpdate(date, observerLocation, observerPosition);
  }

  public show(): void {
    this.isVisible = true;
    if (this.viewer) {
      this.onShow();
    }
  }

  public hide(): void {
    this.isVisible = false;
    if (this.viewer) {
      this.onHide();
    }
  }

  public destroy(): void {
    this.onHide();
    this.onDestroy();
    this.viewer = null;
    this.observerPosition = null;
  }

  protected abstract onInitialize(): void;
  protected abstract onUpdate(date: Date, observerLocation: ObserverLocation, observerPosition: Cesium.Cartesian3): void;
  protected abstract onShow(): void;
  protected abstract onHide(): void;
  protected abstract onDestroy(): void;
}
