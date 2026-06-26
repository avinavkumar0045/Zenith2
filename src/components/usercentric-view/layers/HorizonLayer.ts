import * as Cesium from 'cesium';
import { BaseSkyLayer } from './BaseSkyLayer';
import { ObserverLocation, HorizonTheme } from '../UserCentricView.types';
import { CelestialProjectionEngine } from '../engine/CelestialProjectionEngine';
import { CameraController } from '../services/CameraController';

export class HorizonLayer extends BaseSkyLayer {
  private billboardCollection: Cesium.BillboardCollection | null = null;
  private panels: Cesium.Billboard[] = [];
  public currentTheme: HorizonTheme = 'mountains';
  private texturesMap: Record<HorizonTheme, string> = {} as Record<HorizonTheme, string>;

  constructor() {
    super('horizon-layer');
  }

  protected onInitialize(): void {
    if (!this.viewer) return;

    this.billboardCollection = this.viewer.scene.primitives.add(new Cesium.BillboardCollection());

    // Generate procedural canvas textures for all themes
    this.generateAllThemes();

    // Create 12 tiled billboards around the horizon (each covering 30 degrees of azimuth)
    this.buildHorizonRing();
  }

  private generateAllThemes(): void {
    const themes: HorizonTheme[] = ['mountains', 'forest', 'city', 'ocean', 'desert'];
    themes.forEach(t => {
      this.texturesMap[t] = this.generateThemeTexture(t);
    });
  }

  private generateThemeTexture(theme: HorizonTheme): string {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 128;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';

    // Transparent background
    ctx.clearRect(0, 0, 512, 128);

    // Color: deep silhouette dark gray/blue
    ctx.fillStyle = '#07080e';

    if (theme === 'mountains') {
      // Draw jagged mountain ranges
      ctx.beginPath();
      ctx.moveTo(0, 128);
      ctx.lineTo(0, 70);
      
      // Draw randomized peaks
      const peaks = [
        [40, 45], [90, 85], [140, 30], [200, 75], 
        [260, 40], [320, 90], [390, 25], [450, 70], [512, 50]
      ];
      peaks.forEach(([x, y]) => {
        ctx.lineTo(x, y);
      });
      
      ctx.lineTo(512, 128);
      ctx.closePath();
      ctx.fill();

      // Add a second, lighter layer in the background for depth
      ctx.fillStyle = 'rgba(7, 8, 14, 0.5)';
      ctx.beginPath();
      ctx.moveTo(0, 128);
      ctx.lineTo(0, 80);
      const bgPeaks = [
        [70, 60], [150, 85], [230, 55], [310, 80], [400, 50], [480, 80], [512, 75]
      ];
      bgPeaks.forEach(([x, y]) => {
        ctx.lineTo(x, y);
      });
      ctx.lineTo(512, 128);
      ctx.closePath();
      ctx.fill();
    } 
    else if (theme === 'forest') {
      // Draw pine trees of varying heights
      ctx.beginPath();
      ctx.moveTo(0, 128);
      
      let x = 0;
      while (x < 512) {
        const treeWidth = 14 + Math.random() * 8;
        const treeHeight = 45 + Math.random() * 45;
        
        // Draw triangle tree
        ctx.lineTo(x, 128 - treeHeight);
        ctx.lineTo(x + treeWidth / 2, 128 - treeHeight - 12);
        ctx.lineTo(x + treeWidth, 128 - treeHeight);
        x += treeWidth;
      }
      ctx.lineTo(512, 128);
      ctx.closePath();
      ctx.fill();
    } 
    else if (theme === 'city') {
      // Draw rectangular skyscrapers and buildings
      ctx.beginPath();
      ctx.moveTo(0, 128);
      
      let x = 0;
      while (x < 512) {
        const w = 24 + Math.random() * 32;
        const h = 30 + Math.random() * 70;
        
        ctx.lineTo(x, 128);
        ctx.lineTo(x, 128 - h);
        ctx.lineTo(x + w, 128 - h);
        ctx.lineTo(x + w, 128);
        
        x += w;
      }
      ctx.closePath();
      ctx.fill();

      // Add a few glowing yellow windows
      ctx.fillStyle = 'rgba(244, 208, 63, 0.4)';
      for (let i = 0; i < 20; i++) {
        const wx = Math.random() * 500;
        const wy = 50 + Math.random() * 70;
        ctx.fillRect(wx, wy, 2, 3);
      }
    } 
    else if (theme === 'ocean') {
      // Flat horizon line with small wavy peaks
      ctx.beginPath();
      ctx.moveTo(0, 128);
      ctx.lineTo(0, 95);
      
      for (let waveX = 0; waveX <= 512; waveX += 16) {
        ctx.quadraticCurveTo(waveX + 8, 93 + Math.random() * 3, waveX + 16, 95);
      }
      
      ctx.lineTo(512, 128);
      ctx.closePath();
      ctx.fill();
    } 
    else if (theme === 'desert') {
      // Smooth sweeping sand dunes
      ctx.beginPath();
      ctx.moveTo(0, 128);
      ctx.lineTo(0, 80);
      
      // Control points for nice bezier curves
      ctx.bezierCurveTo(128, 50, 256, 110, 384, 70);
      ctx.bezierCurveTo(450, 50, 480, 80, 512, 75);
      
      ctx.lineTo(512, 128);
      ctx.closePath();
      ctx.fill();

      // Layer 2 dune
      ctx.fillStyle = 'rgba(7, 8, 14, 0.6)';
      ctx.beginPath();
      ctx.moveTo(0, 128);
      ctx.lineTo(0, 95);
      ctx.bezierCurveTo(150, 110, 300, 60, 512, 90);
      ctx.lineTo(512, 128);
      ctx.closePath();
      ctx.fill();
    }

    return canvas.toDataURL();
  }

  private buildHorizonRing(): void {
    if (!this.billboardCollection || !this.observerPosition) return;

    // Remove old panels
    this.panels.forEach(p => this.billboardCollection!.remove(p));
    this.panels = [];

    const numPanels = 12; // 30 degrees each
    const radius = 25000.0; // Place it relatively close so it forms a clean foreground ring

    for (let i = 0; i < numPanels; i++) {
      const az = (i / numPanels) * 360.0;

      // Project billboard onto 0° Altitude
      const pos = CelestialProjectionEngine.altAzToCartesian(
        -0.8, // Slightly below 0 to cover the visual seam
        az,
        this.observerPosition,
        radius
      );

      // Width of a panel covering 30 deg at 25km radius is approx: 2 * radius * tan(15deg) = 13.4km
      // In billboard pixels, we'll size them to overlap slightly
      const p = this.billboardCollection.add({
        position: pos,
        image: this.texturesMap[this.currentTheme],
        width: 14200, // overlapping sizes in dome units
        height: 3500,
        sizeInMeters: true,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        disableDepthTestDistance: Number.POSITIVE_INFINITY
      });

      this.panels.push(p);
    }
  }

  /**
   * Switches the horizon theme dynamically.
   */
  public setTheme(theme: HorizonTheme): void {
    if (theme === this.currentTheme) return;
    this.currentTheme = theme;

    this.panels.forEach(p => {
      p.image = this.texturesMap[theme];
    });
  }

  protected onUpdate(
    date: Date, 
    observerLocation: ObserverLocation, 
    observerPosition: Cesium.Cartesian3
  ): void {
    if (!this.viewer || this.panels.length === 0) return;

    // Check if observer coordinates shifted, rebuild horizon center
    if (this.observerPosition && !Cesium.Cartesian3.equals(this.observerPosition, observerPosition)) {
      this.observerPosition = observerPosition;
      this.buildHorizonRing();
    }

    // Dynamic opacity based on camera pitch
    // Fade out as the user looks up to clear the sky view
    const pitch = CameraController.pitch; // in radians
    const pitchDeg = pitch * (180.0 / Math.PI);
    
    // Horizon is fully opaque up to 10° pitch, then fades to transparent by 45°
    let opacity = 1.0;
    if (pitchDeg > 10.0) {
      opacity = Math.max(0.0, 1.0 - (pitchDeg - 10.0) / 35.0);
    }

    const finalOpacity = opacity * (this.isVisible ? 1.0 : 0.0);

    this.panels.forEach(p => {
      p.show = finalOpacity > 0.01;
      p.color = Cesium.Color.WHITE.withAlpha(finalOpacity);
    });
  }

  protected onShow(): void {
    if (this.billboardCollection) this.billboardCollection.show = true;
  }

  protected onHide(): void {
    if (this.billboardCollection) this.billboardCollection.show = false;
  }

  protected onDestroy(): void {
    if (!this.viewer) return;
    if (this.billboardCollection) {
      this.viewer.scene.primitives.remove(this.billboardCollection);
      this.billboardCollection = null;
    }
    this.panels = [];
  }
}
