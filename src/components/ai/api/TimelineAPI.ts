import { useTimeStore } from '@/components/workspaces/time-intelligence/types';

export class TimelineAPI {
  public static getCurrentTime(): Date {
    return useTimeStore.getState().currentTime;
  }

  public static getSelectedTime(): Date {
    return useTimeStore.getState().selectedTime;
  }

  public static setSelectedTime(time: Date) {
    useTimeStore.getState().setSelectedTime(time);
  }

  public static setPlaying(playing: boolean) {
    useTimeStore.getState().setPlaying(playing);
  }

  public static setPlaybackSpeed(speed: number) {
    useTimeStore.getState().setPlaybackSpeed(speed);
  }

  public static resetToNow() {
    useTimeStore.getState().resetToNow();
  }

  public static getPlayback() {
    const state = useTimeStore.getState();
    return {
      isPlaying: state.isPlaying,
      playbackSpeed: state.playbackSpeed
    };
  }
}
