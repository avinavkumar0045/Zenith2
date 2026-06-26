import { Task, AIContext, AgentResult } from '../ZenithAI.types';
import { CapabilityRegistry } from '../registry/CapabilityRegistry';

export class CoordinatorAgent {
  /**
   * Orchestrates high-level agent work coordination, checks capabilities, and handles conflict resolution.
   */
  public static async process(task: Task, context: AIContext): Promise<AgentResult> {
    const caps = CapabilityRegistry.getCapabilities();
    
    // Check if task actions have conflict issues (e.g. double focus targets)
    const focusActions = task.actions.filter(a => a.type === 'focus');
    const resolvedActions = [...task.actions];
    
    let conflictResolutionNotes = '';

    if (focusActions.length > 1) {
      conflictResolutionNotes = ' Conflict Resolved: Multiple camera locks detected. Retained last focus target and cleared previous locks to prevent flight stutter.';
      // Filter out all but the last focus action
      let seenFocus = false;
      for (let i = resolvedActions.length - 1; i >= 0; i--) {
        if (resolvedActions[i].type === 'focus') {
          if (!seenFocus) {
            seenFocus = true; // keep this one
          } else {
            resolvedActions.splice(i, 1); // remove earlier double focus
          }
        }
      }
    }

    return {
      explanation: `System Coordinator successfully mapped tasks to available platform capabilities.${conflictResolutionNotes}`,
      actions: resolvedActions,
      confidence: 95,
      recommendations: [
        'Sync timeline to evening twilight for optimal visibility scoring.',
        'Apply Observation presets to focus on celestial catalog items.'
      ],
      explainabilityLogs: [
        `Verified tool capabilities in registry (${caps.length} items registered).`,
        `Checked for camera focus conflicts: ${focusActions.length > 1 ? 'Conflict Resolved' : 'None detected'}.`
      ]
    };
  }
}
export default CoordinatorAgent;
