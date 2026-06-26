import { Task, AIAction } from '../ZenithAI.types';

export class TaskPlanner {
  /**
   * Translates natural language prompts into a structured list of tasks and actions.
   */
  public static plan(prompt: string): Task[] {
    const text = prompt.toLowerCase();
    const tasks: Task[] = [];
    
    // Split prompts containing sequential markers like "then"
    const steps = text.split(/\bthen\b/);
    
    steps.forEach((stepText, idx) => {
      const stepClean = stepText.trim();
      const taskId = `task_${Date.now()}_${idx}`;
      
      // 1. Detect ISS observe/track commands
      if (stepClean.includes('iss') && (stepClean.includes('track') || stepClean.includes('observe') || stepClean.includes('follow') || stepClean.includes('locate'))) {
        tasks.push({
          id: taskId,
          agentId: 'explorer',
          description: 'Locate ISS entity and apply Satellite Tracking profile.',
          status: 'pending',
          actions: [
            {
              id: `${taskId}_act1`,
              label: 'Apply Satellite Preset Profile',
              description: 'Switch visualization profile to Satellite Tracking.',
              type: 'apply_preset',
              payload: { action: 'preset', value: 'satellite' }
            },
            {
              id: `${taskId}_act2`,
              label: 'Track ISS Orbit Entity',
              description: 'Focus camera and lock view onto the ISS.',
              type: 'focus',
              payload: { targetId: 'sat_25544' }
            }
          ]
        });
      }
      // 2. Detect Planet target observe commands (e.g. Saturn, Jupiter, Mars)
      else if ((stepClean.includes('saturn') || stepClean.includes('jupiter') || stepClean.includes('mars') || stepClean.includes('venus') || stepClean.includes('moon')) && 
               (stepClean.includes('focus') || stepClean.includes('observe') || stepClean.includes('track') || stepClean.includes('zoom') || stepClean.includes('locate'))) {
        
        let targetName = 'Saturn';
        if (stepClean.includes('jupiter')) targetName = 'Jupiter';
        if (stepClean.includes('mars')) targetName = 'Mars';
        if (stepClean.includes('venus')) targetName = 'Venus';
        if (stepClean.includes('moon')) targetName = 'Moon';

        tasks.push({
          id: taskId,
          agentId: 'explorer',
          description: `Focus and track ${targetName} coordinates.`,
          status: 'pending',
          actions: [
            {
              id: `${taskId}_act1`,
              label: `Focus ${targetName}`,
              description: `Pan camera directly to ${targetName} sub-point.`,
              type: 'focus',
              payload: { targetName }
            }
          ]
        });
      }
      // 3. Detect Astrophotography presets
      else if (stepClean.includes('astrophotography') || stepClean.includes('astrophoto')) {
        tasks.push({
          id: taskId,
          agentId: 'visualization',
          description: 'Configure layers for optimal dark-sky imaging.',
          status: 'pending',
          actions: [
            {
              id: `${taskId}_act1`,
              label: 'Astrophotography Preset',
              description: 'Apply Astrophotography rendering profile.',
              type: 'apply_preset',
              payload: { action: 'preset', value: 'astrophotography' }
            }
          ]
        });
      }
      // 4. Detect general session planning
      else if (stepClean.includes('plan') || stepClean.includes('schedule') || stepClean.includes('agenda') || stepClean.includes('tonight')) {
        tasks.push({
          id: taskId,
          agentId: 'observation',
          description: 'Compile visible targets stargazing agenda.',
          status: 'pending',
          actions: [
            {
              id: `${taskId}_act1`,
              label: 'Sync Planning Dock',
              description: 'Bring up the Time Intelligence panel.',
              type: 'open_workspace',
              payload: { workspaceId: 'Timeline' }
            }
          ]
        });
      }
      // 5. Detect Camera Recenter commands
      else if (stepClean.includes('recenter') || stepClean.includes('reset') || stepClean.includes('home')) {
        tasks.push({
          id: taskId,
          agentId: 'explorer',
          description: 'Recenter camera to observer local coordinates.',
          status: 'pending',
          actions: [
            {
              id: `${taskId}_act1`,
              label: 'Recenter View',
              description: 'Animate camera back to ground station coordinates.',
              type: 'focus',
              payload: {} // empty triggers default recenter
            }
          ]
        });
      }
      // 6. Detect Timeline Playback / speed controls
      else if (stepClean.includes('play') || stepClean.includes('pause') || stepClean.includes('speed') || stepClean.includes('fast-forward')) {
        let timelineAction: 'play' | 'pause' | 'set_speed' = 'play';
        let val: any = undefined;

        if (stepClean.includes('pause') || stepClean.includes('stop')) {
          timelineAction = 'pause';
        } else if (stepClean.includes('speed') || stepClean.includes('fast-forward') || stepClean.includes('speedup')) {
          timelineAction = 'set_speed';
          val = stepClean.includes('3600') || stepClean.includes('hour') ? 3600 : 3600;
        }

        tasks.push({
          id: taskId,
          agentId: 'timeline',
          description: 'Coordinate timeline speed and simulation play state.',
          status: 'pending',
          actions: [
            {
              id: `${taskId}_act1`,
              label: timelineAction === 'play' ? 'Start Play' : (timelineAction === 'pause' ? 'Pause Playback' : 'Accelerate Timeline'),
              description: 'Modify simulation clock step rates.',
              type: timelineAction === 'set_speed' ? 'set_speed' : (timelineAction === 'play' ? 'step_time' : 'step_time'),
              payload: { action: timelineAction, value: val }
            }
          ]
        });
      }
      // 7. Detect Observation Session start/stop
      else if (stepClean.includes('session') || stepClean.includes('recording') || stepClean.includes('note') || stepClean.includes('pin')) {
        let sessionAction: 'start_session' | 'stop_session' | 'pin_event' | 'add_note' = 'start_session';
        let noteText = '';
        
        if (stepClean.includes('stop') || stepClean.includes('end') || stepClean.includes('finish')) {
          sessionAction = 'stop_session';
        } else if (stepClean.includes('note')) {
          sessionAction = 'add_note';
          noteText = 'AI logged observer note.';
        } else if (stepClean.includes('pin')) {
          sessionAction = 'pin_event';
        }

        tasks.push({
          id: taskId,
          agentId: 'session',
          description: 'Control session log record parameters.',
          status: 'pending',
          actions: [
            {
              id: `${taskId}_act1`,
              label: sessionAction === 'start_session' ? 'Open Session' : (sessionAction === 'stop_session' ? 'Close Session' : 'Write Note Log'),
              description: 'Update SessionMemory parameters.',
              type: 'start_session',
              payload: { action: sessionAction, note: noteText }
            }
          ]
        });
      }
      // 8. Detect knowledge or explanation requests
      else if (stepClean.includes('why') || stepClean.includes('explain') || stepClean.includes('what is') || stepClean.includes('meaning')) {
        tasks.push({
          id: taskId,
          agentId: 'knowledge',
          description: `Formulate explainable answer for: "${stepClean}"`,
          status: 'pending',
          actions: []
        });
      }
      // 9. Fallback Observation Agent
      else {
        tasks.push({
          id: taskId,
          agentId: 'observation',
          description: `Analyze stargazing variables for: "${stepClean}"`,
          status: 'pending',
          actions: []
        });
      }
    });

    return tasks.length > 0 ? tasks : [
      {
        id: `task_${Date.now()}_fallback`,
        agentId: 'observation',
        description: 'Sync current observer sky condition report.',
        status: 'pending',
        actions: []
      }
    ];
  }
}
export default TaskPlanner;
