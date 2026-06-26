import { useVisualizationStore, ImmutableVisualizationState } from '../Visualization.types';
import { LayerResolver } from './LayerResolver';
import { RenderingEngine } from './RenderingEngine';
import { CameraEngine } from './CameraEngine';

export class VisualizationEngine {
  private static unsubscribe: (() => void) | null = null;
  private static lastResolvedState: ImmutableVisualizationState | null = null;

  /**
   * Starts the subscription to the Visualization store.
   * Resolves layers on changes, executes diff checks, and synchronizes Cesium in-place.
   */
  public static startSubscription() {
    if (this.unsubscribe) return;

    // Apply initial configuration on boot
    const initialState = useVisualizationStore.getState();
    const resolvedInitial = LayerResolver.resolveLayers(initialState);
    RenderingEngine.applyState(resolvedInitial);
    CameraEngine.setCameraMode(resolvedInitial.cameraMode, resolvedInitial.selectedTrackEntityId);
    this.lastResolvedState = resolvedInitial;

    this.unsubscribe = useVisualizationStore.subscribe((state) => {
      const resolved = LayerResolver.resolveLayers(state);
      
      if (this.hasChanges(resolved, this.lastResolvedState)) {
        RenderingEngine.applyState(resolved, this.lastResolvedState || undefined);
        
        if (!this.lastResolvedState || 
            this.lastResolvedState.cameraMode !== resolved.cameraMode ||
            this.lastResolvedState.selectedTrackEntityId !== resolved.selectedTrackEntityId) {
          CameraEngine.setCameraMode(resolved.cameraMode, resolved.selectedTrackEntityId);
        }

        this.lastResolvedState = resolved;
      }
    });
  }

  /**
   * Destroys the store subscription.
   */
  public static stopSubscription() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.lastResolvedState = null;
  }

  private static hasChanges(a: ImmutableVisualizationState, b: ImmutableVisualizationState | null): boolean {
    if (!b) return true;
    
    const keys = Object.keys(a) as (keyof ImmutableVisualizationState)[];
    for (const key of keys) {
      if (a[key] !== b[key]) {
        return true;
      }
    }
    return false;
  }
}
export default VisualizationEngine;
