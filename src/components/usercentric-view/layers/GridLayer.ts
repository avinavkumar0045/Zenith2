import * as Cesium from 'cesium';
import { BaseSkyLayer } from './BaseSkyLayer';
import { ObserverLocation } from '../UserCentricView.types';
import { CelestialProjectionEngine } from '../engine/CelestialProjectionEngine';

export class GridLayer extends BaseSkyLayer {
  private polylineCollection: Cesium.PolylineCollection | null = null;
  private labelsCollection: Cesium.LabelCollection | null = null;
  private lines: Cesium.Polyline[] = [];
  private labels: Cesium.Label[] = [];
  private lastObserverPosition: Cesium.Cartesian3 | null = null;

  constructor() {
    super('grid-layer');
  }

  protected onInitialize(): void {
    if (!this.viewer) return;

    this.polylineCollection = this.viewer.scene.primitives.add(new Cesium.PolylineCollection());
    this.labelsCollection = this.viewer.scene.primitives.add(new Cesium.LabelCollection());

    this.createGrid();
  }

  private createGrid(): void {
    if (!this.viewer || !this.polylineCollection || !this.labelsCollection || !this.observerPosition) return;

    const dummyPos = new Cesium.Cartesian3(0, 0, 0);
    const gridColor = Cesium.Color.fromCssColorString('rgba(34, 211, 238, 0.15)');
    const cardinalColor = Cesium.Color.fromCssColorString('rgba(34, 211, 238, 0.65)');
    const radius = 375000.0; // Slightly inside constellation lines and stars

    // 1. Create Altitude Rings (15°, 30°, 45°, 60°, 75°)
    const altitudes = [15, 30, 45, 60, 75];
    altitudes.forEach(alt => {
      // Draw circle by connecting Azimuth 0 to 360
      const points: Cesium.Cartesian3[] = [];
      for (let az = 0; az <= 360; az += 5) {
        points.push(dummyPos);
      }

      const line = this.polylineCollection!.add({
        positions: points,
        width: 1.0,
        show: true
      });
      line.material = Cesium.Material.fromType('Color', {
        color: gridColor
      });
      (line as any).gridAltitude = alt;
      this.lines.push(line);

      // Add a label on the North meridian for this altitude
      const altLabel = this.labelsCollection!.add({
        position: dummyPos,
        text: `${alt}°`,
        font: '8pt Outfit, Inter, sans-serif',
        fillColor: Cesium.Color.fromCssColorString('rgba(34, 211, 238, 0.4)'),
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        verticalOrigin: Cesium.VerticalOrigin.CENTER,
        disableDepthTestDistance: Number.POSITIVE_INFINITY
      });
      (altLabel as any).gridAltitude = alt;
      (altLabel as any).gridAzimuth = 0; // North meridian
      this.labels.push(altLabel);
    });

    // 2. Create Azimuth Lines (0°, 45°, 90°, 135°, 180°, 225°, 270°, 315°)
    const azimuths = [0, 45, 90, 135, 180, 225, 270, 315];
    azimuths.forEach(az => {
      const points: Cesium.Cartesian3[] = [];
      for (let alt = 0; alt <= 90; alt += 5) {
        points.push(dummyPos);
      }

      const line = this.polylineCollection!.add({
        positions: points,
        width: az % 90 === 0 ? 1.2 : 0.8, // Slightly thicker for N, E, S, W
        show: true
      });
      line.material = Cesium.Material.fromType('Color', {
        color: az % 90 === 0 ? cardinalColor.withAlpha(0.2) : gridColor
      });
      (line as any).gridAzimuth = az;
      this.lines.push(line);
    });

    // 3. Create Cardinal Direction Labels (N, NE, E, SE, S, SW, W, NW) at Altitude = 1°
    const directions = [
      { text: 'N', az: 0 },
      { text: 'NE', az: 45 },
      { text: 'E', az: 90 },
      { text: 'SE', az: 135 },
      { text: 'S', az: 180 },
      { text: 'SW', az: 225 },
      { text: 'W', az: 270 },
      { text: 'NW', az: 315 }
    ];

    directions.forEach(dir => {
      const label = this.labelsCollection!.add({
        position: dummyPos,
        text: dir.text,
        font: dir.text.length === 1 ? 'bold 12pt Outfit, Inter, sans-serif' : 'bold 9pt Outfit, Inter, sans-serif',
        fillColor: dir.text.length === 1 ? cardinalColor : cardinalColor.withAlpha(0.7),
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 3,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        verticalOrigin: Cesium.VerticalOrigin.CENTER,
        disableDepthTestDistance: Number.POSITIVE_INFINITY
      });
      (label as any).gridAltitude = 1.5; // Sit slightly above silhouettes
      (label as any).gridAzimuth = dir.az;
      this.labels.push(label);
    });
  }

  protected onUpdate(
    date: Date,
    observerLocation: ObserverLocation,
    observerPosition: Cesium.Cartesian3
  ): void {
    if (!this.viewer || !this.polylineCollection || !this.labelsCollection || !this.isVisible) return;

    const radius = 375000.0;

    // Check if we need to update Cartesian positions
    const positionChanged = !this.lastObserverPosition || !Cesium.Cartesian3.equals(this.lastObserverPosition, observerPosition);
    if (positionChanged) {
      this.lastObserverPosition = observerPosition.clone();
    }

    // Always update positions if observer position changed (or for security on every frame with low overhead)
    let altIndex = 0;
    let azIndex = 0;

    this.lines.forEach(line => {
      const gridAltitude = (line as any).gridAltitude;
      const gridAzimuth = (line as any).gridAzimuth;

      if (gridAltitude !== undefined) {
        // This is an altitude circle
        const pts: Cesium.Cartesian3[] = [];
        for (let az = 0; az <= 360; az += 5) {
          const pt = CelestialProjectionEngine.altAzToCartesian(gridAltitude, az, observerPosition, radius);
          pts.push(pt);
        }
        line.positions = pts;
      } 
      else if (gridAzimuth !== undefined) {
        // This is an azimuth line
        const pts: Cesium.Cartesian3[] = [];
        for (let alt = 0; alt <= 90; alt += 5) {
          const pt = CelestialProjectionEngine.altAzToCartesian(alt, gridAzimuth, observerPosition, radius);
          pts.push(pt);
        }
        line.positions = pts;
      }
    });

    this.labels.forEach(label => {
      const gridAltitude = (label as any).gridAltitude;
      const gridAzimuth = (label as any).gridAzimuth;
      if (gridAltitude !== undefined && gridAzimuth !== undefined) {
        label.position = CelestialProjectionEngine.altAzToCartesian(gridAltitude, gridAzimuth, observerPosition, radius - 2000.0);
      }
    });
  }

  protected onShow(): void {
    if (this.polylineCollection) this.polylineCollection.show = true;
    if (this.labelsCollection) this.labelsCollection.show = true;
  }

  protected onHide(): void {
    if (this.polylineCollection) this.polylineCollection.show = false;
    if (this.labelsCollection) this.labelsCollection.show = false;
  }

  protected onDestroy(): void {
    if (!this.viewer) return;
    if (this.polylineCollection) {
      this.viewer.scene.primitives.remove(this.polylineCollection);
      this.polylineCollection = null;
    }
    if (this.labelsCollection) {
      this.viewer.scene.primitives.remove(this.labelsCollection);
      this.labelsCollection = null;
    }
    this.lines = [];
    this.labels = [];
    this.lastObserverPosition = null;
  }
}
