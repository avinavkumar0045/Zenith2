import { PassPredictionObject } from '../../pass-predictions/types/pass.types';

class ObservationServiceClass {
  public generateRecommendations(passes: PassPredictionObject[], dayState: string): string[] {
    const recommendations: string[] = [];

    if (passes.length === 0) {
      recommendations.push("No visible passes detected in the next 24 hours for the selected target.");
      return recommendations;
    }

    const nextPass = passes[0];
    const bestPass = passes.reduce((prev, current) => 
      (prev.maxElevation > current.maxElevation) ? prev : current
    );

    // 1. Next Pass Timing
    const now = new Date();
    const nextStart = new Date(nextPass.startTime);
    const diffMins = Math.floor((nextStart.getTime() - now.getTime()) / 60000);
    
    if (diffMins > 0 && diffMins < 120) {
      recommendations.push(`Next pass approaching in ${diffMins} minutes.`);
    }

    // 2. Best Window
    const bestTime = new Date(bestPass.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    recommendations.push(`Best observation window begins at ${bestTime} (Max Elevation: ${Math.round(bestPass.maxElevation)}°).`);

    // 3. Count
    const excellentPasses = passes.filter(p => p.passQuality === 'Excellent').length;
    if (excellentPasses > 0) {
      recommendations.push(`${excellentPasses} upcoming passes have excellent viewing opportunities.`);
    } else {
      recommendations.push(`There are ${passes.length} total passes available in the next 24 hours.`);
    }

    // 4. Conditions
    if (dayState === 'Day') {
      recommendations.push("Current daylight conditions will make visual observation difficult. Rely on radio telemetry if applicable.");
    } else if (dayState === 'Night' || dayState === 'Twilight') {
      recommendations.push("Current dark sky conditions are optimal for visual tracking.");
    }

    return recommendations;
  }
}

export const ObservationService = new ObservationServiceClass();
