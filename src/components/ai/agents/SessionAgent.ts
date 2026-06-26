import { Task, AIContext, AgentResult } from '../ZenithAI.types';
import { FeedAPI } from '../api/FeedAPI';

export class SessionAgent {
  /**
   * Processes active observation logs, session triggers, and note pins.
   */
  public static async process(task: Task, context: AIContext): Promise<AgentResult> {
    const logs: string[] = [];
    const recommendations: string[] = [];
    let explanation = 'Session logging state coordinated successfully.';
    let confidence = 98;

    const sessionAction = task.actions.find(a => a.type === 'start_session' || a.type === 'feed');
    const activeSession = FeedAPI.getActiveSession();

    if (sessionAction) {
      const payload = sessionAction.payload;
      const act = payload.action;

      if (act === 'start_session') {
        const tname = payload.targetName || 'Global Observatory';
        logs.push(`✓ Action: Initializing observer logging recording for target: ${tname}.`);
        explanation = `Starting active observer session. Tracking target **${tname}**. Recording time logs and coordinates to the telemetry feed.`;
        recommendations.push('Write observer note logs as conditions evolve.');
      } else if (act === 'stop_session') {
        logs.push('✓ Action: Ending current recording session.');
        explanation = `Observation session stopped. Log statistics archived in local memory storage.`;
      } else if (act === 'pin_event') {
        logs.push(`✓ Action: Pinned event log entry.`);
        explanation = `Event pinned to observation logs successfully.`;
      } else if (act === 'add_note') {
        logs.push('✓ Action: Appending custom log note to active session.');
        explanation = `Note note appended to active session logs: "${payload.note}".`;
      }
    } else {
      if (activeSession) {
        explanation = `Observer session is currently **ACTIVE** tracking target **${activeSession.targetName}** (started: ${new Date(activeSession.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}).`;
        recommendations.push('Log local weather note entries or stop the session to archive logs.');
      } else {
        explanation = 'No observation logging session is currently active. System is running in monitoring mode.';
        recommendations.push('Click "Start Session" to open an observer record logs block.');
      }
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
export default SessionAgent;
