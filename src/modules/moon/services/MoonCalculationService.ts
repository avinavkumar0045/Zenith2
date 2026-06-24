import * as SunCalc from 'suncalc';
import { LocationIntelligenceObject } from '../../location/types/location.types';
import { MoonIntelligenceObject } from '../types/moon.types';
import { MoonObservationService } from './MoonObservationService';

export class MoonCalculationServiceClass {
  public calculateMoonData(location: LocationIntelligenceObject, date: Date = new Date()): MoonIntelligenceObject {
    const { latitude, longitude, dayState } = location;
    
    const illumination = SunCalc.getMoonIllumination(date);
    const position = SunCalc.getMoonPosition(date, latitude, longitude);
    const times = SunCalc.getMoonTimes(date, latitude, longitude);

    const altitudeDeg = position.altitude;
    const azimuthDeg = (position.azimuth + 180 + 360) % 360; // SunCalc azimuth is relative to South, add 180 to normalize to North

    const formatTime = (d: Date | null | undefined): string | null => {
      if (!d || isNaN(d.getTime())) return null;
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    const isVisible = altitudeDeg > 0;
    const score = MoonObservationService.calculateScore(altitudeDeg, illumination.fraction, isVisible, dayState);

    return {
      phase: illumination.phase,
      phaseName: this.getPhaseName(illumination.phase),
      illumination: illumination.fraction,
      age: illumination.phase * 29.53, // rough approximation
      altitude: altitudeDeg,
      azimuth: azimuthDeg,
      distance: position.distance,
      moonrise: formatTime(times.rise),
      moonset: formatTime(times.set),
      isVisible,
      observationScore: score,
      timestamp: date.getTime()
    };
  }

  private getPhaseName(phase: number): string {
    if (phase < 0.03 || phase > 0.97) return "New Moon";
    if (phase < 0.22) return "Waxing Crescent";
    if (phase < 0.28) return "First Quarter";
    if (phase < 0.47) return "Waxing Gibbous";
    if (phase < 0.53) return "Full Moon";
    if (phase < 0.72) return "Waning Gibbous";
    if (phase < 0.78) return "Last Quarter";
    return "Waning Crescent";
  }
}

export const MoonCalculationService = new MoonCalculationServiceClass();
