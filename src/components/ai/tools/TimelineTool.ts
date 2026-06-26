import { TimelineAPI } from '../api/TimelineAPI';

export class TimelineTool {
  public static execute(payload: { action: 'play' | 'pause' | 'set_speed' | 'step' | 'reset' | 'set_time'; value?: any }): string {
    switch (payload.action) {
      case 'play':
        TimelineAPI.setPlaying(true);
        return `Simulation playback started.`;
      case 'pause':
        TimelineAPI.setPlaying(false);
        return `Simulation playback paused.`;
      case 'set_speed':
        const speed = Number(payload.value || 600);
        TimelineAPI.setPlaybackSpeed(speed);
        return `Simulation speed multiplier set to ${speed}x.`;
      case 'reset':
        TimelineAPI.resetToNow();
        TimelineAPI.setPlaying(false);
        return `Timeline synchronized to current local time.`;
      case 'set_time':
        const date = new Date(payload.value);
        if (!isNaN(date.getTime())) {
          TimelineAPI.setSelectedTime(date);
          return `Timeline scrubbed to ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}.`;
        }
        return `Failed to parse target time parameter.`;
      case 'step':
        const currentMs = TimelineAPI.getSelectedTime().getTime();
        const stepMin = Number(payload.value || 15);
        const nextTime = new Date(currentMs + stepMin * 60000);
        TimelineAPI.setSelectedTime(nextTime);
        return `Stepped timeline forward by ${stepMin} minutes.`;
      default:
        return `Timeline command unhandled.`;
    }
  }
}
export default TimelineTool;
