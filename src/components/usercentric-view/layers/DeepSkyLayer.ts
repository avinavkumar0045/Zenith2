import * as Cesium from 'cesium';
import { BaseSkyLayer } from './BaseSkyLayer';
import { ObserverLocation } from '../UserCentricView.types';
import { CelestialProjectionEngine } from '../engine/CelestialProjectionEngine';
import { CameraController } from '../services/CameraController';
import { SkySceneService } from '../services/SkySceneService';

interface DSO {
  id: string;
  name: string;
  ra: number;       // hours
  dec: number;      // degrees
  magnitude: number;
  color: string;
  description: string;
}

export class DeepSkyLayer extends BaseSkyLayer {
  private billboardCollection: Cesium.BillboardCollection | null = null;
  private labelsCollection: Cesium.LabelCollection | null = null;
  private dsoBillboards: Map<string, Cesium.Billboard> = new Map();
  private dsoLabels: Map<string, Cesium.Label> = new Map();
  private textures: Record<string, string> = {};

  private dsoCatalog: DSO[] = [
    { id: 'm31', name: 'Andromeda Galaxy (M31)', ra: 0.71, dec: 41.27, magnitude: 3.4, color: '#d6e4f0', description: 'Our neighboring spiral galaxy, 2.5 million light-years away.' },
    { id: 'm42', name: 'Orion Nebula (M42)', ra: 5.59, dec: -5.38, magnitude: 4.0, color: '#f5b7b1', description: 'A massive star-forming region in Orion\'s sword.' },
    { id: 'm45', name: 'Pleiades (M45)', ra: 3.78, dec: 24.12, magnitude: 1.6, color: '#aed6f1', description: 'The Seven Sisters, an open star cluster in Taurus surrounded by blue reflection nebulosity.' },
    { id: 'm8', name: 'Lagoon Nebula (M8)', ra: 18.06, dec: -24.38, magnitude: 6.0, color: '#f1948a', description: 'A giant interstellar cloud in Sagittarius.' }
  ];

  constructor() {
    super('deep-sky-layer');
  }

  protected onInitialize(): void {
    if (!this.viewer) return;

    this.billboardCollection = this.viewer.scene.primitives.add(new Cesium.BillboardCollection());
    this.labelsCollection = this.viewer.scene.primitives.add(new Cesium.LabelCollection());

    // Generate procedural DSO textures
    this.generateDSOTextures();

    // Create billboards
    const dummyPos = new Cesium.Cartesian3(0, 0, 0);

    this.dsoCatalog.forEach(d => {
      const b = this.billboardCollection!.add({
        id: `dso-billboard-${d.id}`,
        position: dummyPos,
        image: this.textures[d.id],
        width: d.id === 'm31' ? 48 : 36, // Andromeda is elongated
        height: 36,
        disableDepthTestDistance: Number.POSITIVE_INFINITY
      });
      (b as any).dsoData = d;
      this.dsoBillboards.set(d.id, b);

      const label = this.labelsCollection!.add({
        position: dummyPos,
        text: d.name,
        font: 'italic 8pt Outfit, Inter, sans-serif',
        fillColor: Cesium.Color.fromCssColorString('rgba(255, 255, 255, 0.7)'),
        outlineColor: Cesium.Color.BLACK,
        outlineWidth: 2,
        pixelOffset: new Cesium.Cartesian3(0, -22, 0),
        horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        disableDepthTestDistance: Number.POSITIVE_INFINITY
      });
      (label as any).dsoData = d;
      this.dsoLabels.set(d.id, label);
    });
  }

  private generateDSOTextures(): void {
    // 1. M31 Andromeda Galaxy (Tilted glowing spiral disk)
    const m31Canvas = document.createElement('canvas');
    m31Canvas.width = 128;
    m31Canvas.height = 64;
    const m31Ctx = m31Canvas.getContext('2d');
    if (m31Ctx) {
      m31Ctx.save();
      m31Ctx.translate(64, 32);
      m31Ctx.rotate(-0.35); // tilt angle of the galaxy
      
      const grad = m31Ctx.createRadialGradient(0, 0, 2, 0, 0, 45);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.9)'); // bright yellow-white core
      grad.addColorStop(0.15, 'rgba(235, 245, 255, 0.6)');
      grad.addColorStop(0.4, 'rgba(165, 195, 255, 0.25)'); // blue arms
      grad.addColorStop(0.8, 'rgba(100, 140, 220, 0.05)');
      grad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');
      
      m31Ctx.fillStyle = grad;
      // Draw inclined ellipse
      m31Ctx.scale(2.2, 1.0);
      m31Ctx.beginPath();
      m31Ctx.arc(0, 0, 20, 0, Math.PI * 2);
      m31Ctx.fill();
      m31Ctx.restore();
    }
    this.textures['m31'] = m31Canvas.toDataURL();

    // 2. M42 Orion Nebula (Organic pinkish-red glowing dust cloud)
    const m42Canvas = document.createElement('canvas');
    m42Canvas.width = 64;
    m42Canvas.height = 64;
    const m42Ctx = m42Canvas.getContext('2d');
    if (m42Ctx) {
      const grad = m42Ctx.createRadialGradient(32, 32, 2, 32, 32, 28);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)'); // bright trapezium stars core
      grad.addColorStop(0.2, 'rgba(255, 180, 200, 0.65)'); // pink gas
      grad.addColorStop(0.6, 'rgba(230, 100, 140, 0.25)'); // magenta outer
      grad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');
      
      m42Ctx.fillStyle = grad;
      // Slightly irregular organic shapes
      m42Ctx.beginPath();
      m42Ctx.arc(32, 32, 28, 0, Math.PI * 2);
      m42Ctx.fill();

      // Overlap a second smaller offset cloud
      const grad2 = m42Ctx.createRadialGradient(40, 28, 0, 40, 28, 16);
      grad2.addColorStop(0, 'rgba(255, 150, 180, 0.4)');
      grad2.addColorStop(1.0, 'rgba(0,0,0,0)');
      m42Ctx.fillStyle = grad2;
      m42Ctx.beginPath();
      m42Ctx.arc(40, 28, 16, 0, Math.PI * 2);
      m42Ctx.fill();
    }
    this.textures['m42'] = m42Canvas.toDataURL();

    // 3. M45 Pleiades Open Cluster (Blue stars with soft blue reflection nebulous gas)
    const m45Canvas = document.createElement('canvas');
    m45Canvas.width = 128;
    m45Canvas.height = 128;
    const m45Ctx = m45Canvas.getContext('2d');
    if (m45Ctx) {
      // Draw background reflection nebulosity (soft blue clouds)
      const nebGrad = m45Ctx.createRadialGradient(64, 64, 5, 64, 64, 50);
      nebGrad.addColorStop(0, 'rgba(174, 214, 241, 0.45)');
      nebGrad.addColorStop(0.5, 'rgba(174, 214, 241, 0.15)');
      nebGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');
      m45Ctx.fillStyle = nebGrad;
      m45Ctx.beginPath();
      m45Ctx.arc(64, 64, 50, 0, Math.PI * 2);
      m45Ctx.fill();

      // Draw the Seven Sisters (bright blue-white points)
      m45Ctx.fillStyle = '#ffffff';
      m45Ctx.shadowColor = '#5dadec';
      m45Ctx.shadowBlur = 6;
      
      const stars = [
        [64, 64, 3],   // Alcyone
        [74, 54, 2.5], // Atlas
        [78, 62, 2],   // Merope
        [50, 50, 2],   // Maia
        [54, 76, 2],   // Electra
        [42, 60, 2],   // Taygeta
        [34, 50, 1.5]  // Celaeno
      ];
      stars.forEach(([x, y, r]) => {
        m45Ctx.beginPath();
        m45Ctx.arc(x, y, r, 0, Math.PI * 2);
        m45Ctx.fill();
      });
    }
    this.textures['m45'] = m45Canvas.toDataURL();

    // 4. M8 Lagoon Nebula (Reddish nebula with gas lane)
    const m8Canvas = document.createElement('canvas');
    m8Canvas.width = 64;
    m8Canvas.height = 64;
    const m8Ctx = m8Canvas.getContext('2d');
    if (m8Ctx) {
      const grad = m8Ctx.createRadialGradient(32, 32, 2, 32, 32, 28);
      grad.addColorStop(0, 'rgba(255, 230, 230, 0.8)');
      grad.addColorStop(0.3, 'rgba(255, 120, 120, 0.45)');
      grad.addColorStop(0.7, 'rgba(230, 50, 100, 0.15)');
      grad.addColorStop(1.0, 'rgba(0, 0, 0, 0.0)');
      
      m8Ctx.fillStyle = grad;
      m8Ctx.beginPath();
      m8Ctx.arc(32, 32, 28, 0, Math.PI * 2);
      m8Ctx.fill();

      // Mask out a central lane to simulate the dust lane of M8
      m8Ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      m8Ctx.globalCompositeOperation = 'destination-out';
      m8Ctx.beginPath();
      m8Ctx.ellipse(32, 32, 4, 22, 0.8, 0, Math.PI * 2);
      m8Ctx.fill();
    }
    this.textures['m8'] = m8Canvas.toDataURL();
  }

  protected onUpdate(
    date: Date, 
    observerLocation: ObserverLocation, 
    observerPosition: Cesium.Cartesian3
  ): void {
    if (!this.viewer || !this.billboardCollection) return;

    let cloudCover = 0.0;
    try {
      const { weather } = require('@/modules/weather/store/useWeatherStore').useWeatherStore.getState();
      if (weather) cloudCover = (weather.cloudCover ?? 0) / 100.0;
    } catch (e) {}

    let moonIllumination = 0.0;
    try {
      const { moonData } = require('@/modules/moon/store/useMoonStore').useMoonStore.getState();
      if (moonData) moonIllumination = moonData.illumination ?? 0.0;
    } catch (e) {}

    let lightPollution = 3.0;
    try {
      const { weather } = require('@/modules/weather/store/useWeatherStore').useWeatherStore.getState();
      if (weather && (weather.observationQuality === 'Poor' || weather.observationQuality === 'Very Poor')) {
        lightPollution = 7.0;
      }
    } catch (e) {}

    // DSOs are highly sensitive to sky glow and clouds
    const skyBrightness = (lightPollution / 9.0) * 0.5 + moonIllumination * 0.4 + cloudCover * 0.3;
    const globalOpacity = Math.max(0.0, 1.0 - skyBrightness * 1.5) * (1.0 - cloudCover);

    const currentFov = CameraController.currentFov;
    const zoomScale = Math.max(1.0, 60.0 / currentFov);

    this.dsoBillboards.forEach((b, id) => {
      const dso = (b as any).dsoData;
      if (!dso) return;

      const altAz = CelestialProjectionEngine.getAltAz(
        dso.ra,
        dso.dec,
        observerLocation.latitude,
        observerLocation.longitude,
        date
      );

      // Project onto dome space (placed at 380,000m)
      const globalPos = CelestialProjectionEngine.altAzToCartesian(
        altAz.altitude,
        altAz.azimuth,
        observerPosition,
        380000.0
      );

      b.position = globalPos;

      const label = this.dsoLabels.get(id);
      if (label) label.position = globalPos;

      // Visible if above horizon and sky conditions are decent
      const isAboveHorizon = altAz.altitude > -2.0;
      const isBrightEnough = dso.magnitude - 2.5 <= 7.0 - skyBrightness * 5.0; // bright cluster visible in worse skies than M8

      if (isAboveHorizon && isBrightEnough && globalOpacity > 0.05 && this.isVisible) {
        b.show = true;
        if (label) label.show = true;

        // Scale sizes proportionally on zoom
        const baseWidth = id === 'm31' ? 48 : 36;
        const baseHeight = 36;

        b.width = baseWidth * Math.pow(zoomScale, 0.6);
        b.height = baseHeight * Math.pow(zoomScale, 0.6);
        
        // Atmosphere extinction near horizon
        const altFade = altAz.altitude > 10.0 ? 1.0 : Math.max(0.0, (altAz.altitude + 2.0) / 12.0);
        
        // Observe mode check
        let observeFade = 1.0;
        let isTarget = false;
        if (SkySceneService.isObserving) {
          isTarget = (SkySceneService as any).observedObjectId === id;
          if (!isTarget) {
            observeFade = 0.15;
          }
        }

        const opacity = globalOpacity * altFade * observeFade;

        b.color = Cesium.Color.WHITE.withAlpha(opacity);
        
        if (label) {
          label.fillColor = Cesium.Color.WHITE.withAlpha(opacity);
          label.pixelOffset = new Cesium.Cartesian3(0, -(b.height / 2 + 10), 0);
          // Show names only at medium zooms, and hide if faded
          label.show = currentFov < 35.0 && (!SkySceneService.isObserving || isTarget);
        }
      } else {
        b.show = false;
        if (label) label.show = false;
      }
    });
  }

  protected onShow(): void {
    if (this.billboardCollection) this.billboardCollection.show = true;
    if (this.labelsCollection) this.labelsCollection.show = true;
  }

  protected onHide(): void {
    if (this.billboardCollection) this.billboardCollection.show = false;
    if (this.labelsCollection) this.labelsCollection.show = false;
  }

  protected onDestroy(): void {
    if (!this.viewer) return;
    if (this.billboardCollection) {
      this.viewer.scene.primitives.remove(this.billboardCollection);
      this.billboardCollection = null;
    }
    if (this.labelsCollection) {
      this.viewer.scene.primitives.remove(this.labelsCollection);
      this.labelsCollection = null;
    }
    this.dsoBillboards.clear();
    this.dsoLabels.clear();
  }
}
