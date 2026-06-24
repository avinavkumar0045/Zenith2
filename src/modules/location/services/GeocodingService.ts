import { NominatimProvider, GeocodingResult } from '../providers/NominatimProvider';
export type { GeocodingResult };

class GeocodingServiceClass {
  private provider: NominatimProvider;

  constructor() {
    // Allows us to easily swap providers later
    this.provider = new NominatimProvider();
  }

  public async search(query: string): Promise<GeocodingResult[]> {
    if (!query || query.trim().length < 2) return [];

    // Check for coordinate formats
    const coord = this.parseCoordinates(query.trim());
    if (coord) {
      // Validate bounds
      if (coord.lat >= -90 && coord.lat <= 90 && coord.lon >= -180 && coord.lon <= 180) {
        // Attempt reverse geocoding to get a real name
        const reverseResult = await this.reverse(coord.lat, coord.lon);
        if (reverseResult) {
          return [reverseResult];
        }
        
        // Fallback to raw coordinate entry
        return [{
          name: `Coordinates: ${coord.lat.toFixed(4)}, ${coord.lon.toFixed(4)}`,
          latitude: coord.lat,
          longitude: coord.lon,
          country: 'Manual Entry',
          source: 'Coordinate Search'
        }];
      }
    }

    return this.provider.search(query);
  }

  /**
   * Attempts to parse various coordinate formats into a lat/lon object.
   */
  private parseCoordinates(query: string): { lat: number, lon: number } | null {
    // Format A: 28.6139, 77.2090 (with or without space)
    const formatA = /^(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)$/;
    
    // Format B: 28.6139 77.2090
    const formatB = /^(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)$/;
    
    // Format C: lat=28.6139 lon=77.2090
    const formatC = /^lat=(-?\d+(?:\.\d+)?)\s+lon=(-?\d+(?:\.\d+)?)$/i;
    
    // Format D: Latitude:28.6139 Longitude:77.2090
    const formatD = /^latitude:(-?\d+(?:\.\d+)?)\s+longitude:(-?\d+(?:\.\d+)?)$/i;

    let match = query.match(formatA);
    if (match) return { lat: parseFloat(match[1]), lon: parseFloat(match[2]) };

    match = query.match(formatB);
    if (match) return { lat: parseFloat(match[1]), lon: parseFloat(match[2]) };

    match = query.match(formatC);
    if (match) return { lat: parseFloat(match[1]), lon: parseFloat(match[2]) };

    match = query.match(formatD);
    if (match) return { lat: parseFloat(match[1]), lon: parseFloat(match[2]) };

    return null;
  }

  public async reverse(latitude: number, longitude: number): Promise<GeocodingResult | null> {
    return this.provider.reverse(latitude, longitude);
  }
}

export const GeocodingService = new GeocodingServiceClass();
