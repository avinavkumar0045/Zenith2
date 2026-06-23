import * as Cesium from 'cesium';

export interface IMarkerOptions {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  altitude?: number;
  color?: string;
  size?: number;
}

class MarkerServiceClass {
  /**
   * Helper function to create a standardized Cesium Entity for points of interest.
   * Modules can use this to generate entities to pass to their specific layers.
   */
  public createGenericMarker(options: IMarkerOptions): Cesium.Entity.ConstructorOptions {
    const alt = options.altitude ?? 0;
    return {
      id: options.id,
      name: options.name,
      position: Cesium.Cartesian3.fromDegrees(options.longitude, options.latitude, alt),
      point: {
        pixelSize: options.size ?? 10,
        color: options.color ? Cesium.Color.fromCssColorString(options.color) : Cesium.Color.WHITE,
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
      },
      label: {
        text: options.name,
        font: '14pt sans-serif',
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        outlineWidth: 2,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        pixelOffset: new Cesium.Cartesian2(0, -15),
      }
    };
  }

  /**
   * Helper function specifically for satellites
   */
  public createSatelliteMarker(options: IMarkerOptions): Cesium.Entity.ConstructorOptions {
    const base = this.createGenericMarker({
      ...options,
      color: options.color ?? '#f59e0b', // Amber color for satellites
      size: options.size ?? 6
    });

    // We can add specific paths or models here in the future
    return {
      ...base,
      description: `Satellite: ${options.name}`
    };
  }
}

export const MarkerService = new MarkerServiceClass();
