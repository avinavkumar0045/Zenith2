import { SatelliteProvider } from './SatelliteProvider';
import { SatelliteObject } from '../types/satellite.types';
import { OrbitService } from '../services/OrbitService';

export class CelesTrakProvider implements SatelliteProvider {
  private readonly baseUrl = 'https://celestrak.org/NORAD/elements/gp.php';

  public async fetchSatellites(category: string): Promise<SatelliteObject[]> {
    try {
      // Celestrak endpoints. E.g., GROUP=weather
      const response = await fetch(`${this.baseUrl}?GROUP=${category}&FORMAT=tle`);
      if (!response.ok) {
        throw new Error(`Failed to fetch from CelesTrak: ${response.statusText}`);
      }

      const text = await response.text();
      return this.parseTLEText(text, category);
    } catch (error) {
      console.warn("CelesTrak Fetch failed:", error instanceof Error ? error.message : error);
      return [];
    }
  }

  private parseTLEText(text: string, category: string): SatelliteObject[] {
    const lines = text.split('\n').map(l => l.replace('\r', ''));
    const satellites: SatelliteObject[] = [];

    // TLEs come in blocks of 3 lines (Name, Line 1, Line 2)
    for (let i = 0; i < lines.length - 2; i += 3) {
      const name = lines[i];
      const tleLine1 = lines[i + 1];
      const tleLine2 = lines[i + 2];

      if (name && tleLine1 && tleLine2 && tleLine1.startsWith('1 ') && tleLine2.startsWith('2 ')) {
        const satObj = OrbitService.parseTLE(name, tleLine1, tleLine2, category, 'CelesTrak');
        if (satObj) {
          satellites.push(satObj);
        }
      }
    }

    return satellites;
  }
}
