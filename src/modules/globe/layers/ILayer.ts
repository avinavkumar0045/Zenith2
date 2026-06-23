export interface ILayer {
  id: string;
  name: string;
  isVisible: boolean;

  /**
   * Called when the layer is added to the LayerManager.
   * This is where the layer should set up its Cesium primitives, entities, or data sources.
   */
  initialize(): void;

  /**
   * Shows the layer's visual elements on the globe.
   */
  show(): void;

  /**
   * Hides the layer's visual elements from the globe.
   */
  hide(): void;

  /**
   * Called every frame or on a specific tick to update dynamic layer data.
   * @param time The current simulation time or delta.
   */
  update(time?: any): void;

  /**
   * Cleans up all resources associated with the layer when it is removed.
   */
  destroy(): void;
}
