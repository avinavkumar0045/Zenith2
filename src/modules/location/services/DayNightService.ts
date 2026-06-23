import * as SunCalc from 'suncalc';

export interface DayNightData {
  dayState: string;
  sunrise: string;
  sunset: string;
  twilight: string;
}

class DayNightServiceClass {
  
  public getDayNightData(latitude: number, longitude: number, date: Date = new Date()): DayNightData {
    const times = SunCalc.getTimes(date, latitude, longitude);
    
    // Format times (guards against null/NaN dates in polar regions)
    const formatTime = (d: Date | null): string => {
      if (!d || isNaN(d.getTime())) return 'N/A';
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    };

    // Determine current day state based on the current time vs sun times
    let dayState = 'Night';
    const now = date.getTime();
    
    const sunriseMs = times.sunrise?.getTime() ?? 0;
    const sunsetMs = times.sunset?.getTime() ?? 0;
    const dawnMs = times.dawn?.getTime() ?? 0;
    const duskMs = times.dusk?.getTime() ?? 0;
    const goldenHourMs = times.goldenHour?.getTime() ?? 0;
    const goldenHourEndMs = times.goldenHourEnd?.getTime() ?? 0;

    if (sunriseMs && sunsetMs && now > sunriseMs && now < sunsetMs) {
      dayState = 'Day';
    } else if (dawnMs && sunriseMs && now > dawnMs && now < sunriseMs) {
      dayState = 'Dawn';
    } else if (sunsetMs && duskMs && now > sunsetMs && now < duskMs) {
      dayState = 'Dusk';
    }

    if (goldenHourMs && sunsetMs && now > goldenHourMs && now < sunsetMs) {
      dayState = 'Golden Hour';
    } else if (sunriseMs && goldenHourEndMs && now > sunriseMs && now < goldenHourEndMs) {
      dayState = 'Golden Hour';
    }

    return {
      dayState,
      sunrise: formatTime(times.sunrise),
      sunset: formatTime(times.sunset),
      twilight: formatTime(times.dusk)
    };
  }
}

export const DayNightService = new DayNightServiceClass();
