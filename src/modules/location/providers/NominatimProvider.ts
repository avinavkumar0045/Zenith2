export interface GeocodingResult {
  latitude: number;
  longitude: number;
  name: string;
  country: string;
  source: string;
}

export class NominatimProvider {
  private readonly baseUrl = 'https://nominatim.openstreetmap.org';

  public async search(query: string): Promise<GeocodingResult[]> {
    try {
      const response = await fetch(`${this.baseUrl}/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5`, {
        headers: {
          'Accept-Language': 'en',
          // Nominatim requires a User-Agent or it might block requests.
          'User-Agent': 'Project-Zenith/1.0'
        }
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      
      return data.map((item: any) => ({
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        name: item.name || item.address?.city || item.address?.town || item.address?.village || item.display_name.split(',')[0],
        country: item.address?.country || 'Unknown',
        source: 'Nominatim'
      }));
    } catch (error) {
      console.error("Nominatim Search Error", error);
      return [];
    }
  }

  public async reverse(latitude: number, longitude: number): Promise<GeocodingResult | null> {
    try {
      const response = await fetch(`${this.baseUrl}/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`, {
        headers: {
          'Accept-Language': 'en',
          'User-Agent': 'Project-Zenith/1.0'
        }
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const item = await response.json();
      
      if (item.error) return null;

      return {
        latitude: parseFloat(item.lat),
        longitude: parseFloat(item.lon),
        name: item.name || item.address?.city || item.address?.town || item.address?.village || item.address?.county || item.address?.state || 'Unknown Location',
        country: item.address?.country || 'Unknown',
        source: 'Nominatim'
      };
    } catch (error) {
      console.error("Nominatim Reverse Error", error);
      return null;
    }
  }
}
