import { useISSStore } from '../store/useISSStore';
import { useSatelliteStore } from '../../satellites/store/useSatelliteStore';
import { CameraService } from '../../globe/services/CameraService';

export const useISS = () => {
  const { isTracking, setIsTracking } = useISSStore();
  const { setSelectedSatellite } = useSatelliteStore();

  const locateISS = () => {
    const { iss } = useISSStore.getState();
    if (iss) {
      CameraService.focusLocation(iss.longitude, iss.latitude, Math.max(iss.altitude, 1000000));
      CameraService.trackEntity(iss.id);
      setIsTracking(true);
      setSelectedSatellite(iss);
    }
  };

  const stopTracking = () => {
    CameraService.stopTracking();
    setIsTracking(false);
    setSelectedSatellite(null);
  };

  return {
    isTracking,
    locateISS,
    stopTracking
  };
};

