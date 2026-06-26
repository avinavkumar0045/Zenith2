import { Task, AIContext, AgentResult } from '../ZenithAI.types';
import { TimelineAPI } from '../api/TimelineAPI';

export class TimelineAgent {
  /**
   * Evaluates time controls and maps simulation timeline modifications.
   */
  public static async process(task: Task, context: AIContext): Promise<AgentResult> {
    const logs: string[] = [];
    const recommendations: string[] = [];
    let explanation = 'Timeline state resolved successfully.';
    let confidence = 99;

    const timelineAction = task.actions.find(a => a.type === 'set_speed' || a.type === 'step_time' || a.type === 'step');
    const selectedTime = TimelineAPI.getSelectedTime();

    logs.push(`✓ Active timeline date: ${selectedTime.toLocaleDateString()} at ${selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`);

    if (timelineAction) {
      const payload = timelineAction.payload;
      const act = payload.action;

      if (act === 'play') {
        logs.push('✓ Action: Start timeline time progression.');
        explanation = `Starting simulation clock. Time is advancing at ${TimelineAPI.getPlayback().playbackSpeed}x multiplier.`;
        recommendations.push('Pause the timeline when target transits are in view.');
      } else if (act === 'pause') {
        logs.push('✓ Action: Pausing timeline progression.');
        explanation = 'Paused simulation clock. Orbit and twilight states frozen in place for steady target analysis.';
        recommendations.push('Click step forward to advance in 15 minute intervals.');
      } else if (act === 'set_speed') {
        const speed = payload.value || 600;
        logs.push(`✓ Action: Adjusting simulation speed to ${speed}x.`);
        explanation = `Simulation playback rate adjusted to **${speed}x** real-time speed.`;
        recommendations.push('Increase speed rate to 3600x (1 hour/sec) for quick orbital revolutions.');
      } else if (act === 'reset') {
        logs.push('✓ Action: Restoring clock state to local system time.');
        explanation = 'Timeline reset. Global time context synchronized with current local clock.';
      } else {
        logs.push(`✓ Action: Chronological step parameters modified.`);
        explanation = 'Advanced simulation clock forward. Subsystems recalculating orbital coordinate projections.';
      }
    } else {
      explanation = `Timeline is synchronized to **${selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}**. Playback: **${context.timeline.isPlaying ? 'Active' : 'Paused'}** (${context.timeline.playbackSpeed}x speed).`;
      recommendations.push('Adjust timeline playback rate to preview satellite pass trajectories.');
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
export default TimelineAgent;
