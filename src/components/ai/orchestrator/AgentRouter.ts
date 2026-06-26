import { Task, AIContext, AgentResult } from '../ZenithAI.types';
import { ObservationAgent } from '../agents/ObservationAgent';
import { ExplorerAgent } from '../agents/ExplorerAgent';
import { TimelineAgent } from '../agents/TimelineAgent';
import { VisualizationAgent } from '../agents/VisualizationAgent';
import { SessionAgent } from '../agents/SessionAgent';
import { KnowledgeAgent } from '../agents/KnowledgeAgent';
import { CoordinatorAgent } from '../agents/CoordinatorAgent';

export class AgentRouter {
  /**
   * Delegates a task to the correct agent and returns its AgentResult outcome.
   */
  public static async route(task: Task, context: AIContext): Promise<AgentResult> {
    try {
      switch (task.agentId.toLowerCase()) {
        case 'observation':
          return await ObservationAgent.process(task, context);
        case 'explorer':
          return await ExplorerAgent.process(task, context);
        case 'timeline':
          return await TimelineAgent.process(task, context);
        case 'visualization':
          return await VisualizationAgent.process(task, context);
        case 'session':
          return await SessionAgent.process(task, context);
        case 'knowledge':
          return await KnowledgeAgent.process(task, context);
        case 'coordinator':
          return await CoordinatorAgent.process(task, context);
        default:
          // Fallback to coordinator
          return await CoordinatorAgent.process(task, context);
      }
    } catch (err: any) {
      console.error(`Router error routing to agent ${task.agentId}:`, err);
      return {
        explanation: `Failed routing task to agent "${task.agentId}". ${err?.message || err}`,
        actions: [],
        confidence: 0,
        recommendations: []
      };
    }
  }
}
export default AgentRouter;
