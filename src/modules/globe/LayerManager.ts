import { ILayer } from './layers/ILayer';

class LayerManagerClass {
  private layers: Map<string, ILayer> = new Map();

  /**
   * Registers and initializes a layer.
   */
  public addLayer(layer: ILayer) {
    if (this.layers.has(layer.id)) {
      console.warn(`Layer with ID ${layer.id} is already registered.`);
      return;
    }
    
    this.layers.set(layer.id, layer);
    layer.initialize();
  }

  /**
   * Retrieves a layer by its ID.
   */
  public getLayer<T extends ILayer>(id: string): T | undefined {
    return this.layers.get(id) as T;
  }

  /**
   * Removes and destroys a layer.
   */
  public removeLayer(id: string) {
    const layer = this.layers.get(id);
    if (layer) {
      layer.hide();
      layer.destroy();
      this.layers.delete(id);
    }
  }

  /**
   * Updates all active layers. Should be called on Cesium's postUpdate or preUpdate tick.
   */
  public updateAll(time?: any) {
    this.layers.forEach((layer) => {
      if (layer.isVisible) {
        layer.update(time);
      }
    });
  }

  /**
   * Destroys all layers.
   */
  public destroyAll() {
    this.layers.forEach((layer) => {
      layer.hide();
      layer.destroy();
    });
    this.layers.clear();
  }
}

export const LayerManager = new LayerManagerClass();
