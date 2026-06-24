import { OpportunityObject, ForecastQuality } from '../types/opportunity.types';
import { useWeatherStore } from '../../weather/store/useWeatherStore';

export class OpportunityForecastEngineClass {
  
  public generateForecast(opportunities: OpportunityObject[]): { quality: ForecastQuality, summary: string } {
    let quality: ForecastQuality = 'AVERAGE';
    let summary = '';

    const { weather } = useWeatherStore.getState();
    const isCloudy = weather ? weather.scoreMultiplier < 0.5 : false;

    if (opportunities.length === 0 || isCloudy) {
      quality = 'POOR';
      summary = isCloudy ? 'Heavy cloud cover is restricting observation opportunities.' : 'No major observable targets in the next 6 hours.';
    } else {
      const hasISS = opportunities.some(o => o.category === 'ISS');
      const hasPlanets = opportunities.some(o => o.category === 'PLANET');
      const hasMoon = opportunities.some(o => o.category === 'MOON');

      if (hasISS && (hasPlanets || hasMoon)) {
        quality = 'EXCELLENT';
        summary = 'Next 6 hours contain multiple observable targets including an ISS pass.';
      } else if (hasPlanets || hasMoon) {
        quality = 'GOOD';
        summary = 'Good observation windows approaching for primary celestial bodies.';
      } else {
        quality = 'AVERAGE';
        summary = 'Standard orbital and celestial transits expected.';
      }
    }

    return { quality, summary };
  }
}

export const OpportunityForecastEngine = new OpportunityForecastEngineClass();
