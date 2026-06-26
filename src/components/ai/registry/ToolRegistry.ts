import { FocusTool } from '../tools/FocusTool';
import { TimelineTool } from '../tools/TimelineTool';
import { ExplorerTool } from '../tools/ExplorerTool';
import { VisualizationTool } from '../tools/VisualizationTool';
import { FeedTool } from '../tools/FeedTool';

export class ToolRegistry {
  /**
   * Dispatches command executions to specific workspace tools and returns a string feedback result.
   */
  public static execute(toolName: string, payload: any): string {
    try {
      switch (toolName.toLowerCase()) {
        case 'focus':
          return FocusTool.execute(payload);
        case 'timeline':
          return TimelineTool.execute(payload);
        case 'explorer':
          return ExplorerTool.execute(payload);
        case 'visualization':
          return VisualizationTool.execute(payload);
        case 'feed':
          return FeedTool.execute(payload);
        default:
          return `Error: Tool "${toolName}" not registered.`;
      }
    } catch (err: any) {
      console.error(`Error running tool ${toolName}:`, err);
      return `Error: Failed executing tool "${toolName}": ${err?.message || err}`;
    }
  }
}
export default ToolRegistry;
