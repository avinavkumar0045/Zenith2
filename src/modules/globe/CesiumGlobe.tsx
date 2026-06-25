"use client";

import { useEffect, useRef } from 'react';
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';
import { useAppStore } from '@/store/useAppStore';
import { GlobeService } from './services/GlobeService';
import { LayerManager } from './LayerManager';
import { DayNightLayer } from './layers/DayNightLayer';
import { SatelliteLayer } from './layers/SatelliteLayer';
import { LocationLayer } from './layers/LocationLayer';
import { OrbitLayer } from './layers/OrbitLayer';
import { ISSLayer } from '../iss/layers/ISSLayer';
import { ISSService } from '../iss/services/ISSService';

import { MoonGroundLayer } from '../moon/layers/MoonGroundLayer';
import { PlanetGroundLayer } from '../planets/layers/PlanetGroundLayer';
import { getEntityPriority } from './resolvers/PriorityResolver';
import { resolveLabelCollisions } from './resolvers/CollisionResolver';
import { useSatelliteStore } from '../satellites/store/useSatelliteStore';

export default function CesiumGlobe() {
  const cesiumContainer = useRef<HTMLDivElement>(null);
  const setGlobeReady = useAppStore((state) => state.setGlobeReady);

  useEffect(() => {
    if (!cesiumContainer.current) return;

    // Set Cesium base URL
    (window as any).CESIUM_BASE_URL = '/cesium';

    // Initialize the viewer
    const viewer = new Cesium.Viewer(cesiumContainer.current, {
      animation: false,
      baseLayerPicker: false,
      fullscreenButton: false,
      geocoder: false,
      homeButton: false,
      infoBox: false,
      sceneModePicker: false,
      selectionIndicator: false,
      timeline: false,
      navigationHelpButton: false,
      navigationInstructionsInitiallyVisible: false,
      scene3DOnly: true,
      requestRenderMode: true,
      maximumRenderTimeChange: Infinity,
    });

    // Remove credits for cleaner UI
    const creditsElement = viewer.bottomContainer as HTMLElement;
    if (creditsElement) {
        creditsElement.style.display = 'none';
    }

    // Set initial camera view
    viewer.camera.setView({
      destination: Cesium.Cartesian3.fromDegrees(0.0, 20.0, 20000000.0),
    });

    // Register with GlobeService
    GlobeService.initialize(viewer);

    // Initialize Default Layers
    const dayNightLayer = new DayNightLayer();
    const satelliteLayer = new SatelliteLayer();
    const locationLayer = new LocationLayer();
    const orbitLayer = new OrbitLayer();
    const issLayer = new ISSLayer();
    const moonGroundLayer = new MoonGroundLayer();
    const planetGroundLayer = new PlanetGroundLayer();

    LayerManager.addLayer(dayNightLayer);
    LayerManager.addLayer(satelliteLayer);
    LayerManager.addLayer(locationLayer);
    LayerManager.addLayer(orbitLayer);
    LayerManager.addLayer(issLayer);
    LayerManager.addLayer(moonGroundLayer);
    LayerManager.addLayer(planetGroundLayer);

    dayNightLayer.show();
    satelliteLayer.show();
    locationLayer.show();
    orbitLayer.show();
    issLayer.show();
    moonGroundLayer.show();
    planetGroundLayer.show();
    
    // Boot up the ISS Telemetry Service
    ISSService.initialize();


    // Hook Cesium update ticks to the LayerManager
    const removePreUpdateEvent = viewer.scene.preUpdate.addEventListener((scene, time) => {
      LayerManager.updateAll(time);
    });

    // Implement zoom-based label visibility (Far, Medium, Close) and collision resolution
    const updateLabelVisibility = () => {
      const height = viewer.camera.positionCartographic.height;
      const scene = viewer.scene;
      const julianDate = Cesium.JulianDate.now();
      const activeSatellites = useSatelliteStore.getState().activeSatellites;

      const entitiesWithLabels: Cesium.Entity[] = [];

      // 1. Gather labels from viewer's direct entities (like planets and moon)
      viewer.entities.values.forEach((entity) => {
        if (entity.label) {
          entitiesWithLabels.push(entity);
        }
      });

      // 2. Gather labels from dataSources
      const dataSources = viewer.dataSources;
      for (let i = 0; i < dataSources.length; i++) {
        const ds = dataSources.get(i);
        ds.entities.values.forEach((entity) => {
          if (entity.label) {
            entitiesWithLabels.push(entity);
          }
        });
      }

      // 3. Assign base zoom-level visibility rules using getEntityPriority
      entitiesWithLabels.forEach((entity) => {
        const priority = getEntityPriority(entity, activeSatellites);
        let showLabel = true;

        if (height > 6000000) {
          // Far Zoom: Show only entities with priority >= 85 (Location, ISS, Moon, Planets)
          showLabel = priority >= 85;
        } else if (height > 2000000) {
          // Medium Zoom: Show entities with priority >= 70 (Adds Space Stations, Weather Satellites)
          showLabel = priority >= 70;
        } else {
          // Close Zoom: Show all entities with priority >= 40 (Adds Navigation, Comm, Others)
          showLabel = priority >= 40;
        }

        // Tag entity with its base zoom status and priority
        (entity as any)._zoomShowLabel = showLabel;
        (entity as any)._priority = priority;
      });

      // 4. Sort by priority descending (highest priority first)
      const sortedEntities = [...entitiesWithLabels].sort((a, b) => {
        const prioA = (a as any)._priority || 0;
        const prioB = (b as any)._priority || 0;
        return prioB - prioA;
      });

      // 5. Run screen-space collision checks and mutate visibility
      resolveLabelCollisions(sortedEntities, scene, julianDate);
    };

    viewer.camera.percentageChanged = 0.05;
    const removeCameraChanged = viewer.camera.changed.addEventListener(updateLabelVisibility);

    // Throttled postRender updates at 100ms (10Hz) to update labels continuously during smooth motion
    let lastRenderUpdate = 0;
    const removePostRender = viewer.scene.postRender.addEventListener(() => {
      const now = Date.now();
      if (now - lastRenderUpdate > 100) {
        updateLabelVisibility();
        lastRenderUpdate = now;
      }
    });

    // Trigger an initial layout calculation after Cesium completes loading data
    const initialTimer = setTimeout(() => {
      updateLabelVisibility();
    }, 500);

    setGlobeReady(true);

    return () => {
      clearTimeout(initialTimer);
      removePostRender();
      removeCameraChanged();
      removePreUpdateEvent();
      LayerManager.destroyAll();
      GlobeService.destroy();
      viewer.destroy();
    };
  }, [setGlobeReady]);

  return <div id="cesiumContainer" ref={cesiumContainer} className="w-full h-full absolute inset-0 -z-10" />;
}
