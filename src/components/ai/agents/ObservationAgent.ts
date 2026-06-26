import { Task, AIContext, AgentResult } from '../ZenithAI.types';
import { SkyAPI } from '../api/SkyAPI';

export class ObservationAgent {
  /**
   * Evaluates stargazing conditions, calculates confidence ratings, and generates explainability logs.
   */
  public static async process(task: Task, context: AIContext): Promise<AgentResult> {
    const weather = context.weather;
    const location = context.location;
    const score = SkyAPI.getSkyScore();
    const plan = SkyAPI.getPlan();
    const bestTarget = SkyAPI.getBestTarget();

    const logs: string[] = [];
    let confidence = 95;

    // 1. Location Verification
    if (!location) {
      logs.push('❌ Error: Observer location telemetry missing.');
      return {
        explanation: 'Observer location coordinates are undefined. Cannot compile observation plan.',
        actions: [],
        confidence: 0,
        recommendations: ['Select or search a ground station location first.']
      };
    }
    logs.push(`✓ Observer location active: ${location.name}.`);

    // 2. Weather Impact Analysis
    if (weather) {
      const cloudPercent = weather.cloudCover;
      logs.push(`✓ Weather analysis: Cloud cover is ${cloudPercent}%. Condition: ${weather.condition}.`);
      
      // Impact score based on cloud cover
      if (cloudPercent > 50) {
        confidence -= (cloudPercent - 40);
        logs.push(`⚠️ Weather warning: High cloud cover (${cloudPercent}%) limits celestial visibility.`);
      } else {
        logs.push(`✓ Skies are clear: Cloud cover is minimal (${cloudPercent}%).`);
      }
    } else {
      logs.push('⚠️ Weather metrics unavailable. Assuming nominal twilight conditions.');
      confidence -= 15;
    }

    // 3. Moon Phase skyglow penalty
    const report = SkyAPI.getReport();
    if (report?.moonSummary) {
      const moon = report.moonSummary;
      if (moon.isVisible) {
        logs.push(`✓ Moon is above horizon. Phase: ${moon.phase}. Elevation: ${moon.altitude.toFixed(1)}°.`);
        if (moon.phase.toLowerCase().includes('full') || moon.phase.toLowerCase().includes('gibbous')) {
          confidence -= 10;
          logs.push('⚠️ Skyglow warning: Bright moon phase increases skyglow interference.');
        } else {
          logs.push('✓ Moon phase is favorable (low illumination). Faint objects remain visible.');
        }
      } else {
        logs.push('✓ Moon is below the horizon (Dark sky conditions active). Favorable for Deep Sky catalog targets.');
      }
    }

    // 4. Stargazing windows
    if (plan?.rankedTargets && plan.rankedTargets.length > 0) {
      logs.push(`✓ Target list compiled: ${plan.rankedTargets.length} visible bodies ranked.`);
    } else {
      logs.push('⚠️ Stargazing windows: No targets currently meet the 10° elevation threshold.');
      confidence -= 20;
    }

    confidence = Math.max(5, Math.min(100, confidence));

    // Construct response explanation
    let explanation = `Stargazing visibility quality index is rated at **${score}/100** tonight. `;
    if (bestTarget) {
      explanation += `The top recommended observation target is **${bestTarget}** based on elevation angles and atmospheric scattering. `;
    } else {
      explanation += 'Sky conditions are currently marginal for stargazing. ';
    }
    
    explanation += `Weather multiplier is ${weather?.scoreMultiplier ?? 1.0}x.`;

    const recommendations = [
      'Focus the camera on the recommended targets using action controls.',
      'Scrub simulated timeline to nadir (darkest astronomical twilight) for optimal visibility.',
      'Toggle ground grid off to maximize deep-sky contrast.'
    ];

    if (weather && weather.cloudCover > 60) {
      recommendations.unshift('⚠️ Consider delaying observation session due to cloudy forecasts.');
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
export default ObservationAgent;
