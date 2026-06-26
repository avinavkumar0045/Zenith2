export interface AICapability {
  name: string;
  description: string;
  agentId: string;
  skills: string[];
}

export class CapabilityRegistry {
  private static capabilities: AICapability[] = [
    {
      name: 'ObservationPlanning',
      description: 'Generates detailed observation schedules, stargazing windows, and target score rankings.',
      agentId: 'observation',
      skills: ['calculateApproximatedWindow', 'determineQuality', 'rankTargets']
    },
    {
      name: 'VisibilityPrediction',
      description: 'Predicts current and future coordinate elevations, transit heights, and twilight states.',
      agentId: 'observation',
      skills: ['twilightCalculation', 'horizonChecks']
    },
    {
      name: 'CloudAnalysis',
      description: 'Evaluates regional cloud cover forecast and computes visibility index weather multipliers.',
      agentId: 'observation',
      skills: ['weatherImpactScoring']
    },
    {
      name: 'CatalogSearch',
      description: 'Queries active planets, satellites, space stations, constellations, and deep-sky objects by name or category.',
      agentId: 'explorer',
      skills: ['fuzzySearch', 'categoryFiltering']
    },
    {
      name: 'CameraControl',
      description: 'Executes globe flight trajectories, recentering observer views, or tracking satellite orbits.',
      agentId: 'explorer',
      skills: ['cameraFocus', 'entityLockTracking']
    },
    {
      name: 'TimelineSpeedControl',
      description: 'Configures simulation speed rate multipliers and playback steps.',
      agentId: 'timeline',
      skills: ['setSpeed', 'stepSimulation']
    },
    {
      name: 'TimeTravelScrubbing',
      description: 'Adjusts simulation clock forward/backward and resets current selected time to now.',
      agentId: 'timeline',
      skills: ['setSelectedTime', 'resetToNow']
    },
    {
      name: 'LayerOpacityControl',
      description: 'Adjusts opacity levels of atmosphere, clouds, ground tracks, coordinate grids, and labels.',
      agentId: 'visualization',
      skills: ['setOpacity', 'fineTuningSliders']
    },
    {
      name: 'PresetProfileMapping',
      description: 'Switches rendering presets automatically (Minimal, Observation, Satellite, Astrophotography, Everything).',
      agentId: 'visualization',
      skills: ['applyProfilePreset']
    },
    {
      name: 'SessionLogging',
      description: 'Launches or stops observer log session feeds and records notes.',
      agentId: 'session',
      skills: ['startSession', 'stopSession', 'addNotes']
    },
    {
      name: 'EventPinning',
      description: 'Pins transit times, twilight warnings, and window blocks to observer dashboard logs.',
      agentId: 'session',
      skills: ['pinEvent']
    },
    {
      name: 'SpaceConceptAnswering',
      description: 'Answers general knowledge stargazing, orbital decay, ISS crew, and celestial body metrics questions.',
      agentId: 'knowledge',
      skills: ['astronomyQA', 'explainTerminology']
    }
  ];

  public static getCapabilities(): AICapability[] {
    return this.capabilities;
  }

  public static getCapabilitiesForAgent(agentId: string): AICapability[] {
    return this.capabilities.filter(c => c.agentId === agentId);
  }

  public static register(capability: AICapability) {
    if (!this.capabilities.some(c => c.name === capability.name)) {
      this.capabilities.push(capability);
    }
  }
}
export default CapabilityRegistry;
