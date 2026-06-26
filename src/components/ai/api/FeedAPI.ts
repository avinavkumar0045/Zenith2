import { useSessionMemoryStore, ObservationSession } from '../memory/SessionMemory';

export class FeedAPI {
  public static getActiveSession(): ObservationSession | null {
    return useSessionMemoryStore.getState().activeSession;
  }

  public static getPinnedEvents(): any[] {
    return useSessionMemoryStore.getState().pinnedEvents;
  }

  public static startSession(targetId: string, targetName: string) {
    useSessionMemoryStore.getState().startSession(targetId, targetName);
  }

  public static stopSession() {
    useSessionMemoryStore.getState().stopSession();
  }

  public static addSessionNote(note: string) {
    useSessionMemoryStore.getState().addNoteToSession(note);
  }

  public static pinEvent(event: any) {
    useSessionMemoryStore.getState().pinEvent(event);
  }

  public static getRecentActions(): string[] {
    return useSessionMemoryStore.getState().recentActions;
  }
}
