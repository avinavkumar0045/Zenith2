import { AIContext } from '../ZenithAI.types';
import { SkyAPI } from '../api/SkyAPI';
import { TimelineAPI } from '../api/TimelineAPI';
import { ExplorerAPI } from '../api/ExplorerAPI';
import { VisualizationAPI } from '../api/VisualizationAPI';
import { FeedAPI } from '../api/FeedAPI';
import { useWorkingMemoryStore } from '../memory/WorkingMemory';

export class ContextBuilder {
  /**
   * Compiles all current subsystem states into a single immutable context snapshot.
   */
  public static buildContext(): AIContext {
    const activeLoc = SkyAPI.getActiveLocation();
    const weatherData = SkyAPI.getWeather();
    const playback = TimelineAPI.getPlayback();
    const visState = VisualizationAPI.getLayersState();
    const selectedObjId = ExplorerAPI.getSelectedObjectId();
    const activeSess = FeedAPI.getActiveSession();
    const currentGoal = useWorkingMemoryStore.getState().currentGoal;

    let selectedObjectDetails = null;
    if (selectedObjId) {
      const obj = ExplorerAPI.getObjectById(selectedObjId);
      if (obj) {
        selectedObjectDetails = {
          id: obj.id,
          name: obj.name,
          type: obj.type
        };
      }
    }

    return {
      location: activeLoc ? {
        latitude: activeLoc.latitude,
        longitude: activeLoc.longitude,
        name: activeLoc.name
      } : null,
      weather: weatherData ? {
        condition: weatherData.condition,
        cloudCover: weatherData.cloudCover,
        temperature: weatherData.temperature,
        scoreMultiplier: weatherData.scoreMultiplier
      } : null,
      timeline: {
        currentTime: TimelineAPI.getCurrentTime().toISOString(),
        selectedTime: TimelineAPI.getSelectedTime().toISOString(),
        isPlaying: playback.isPlaying,
        playbackSpeed: playback.playbackSpeed
      },
      visualization: {
        activeProfile: visState.activeProfile,
        showPlanets: visState.showPlanets,
        showMoon: visState.showMoon,
        showISS: visState.showISS,
        showSatellites: visState.showSatellites,
        showAtmosphere: visState.showAtmosphere,
        showClouds: visState.showClouds,
        showGroundTracks: visState.showGroundTracks,
        showGrid: visState.showGrid
      },
      selectedObject: selectedObjectDetails,
      activeSession: activeSess ? {
        targetId: activeSess.targetId,
        targetName: activeSess.targetName,
        startTime: activeSess.startTime,
        durationMinutes: activeSess.durationMinutes
      } : null,
      userGoal: currentGoal
    };
  }
}
export default ContextBuilder;
