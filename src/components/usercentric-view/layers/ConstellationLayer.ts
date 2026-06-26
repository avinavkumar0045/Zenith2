import * as Cesium from 'cesium';
import { BaseSkyLayer } from './BaseSkyLayer';
import { ObserverLocation } from '../UserCentricView.types';
import { CONSTELLATION_CONNECTIONS, BRIGHT_STARS } from '../assets/starCatalog';
import { CelestialProjectionEngine } from '../engine/CelestialProjectionEngine';
import { SkyDomeRadiusService } from '../engine/SkyDomeRadiusService';
import { CameraController } from '../services/CameraController';

export class ConstellationLayer extends BaseSkyLayer {
  private polylineCollection: Cesium.PolylineCollection | null = null;
  private labelsCollection: Cesium.LabelCollection | null = null;
  private linesMap: Map<string, Cesium.Polyline[]> = new Map();
  private labelsMap: Map<string, Cesium.Label> = new Map();
  private selectedConstellationId: string | null = null;

  constructor() {
    super('constellation-layer');
  }

  protected onInitialize(): void {
    if (!this.viewer) return;

    this.polylineCollection = this.viewer.scene.primitives.add(new Cesium.PolylineCollection());
    this.labelsCollection = this.viewer.scene.primitives.add(new Cesium.LabelCollection());

    this.createConstellationLines();
  }

  private createConstellationLines(): void {
    if (!this.viewer || !this.polylineCollection || !this.labelsCollection || !this.observerPosition) return;

    const dummyPos = new Cesium.Cartesian3(0, 0, 0);

    CONSTELLATION_CONNECTIONS.forEach((c) => {
      const linesForConstellation: Cesium.Polyline[] = [];

      c.connections.forEach(([starIdA, starIdB]) => {
        const starA = BRIGHT_STARS.find(s => s.id === starIdA);
        const starB = BRIGHT_STARS.find(s => s.id === starIdB);
        if (!starA || !starB) return;

        // Add a line primitive
        const line = this.polylineCollection!.add({
          positions: [dummyPos, dummyPos],
          width: 1.0,
          show: true
        });
        line.material = Cesium.Material.fromType('Color', {
          color: Cesium.Color.fromCssColorString('rgba(255, 255, 255, 0.12)')
        });

        // Store custom tags for picking
        (line as any).constellationId = c.constellationId;
        (line as any).isConstellationLine = true;
        (line as any).starA = starA;
        (line as any).starB = starB;

        linesForConstellation.push(line);
      });

      this.linesMap.set(c.constellationId, linesForConstellation);

      // Add a label for the constellation name at its center
      // Calculate approximate center RA and Dec of the constellation
      let sumRa = 0;
      let sumDec = 0;
      let count = 0;
      
      c.connections.forEach(([starIdA, starIdB]) => {
        const starA = BRIGHT_STARS.find(s => s.id === starIdA);
        const starB = BRIGHT_STARS.find(s => s.id === starIdB);
        if (starA) { sumRa += starA.ra; sumDec += starA.dec; count++; }
        if (starB) { sumRa += starB.ra; sumDec += starB.dec; count++; }
      });

      const avgRa = count > 0 ? sumRa / count : 12.0;
      const avgDec = count > 0 ? sumDec / count : 0.0;

      const label = this.labelsCollection!.add({
        position: dummyPos,
        text: c.name.toUpperCase(),
        font: '10pt Outfit, Inter, sans-serif',
        fillColor: Cesium.Color.fromCssColorString('rgba(255, 255, 255, 0.55)'),
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE,
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        verticalOrigin: Cesium.VerticalOrigin.CENTER,
        disableDepthTestDistance: Number.POSITIVE_INFINITY
      });

      (label as any).constellationId = c.constellationId;
      (label as any).ra = avgRa;
      (label as any).dec = avgDec;

      this.labelsMap.set(c.constellationId, label);
    });
  }

  protected onUpdate(
    date: Date, 
    observerLocation: ObserverLocation, 
    observerPosition: Cesium.Cartesian3
  ): void {
    if (!this.viewer || !this.polylineCollection || !this.labelsCollection) return;

    let cloudCover = 0.0;
    try {
      const { weather } = require('@/modules/weather/store/useWeatherStore').useWeatherStore.getState();
      if (weather) cloudCover = (weather.cloudCover ?? 0) / 100.0;
    } catch (e) {}

    const globalCloudOpacity = 1.0 - cloudCover;

    const currentFov = CameraController.currentFov;
    const baseRadius = SkyDomeRadiusService.getAdaptiveRadius(currentFov);
    const lineRadius = baseRadius * 1.12; // slightly closer than stars so lines render underneath points cleanly
    const labelRadius = baseRadius * 1.09;

    // Update lines position
    this.linesMap.forEach((lines, constellationId) => {
      const isSelected = constellationId === this.selectedConstellationId;

      lines.forEach((line) => {
        const starA = (line as any).starA;
        const starB = (line as any).starB;

        const posA = CelestialProjectionEngine.projectCelestial(
          starA.ra,
          starA.dec,
          observerLocation.latitude,
          observerLocation.longitude,
          date,
          observerPosition,
          lineRadius
        );

        const posB = CelestialProjectionEngine.projectCelestial(
          starB.ra,
          starB.dec,
          observerLocation.latitude,
          observerLocation.longitude,
          date,
          observerPosition,
          lineRadius
        );

        line.positions = [posA, posB];

        // Check if visible above horizon
        const altA = CelestialProjectionEngine.getAltAz(starA.ra, starA.dec, observerLocation.latitude, observerLocation.longitude, date).altitude;
        const altB = CelestialProjectionEngine.getAltAz(starB.ra, starB.dec, observerLocation.latitude, observerLocation.longitude, date).altitude;

        const isAboveHorizon = altA > 0 || altB > 0;

        if (isAboveHorizon && this.isVisible) {
          line.show = true;
          // Stylize selected constellation
          if (this.selectedConstellationId !== null) {
            if (isSelected) {
              line.width = 2.5;
              line.material.uniforms.color = Cesium.Color.fromCssColorString('rgba(0, 230, 255, 0.85)').withAlpha(globalCloudOpacity);
            } else {
              line.width = 1.0;
              line.material.uniforms.color = Cesium.Color.fromCssColorString('rgba(255, 255, 255, 0.05)').withAlpha(globalCloudOpacity);
            }
          } else {
            // Default styled lines
            line.width = 1.2;
            line.material.uniforms.color = Cesium.Color.fromCssColorString('rgba(255, 255, 255, 0.15)').withAlpha(globalCloudOpacity);
          }
        } else {
          line.show = false;
        }
      });
    });

    // Update labels position
    this.labelsMap.forEach((label, constellationId) => {
      const isSelected = constellationId === this.selectedConstellationId;
      const ra = (label as any).ra;
      const dec = (label as any).dec;

      const altAz = CelestialProjectionEngine.getAltAz(
        ra,
        dec,
        observerLocation.latitude,
        observerLocation.longitude,
        date
      );

      const globalPos = CelestialProjectionEngine.altAzToCartesian(
        altAz.altitude,
        altAz.azimuth,
        observerPosition,
        labelRadius
      );

      label.position = globalPos;

      const isAboveHorizon = altAz.altitude > 5.0;

      if (isAboveHorizon && this.isVisible) {
        label.show = true;
        if (this.selectedConstellationId !== null) {
          if (isSelected) {
            label.fillColor = Cesium.Color.fromCssColorString('rgba(0, 230, 255, 0.95)').withAlpha(globalCloudOpacity);
            label.font = '12pt Outfit, Inter, sans-serif';
          } else {
            label.fillColor = Cesium.Color.fromCssColorString('rgba(255, 255, 255, 0.15)').withAlpha(globalCloudOpacity);
            label.font = '9pt Outfit, Inter, sans-serif';
          }
        } else {
          label.fillColor = Cesium.Color.fromCssColorString('rgba(255, 255, 255, 0.55)').withAlpha(globalCloudOpacity);
          label.font = '10pt Outfit, Inter, sans-serif';
        }
      } else {
        label.show = false;
      }
    });
  }

  /**
   * Highlights a constellation by its ID. Pass null to reset.
   */
  public selectConstellation(id: string | null): void {
    this.selectedConstellationId = id;
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
    this.linesMap.clear();
    this.labelsMap.clear();
  }
}
