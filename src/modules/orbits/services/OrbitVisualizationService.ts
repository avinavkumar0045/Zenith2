import { useSatelliteStore } from '../../satellites/store/useSatelliteStore';
import { useOrbitStore } from '../store/useOrbitStore';
import { TrajectoryService } from './TrajectoryService';
import { GroundTrackService } from './GroundTrackService';
import { OrbitIntelligenceObject } from '../types/orbit.types';

class OrbitVisualizationServiceClass {
  private unsubscribe: (() => void) | null = null;
  private updateInterval: any = null;

  public initialize() {
    if (this.unsubscribe) return;

    // Listen to satellite selection changes
    this.unsubscribe = useSatelliteStore.subscribe((state, prevState) => {
      // Re-run ONLY if the selected satellite ID changed. 
      // Do not re-run just because coordinates updated.
      if (state.selectedSatellite?.id !== prevState.selectedSatellite?.id) {
        this.updateOrbitVisualization(state.selectedSatellite);
      }
    });

    // Automatically recalculate orbits periodically to advance the future/past paths
    this.updateInterval = setInterval(() => {
      const { selectedSatellite } = useSatelliteStore.getState();
      if (selectedSatellite) {
        this.updateOrbitVisualization(selectedSatellite);
      }
    }, 90000); // Phase 5.5: Update paths every 90 seconds

  }

  private updateOrbitVisualization(satellite: any | null) {
    if (!satellite) {
      useOrbitStore.getState().setActiveOrbit(null);
      return;
    }

    const trajectories = TrajectoryService.generateTrajectory(satellite, 30, 90, 2);
    
    // The ground track combines past and future, but we usually want to show where it's going.
    // For simplicity, we'll project the future path.
    const groundTrackPoints = GroundTrackService.generateGroundTrack(trajectories.future);

    // Estimate orbital period (using Kepler's Third Law simplification or hardcode approx for LEO)
    // Most LEO satellites are ~90-100 mins.
    const periodMinutes = 95; 

    const orbitObj: OrbitIntelligenceObject = {
      satelliteId: satellite.id,
      category: satellite.category,
      pastOrbitPoints: trajectories.past,
      futureOrbitPoints: trajectories.future,
      groundTrackPoints,
      periodMinutes,
      inclination: satellite.inclination,
      altitude: satellite.altitude,
      velocity: satellite.velocity,
      lastUpdated: Date.now()
    };

    useOrbitStore.getState().setActiveOrbit(orbitObj);
  }

  public destroy() {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }
}

export const OrbitVisualizationService = new OrbitVisualizationServiceClass();
