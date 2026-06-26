import { useTimeStore } from '../types';

export class PlaybackEngine {
  private static timerId: any = null;

  /**
   * Starts the temporal progression loop.
   */
  public static startPlayback() {
    if (this.timerId) return;

    useTimeStore.getState().setPlaying(true);

    const tickMs = 200; // Tick interval
    this.timerId = setInterval(() => {
      const { selectedTime, playbackSpeed, isPlaying } = useTimeStore.getState();

      if (!isPlaying) {
        this.stopPlayback();
        return;
      }

      // Progress selectedTime: (playbackSpeed * tickMs) / 1000 seconds
      const secondsToAdd = (playbackSpeed * tickMs) / 1000;
      const nextTime = new Date(selectedTime.getTime() + secondsToAdd * 1000);

      // Update global simulated time context
      useTimeStore.getState().setSelectedTime(nextTime);
    }, tickMs);
  }

  /**
   * Stops the temporal progression loop.
   */
  public static stopPlayback() {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
    useTimeStore.getState().setPlaying(false);
  }

  /**
   * Increments simulated time by 15 minutes.
   */
  public static stepForward() {
    const { selectedTime } = useTimeStore.getState();
    const stepMs = 15 * 60000;
    useTimeStore.getState().setSelectedTime(new Date(selectedTime.getTime() + stepMs));
  }

  /**
   * Decrements simulated time by 15 minutes.
   */
  public static stepBackward() {
    const { selectedTime } = useTimeStore.getState();
    const stepMs = 15 * 60000;
    useTimeStore.getState().setSelectedTime(new Date(selectedTime.getTime() - stepMs));
  }
}
