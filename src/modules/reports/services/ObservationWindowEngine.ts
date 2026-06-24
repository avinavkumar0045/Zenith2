import { ObservationWindow } from '../types/observation-planning.types';
import { PassPredictionObject } from '../../pass-predictions/types/pass.types';

export class ObservationWindowEngineClass {
  
  public calculatePassWindow(pass: PassPredictionObject): ObservationWindow {
    const startTime = new Date(pass.startTime).getTime();
    const endTime = new Date(pass.endTime).getTime();
    const peakTime = new Date(pass.peakTime).getTime();
    
    return {
      visibilityStart: startTime,
      visibilityEnd: endTime,
      peakTime: peakTime,
      peakAltitude: pass.maxElevation,
      durationMinutes: Math.max(1, Math.round((endTime - startTime) / 60000))
    };
  }

  public calculateApproximatedWindow(
    currentAlt: number, 
    currentAz: number, 
    isRising: boolean // az < 180 usually means rising in northern hemisphere roughly, but we can just use a simple heuristic
  ): ObservationWindow | null {
    if (currentAlt <= 0) return null; // Not currently visible, and without full ephemeris we can't easily predict next rise

    const now = Date.now();
    const rateDegPerHour = 15; // Earth rotation
    
    // Very coarse approximation: assume peak altitude at south (az=180)
    let hoursToPeak = 0;
    if (currentAz < 180) {
      hoursToPeak = (180 - currentAz) / rateDegPerHour;
    } else {
      hoursToPeak = (180 - currentAz) / rateDegPerHour; // negative, peak was in the past
    }
    
    // If it's already past peak and setting
    const peakTime = now + hoursToPeak * 3600000;
    
    // Approximate peak altitude based on current altitude and hours to peak (very coarse)
    const peakAltitude = Math.min(90, Math.max(currentAlt, currentAlt + Math.abs(hoursToPeak) * rateDegPerHour * 0.5));

    // Time it takes to go from 10 deg to peak
    const hoursFrom10ToPeak = (peakAltitude - 10) / rateDegPerHour;
    
    let visibilityStart = peakTime - hoursFrom10ToPeak * 3600000;
    let visibilityEnd = peakTime + hoursFrom10ToPeak * 3600000;

    // Sanity constraints
    if (visibilityEnd < now) visibilityEnd = now + 1800000; // If it's setting, give it at least 30 mins
    
    const durationMinutes = Math.max(1, Math.round((visibilityEnd - visibilityStart) / 60000));

    return {
      visibilityStart,
      visibilityEnd,
      peakTime,
      peakAltitude,
      durationMinutes
    };
  }
}

export const ObservationWindowEngine = new ObservationWindowEngineClass();
