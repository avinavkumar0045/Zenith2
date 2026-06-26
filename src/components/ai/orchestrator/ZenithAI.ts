import { useConversationMemoryStore } from '../memory/ConversationMemory';
import { useWorkingMemoryStore } from '../memory/WorkingMemory';
import { useSessionMemoryStore } from '../memory/SessionMemory';
import { ContextBuilder } from './ContextBuilder';
import { TaskPlanner } from './TaskPlanner';
import { AgentRouter } from './AgentRouter';
import { PlanExecutor } from './PlanExecutor';
import { SkyAPI } from '../api/SkyAPI';
import { AIAction, AISessionPlan, PlanTarget, Task } from '../ZenithAI.types';
import { EventBus } from './EventBus';

export class ZenithAI {
  /**
   * Processes a user prompt through the agentic pipeline.
   */
  public static async processPrompt(prompt: string) {
    const chatStore = useConversationMemoryStore.getState();
    const workingStore = useWorkingMemoryStore.getState();
    const sessionStore = useSessionMemoryStore.getState();

    // 1. Add User message
    chatStore.addMessage({
      sender: 'user',
      text: prompt,
      status: 'done'
    });

    // 2. Set thinking & stage loading
    chatStore.setThinking(true, 'Analyzing Sky');
    
    // Simulate staged processing to resemble Devin/Claude reasoning presentation
    await new Promise((resolve) => setTimeout(resolve, 350));
    chatStore.setReasoningStep('Checking Weather');
    
    await new Promise((resolve) => setTimeout(resolve, 350));
    chatStore.setReasoningStep('Checking Timeline');
    
    await new Promise((resolve) => setTimeout(resolve, 350));
    chatStore.setReasoningStep('Computing Visibility');

    const context = ContextBuilder.buildContext();

    // Set goal in working memory based on query keywords
    const textLower = prompt.toLowerCase();
    if (textLower.includes('astrophotography') || textLower.includes('astrophoto')) {
      workingStore.setGoal('Astrophotography');
    } else if (textLower.includes('iss') || textLower.includes('satellite')) {
      workingStore.setGoal('Satellite Tracking');
    } else if (textLower.includes('plan') || textLower.includes('observe')) {
      workingStore.setGoal('General Observation');
    }

    // 3. Plan tasks
    chatStore.setReasoningStep('Planning Session');
    const tasks = TaskPlanner.plan(prompt);
    
    // 4. Delegate to Router & Specialized Agents
    const actionList: AIAction[] = [];
    const logs: string[] = [];
    const recommendations: string[] = [];
    let aggregatedExplanation = '';
    let avgConfidence = 0;

    for (const task of tasks) {
      const result = await AgentRouter.route(task, context);
      task.result = result;
      
      if (result.actions.length > 0) {
        actionList.push(...result.actions);
      }
      if (result.explainabilityLogs) {
        logs.push(...result.explainabilityLogs);
      }
      if (result.recommendations) {
        recommendations.push(...result.recommendations);
      }
      avgConfidence += result.confidence;
      aggregatedExplanation += (aggregatedExplanation ? ' ' : '') + result.explanation;
    }

    avgConfidence = Math.round(avgConfidence / tasks.length);

    // 5. Build Session Plan if relevant
    let sessionPlan: AISessionPlan | undefined = undefined;
    
    const isPlanRequest = textLower.includes('plan') || textLower.includes('schedule') || textLower.includes('agenda') || textLower.includes('observe') || textLower.includes('tonight');
    if (isPlanRequest) {
      const plan = SkyAPI.getPlan();
      const targets: PlanTarget[] = [];
      
      if (plan?.rankedTargets && plan.rankedTargets.length > 0) {
        plan.rankedTargets.slice(0, 3).forEach((t, i) => {
          targets.push({
            id: t.id,
            name: t.name,
            type: t.type,
            windowLabel: t.window 
              ? `${new Date(t.window.visibilityStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })} - ${new Date(t.window.visibilityEnd).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}` 
              : 'Twilight window',
            quality: t.quality,
            score: Math.round(t.score),
            reasoning: `Peak elevation is ${t.window?.peakAltitude.toFixed(0) || '15'}° in the ${t.quality} zone.`
          });
        });
      } else {
        // High fidelity fallback targets
        targets.push(
          { id: 'moon', name: 'Moon', type: 'Moon', windowLabel: '19:30 - 23:45', quality: 'Good', score: 85, reasoning: 'Phase: Waxing Crescent. Low skyglow interference.' },
          { id: 'planet-Jupiter', name: 'Jupiter', type: 'Planet', windowLabel: '20:15 - 01:30', quality: 'Excellent', score: 92, reasoning: 'Nadir elevation at 52° provides maximum clarity.' },
          { id: 'planet-Saturn', name: 'Saturn', type: 'Planet', windowLabel: '21:00 - 02:45', quality: 'Good', score: 78, reasoning: 'Rings tilt visible. Contrast multiplier: 1.0.' }
        );
      }

      sessionPlan = {
        title: 'Stargazing Agenda Plan',
        targets,
        confidence: avgConfidence,
        weatherSummary: context.weather ? `${context.weather.condition} (${context.weather.cloudCover}% Cloud Cover)` : 'Favorable dry skies',
        overallQuality: plan?.overallQuality || 'Good',
        suggestedDuration: 120
      };
    }

    // 6. Complete typing simulation and add AI message
    chatStore.setThinking(false);

    chatStore.addMessage({
      sender: 'ai',
      text: aggregatedExplanation,
      actions: actionList.length > 0 ? actionList : undefined,
      plan: sessionPlan,
      status: 'done'
    });

    // Save logs to session action logs
    logs.forEach(log => sessionStore.logAction(`[AI log] ${log}`));

    // If query requires direct auto-execution of actions (e.g. recenter), execute them now!
    const shouldAutoRun = textLower.includes('recenter') || textLower.includes('reset') || textLower.includes('fast-forward') || textLower.includes('speed');
    if (shouldAutoRun && actionList.length > 0) {
      await PlanExecutor.execute(tasks);
    }
  }

  /**
   * Broadcasts events to coordinate proactive AI suggestions.
   */
  public static triggerProactiveSuggestion(eventLabel: string, actionType: string, actionPayload: any) {
    const chatStore = useConversationMemoryStore.getState();
    const isDrawerOpen = document.body.classList.contains('ai-drawer-open');

    // Notify event bus
    EventBus.emit(eventLabel, actionPayload);

    // If drawer is open, add suggestion toast log to chat history
    if (isDrawerOpen) {
      chatStore.addMessage({
        sender: 'system',
        text: `Proactive Alert: ${eventLabel.replace(/([A-Z])/g, ' $1').trim()}. Suggestion: ${actionType.replace('_', ' ')}`,
        status: 'done'
      });
    }
  }
}
export default ZenithAI;
