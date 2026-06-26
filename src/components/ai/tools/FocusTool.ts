import { CameraService } from '@/modules/globe/services/CameraService';
import { ExplorerAPI } from '../api/ExplorerAPI';
import { EventBus } from '../orchestrator/EventBus';

export class FocusTool {
  public static execute(payload: { targetId?: string; targetName?: string; coords?: { latitude: number; longitude: number; altitude?: number } }): string {
    if (payload.targetId) {
      const cleanId = payload.targetId.replace('sat_', '').replace('station_', '').replace('planet_', '').replace('const_', '').replace('deepsky_', '');
      let obj = ExplorerAPI.getObjectById(payload.targetId);
      if (!obj) obj = ExplorerAPI.getObjectById(cleanId);
      if (!obj) obj = ExplorerAPI.getObjectById(`sat_${cleanId}`);
      if (!obj) obj = ExplorerAPI.getObjectById(`station_${cleanId}`);

      if (obj && obj.coordinates) {
        CameraService.stopTracking();
        const alt = obj.coordinates.altitude || 2000000;
        CameraService.focusLocation(obj.coordinates.longitude, obj.coordinates.latitude, alt);
        
        const isOrbitable = obj.type === 'satellites' || obj.type === 'stations' || obj.id === 'sat_25544' || obj.id.includes('25544');
        if (isOrbitable) {
          const actualId = obj.originalData?.id || obj.id;
          setTimeout(() => {
            CameraService.trackEntity(actualId);
          }, 100);
        }
        
        ExplorerAPI.setSelectedObject(obj.id);
        EventBus.emit('focusTarget', { targetId: obj.id, targetName: obj.name, coords: obj.coordinates });
        return `Camera focused and locked onto: ${obj.name}`;
      }
    }
    
    if (payload.targetName) {
      const obj = ExplorerAPI.findByName(payload.targetName);
      if (obj && obj.coordinates) {
        CameraService.stopTracking();
        const alt = obj.coordinates.altitude || 2000000;
        CameraService.focusLocation(obj.coordinates.longitude, obj.coordinates.latitude, alt);
        
        const isOrbitable = obj.type === 'satellites' || obj.type === 'stations' || obj.id === 'sat_25544' || obj.id.includes('25544');
        if (isOrbitable) {
          const actualId = obj.originalData?.id || obj.id;
          setTimeout(() => {
            CameraService.trackEntity(actualId);
          }, 100);
        }
        ExplorerAPI.setSelectedObject(obj.id);
        EventBus.emit('focusTarget', { targetId: obj.id, targetName: obj.name, coords: obj.coordinates });
        return `Camera focused and locked onto: ${obj.name}`;
      }
    }

    if (payload.coords) {
      CameraService.stopTracking();
      CameraService.focusLocation(payload.coords.longitude, payload.coords.latitude, payload.coords.altitude || 2000000.0);
      EventBus.emit('focusTarget', { coords: payload.coords });
      return `Focused camera on coordinates: Lat ${payload.coords.latitude.toFixed(4)}, Lon ${payload.coords.longitude.toFixed(4)}`;
    }

    // Default reset
    CameraService.resetView();
    ExplorerAPI.setSelectedObject(null);
    EventBus.emit('focusTarget', null);
    return `Reset camera to global overview.`;
  }
}
export default FocusTool;
