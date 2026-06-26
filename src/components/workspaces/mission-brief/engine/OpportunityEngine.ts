import { SkyRecommendationEngine } from '@/modules/reports/services/SkyRecommendationEngine';

export class OpportunityEngine {
  /**
   * Resolves the single best observation target and its viewing reason.
   */
  public static getBestTarget(): { name: string; reason: string } | null {
    try {
      return SkyRecommendationEngine.getBestTarget();
    } catch (e) {
      console.warn("OpportunityEngine failed to resolve best target:", e);
      return null;
    }
  }
}
