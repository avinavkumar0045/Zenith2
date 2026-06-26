import { SkyRecommendationEngine } from '@/modules/reports/services/SkyRecommendationEngine';

export class RecommendationEngine {
  /**
   * Compiles and caps recommendations to a maximum of 3 actionable steps.
   */
  public static getActionableSteps(): string[] {
    try {
      const recs = SkyRecommendationEngine.getRecommendations();
      return recs.slice(0, 3);
    } catch (e) {
      console.warn("RecommendationEngine failed to resolve recommendations:", e);
      return [];
    }
  }

  /**
   * Compiles active warning notifications.
   */
  public static getWarnings(): string[] {
    try {
      return SkyRecommendationEngine.getWarnings();
    } catch (e) {
      console.warn("RecommendationEngine failed to resolve warnings:", e);
      return [];
    }
  }
}
