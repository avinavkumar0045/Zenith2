import * as Cesium from 'cesium';

/**
 * Resolves the display priority of a Cesium Entity.
 * 
 * Priority Scale:
 * - 100: Current Active Geolocation Marker
 * - 95: International Space Station (ISS)
 * - 90: Moon Ground Marker
 * - 85: Major Planets Ground Markers
 * - 80: Space Stations
 * - 70: Weather Satellites
 * - 60: Navigation Satellites
 * - 50: Communication Satellites
 * - 40: Other / Generic Satellites
 * - 0: Default lowest priority
 */
export function getEntityPriority(entity: Cesium.Entity, activeSatellites: any[]): number {
  const id = entity.id;

  // 1. Current Location Marker
  if (id.startsWith('loc_')) {
    return 100;
  }

  // 2. ISS Marker
  if (id === 'sat_25544') {
    return 95;
  }

  // 3. Moon Marker
  if (id === 'moon-ground-position') {
    return 90;
  }

  // 4. Major Planets Markers
  if (id.startsWith('planet-ground-')) {
    return 85;
  }

  // 5. Satellites
  if (id.startsWith('sat_')) {
    // Try to find satellite in active satellites list to read its category
    const sat = activeSatellites.find(s => s.id === id);
    if (sat) {
      const cat = (sat.category || "").toLowerCase();
      const name = (sat.name || "").toLowerCase();

      if (cat === 'stations' || name.includes('tiangong') || name.includes('space station')) {
        return 80;
      }
      if (cat === 'weather' || name.includes('noaa') || name.includes('goes') || name.includes('meteor') || name.includes('fengyun')) {
        return 70;
      }
      if (cat === 'gnss' || name.includes('gps') || name.includes('glo-ops') || name.includes('galileo') || name.includes('beidou')) {
        return 60;
      }
      if (cat === 'starlink' || cat === 'oneweb' || name.includes('iridium') || name.includes('orbcomm')) {
        return 50;
      }
    } else {
      // Fallback keyword parsing using entity name if store lookup is missing
      const name = (entity.name || "").toLowerCase();
      if (name.includes('tiangong') || name.includes('space station')) {
        return 80;
      }
      if (name.includes('noaa') || name.includes('goes') || name.includes('meteor') || name.includes('fengyun')) {
        return 70;
      }
      if (name.includes('gps') || name.includes('glo-ops') || name.includes('galileo') || name.includes('beidou')) {
        return 60;
      }
      if (name.includes('starlink') || name.includes('oneweb') || name.includes('iridium') || name.includes('orbcomm')) {
        return 50;
      }
    }

    return 40; // Default Generic Satellites
  }

  return 0; // Default background decoration / other entities
}
