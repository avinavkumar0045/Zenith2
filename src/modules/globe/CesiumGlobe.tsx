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

    LayerManager.addLayer(dayNightLayer);
    LayerManager.addLayer(satelliteLayer);
    LayerManager.addLayer(locationLayer);
    LayerManager.addLayer(orbitLayer);

    dayNightLayer.show();
    satelliteLayer.show();
    locationLayer.show();
    orbitLayer.show();

    // Hook Cesium update ticks to the LayerManager
    const removePreUpdateEvent = viewer.scene.preUpdate.addEventListener((scene, time) => {
      LayerManager.updateAll(time);
    });

    setGlobeReady(true);

    return () => {
      removePreUpdateEvent();
      LayerManager.destroyAll();
      GlobeService.destroy();
      viewer.destroy();
    };
  }, [setGlobeReady]);

  return <div id="cesiumContainer" ref={cesiumContainer} className="w-full h-full absolute inset-0 -z-10" />;
}
