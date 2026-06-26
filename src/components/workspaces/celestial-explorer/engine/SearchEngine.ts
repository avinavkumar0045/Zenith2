import { ExplorerObject, ExplorerCategory } from '../CelestialExplorer.types';

export class SearchEngine {
  /**
   * Filters the compiled list based on the search query text and category toggle.
   */
  public static filterObjects(
    objects: ExplorerObject[],
    query: string,
    category: ExplorerCategory | 'all'
  ): ExplorerObject[] {
    let filtered = objects;

    // 1. Filter by category first if not 'all'
    if (category !== 'all') {
      filtered = filtered.filter((obj) => obj.type === category);
    }

    // 2. Filter by search query if specified
    const cleanQuery = query.trim().toLowerCase();
    if (cleanQuery.length > 0) {
      filtered = filtered.filter((obj) => {
        const matchesName = obj.name.toLowerCase().includes(cleanQuery);
        const matchesDesc = obj.description.toLowerCase().includes(cleanQuery);
        const matchesType = obj.type.toLowerCase().includes(cleanQuery);
        
        let matchesAbbr = false;
        if (obj.originalData?.abbreviation) {
          matchesAbbr = obj.originalData.abbreviation.toLowerCase().includes(cleanQuery);
        } else if (obj.originalData?.noradId) {
          matchesAbbr = String(obj.originalData.noradId).includes(cleanQuery);
        }

        return matchesName || matchesDesc || matchesType || matchesAbbr;
      });
    }

    return filtered;
  }
}
