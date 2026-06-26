import { Task, AIContext, AgentResult } from '../ZenithAI.types';

export class KnowledgeAgent {
  /**
   * Resolves general astronomy knowledge questions and defines terminology.
   */
  public static async process(task: Task, context: AIContext): Promise<AgentResult> {
    const logs: string[] = ['✓ Initializing Knowledge Agent catalog search.'];
    const text = task.description.toLowerCase();
    
    let explanation = 'As an astronomical coordinator, I can provide details on planet distances, satellite speeds, and nebula coordinates. Ask me about ISS, Jupiter, Saturn, or Andromeda!';
    let confidence = 98;
    const recommendations: string[] = [];

    if (text.includes('iss') || text.includes('space station')) {
      logs.push('✓ Matched topic: International Space Station.');
      explanation = 'The **International Space Station (ISS)** orbits the Earth at an altitude of approximately **415 - 425 km**. It travels at a velocity of **27,600 km/h** (approx. 7.66 km/s), completing a full revolution of our planet every **92.8 minutes**. It serves as a microgravity space laboratory for international research teams.';
      recommendations.push('Apply the Satellite Preset profile and click "Track ISS" to lock the viewer camera on its live path.');
    } else if (text.includes('saturn')) {
      logs.push('✓ Matched topic: Saturn.');
      explanation = '**Saturn** is the sixth planet from the Sun and the second-largest in the Solar System. It is famous for its extensive ring system, composed mainly of ice particles, rocky debris, and dust. Favorable target elevations tonight.';
      recommendations.push('Focus camera on Saturn using the Explorer catalog button.');
    } else if (text.includes('jupiter')) {
      logs.push('✓ Matched topic: Jupiter.');
      explanation = '**Jupiter** is the largest planet in our Solar System. A gas giant with a mass more than two and a half times that of all the other planets in the Solar System combined. It features the Great Red Spot storm and is orbited by 95 known moons.';
      recommendations.push('Use the Timeline scrubbers to check Jupiter\'s peak altitude window.');
    } else if (text.includes('andromeda') || text.includes('m31')) {
      logs.push('✓ Matched topic: Andromeda Galaxy.');
      explanation = 'The **Andromeda Galaxy (M31)** is a barred spiral galaxy approximately **2.5 million light-years** from Earth, and the nearest major galaxy to the Milky Way. It is visible to the naked eye under dark skies in the constellation Andromeda.';
      recommendations.push('Activate the Astrophotography profile preset to clear cities and labels for a pristine look.');
    } else if (text.includes('orion') || text.includes('m42')) {
      logs.push('✓ Matched topic: Orion Nebula.');
      explanation = 'The **Orion Nebula (M42)** is a diffuse nebula situated in the Milky Way, south of Orion\'s Belt. It is one of the brightest nebulae and is a massive stellar nursery where new stars are actively forming.';
      recommendations.push('Toggle stars backdrop visibility ON to verify constellation alignments.');
    } else {
      logs.push('✓ Term mapping: Unmatched general query. Returning default coordinator response.');
      explanation = 'I am the platform knowledge database coordinate coordinator. I can explain planet positions, satellite elevations, and dark sky ratings. Ask me to locate a target, start a session, or plan an observation tonight!';
      recommendations.push('Try asking: "Plan observation tonight", "Track ISS", or "Prepare for astrophotography".');
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
export default KnowledgeAgent;
