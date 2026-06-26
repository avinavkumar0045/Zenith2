import { ExplorerObject, ExplorerModel, ExplorerCategory } from '../CelestialExplorer.types';
import { RankingEngine } from './RankingEngine';

export class FeaturedEngine {
  /**
   * Generates the final presentation-ready ExplorerModel.
   * Curates the "Featured Tonight" list based on visibility, quality, and interest.
   * Compiles object counts for each filter category.
   */
  public static compileModel(
    allCompiledObjects: ExplorerObject[],
    filteredObjects: ExplorerObject[],
    searchQuery: string,
    activeCategory: ExplorerCategory | 'all'
  ): ExplorerModel {
    // Curate Featured Tonight from all compiled objects (not affected by search text/category filters)
    // We target high-interest objects that are currently above the horizon (altitude > 0)
    const featuredPool = allCompiledObjects.filter(
      (obj) => 
        obj.altitude > 0 &&
        obj.visibilityState !== 'Below Horizon' &&
        (obj.type === 'planets' || obj.type === 'moon' || obj.type === 'stations' || obj.type === 'deep-sky')
    );

    // Rank the featured objects using the RankingEngine
    const rankedFeatured = RankingEngine.rankObjects(featuredPool);

    // Slice top 3 targets for the Featured tonight dashboard
    const featuredObjects = rankedFeatured.slice(0, 3);

    // Compute category counts based on the base aggregated dataset
    const categoryCounts: Record<ExplorerCategory | 'all', number> = {
      all: allCompiledObjects.length,
      planets: allCompiledObjects.filter(o => o.type === 'planets').length,
      moon: allCompiledObjects.filter(o => o.type === 'moon').length,
      stations: allCompiledObjects.filter(o => o.type === 'stations').length,
      satellites: allCompiledObjects.filter(o => o.type === 'satellites').length,
      constellations: allCompiledObjects.filter(o => o.type === 'constellations').length,
      'deep-sky': allCompiledObjects.filter(o => o.type === 'deep-sky').length,
    };

    return {
      allObjects: filteredObjects,
      featuredObjects,
      categoryCounts,
      lastUpdated: Date.now(),
    };
  }
}
