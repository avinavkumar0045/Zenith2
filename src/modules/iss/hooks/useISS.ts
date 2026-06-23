import { useISSStore } from '../store/useISSStore';
import { useSatelliteStore } from '../../satellites/store/useSatelliteStore';
import { CameraService } from '../../globe/services/CameraService';

export const useISS = () => {
  const { iss, isTracking, setIsTracking } = useISSStore();
  const { setSelectedSatellite } = useSatelliteStore();

  const locateISS = () => {
    if (iss) {
      CameraService.focusLocation(iss.longitude, iss.latitude, Math.max(iss.altitude, 1000000));
      // Focus doesn't necessarily track, but we can engage track immediately
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
    iss,
    isTracking,
    locateISS,
    stopTracking
  };
};

