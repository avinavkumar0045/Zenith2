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

export default function CesiumGlobe() {
  const cesiumContainer = useRef<HTMLDivElement>(null);
  const setGlobeReady = useAppStore((state) => state.setGlobeReady);

  useEffect(() => {
    if (!cesiumContainer.current) return;

    // Set Cesium base URL
    (window as any).CESIUM_BASE_URL = '/cesium';

    // Provide the active community token (from 1.142.0) since the default in 1.134.0 has expired
    Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIxMDYxM2JlMS00NTIzLTQ0YWItYTg5My00NzRkMDgwNThiZDciLCJpZCI6MjU5LCJzdWIiOiJDZXNpdW1KUyIsImlzcyI6Imh0dHBzOi8vYXBpLmNlc2l1bS5jb20iLCJhdWQiOiIxLjE0MiBSZWxlYXNlIC0gRGVsZXRlIG9uIEF1Z3VzdCAxLCAyMDI2IiwiaWF0IjoxNzc5NjkwODE2fQ.Eq05fkRTh1lFGZUqr9vZZorz4HO_6rY_UmYi3fIHYaU';

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

    // Explicitly guarantee touch inputs are enabled for mobile
    viewer.scene.screenSpaceCameraController.enableInputs = true;
    viewer.scene.screenSpaceCameraController.enableZoom = true;
    viewer.scene.screenSpaceCameraController.enableRotate = true;
    viewer.scene.screenSpaceCameraController.enableTilt = true;
    viewer.scene.screenSpaceCameraController.enableTranslate = true;

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
