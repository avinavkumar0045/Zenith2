import { useWeatherStore } from '../../weather/store/useWeatherStore';
import { useMoonStore } from '../../moon/store/useMoonStore';
import { usePassStore } from '../../pass-predictions/store/usePassStore';

export class SpaceEnvironmentEngineClass {
  
  public generateSummary(mostRelevantAsset: string, satelliteCount: number): string {
    const { weather } = useWeatherStore.getState();
    const { moonData } = useMoonStore.getState();
    const { upcomingPasses } = usePassStore.getState();

    let summary = '';

    // Weather impact
    if (weather) {
      if (weather.scoreMultiplier < 0.3) {
        summary += `Heavy clouds and poor conditions significantly reducing visibility. `;
      } else if (weather.scoreMultiplier > 0.8) {
        summary += `Clear skies providing excellent observation conditions. `;
      } else {
        summary += `Average atmospheric conditions for observation. `;
      }
    } else {
      summary += `Sky conditions unknown. `;
    }

    // Asset highlights
    if (mostRelevantAsset === 'Moon') {
      summary += `The Moon currently dominates the local sky environment. `;
    } else if (mostRelevantAsset === 'ISS') {
      summary += `ISS is making a high-visibility transit overhead. `;
    } else if (mostRelevantAsset !== 'None') {
      summary += `${mostRelevantAsset} is the most prominent target. `;
    } else {
      summary += `No prominent celestial targets currently visible. `;
    }

    // Satellites
    const now = Date.now();
    const activePasses = upcomingPasses ? upcomingPasses.filter(p => new Date(p.startTime).getTime() < now && new Date(p.endTime).getTime() > now).length : 0;
    
    if (activePasses > 2) {
      summary += `Multiple satellite transits currently occurring.`;
    } else if (satelliteCount > 50) {
      summary += `High background satellite density in orbital sector.`;
    }

    return summary.trim();
  }
}

export const SpaceEnvironmentEngine = new SpaceEnvironmentEngineClass();
