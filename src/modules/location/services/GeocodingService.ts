import { NominatimProvider, GeocodingResult } from '../providers/NominatimProvider';
export type { GeocodingResult };

class GeocodingServiceClass {
  private provider: NominatimProvider;

  // Cache for reverse geocoding
  private lastReverseCache: {
    lat: number;
    lon: number;
    result: GeocodingResult | null;
    timestamp: number;
  } | null = null;

  // In-progress reverse geocoding promise
  private activeReversePromise: {
    lat: number;
    lon: number;
    promise: Promise<GeocodingResult | null>;
  } | null = null;
  
  // Throttle request timestamp
  private lastRequestTime = 0;

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
    const now = Date.now();
    
    // 1. Check cache first. If a request was made for a very close location (within ~50m) in the last 15 seconds, return it
    if (this.lastReverseCache) {
      const latDiff = Math.abs(this.lastReverseCache.lat - latitude);
      const lonDiff = Math.abs(this.lastReverseCache.lon - longitude);
      const timeDiff = now - this.lastReverseCache.timestamp;
      
      if (latDiff < 0.0005 && lonDiff < 0.0005 && timeDiff < 15000) {
        return this.lastReverseCache.result;
      }
    }

    // 2. Check if a request for a close location is already in progress
    if (this.activeReversePromise) {
      const latDiff = Math.abs(this.activeReversePromise.lat - latitude);
      const lonDiff = Math.abs(this.activeReversePromise.lon - longitude);
      
      if (latDiff < 0.0005 && lonDiff < 0.0005) {
        return this.activeReversePromise.promise;
      }
    }

    // 3. Rate limit: ensure we don't query Nominatim faster than once per 1.2 seconds
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < 1200) {
      const delay = 1200 - timeSinceLastRequest;
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    // 4. Update request time and construct the active promise
    this.lastRequestTime = Date.now();
    
    const promise = (async () => {
      try {
        const result = await this.provider.reverse(latitude, longitude);
        
        // Cache the result
        this.lastReverseCache = {
          lat: latitude,
          lon: longitude,
          result,
          timestamp: Date.now()
        };
        
        return result;
      } catch (err) {
        return null;
      } finally {
        // Clear active promise reference once finished
        if (this.activeReversePromise && 
            this.activeReversePromise.lat === latitude && 
            this.activeReversePromise.lon === longitude) {
          this.activeReversePromise = null;
        }
      }
    })();

    this.activeReversePromise = {
      lat: latitude,
      lon: longitude,
      promise
    };

    return promise;
  }
}

export const GeocodingService = new GeocodingServiceClass();
