import { Task, AIAction } from '../ZenithAI.types';
import { ToolRegistry } from '../registry/ToolRegistry';
import { useSessionMemoryStore } from '../memory/SessionMemory';

export class PlanExecutor {
  /**
   * Executes a list of tasks in order, running their nested workspace actions.
   */
  public static async execute(
    tasks: Task[], 
    onTaskProgress?: (task: Task) => void
  ): Promise<Task[]> {
    const executedTasks: Task[] = [];

    for (const task of tasks) {
      task.status = 'executing';
      if (onTaskProgress) onTaskProgress(task);

      // Simulate a small agentic delay for visual processing feedback
      await new Promise((resolve) => setTimeout(resolve, 300));

      const updatedActions: AIAction[] = [];
      let taskSuccess = true;

      for (const action of task.actions) {
        action.status = 'executing';
        let toolName = '';
        let payload = action.payload;

        // Map AI actions to ToolRegistry targets
        if (action.type === 'apply_preset') {
          toolName = 'visualization';
          payload = { 
            action: 'preset', 
            value: action.payload?.value || action.payload?.preset || 'observation' 
          };
        } else if (action.type === 'focus') {
          toolName = 'focus';
        } else if (action.type === 'set_speed' || action.type === 'step_time') {
          toolName = 'timeline';
        } else if (action.type === 'open_workspace') {
          toolName = 'explorer';
          payload = { action: 'category', value: 'all' };
        } else if (action.type === 'start_session') {
          toolName = 'feed';
        } else {
          toolName = action.type;
        }

        const toolResult = ToolRegistry.execute(toolName, payload);
        const isError = toolResult.toLowerCase().includes('error') || toolResult.toLowerCase().includes('failed');

        action.status = isError ? 'failed' : 'completed';
        action.result = toolResult;
        updatedActions.push(action);

        if (isError) {
          taskSuccess = false;
        }

        // Log action result to memory
        useSessionMemoryStore.getState().logAction(`Agent performed action: ${action.label} - ${toolResult}`);
      }

      task.status = taskSuccess ? 'completed' : 'failed';
      task.actions = updatedActions;
      executedTasks.push(task);

      if (onTaskProgress) onTaskProgress(task);
    }

    return executedTasks;
  }
}
export default PlanExecutor;
