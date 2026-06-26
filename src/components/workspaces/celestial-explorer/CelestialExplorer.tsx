import React, { useMemo } from 'react';
import { CelestialExplorerDrawer } from './CelestialExplorerDrawer';
import { CelestialExplorerContent } from './CelestialExplorerContent';
import { ExplorerEngine } from './engine/ExplorerEngine';
import { ExplorerObject, useCelestialExplorerStore } from './CelestialExplorer.types';
import { useLocationStore } from '@/modules/location/store/useLocationStore';
import { useWeatherStore } from '@/modules/weather/store/useWeatherStore';
import { useMoonStore } from '@/modules/moon/store/useMoonStore';
import { useMoonPositionStore } from '@/modules/moon/store/useMoonPositionStore';
import { usePlanetStore } from '@/modules/planets/store/usePlanetStore';
import { useSatelliteStore } from '@/modules/satellites/store/useSatelliteStore';
import { useISSStore } from '@/modules/iss/store/useISSStore';
import { useConstellationStore } from '@/modules/constellations/store/useConstellationStore';
import { CameraService } from '@/modules/globe/services/CameraService';
import { CommandIslandAPI } from '@/components/ui/command-island/CommandIslandState';

interface CelestialExplorerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CelestialExplorer: React.FC<CelestialExplorerProps> = ({ isOpen, onClose }) => {
  // 1. Subscribe to external domain stores to trigger reactive updates
  const activeLocation = useLocationStore((state) => state.activeLocation);
  const weather = useWeatherStore((state) => state.weather);
  const moonData = useMoonStore((state) => state.moonData);
  const moonPos = useMoonPositionStore((state) => state.subLunarLatitude); // track position changes
  const planets = usePlanetStore((state) => state.planets);
  const activeSatellites = useSatelliteStore((state) => state.activeSatellites);
  const iss = useISSStore((state) => state.iss);
  const constellations = useConstellationStore((state) => state.constellations);

  // 2. Subscribe to UI store query and category filters
  const { searchQuery, activeCategory, resetStore } = useCelestialExplorerStore();

  // Reset store when closed
  React.useEffect(() => {
    if (!isOpen) {
      resetStore();
    }
  }, [isOpen, resetStore]);

  // 3. Compile ExplorerModel reactively via pipeline compilation
  const model = useMemo(() => {
    if (!activeLocation) return null;
    return ExplorerEngine.compileModel(searchQuery, activeCategory);
  }, [
    activeLocation,
    weather,
    moonData,
    moonPos,
    planets,
    activeSatellites,
    iss,
    constellations,
    searchQuery,
    activeCategory
  ]);

  // 4. Handle Focus Action (runs camera flight & notifies Command Island)
  const handleFocusObject = (obj: ExplorerObject) => {
    if (!obj.coordinates) return;
    const { longitude, latitude, altitude } = obj.coordinates;

    // Stop tracking first to allow free flight
    CameraService.stopTracking();

    if (obj.type === 'satellites') {
      const sat = obj.originalData;
      if (sat) {
        CameraService.focusLocation(longitude, latitude, Math.max(altitude || 1000000, 1000000));
        // Track the entity after a small delay to align with the camera trajectory
        setTimeout(() => {
          CameraService.trackEntity(sat.id);
        }, 100);
        useSatelliteStore.getState().setSelectedSatellite(sat);
        CommandIslandAPI.showNotification(`Tracking Satellite: ${obj.name}`, 2);
      }
    } else if (obj.type === 'stations') {
      const station = obj.originalData;
      if (station) {
        CameraService.focusLocation(longitude, latitude, Math.max(altitude || 1000000, 1000000));
        setTimeout(() => {
          CameraService.trackEntity(station.id);
        }, 100);
        
        if (station.id === 'sat_25544') { // ISS
          useISSStore.getState().setIsTracking(true);
        }
        useSatelliteStore.getState().setSelectedSatellite(station);
        CommandIslandAPI.showNotification(`Tracking Space Station: ${obj.name}`, 2);
      }
    } else if (obj.type === 'planets') {
      const planet = obj.originalData;
      if (planet) {
        CameraService.focusLocation(longitude, latitude, altitude || 5000000.0);
        usePlanetStore.getState().setSelectedPlanet(planet.id);
        CommandIslandAPI.showNotification(`Tracking Planet: ${obj.name}`, 2);
      }
    } else if (obj.type === 'moon') {
      CameraService.focusLocation(longitude, latitude, altitude || 5000000.0);
      CommandIslandAPI.showNotification(`Tracking Moon`, 2);
    } else if (obj.type === 'constellations') {
      CameraService.focusLocation(longitude, latitude, altitude || 8000000.0);
      CommandIslandAPI.showNotification(`Tracking Constellation: ${obj.name}`, 2);
    } else if (obj.type === 'deep-sky') {
      CameraService.focusLocation(longitude, latitude, altitude || 10000000.0);
      CommandIslandAPI.showNotification(`Tracking Deep Sky: ${obj.name}`, 2);
    }
  };

  return (
    <CelestialExplorerDrawer isOpen={isOpen} onClose={onClose}>
      <CelestialExplorerContent
        model={model}
        onClose={onClose}
        onFocusObject={handleFocusObject}
      />
    </CelestialExplorerDrawer>
  );
};
export default CelestialExplorer;
