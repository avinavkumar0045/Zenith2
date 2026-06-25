import { CelesTrakProvider } from '../../satellites/providers/CelesTrakProvider';
import { ISSObject } from '../types/iss.types';

class ISSTelemetryServiceClass {
  private provider = new CelesTrakProvider();

  public async fetchISSTelemetry(): Promise<ISSObject | null> {
    try {
      // The ISS is usually in the "stations" group on CelesTrak
      const stations = await this.provider.fetchSatellites('stations');
      
      // NORAD ID 25544 is the ISS
      const issData = stations.find(sat => sat.noradId === 25544);
      
      if (issData) {
        return {
          ...issData,
          crewCount: 7 // Hardcoded approximate or fetched from another API later. The user said no Crew Info APIs for now.
        } as ISSObject;
      }
      
      return null;
    } catch (e) {
      console.warn("Failed to fetch ISS telemetry:", e instanceof Error ? e.message : e);
      return null;
    }
  }
}

export const ISSTelemetryService = new ISSTelemetryServiceClass();
