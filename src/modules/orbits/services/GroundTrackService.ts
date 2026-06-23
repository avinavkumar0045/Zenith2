import { OrbitPoint } from '../types/orbit.types';

class GroundTrackServiceClass {
  
  /**
   * Projects a 3D orbital trajectory onto the 2D surface of the Earth.
   * Returns an array of coordinates where altitude is forced to 0 (surface level).
   */
  public generateGroundTrack(trajectory: OrbitPoint[]): OrbitPoint[] {
    // To avoid lines cutting through the Earth when crossing the international date line,
    // advanced logic is needed. For Phase 3A, we'll provide the raw points but force altitude to 0.
    // The OrbitLayer handles the visual wrapping.
    
    return trajectory.map(point => ({
      ...point,
      altitude: 0 // Snap to surface
    }));
  }
}

export const GroundTrackService = new GroundTrackServiceClass();
