import { VisualizationAPI } from '../api/VisualizationAPI';
import { VisualizationProfile } from '../../workspaces/visualization/Visualization.types';

export class VisualizationTool {
  public static execute(payload: { action: 'preset' | 'toggle' | 'opacity'; key?: any; value?: any }): string {
    switch (payload.action) {
      case 'preset':
        const prof = payload.value as VisualizationProfile;
        VisualizationAPI.setProfile(prof);
        return `Applied visualization preset profile: "${prof}".`;
      case 'toggle':
        if (payload.key) {
          VisualizationAPI.toggleLayer(payload.key);
          return `Toggled visualization layer: "${payload.key}".`;
        }
        return `Failed to specify layer key to toggle.`;
      case 'opacity':
        if (payload.key && payload.value !== undefined) {
          const val = Math.min(100, Math.max(0, Number(payload.value)));
          VisualizationAPI.setOpacity(payload.key, val);
          return `Set visualization opacity of "${payload.key}" to ${val}%.`;
        }
        return `Failed to specify layer key or opacity value.`;
      default:
        return `Visualization command unhandled.`;
    }
  }
}
export default VisualizationTool;
