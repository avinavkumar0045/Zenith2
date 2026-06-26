import * as Cesium from 'cesium';
import * as satellite from 'satellite.js';
import { BaseSkyLayer } from './BaseSkyLayer';
import { ObserverLocation } from '../UserCentricView.types';
import { CelestialProjectionEngine } from '../engine/CelestialProjectionEngine';
import { CameraController } from '../services/CameraController';
import { SkyDomeRadiusService } from '../engine/SkyDomeRadiusService';

export class SatelliteLayer extends BaseSkyLayer {
  private billboardCollection: Cesium.BillboardCollection | null = null;
  private polylineCollection: Cesium.PolylineCollection | null = null;
  
  private satelliteBillboards: Map<string, Cesium.Billboard> = new Map();
  private orbitPolyline: Cesium.Polyline | null = null;
  
  private dotTextureUrl = '';
  private issTextureUrl = '';

  constructor() {
    super('satellite-layer');
  }

  protected onInitialize(): void {
    if (!this.viewer) return;

    this.billboardCollection = this.viewer.scene.primitives.add(new Cesium.BillboardCollection());
    this.polylineCollection = this.viewer.scene.primitives.add(new Cesium.PolylineCollection());

    // 1. Generate generic satellite dot texture (white glowing dot)
    const dotCanvas = document.createElement('canvas');
    dotCanvas.width = 16;
    dotCanvas.height = 16;
    const dotCtx = dotCanvas.getContext('2d');
    if (dotCtx) {
      const grad = dotCtx.createRadialGradient(8, 8, 1, 8, 8, 8);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.3, '#33d6ff');
      grad.addColorStop(0.7, 'rgba(51, 214, 255, 0.3)');
      grad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');
      dotCtx.fillStyle = grad;
      dotCtx.fillRect(0, 0, 16, 16);
    }
    this.dotTextureUrl = dotCanvas.toDataURL();

    // 2. Generate ISS detailed structural icon texture (solar panels silhouette)
    const issCanvas = document.createElement('canvas');
    issCanvas.width = 64;
    issCanvas.height = 64;
    const issCtx = issCanvas.getContext('2d');
    if (issCtx) {
      // Draw solar panels
      issCtx.fillStyle = '#f5b041'; // golden solar cells
      issCtx.fillRect(4, 20, 14, 24); // Left panel 1
      issCtx.fillRect(46, 20, 14, 24); // Right panel 1
      
      // Draw trusses
      issCtx.fillStyle = '#bdc3c7'; // metal truss
      issCtx.fillRect(18, 29, 28, 6);
      issCtx.fillRect(30, 12, 4, 40);
      
      // Central modules
      issCtx.fillStyle = '#ecf0f1';
      issCtx.beginPath();
      issCtx.arc(32, 32, 6, 0, Math.PI * 2);
      issCtx.fill();
    }
    this.issTextureUrl = issCanvas.toDataURL();

    // Orbit trail line (initially empty)
    if (this.polylineCollection) {
      this.orbitPolyline = this.polylineCollection.add({
        positions: [],
        width: 1.5,
        color: Cesium.Color.fromCssColorString('rgba(0, 230, 255, 0.4)'),
        show: false
      });
    }
  }

  protected onUpdate(
    date: Date, 
    observerLocation: ObserverLocation, 
    observerPosition: Cesium.Cartesian3
  ): void {
    if (!this.viewer || !this.billboardCollection || !this.orbitPolyline) return;

    let activeSats: any[] = [];
    let selectedSat: any = null;
    let showSatellitesOption = true;

    try {
      const satStore = require('@/modules/satellites/store/useSatelliteStore').useSatelliteStore.getState();
      activeSats = satStore.activeSatellites || [];
      selectedSat = satStore.selectedSatellite;

      const visStore = require('@/components/workspaces/visualization/Visualization.types').useVisualizationStore.getState();
      showSatellitesOption = visStore.showSatellites;
    } catch (e) {}

    // Clean up billboards of satellites that no longer exist
    const currentSatIds = new Set(activeSats.map(s => s.id));
    this.satelliteBillboards.forEach((b, id) => {
      if (!currentSatIds.has(id)) {
        this.billboardCollection!.remove(b);
        this.satelliteBillboards.delete(id);
      }
    });

    if (!showSatellitesOption || !this.isVisible) {
      this.satelliteBillboards.forEach(b => b.show = false);
      this.orbitPolyline.show = false;
      return;
    }

    const currentFov = CameraController.currentFov;
    const zoomScale = Math.max(1.0, 60.0 / currentFov);
    const baseRadius = SkyDomeRadiusService.getAdaptiveRadius(currentFov);
    const satRadius = baseRadius * 0.85; // satellites render inside planets/stars
    const trailRadius = baseRadius * 0.82; // orbit trail sits just inside the satellites

    // Sync and update position of active satellites
    activeSats.forEach(sat => {
      let b = this.satelliteBillboards.get(sat.id);
      if (!b) {
        // Create new billboard
        b = this.billboardCollection!.add({
          id: `sat-billboard-${sat.id}`,
          position: new Cesium.Cartesian3(0, 0, 0),
          image: this.dotTextureUrl,
          width: 10,
          height: 10,
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        });
        (b as any).satData = sat;
        this.satelliteBillboards.set(sat.id, b);
      }

      // Calculate satellite Cartesian coordinates
      // In the store, latitude/longitude are degrees, altitude is height in meters
      const satHeight = sat.altitude || 400000.0;
      const satPosition = Cesium.Cartesian3.fromDegrees(sat.longitude, sat.latitude, satHeight);

      // Compute Alt/Az relative to the observer
      const altAz = CelestialProjectionEngine.getAltAzFromCartesian(satPosition, observerPosition);

      // Project onto the sky dome using adaptive radius
      const globalPos = CelestialProjectionEngine.altAzToCartesian(
        altAz.altitude,
        altAz.azimuth,
        observerPosition,
        satRadius
      );

      b.position = globalPos;

      const isAboveHorizon = altAz.altitude > 0.0;

      if (isAboveHorizon) {
        b.show = true;

        // Visual adaptations for ISS or selection
        const isISS = sat.name.toUpperCase().includes('ISS');
        const isSelected = selectedSat && selectedSat.id === sat.id;

        if (isISS && currentFov < 10.0) {
          // Render detailed ISS structural silhouette when zoomed in
          b.image = this.issTextureUrl;
          b.width = 24 * Math.pow(zoomScale, 0.5);
          b.height = 24 * Math.pow(zoomScale, 0.5);
          b.color = Cesium.Color.WHITE;
        } else {
          // Standard point
          b.image = this.dotTextureUrl;
          if (isSelected) {
            b.width = 16;
            b.height = 16;
            b.color = Cesium.Color.fromCssColorString('#00ff66'); // green glow for selection
          } else {
            b.width = 10;
            b.height = 10;
            b.color = Cesium.Color.WHITE;
          }
        }
      } else {
        b.show = false;
      }
    });

    // Update orbit prediction trail for selected satellite
    if (selectedSat && this.satelliteBillboards.has(selectedSat.id)) {
      const b = this.satelliteBillboards.get(selectedSat.id);
      if (b && b.show) {
        this.updateOrbitTrail(selectedSat, date, observerLocation, observerPosition, trailRadius);
      } else {
        this.orbitPolyline.show = false;
      }
    } else {
      this.orbitPolyline.show = false;
    }
  }

  /**
   * Propagates satellite TLE or positions to draw the future orbit path in sky dome coordinates.
   */
  private updateOrbitTrail(
    sat: any, 
    date: Date, 
    observerLocation: ObserverLocation, 
    observerPosition: Cesium.Cartesian3,
    trailRadius: number
  ) {
    if (!this.orbitPolyline) return;

    const trailPositions: Cesium.Cartesian3[] = [];

    // Propagate using satellite.js if TLE coordinates are available
    if (sat.tleLine1 && sat.tleLine2) {
      try {
        const satrec = satellite.twoline2satrec(sat.tleLine1, sat.tleLine2);

        // Render 45 minutes of orbit at 1.5-minute intervals
        for (let m = 0; m <= 30; m++) {
          const checkTime = new Date(date.getTime() + m * 90 * 1000);
          const positionAndVelocity = satellite.propagate(satrec, checkTime);
          const posEci = positionAndVelocity.position;

          if (posEci && typeof posEci === 'object' && 'x' in posEci) {
            const gmst = satellite.gstime(checkTime);
            const posGd = satellite.eciToGeodetic(posEci as any, gmst);

            const lat = satellite.degreesLat(posGd.latitude);
            const lon = satellite.degreesLong(posGd.longitude);
            const alt = posGd.height * 1000.0; // km to meters

            const satPosCartesian = Cesium.Cartesian3.fromDegrees(lon, lat, alt);
            const altAz = CelestialProjectionEngine.getAltAzFromCartesian(satPosCartesian, observerPosition);
            
            // Only draw orbit segments that are above the horizon to keep screen clean
            if (altAz.altitude > -2.0) {
              const domePos = CelestialProjectionEngine.altAzToCartesian(altAz.altitude, altAz.azimuth, observerPosition, trailRadius);
              trailPositions.push(domePos);
            }
          }
        }
      } catch (err) {
        console.warn("Satellite propagation failed for trail:", err);
      }
    }

    // Fallback: If no TLE exists, draw a short horizontal circle projection 
    // around the satellite's current direction
    if (trailPositions.length < 2) {
      const satHeight = sat.altitude || 400000.0;
      const satPosCartesian = Cesium.Cartesian3.fromDegrees(sat.longitude, sat.latitude, satHeight);
      const altAz = CelestialProjectionEngine.getAltAzFromCartesian(satPosCartesian, observerPosition);

      // Create a short arc along azimuth
      for (let offset = -10; offset <= 10; offset += 2) {
        const domePos = CelestialProjectionEngine.altAzToCartesian(
          altAz.altitude, 
          altAz.azimuth + offset, 
          observerPosition, 
          trailRadius
        );
        trailPositions.push(domePos);
      }
    }

    if (trailPositions.length >= 2) {
      this.orbitPolyline.positions = trailPositions;
      this.orbitPolyline.show = true;
    } else {
      this.orbitPolyline.show = false;
    }
  }

  protected onShow(): void {
    if (this.billboardCollection) this.billboardCollection.show = true;
    if (this.polylineCollection) this.polylineCollection.show = true;
  }

  protected onHide(): void {
    if (this.billboardCollection) this.billboardCollection.show = false;
    if (this.polylineCollection) this.polylineCollection.show = false;
  }

  protected onDestroy(): void {
    if (!this.viewer) return;
    if (this.billboardCollection) {
      this.viewer.scene.primitives.remove(this.billboardCollection);
      this.billboardCollection = null;
    }
    if (this.polylineCollection) {
      this.viewer.scene.primitives.remove(this.polylineCollection);
      this.polylineCollection = null;
    }
    this.satelliteBillboards.clear();
    this.orbitPolyline = null;
  }
}
