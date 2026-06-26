import { Task, AIContext, AgentResult } from '../ZenithAI.types';
import { ExplorerAPI } from '../api/ExplorerAPI';

export class ExplorerAgent {
  /**
   * Evaluates targets inside the explorer catalog and coordinates camera tracking actions.
   */
  public static async process(task: Task, context: AIContext): Promise<AgentResult> {
    const logs: string[] = [];
    const recommendations: string[] = [];
    let explanation = 'Celestial Explorer catalog queried successfully.';
    let confidence = 98;

    // Search for targets in action payload
    const focusAction = task.actions.find(a => a.type === 'focus');
    if (focusAction) {
      const payload = focusAction.payload;
      let target = null;
      
      if (payload.targetId) {
        target = ExplorerAPI.getObjectById(payload.targetId);
      } else if (payload.targetName) {
        target = ExplorerAPI.findByName(payload.targetName);
      }

      if (target) {
        logs.push(`✓ Found target in catalog database: ${target.name} (${target.type}).`);
        logs.push(`✓ Coordinates resolved: Lat ${target.coordinates.latitude.toFixed(4)}, Lon ${target.coordinates.longitude.toFixed(4)}.`);
        logs.push(`✓ Target is currently ${target.visibilityState}. Altitude: ${target.altitude.toFixed(1)}°, bearing direction: ${target.direction}.`);
        
        explanation = `Target **${target.name}** is registered in the Explorer Catalog. It is currently **${target.visibilityState}** at an altitude of **${target.altitude.toFixed(1)}°** in the **${target.direction}** sky. Observation Rating: **${target.observationRating}/10**.`;
        
        if (target.visibilityState.toLowerCase().includes('below') || target.altitude < 0) {
          confidence -= 30;
          logs.push(`⚠️ Visibility check: Target is below the horizon. Visual locks will point through the Earth sphere.`);
          recommendations.push('Fast-forward simulated time until the target rises above the horizon.');
        } else {
          logs.push(`✓ Target visibility is favorable. Visual tracking enabled.`);
          recommendations.push(`Use the camera tracking controls to follow ${target.name}'s flight path.`);
        }

        if (target.type === 'satellites' || target.type === 'stations') {
          recommendations.push('Switch to the Satellite preset profile to display ground tracks and sensor footprint cones.');
        }
      } else {
        logs.push(`⚠️ Target name or ID could not be matched in active catalog stores.`);
        explanation = 'Could not resolve target details in Explorer catalog database. Camera resets to Earth overview.';
        confidence -= 40;
        recommendations.push('Search catalog manually inside the Objects workspace drawer.');
      }
    } else {
      logs.push(`✓ Querying full catalog. Catalog contains ${ExplorerAPI.getObjects().length} registered items.`);
      explanation = `The Celestial Explorer database catalog holds **${ExplorerAPI.getObjects().length}** orbital and stellar coordinates ready for visual targeting.`;
      recommendations.push('Specify a target name (e.g., "ISS", "Jupiter", "Orion Nebula") to focus camera.');
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
export default ExplorerAgent;
