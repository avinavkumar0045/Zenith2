import * as Cesium from 'cesium';
import { GlobeService } from '@/modules/globe/services/GlobeService';
import { LayerManager } from '@/modules/globe/LayerManager';
import { useLocationStore } from '@/modules/location/store/useLocationStore';
import { useOrbitStore } from '@/modules/orbits/store/useOrbitStore';
import { ImmutableVisualizationState } from '../Visualization.types';

export class RenderingEngine {
  private static gridLayer: Cesium.ImageryLayer | null = null;
  private static cloudCanvas: HTMLCanvasElement | null = null;

  /**
   * Applies the resolved visualization state directly to the Cesium viewer.
   */
  public static applyState(state: ImmutableVisualizationState, prevState?: ImmutableVisualizationState) {
    try {
      const viewer = GlobeService.getViewer();
      if (!viewer) return;

      // 1. Objects Toggling (Zustand Layer sync)
      this.toggleStandardLayer('planet-ground-layer', state.showPlanets);
      this.toggleStandardLayer('moon-ground-layer', state.showMoon);
      this.toggleStandardLayer('iss-layer', state.showISS);
      this.toggleStandardLayer('satellite-layer', state.showSatellites);
      this.toggleStandardLayer('location-layer', state.showCities);

      // Sync orbits workspace state values directly into Orbit store
      useOrbitStore.setState({
        showPastOrbit: state.showPastOrbits,
        showFutureOrbit: state.showFutureOrbits,
        showGroundTrack: state.showGroundTracks
      });
      this.toggleStandardLayer('orbit-layer', state.showGroundTracks || state.showFutureOrbits || state.showPastOrbits);

      // 2. Day/Night shadow lighting
      if (viewer.scene && viewer.scene.globe) {
        viewer.scene.globe.enableLighting = state.showDayNight;
      }

      // 3. Atmosphere rendering
      if (viewer.scene && viewer.scene.skyAtmosphere && viewer.scene.globe) {
        viewer.scene.skyAtmosphere.show = state.showAtmosphere;
        viewer.scene.globe.showGroundAtmosphere = state.showAtmosphere;
        // Atmosphere opacity mapping: adjust brightness shift
        viewer.scene.skyAtmosphere.brightnessShift = (state.opacityAtmosphere / 100.0) - 0.5;
      }

      // 4. Stars & Milky Way
      if (viewer.scene && viewer.scene.skyBox) {
        viewer.scene.skyBox.show = state.showStars || state.showMilkyWay;
      }

      // 5. Grid overlay
      this.updateCoordinateGrid(viewer, state.showGrid, state.opacityGrid);

      // 6. Clouds sphere + opacity
      this.updateClouds(viewer, state.showClouds, state.opacityClouds);

      // 7. Observer Horizon
      this.updateObserverHorizon(viewer, state.showObserverHorizon, state.opacityGroundTracks);

      // 8. Altitude/Azimuth / Direction Guides
      this.updateDirectionGuides(viewer, state.showDirectionGuides, state.opacityGrid);

      // 9. Opacity applications on existing elements
      if (!prevState || prevState.opacityLabels !== state.opacityLabels) {
        this.applyLabelOpacity(viewer, state.opacityLabels);
      }
      if (!prevState || prevState.opacityGroundTracks !== state.opacityGroundTracks) {
        this.applyOrbitOpacity(state.opacityGroundTracks);
      }

    } catch (e) {
      // GlobeService or viewer is not initialized yet (e.g. in SSR or loading state)
    }
  }

  private static toggleStandardLayer(layerId: string, show: boolean) {
    const layer = LayerManager.getLayer(layerId);
    if (layer) {
      if (show) {
        layer.show();
      } else {
        layer.hide();
      }
    }
  }

  private static updateCoordinateGrid(viewer: Cesium.Viewer, show: boolean, opacity: number) {
    // Look for existing GridImageryProvider layer
    let existingLayer: Cesium.ImageryLayer | null = null;
    const layers = viewer.imageryLayers;
    
    for (let i = 0; i < layers.length; i++) {
      const layer = layers.get(i);
      if (layer.imageryProvider instanceof Cesium.GridImageryProvider) {
        existingLayer = layer;
        break;
      }
    }

    if (show) {
      const alpha = opacity / 100.0;
      if (!existingLayer) {
        const gridProvider = new Cesium.GridImageryProvider({
          color: Cesium.Color.CYAN.withAlpha(0.2),
          glowColor: Cesium.Color.CYAN.withAlpha(0.05),
          canvasSize: 256
        });
        const newLayer = layers.addImageryProvider(gridProvider);
        newLayer.alpha = alpha;
      } else {
        existingLayer.alpha = alpha;
      }
    } else {
      if (existingLayer) {
        layers.remove(existingLayer);
      }
    }
  }

  private static updateClouds(viewer: Cesium.Viewer, show: boolean, opacity: number) {
    let cloudEntity = viewer.entities.getById('cloud-layer-sphere');
    
    if (show) {
      if (!this.cloudCanvas) {
        // Generate a simple procedural white cloud canvas
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, 512, 256);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
          for (let i = 0; i < 20; i++) {
            const x = Math.random() * 512;
            const y = Math.random() * 256;
            const r = 15 + Math.random() * 35;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        this.cloudCanvas = canvas;
      }

      const alpha = opacity / 100.0;

      if (!cloudEntity) {
        viewer.entities.add({
          id: 'cloud-layer-sphere',
          ellipsoid: {
            radii: new Cesium.Cartesian3(6378137.0 + 35000.0, 6378137.0 + 35000.0, 6356752.0 + 35000.0), // 35km high
            material: new Cesium.ImageMaterialProperty({
              image: this.cloudCanvas,
              transparent: true,
              color: Cesium.Color.WHITE.withAlpha(alpha) as any
            })
          }
        });
      } else {
        cloudEntity.show = true;
        if (cloudEntity.ellipsoid && cloudEntity.ellipsoid.material) {
          (cloudEntity.ellipsoid.material as any).color = Cesium.Color.WHITE.withAlpha(alpha) as any;
        }
      }
    } else {
      if (cloudEntity) {
        cloudEntity.show = false;
      }
    }
  }

  private static updateObserverHorizon(viewer: Cesium.Viewer, show: boolean, opacity: number) {
    const horizonEntity = viewer.entities.getById('observer-horizon-cone');
    const activeLocation = useLocationStore.getState().activeLocation;

    if (show && activeLocation) {
      const alphaFill = (opacity / 100.0) * 0.12;
      const alphaOutline = (opacity / 100.0) * 0.7;

      if (!horizonEntity) {
        viewer.entities.add({
          id: 'observer-horizon-cone',
          position: Cesium.Cartesian3.fromDegrees(activeLocation.longitude, activeLocation.latitude),
          ellipse: {
            semiMinorAxis: 600000.0, // 600km radius observer cone
            semiMajorAxis: 600000.0,
            material: Cesium.Color.CYAN.withAlpha(alphaFill) as any,
            outline: true,
            outlineColor: Cesium.Color.CYAN.withAlpha(alphaOutline) as any,
            outlineWidth: 2,
            height: 50.0 // slight elevate
          }
        });
      } else {
        horizonEntity.show = true;
        horizonEntity.position = Cesium.Cartesian3.fromDegrees(activeLocation.longitude, activeLocation.latitude) as any;
        if (horizonEntity.ellipse) {
          horizonEntity.ellipse.material = Cesium.Color.CYAN.withAlpha(alphaFill) as any;
          horizonEntity.ellipse.outlineColor = Cesium.Color.CYAN.withAlpha(alphaOutline) as any;
        }
      }
    } else {
      if (horizonEntity) {
        horizonEntity.show = false;
      }
    }
  }

  private static updateDirectionGuides(viewer: Cesium.Viewer, show: boolean, opacity: number) {
    const activeLocation = useLocationStore.getState().activeLocation;
    const guidesIds = ['guide_n', 'guide_s', 'guide_e', 'guide_w'];
    
    if (show && activeLocation) {
      const lat = activeLocation.latitude;
      const lon = activeLocation.longitude;
      const alpha = (opacity / 100.0) * 0.6;
      const color = Cesium.Color.CYAN.withAlpha(alpha);

      const directions = [
        { id: 'guide_n', targetLat: lat + 4, targetLon: lon },
        { id: 'guide_s', targetLat: lat - 4, targetLon: lon },
        { id: 'guide_e', targetLat: lat, targetLon: lon + 4 },
        { id: 'guide_w', targetLat: lat, targetLon: lon - 4 }
      ];

      directions.forEach(dir => {
        let entity = viewer.entities.getById(dir.id);
        const positions = [
          Cesium.Cartesian3.fromDegrees(lon, lat, 100),
          Cesium.Cartesian3.fromDegrees(dir.targetLon, dir.targetLat, 100)
        ];

        if (!entity) {
          viewer.entities.add({
            id: dir.id,
            polyline: {
              positions,
              width: 1.5,
              clampToGround: true,
              material: color as any
            }
          });
        } else {
          entity.show = true;
          if (entity.polyline) {
            entity.polyline.positions = positions as any;
            entity.polyline.material = color as any;
          }
        }
      });
    } else {
      guidesIds.forEach(id => {
        const entity = viewer.entities.getById(id);
        if (entity) entity.show = false;
      });
    }
  }

  private static applyLabelOpacity(viewer: Cesium.Viewer, opacity: number) {
    const alpha = opacity / 100.0;
    
    const applyToEntity = (entity: Cesium.Entity) => {
      if (entity.label) {
        const currentFill = entity.label.fillColor ? entity.label.fillColor.getValue(Cesium.JulianDate.now()) : Cesium.Color.WHITE;
        entity.label.fillColor = currentFill.withAlpha(alpha) as any;
        const currentOutline = entity.label.outlineColor ? entity.label.outlineColor.getValue(Cesium.JulianDate.now()) : Cesium.Color.BLACK;
        entity.label.outlineColor = currentOutline.withAlpha(alpha) as any;
      }
    };

    // Apply to direct entities
    viewer.entities.values.forEach(applyToEntity);

    // Apply to data sources
    for (let i = 0; i < viewer.dataSources.length; i++) {
      const ds = viewer.dataSources.get(i);
      ds.entities.values.forEach(applyToEntity);
    }
  }

  private static applyOrbitOpacity(opacity: number) {
    const factor = opacity / 100.0;
    const orbitLayer = LayerManager.getLayer<any>('orbit-layer');
    if (orbitLayer && orbitLayer.dataSource) {
      orbitLayer.dataSource.entities.values.forEach((entity: any) => {
        if (entity.polyline) {
          const material = entity.polyline.material;
          if (material) {
            if (entity.id.startsWith('orbit_past_') && material.color) {
              const baseColor = material.color.getValue(Cesium.JulianDate.now()) || Cesium.Color.CYAN;
              material.color = baseColor.withAlpha(0.3 * factor) as any;
            } else if (entity.id.startsWith('orbit_future_') && material.color) {
              const baseColor = material.color.getValue(Cesium.JulianDate.now()) || Cesium.Color.CYAN;
              material.color = baseColor.withAlpha(0.9 * factor) as any;
            } else if (entity.id.startsWith('orbit_ground_')) {
              if (typeof material.getValue === 'function') {
                const baseColor = material.getValue(Cesium.JulianDate.now()) || Cesium.Color.CYAN;
                entity.polyline.material = baseColor.withAlpha(0.5 * factor) as any;
              } else if (material.color) {
                const baseColor = material.color.getValue(Cesium.JulianDate.now()) || Cesium.Color.CYAN;
                material.color = baseColor.withAlpha(0.5 * factor) as any;
              }
            }
          }
        }
      });
    }
  }
}
