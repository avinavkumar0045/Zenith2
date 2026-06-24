import { useWeatherStore } from '../../weather/store/useWeatherStore';
import { useConstellationStore } from '../../constellations/store/useConstellationStore';

export class VisibilitySummaryEngineClass {
  
  public generateSummary(data: any): string[] {
    const summary: string[] = [];
    const { weather } = useWeatherStore.getState();
    const { nearZenithConstellation } = useConstellationStore.getState();

    // 1. Weather/Quality
    if (weather && weather.scoreMultiplier < 0.5) {
      summary.push(`Observation quality is ${weather.observationQuality.toLowerCase()} due to weather.`);
    } else {
      summary.push(`Current observation quality is ${data.observationQuality.toLowerCase()}.`);
    }

    // 2. Best Target
    if (data.bestTarget !== 'None') {
      summary.push(`${data.bestTarget} is the highest ranked target.`);
    } else {
      summary.push(`No prime celestial targets are currently visible.`);
    }

    // 3. Moon Status
    if (data.visibleMoon) {
      summary.push(`The Moon is visible at ${data.moonAltitude.toFixed(0)}° altitude.`);
    }

    // 4. Planets/Constellations
    if (data.visiblePlanets.length > 0) {
      summary.push(`${data.visiblePlanets.length} major planet(s) are visible.`);
    } else if (nearZenithConstellation) {
      summary.push(`${nearZenithConstellation.name} is currently near zenith.`);
    }

    // 5. ISS / Satellites
    if (data.issVisible) {
      summary.push(`The ISS is currently passing overhead.`);
    } else if (data.upcomingPasses > 0) {
      summary.push(`${data.upcomingPasses} strong satellite pass(es) expected soon.`);
    }

    return summary.slice(0, 5); // Max 5 statements
  }
}

export const VisibilitySummaryEngine = new VisibilitySummaryEngineClass();
