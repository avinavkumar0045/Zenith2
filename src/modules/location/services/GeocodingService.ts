import { NominatimProvider, GeocodingResult } from '../providers/NominatimProvider';
export type { GeocodingResult };

class GeocodingServiceClass {
  private provider: NominatimProvider;

  constructor() {
    // Allows us to easily swap providers later
    this.provider = new NominatimProvider();
  }

  public async search(query: string): Promise<GeocodingResult[]> {
    if (!query || query.length < 2) return [];
    return this.provider.search(query);
  }

  public async reverse(latitude: number, longitude: number): Promise<GeocodingResult | null> {
    return this.provider.reverse(latitude, longitude);
  }
}

export const GeocodingService = new GeocodingServiceClass();
