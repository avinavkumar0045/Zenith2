import { FeedAPI } from '../api/FeedAPI';

export class FeedTool {
  public static execute(payload: { action: 'start_session' | 'stop_session' | 'pin_event' | 'add_note'; targetId?: string; targetName?: string; event?: any; note?: string }): string {
    switch (payload.action) {
      case 'start_session':
        const tid = payload.targetId || 'global';
        const tname = payload.targetName || 'Global Observatory';
        FeedAPI.startSession(tid, tname);
        return `Started observation logging session for: ${tname}.`;
      case 'stop_session':
        const currentSession = FeedAPI.getActiveSession();
        if (!currentSession) return `No active observation session is running.`;
        FeedAPI.stopSession();
        return `Stopped observation session for: ${currentSession.targetName}. Saved telemetry to logs.`;
      case 'pin_event':
        if (payload.event) {
          FeedAPI.pinEvent(payload.event);
          return `Pinned event: "${payload.event.label}" to observer logs.`;
        }
        return `Failed to specify event payload to pin.`;
      case 'add_note':
        if (payload.note) {
          FeedAPI.addSessionNote(payload.note);
          return `Added note to active session: "${payload.note}".`;
        }
        return `Failed to specify note text.`;
      default:
        return `Feed command unhandled.`;
    }
  }
}
export default FeedTool;
