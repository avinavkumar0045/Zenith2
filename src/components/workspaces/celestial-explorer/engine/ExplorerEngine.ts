import { usePlanetStore } from '@/modules/planets/store/usePlanetStore';
import { useMoonStore } from '@/modules/moon/store/useMoonStore';
import { useMoonPositionStore } from '@/modules/moon/store/useMoonPositionStore';
import { useSatelliteStore } from '@/modules/satellites/store/useSatelliteStore';
import { useISSStore } from '@/modules/iss/store/useISSStore';
import { useConstellationStore } from '@/modules/constellations/store/useConstellationStore';
import { useLocationStore } from '@/modules/location/store/useLocationStore';
import { useWeatherStore } from '@/modules/weather/store/useWeatherStore';
import { ExplorerObject, ExplorerCategory, ExplorerModel } from '../CelestialExplorer.types';
import { getDirectionLabel, calculateAltAzForEquatorial, getSubPointFromEquatorial, calculateSatelliteAltAz } from '../CelestialExplorer.utils';
import { SearchEngine } from './SearchEngine';
import { RankingEngine } from './RankingEngine';
import { FeaturedEngine } from './FeaturedEngine';

export interface DeepSkyCatalogItem {
  id: string;
  name: string;
  abbreviation: string;
  rightAscension: number; // hours
  declination: number; // degrees
  description: string;
}

export const DEEP_SKY_CATALOG: DeepSkyCatalogItem[] = [
  { id: 'm31', name: 'Andromeda Galaxy', abbreviation: 'M31', rightAscension: 0.712, declination: 41.27, description: 'The nearest major spiral galaxy to the Milky Way, visible as a soft glow in the night sky.' },
  { id: 'm42', name: 'Orion Nebula', abbreviation: 'M42', rightAscension: 5.588, declination: -5.38, description: 'A stellar nursery where new stars are forming, situated in Orion\'s sword.' },
  { id: 'm45', name: 'Pleiades', abbreviation: 'M45', rightAscension: 3.78, declination: 24.1, description: 'An open cluster of bright blue stars, easily visible to the naked eye in Taurus.' },
  { id: 'm13', name: 'Hercules Cluster', abbreviation: 'M13', rightAscension: 16.69, declination: 36.46, description: 'A massive globular cluster containing hundreds of thousands of stars.' },
  { id: 'm57', name: 'Ring Nebula', abbreviation: 'M57', rightAscension: 18.89, declination: 33.03, description: 'A planetary nebula in Lyra, representing the shroud of a dying star.' },
  { id: 'm1', name: 'Crab Nebula', abbreviation: 'M1', rightAscension: 5.575, declination: 22.01, description: 'A supernova remnant in Taurus, observed historically in 1054 AD.' },
];

export class ExplorerEngine {
  /**
   * Aggregates raw astronomical store records and projects them relative to observer position.
   */
  public static compileRawObjects(): ExplorerObject[] {
    const { activeLocation } = useLocationStore.getState();
    if (!activeLocation) return [];

    const { weather } = useWeatherStore.getState();
    const weatherMultiplier = weather?.scoreMultiplier ?? 1.0;
    const observerLat = activeLocation.latitude;
    const observerLon = activeLocation.longitude;
    const date = new Date();

    const compiled: ExplorerObject[] = [];

    // 1. Compile Planets
    const planetsObj = usePlanetStore.getState().planets;
    if (planetsObj) {
      Object.values(planetsObj).forEach((p) => {
        compiled.push({
          id: `planet_${p.id}`,
          name: p.name,
          type: 'planets',
          visibilityState: p.isAboveHorizon ? 'Visible' : 'Below Horizon',
          observationRating: Math.round(p.observationScore),
          bestObservationTime: p.riseTime ? `Rise: ${p.riseTime}` : 'N/A',
          direction: getDirectionLabel(p.azimuth),
          altitude: p.altitude,
          description: `Major solar planet ${p.name}. Distance: ${p.distance.toFixed(2)} AU.`,
          coordinates: {
            latitude: p.subPlanetLatitude,
            longitude: p.subPlanetLongitude,
            altitude: 5000000.0 // Zoom scale in meters
          },
          originalData: p
        });
      });
    }

    // 2. Compile Moon
    const moonData = useMoonStore.getState().moonData;
    const moonPos = useMoonPositionStore.getState();
    if (moonData) {
      compiled.push({
        id: 'moon_primary',
        name: 'Moon',
        type: 'moon',
        visibilityState: moonData.isVisible ? 'Visible' : 'Below Horizon',
        observationRating: Math.round(moonData.observationScore),
        bestObservationTime: moonData.moonrise ? `Rise: ${moonData.moonrise}` : 'N/A',
        direction: getDirectionLabel(moonData.azimuth),
        altitude: moonData.altitude,
        description: `Earth's satellite. Phase: ${moonData.phaseName} (${Math.round(moonData.illumination * 100)}% Illuminated).`,
        coordinates: {
          latitude: moonPos.subLunarLatitude ?? 0,
          longitude: moonPos.subLunarLongitude ?? 0,
          altitude: 384400.0 * 1000 // Convert km to meters
        },
        originalData: moonData
      });
    }

    // 3. Compile Space Stations (ISS + any other stations)
    const iss = useISSStore.getState().iss;
    const satellites = useSatelliteStore.getState().activeSatellites;

    if (iss) {
      const altAz = calculateSatelliteAltAz(observerLat, observerLon, iss.latitude, iss.longitude, iss.altitude);
      const isVisible = altAz.altitude > 0;
      
      let score = 0;
      if (isVisible) {
        score = Math.round((altAz.altitude / 90.0) * 8.0 + 2.0);
        score = Math.min(10, Math.max(0, score * weatherMultiplier));
      }

      compiled.push({
        id: `station_${iss.id}`,
        name: 'ISS (Space Station)',
        type: 'stations',
        visibilityState: isVisible ? 'In Orbit (Visible)' : 'Below Horizon',
        observationRating: score,
        bestObservationTime: 'Real-time tracking',
        direction: getDirectionLabel(altAz.azimuth),
        altitude: altAz.altitude,
        description: `International Space Station. Speed: ${(iss.velocity || 27600).toFixed(0)} km/h. Crew: ${iss.crewCount ?? 7}.`,
        coordinates: {
          latitude: iss.latitude,
          longitude: iss.longitude,
          altitude: iss.altitude
        },
        originalData: iss
      });
    }

    // Add other stations from activeSatellites (where category is stations or contains "station")
    satellites.forEach((sat) => {
      const isStationCategory = sat.category === 'stations' || sat.name.toLowerCase().includes('station');
      if (isStationCategory && (!iss || sat.id !== iss.id)) {
        const altAz = calculateSatelliteAltAz(observerLat, observerLon, sat.latitude, sat.longitude, sat.altitude);
        const isVisible = altAz.altitude > 0;
        
        let score = 0;
        if (isVisible) {
          score = Math.round((altAz.altitude / 90.0) * 8.0 + 2.0);
          score = Math.min(10, Math.max(0, score * weatherMultiplier));
        }

        compiled.push({
          id: `station_${sat.id}`,
          name: sat.name,
          type: 'stations',
          visibilityState: isVisible ? 'Visible' : 'Below Horizon',
          observationRating: score,
          bestObservationTime: 'Orbit pass prediction',
          direction: getDirectionLabel(altAz.azimuth),
          altitude: altAz.altitude,
          description: `NORAD ID: ${sat.noradId}. Altitude: ${(sat.altitude / 1000).toFixed(0)} km.`,
          coordinates: {
            latitude: sat.latitude,
            longitude: sat.longitude,
            altitude: sat.altitude
          },
          originalData: sat
        });
      }
    });

    // 4. Compile Active Satellites (excluding stations)
    satellites.forEach((sat) => {
      const isStationCategory = sat.category === 'stations' || sat.name.toLowerCase().includes('station');
      if (!isStationCategory && (!iss || sat.id !== iss.id)) {
        const altAz = calculateSatelliteAltAz(observerLat, observerLon, sat.latitude, sat.longitude, sat.altitude);
        const isVisible = altAz.altitude > 0;
        
        let score = 0;
        if (isVisible) {
          score = Math.round((altAz.altitude / 90.0) * 8.0 + 2.0);
          score = Math.min(10, Math.max(0, score * weatherMultiplier));
        }

        compiled.push({
          id: `sat_${sat.id}`,
          name: sat.name,
          type: 'satellites',
          visibilityState: isVisible ? 'In Orbit' : 'Below Horizon',
          observationRating: score,
          bestObservationTime: 'Orbital window',
          direction: getDirectionLabel(altAz.azimuth),
          altitude: altAz.altitude,
          description: `NORAD: ${sat.noradId}. Cat: ${sat.category || 'Active'}. Alt: ${(sat.altitude / 1000).toFixed(0)} km.`,
          coordinates: {
            latitude: sat.latitude,
            longitude: sat.longitude,
            altitude: sat.altitude
          },
          originalData: sat
        });
      }
    });

    // 5. Compile Constellations
    const constellationsList = useConstellationStore.getState().constellations;
    constellationsList.forEach((c) => {
      const subPoint = getSubPointFromEquatorial(c.rightAscension, c.declination, date);
      compiled.push({
        id: `const_${c.id}`,
        name: c.name,
        type: 'constellations',
        visibilityState: c.isVisible ? 'Visible' : 'Below Horizon',
        observationRating: Math.round(c.visibilityScore),
        bestObservationTime: 'Best: 21:00 - 03:00',
        direction: getDirectionLabel(c.azimuth),
        altitude: c.altitude,
        description: c.description || `The constellation ${c.name} (${c.abbreviation}).`,
        coordinates: {
          latitude: subPoint.latitude,
          longitude: subPoint.longitude,
          altitude: 8000000.0 // Zoom scale in meters
        },
        originalData: c
      });
    });

    // 6. Compile Deep Sky Objects
    DEEP_SKY_CATALOG.forEach((dso) => {
      const altAz = calculateAltAzForEquatorial(dso.rightAscension, dso.declination, observerLat, observerLon, date);
      const isVisible = altAz.altitude > 0;
      const subPoint = getSubPointFromEquatorial(dso.rightAscension, dso.declination, date);

      // Deep sky observations drop score if Moon is bright and visible
      const moonIllum = moonData ? moonData.illumination : 0.0;
      const moonPenalty = (moonData && moonData.isVisible) ? moonIllum * 4.0 : 0.0;

      let score = 0;
      if (isVisible) {
        score = Math.round((altAz.altitude / 90.0) * 8.0 + 2.0 - moonPenalty);
        score = Math.min(10, Math.max(0, score * weatherMultiplier));
      }

      compiled.push({
        id: `deepsky_${dso.id}`,
        name: dso.name,
        type: 'deep-sky',
        visibilityState: isVisible ? 'Visible' : 'Below Horizon',
        observationRating: score,
        bestObservationTime: 'Best: Dark sky transit',
        direction: getDirectionLabel(altAz.azimuth),
        altitude: altAz.altitude,
        description: dso.description,
        coordinates: {
          latitude: subPoint.latitude,
          longitude: subPoint.longitude,
          altitude: 10000000.0 // Zoom scale in meters
        },
        originalData: dso
      });
    });

    return compiled;
  }

  /**
   * Runs the complete pipeline (Aggregation -> Search -> Ranking -> Featured curation)
   * returning a unified, presentation-ready ExplorerModel.
   */
  public static compileModel(query: string, category: ExplorerCategory | 'all'): ExplorerModel {
    const raw = ExplorerEngine.compileRawObjects();
    const filtered = SearchEngine.filterObjects(raw, query, category);
    const ranked = RankingEngine.rankObjects(filtered);
    return FeaturedEngine.compileModel(raw, ranked, query, category);
  }
}
