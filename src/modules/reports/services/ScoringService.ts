import { PassPredictionObject } from '../../pass-predictions/types/pass.types';

class ScoringServiceClass {
  /**
   * Generates a 0-10 score based on current conditions and upcoming passes.
   */
  public generateScore(dayState: string, passes: PassPredictionObject[]): number {
    let score = 0;

    // 1. Base score from Day/Night (Dark sky is better for visual observation)
    if (dayState === 'Night' || dayState === 'Twilight') {
      score += 4;
    } else if (dayState === 'Golden Hour') {
      score += 2;
    }

    // 2. Add score based on passes
    if (passes.length > 0) {
      // Find the best pass
      const bestPass = passes.reduce((prev, current) => 
        (prev.maxElevation > current.maxElevation) ? prev : current
      );

      // Score based on elevation (up to 4 points)
      if (bestPass.maxElevation >= 60) score += 4;
      else if (bestPass.maxElevation >= 30) score += 3;
      else if (bestPass.maxElevation >= 15) score += 1;

      // Score based on quantity (up to 2 points)
      if (passes.length >= 3) score += 2;
      else if (passes.length === 2) score += 1;
    }

    // Ensure within bounds 0-10
    return Math.max(0, Math.min(10, score));
  }

  public getQualityLabel(score: number): string {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    if (score >= 4) return 'Average';
    return 'Poor';
  }
}

export const ScoringService = new ScoringServiceClass();
