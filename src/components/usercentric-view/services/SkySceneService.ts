import * as Cesium from 'cesium';
import { ObserverLocation } from '../UserCentricView.types';
import { BaseSkyLayer } from '../layers/BaseSkyLayer';
import { StarsLayer } from '../layers/StarsLayer';
import { ConstellationLayer } from '../layers/ConstellationLayer';
import { PlanetLayer } from '../layers/PlanetLayer';
import { MoonLayer } from '../layers/MoonLayer';
import { SatelliteLayer } from '../layers/SatelliteLayer';
import { HorizonLayer } from '../layers/HorizonLayer';
import { AtmosphereLayer } from '../layers/AtmosphereLayer';
import { MilkyWayLayer } from '../layers/MilkyWayLayer';
import { DeepSkyLayer } from '../layers/DeepSkyLayer';
import { GridLayer } from '../layers/GridLayer';

class SkySceneServiceClass {
  private viewer: Cesium.Viewer | null = null;
  private observerPosition: Cesium.Cartesian3 | null = null;
  private layers: Map<string, BaseSkyLayer> = new Map();
  private isInitialized = false;

  public isObserving = false;
  public observedObjectId: string | null = null;
  public selectedObjectId: string | null = null;
  public showAtmosphere = true;

  public initialize(viewer: Cesium.Viewer, observerLocation: ObserverLocation) {
    if (this.isInitialized) return;

    this.viewer = viewer;
    
    // Calculate global ECEF coordinates of the observer
    this.observerPosition = Cesium.Cartesian3.fromDegrees(
      observerLocation.longitude,
      observerLocation.latitude,
      observerLocation.altitude || 10.0
    );

    // Instantiate and register all rendering layers
    this.registerLayer(new AtmosphereLayer());
    this.registerLayer(new MilkyWayLayer());
    this.registerLayer(new GridLayer());
    this.registerLayer(new DeepSkyLayer());
    this.registerLayer(new StarsLayer());
    this.registerLayer(new ConstellationLayer());
    this.registerLayer(new PlanetLayer());
    this.registerLayer(new MoonLayer());
    this.registerLayer(new SatelliteLayer());
    this.registerLayer(new HorizonLayer());

    // Initialize all layers
    this.layers.forEach(layer => {
      layer.initialize(viewer, this.observerPosition!);
      layer.show(); // Default visible
    });

    this.isInitialized = true;
  }

  private registerLayer(layer: BaseSkyLayer) {
    this.layers.set(layer.name, layer);
  }

  /**
   * Drives the update loop of all layers, resolving coordinates for the current date/time.
   */
  public update(date: Date, observerLocation: ObserverLocation) {
    if (!this.isInitialized || !this.viewer) return;

    // Recalculate observer position if location coordinates drift
    const nextPos = Cesium.Cartesian3.fromDegrees(
      observerLocation.longitude,
      observerLocation.latitude,
      observerLocation.altitude || 10.0
    );

    if (this.observerPosition && !Cesium.Cartesian3.equals(this.observerPosition, nextPos)) {
      this.observerPosition = nextPos;
    }

    // Update each active layer
    this.layers.forEach(layer => {
      if (layer.isVisible) {
        layer.update(date, observerLocation, this.observerPosition!);
      }
    });
  }

  /**
   * Exposes a specific layer by name (e.g. to toggle visibility or set options).
   */
  public getLayer<T extends BaseSkyLayer>(name: string): T | undefined {
    return this.layers.get(name) as T | undefined;
  }

  public destroy() {
    this.layers.forEach(layer => {
      layer.destroy();
    });
    this.layers.clear();
    this.viewer = null;
    this.observerPosition = null;
    this.isInitialized = false;
  }
}

export const SkySceneService = new SkySceneServiceClass();
