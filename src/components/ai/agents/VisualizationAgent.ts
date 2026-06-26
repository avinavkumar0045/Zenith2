import { Task, AIContext, AgentResult } from '../ZenithAI.types';
import { VisualizationAPI } from '../api/VisualizationAPI';

export class VisualizationAgent {
  /**
   * Processes layer configurations and adjusts preset profiles or opacities.
   */
  public static async process(task: Task, context: AIContext): Promise<AgentResult> {
    const logs: string[] = [];
    const recommendations: string[] = [];
    let explanation = 'Visualization settings processed successfully.';
    let confidence = 98;

    const visAction = task.actions.find(a => a.type === 'apply_preset' || a.type === 'visualization');
    const layers = VisualizationAPI.getLayersState();

    logs.push(`✓ Active rendering preset: "${layers.activeProfile.toUpperCase()}".`);

    if (visAction) {
      const payload = visAction.payload;
      const act = payload.action;

      if (act === 'preset') {
        const val = payload.value;
        logs.push(`✓ Action: Switch profile preset to: "${val}".`);
        
        if (val === 'satellite') {
          explanation = 'Switching to **Satellite presetting**. This enables ground tracks, future/past orbit pathways, sensor footprints, and geographic grid lines.';
          recommendations.push('Click "Track ISS" to center view on the space station.');
        } else if (val === 'astrophotography') {
          explanation = 'Switching to **Astrophotography presetting**. This turns off coordinate lines, cities, and labels to offer a clean dark-sky view.';
          recommendations.push('Ensure Day/Night shadows are turned on to simulate dark twilight skies.');
        } else if (val === 'minimal') {
          explanation = 'Switching to **Minimal presetting**. Removes clutter, leaving twilight boundaries and the moon path visible.';
        } else {
          explanation = `Applied visualization preset profile: **${val.toUpperCase()}**.`;
        }
      } else if (act === 'opacity') {
        logs.push(`✓ Action: Set opacity slider on "${payload.key}" to ${payload.value}%.`);
        explanation = `Layer **${payload.key}** opacity adjusted to **${payload.value}%** for optimal visual contrast.`;
      } else {
        logs.push(`✓ Action: Toggled rendering layer visibility.`);
        explanation = 'Layer visibility updated in rendering engine pipeline.';
      }
    } else {
      explanation = `Earth rendering engine is configured with preset **${layers.activeProfile.toUpperCase()}**. Atmosphere: **${layers.showAtmosphere ? 'ON' : 'OFF'}**, Clouds: **${layers.showClouds ? 'ON' : 'OFF'}**, Grid: **${layers.showGrid ? 'ON' : 'OFF'}**.`;
      recommendations.push('Tweak opacity sliders in the Layers drawer to refine visual representation.');
    }

    return {
      explanation,
      actions: task.actions,
      confidence,
      recommendations,
      explainabilityLogs: logs
    };
  }
}
export default VisualizationAgent;
