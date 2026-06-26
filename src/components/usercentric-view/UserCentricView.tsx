"use client";

import React, { useEffect, useRef, useState } from 'react';
import * as Cesium from 'cesium';
import { useLocationStore } from '../../modules/location/store/useLocationStore';
import { useTimeStore } from '../workspaces/time-intelligence/types';
import { SkyRenderer } from './engine/SkyRenderer';
import { CameraController } from './services/CameraController';
import { SkySceneService } from './services/SkySceneService';
import { SkyObject, HorizonTheme, ZoomLevel } from './UserCentricView.types';
import { Eye, EyeOff } from 'lucide-react';
import { EventBus } from '@/components/ai/orchestrator/EventBus';
import { ExplorerAPI } from '@/components/ai/api/ExplorerAPI';

// UI imports
import ObservationHUD from './ui/ObservationHUD';
import Compass from './ui/Compass';
import ZoomControls from './ui/ZoomControls';
import TimelineMini from './ui/TimelineMini';
import ObservationCard from './ui/ObservationCard';
import TargetGuide from './ui/TargetGuide';
import Notifications from './ui/Notifications';

export default function UserCentricView() {
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [viewer, setViewer] = useState<Cesium.Viewer | null>(null);
  const [selectedObject, setSelectedObject] = useState<SkyObject | null>(null);
  const [isObserving, setIsObserving] = useState(false);
  const [isTracked, setIsTracked] = useState(false);
  const [activeHorizonTheme, setActiveHorizonTheme] = useState<HorizonTheme>('mountains');
  const [showGrid, setShowGrid] = useState(true);
  const [showAtmosphere, setShowAtmosphere] = useState(false);
  const [selectedObjectAltAz, setSelectedObjectAltAz] = useState<{ altitude: number; azimuth: number } | null>(null);
  const [isHudCollapsed, setIsHudCollapsed] = useState(false);

  // Camera orientation states for HUD syncing
  const [cameraHeading, setCameraHeading] = useState(0);
  const [cameraPitch, setCameraPitch] = useState(10);
  const [currentFov, setCurrentFov] = useState(60);

  const activeLocation = useLocationStore((state: any) => state.activeLocation);
  const selectedTime = useTimeStore((state: any) => state.selectedTime);

  // Fallback observer coordinates
  const observerLocation = {
    latitude: activeLocation ? activeLocation.latitude : 13.0827,
    longitude: activeLocation ? activeLocation.longitude : 80.2707,
    altitude: 10.0
  };

  // Initialize sky renderer
  useEffect(() => {
    if (!containerRef.current) return;

    const renderer = new SkyRenderer();

    const handleCameraChange = () => {
      const orientation = CameraController.getCameraOrientationDeg();
      setCameraHeading(orientation.heading);
      setCameraPitch(orientation.pitch);
      setCurrentFov(CameraController.currentFov);
    };

    const cesiumViewer = renderer.initialize(
      containerRef.current,
      observerLocation,
      handleCameraChange
    );

    setViewer(cesiumViewer);
    handleCameraChange();

    // 1. Setup mouse click listener to pick sky entities
    const clickHandler = new Cesium.ScreenSpaceEventHandler(cesiumViewer.scene.canvas);
    clickHandler.setInputAction((click: any) => {
      const picked = cesiumViewer.scene.pick(click.position);
      
      if (Cesium.defined(picked) && picked.primitive) {
        const prim = picked.primitive;
        let clickedObj: SkyObject | null = null;

        // Resolve what was picked
        if (prim._starData) {
          // Picked a star
          clickedObj = {
            id: prim._starData.id,
            name: prim._starData.name,
            type: 'star',
            ra: prim._starData.ra,
            dec: prim._starData.dec,
            magnitude: prim._starData.magnitude,
            description: `A bright star of spectral class ${prim._starData.color}.`
          };
        } 
        else if (prim.planetId) {
          // Picked a planet
          let planetsData: Record<string, any> = {};
          try {
            planetsData = require('@/modules/planets/store/usePlanetStore').usePlanetStore.getState().planets || {};
          } catch (e) {}
          const data = planetsData[prim.planetId];
          clickedObj = {
            id: prim.planetId,
            name: prim.planetId.toUpperCase(),
            type: 'planet',
            ra: data ? data.subPlanetLongitude / 15.0 : 12.0,
            dec: data ? data.subPlanetLatitude : 0.0,
            magnitude: prim.planetId === 'venus' ? -4.4 : prim.planetId === 'jupiter' ? -2.2 : 0.5,
            description: `A major planet visible in the sky.`
          };
        }
        else if (prim.satData) {
          // Picked a satellite
          clickedObj = {
            id: prim.satData.id,
            name: prim.satData.name,
            type: 'satellite',
            ra: prim.satData.longitude / 15.0,
            dec: prim.satData.latitude,
            magnitude: 2.5,
            description: `NORAD: ${prim.satData.noradId}. Velocity: ${prim.satData.velocity.toFixed(1)} km/s.`
          };
        }
        else if (prim.dsoData) {
          // Picked a messier object
          clickedObj = {
            id: prim.dsoData.id,
            name: prim.dsoData.name,
            type: 'deepsky',
            ra: prim.dsoData.ra,
            dec: prim.dsoData.dec,
            magnitude: prim.dsoData.magnitude,
            description: prim.dsoData.description
          };
        }
        else if (prim.constellationId) {
          // Picked a constellation line or label
          const conn = require('./assets/starCatalog').CONSTELLATION_CONNECTIONS.find((c: any) => c.constellationId === prim.constellationId);
          if (conn) {
            clickedObj = {
              id: conn.constellationId,
              name: conn.name,
              type: 'deepsky', // or custom type
              ra: 12.0, // center
              dec: 0.0,
              description: `Constellation: ${conn.name}. Connecting lines highlighted.`
            };
          }
        }

        if (clickedObj) {
          setSelectedObject(clickedObj);
          setIsObserving(false);
          setIsTracked(false);
          
          // If a constellation is selected, highlight it
          const constLayer = SkySceneService.getLayer<any>('constellation-layer');
          if (constLayer) {
            constLayer.selectConstellation(clickedObj.type === 'deepsky' && clickedObj.id.length === 3 ? clickedObj.id : null);
          }
        }
      } else {
        // Clicked empty space: clear selection
        setSelectedObject(null);
        setIsObserving(false);
        setIsTracked(false);
        const constLayer = SkySceneService.getLayer<any>('constellation-layer');
        if (constLayer) constLayer.selectConstellation(null);
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    return () => {
      clickHandler.destroy();
      renderer.destroy();
      setViewer(null);
    };
  }, [activeLocation]);

  // Adjust zoom preset
  const handleZoomPresetChange = (level: ZoomLevel) => {
    CameraController.setZoomPreset(level);
  };

  // Adjust horizon theme
  const handleSetHorizonTheme = (theme: HorizonTheme) => {
    setActiveHorizonTheme(theme);
    const horizonLayer = SkySceneService.getLayer<any>('horizon-layer');
    if (horizonLayer) {
      horizonLayer.setTheme(theme);
    }
  };

  // Select an object from Visible Tonight list
  const handleSelectObject = (obj: SkyObject) => {
    setSelectedObject(obj);
    setIsObserving(false);
    setIsTracked(false);
    
    const constLayer = SkySceneService.getLayer<any>('constellation-layer');
    if (constLayer) {
      constLayer.selectConstellation(obj.id === 'ori' || obj.id === 'uma' || obj.id === 'umi' || obj.id === 'cas' || obj.id === 'gem' || obj.id === 'leo' || obj.id === 'sco' || obj.id === 'cyg' || obj.id === 'lyr' || obj.id === 'aql' ? obj.id : null);
    }

    // Automatically center view on the selected target
    focusOnObject(obj);
  };
  // Center camera on target
  const focusOnObject = async (obj: SkyObject) => {
    if (!viewer) return;

    // Calculate target Alt/Az
    let alt = 45;
    let az = 180;

    if (obj.type === 'planet') {
      let planetsData: Record<string, any> = {};
      try {
        planetsData = require('@/modules/planets/store/usePlanetStore').usePlanetStore.getState().planets || {};
      } catch (e) {}
      const data = planetsData[obj.id];
      if (data) {
        alt = data.altitude;
        az = data.azimuth;
      }
    } 
    else if (obj.type === 'moon') {
      let moonData: any = null;
      try {
        moonData = require('@/modules/moon/store/useMoonStore').useMoonStore.getState().moonData;
      } catch (e) {}
      alt = moonData ? moonData.altitude : 45.0;
      az = moonData ? moonData.azimuth : 180.0;
    }
    else if (obj.type === 'satellite') {
      let activeSats: any[] = [];
      try {
        activeSats = require('@/modules/satellites/store/useSatelliteStore').useSatelliteStore.getState().activeSatellites || [];
      } catch (e) {}
      const sat = activeSats.find(s => s.id === obj.id);
      if (sat) {
        const satPos = Cesium.Cartesian3.fromDegrees(sat.longitude, sat.latitude, sat.altitude || 400000);
        const altAz = require('./engine/CelestialProjectionEngine').CelestialProjectionEngine.getAltAzFromCartesian(satPos, viewer.camera.position);
        alt = altAz.altitude;
        az = altAz.azimuth;
      }
    }
    else {
      // Star or DSO
      const altAz = require('./engine/CelestialProjectionEngine').CelestialProjectionEngine.getAltAz(
        obj.ra,
        obj.dec,
        observerLocation.latitude,
        observerLocation.longitude,
        new Date()
      );
      alt = altAz.altitude;
      az = altAz.azimuth;
    }

    // Smooth slew
    await CameraController.slewTo(az, alt, obj.type === 'deepsky' ? 1.0 : 8.0, 2.0);
  };

  const handleFocus = async () => {
    if (!selectedObject) return;
    await focusOnObject(selectedObject);
  };

  // Toggle Observe Mode (fade other objects)
  const handleObserve = () => {
    setIsObserving(!isObserving);
    handleFocus(); // Automatically slew on Observe
  };

  // Sync showGrid state with grid-layer visibility
  useEffect(() => {
    const gridLayer = SkySceneService.getLayer<any>('grid-layer');
    if (gridLayer) {
      if (showGrid) {
        gridLayer.show();
      } else {
        gridLayer.hide();
      }
    }
  }, [showGrid, viewer]);

  // Sync showAtmosphere state with atmosphere-layer and service
  useEffect(() => {
    SkySceneService.showAtmosphere = showAtmosphere;
    const atmosphereLayer = SkySceneService.getLayer<any>('atmosphere-layer');
    if (atmosphereLayer) {
      if (showAtmosphere) {
        atmosphereLayer.show();
      } else {
        atmosphereLayer.hide();
      }
    }
  }, [showAtmosphere, viewer]);

  // Real-time altitude and azimuth for selected object to prevent N/A on card
  useEffect(() => {
    if (!selectedObject || !viewer) {
      setSelectedObjectAltAz(null);
      return;
    }

    const updateSelectedAltAz = () => {
      let alt = 0;
      let az = 0;
      
      let date = selectedTime ? new Date(selectedTime) : new Date();

      if (selectedObject.type === 'planet') {
        let planetsData: Record<string, any> = {};
        try {
          planetsData = require('@/modules/planets/store/usePlanetStore').usePlanetStore.getState().planets || {};
        } catch (e) {}
        const data = planetsData[selectedObject.id];
        if (data) {
          alt = data.altitude;
          az = data.azimuth;
        }
      } 
      else if (selectedObject.type === 'moon') {
        let moonData: any = null;
        try {
          moonData = require('@/modules/moon/store/useMoonStore').useMoonStore.getState().moonData;
        } catch (e) {}
        alt = moonData ? moonData.altitude : 0;
        az = moonData ? moonData.azimuth : 0;
      }
      else if (selectedObject.type === 'satellite') {
        let activeSats: any[] = [];
        try {
          activeSats = require('@/modules/satellites/store/useSatelliteStore').useSatelliteStore.getState().activeSatellites || [];
        } catch (e) {}
        const sat = activeSats.find(s => s.id === selectedObject.id);
        if (sat) {
          const satPos = Cesium.Cartesian3.fromDegrees(sat.longitude, sat.latitude, sat.altitude || 400000);
          const altAz = require('./engine/CelestialProjectionEngine').CelestialProjectionEngine.getAltAzFromCartesian(satPos, viewer.camera.position);
          alt = altAz.altitude;
          az = altAz.azimuth;
        }
      }
      else {
        // Star or DSO
        const altAz = require('./engine/CelestialProjectionEngine').CelestialProjectionEngine.getAltAz(
          selectedObject.ra,
          selectedObject.dec,
          observerLocation.latitude,
          observerLocation.longitude,
          date
        );
        alt = altAz.altitude;
        az = altAz.azimuth;
      }

      setSelectedObjectAltAz({ altitude: alt, azimuth: az });
    };

    updateSelectedAltAz();
    const interval = setInterval(updateSelectedAltAz, 250);

    return () => clearInterval(interval);
  }, [selectedObject, selectedTime, viewer, observerLocation]);

  // Auto-focus when isObserving is active and selectedObject is updated
  useEffect(() => {
    if (isObserving && selectedObject) {
      focusOnObject(selectedObject);
    }
  }, [isObserving, selectedObject]);

  // Listen to AI EventBus for focusTarget actions
  useEffect(() => {
    const typeMap: Record<string, 'star' | 'planet' | 'moon' | 'satellite' | 'deepsky'> = {
      planets: 'planet',
      stars: 'star',
      satellites: 'satellite',
      stations: 'satellite',
      deepsky: 'deepsky'
    };

    const unsubscribe = EventBus.on('focusTarget', (payload: any) => {
      if (!payload) {
        setSelectedObject(null);
        setIsObserving(false);
        setIsTracked(false);
        const constLayer = SkySceneService.getLayer<any>('constellation-layer');
        if (constLayer) constLayer.selectConstellation(null);
        return;
      }

      let targetId = payload.targetId;
      let targetName = payload.targetName;
      let skyObj: SkyObject | null = null;

      if (targetId) {
        const found = ExplorerAPI.getObjectById(targetId);
        if (found) {
          skyObj = {
            id: found.id,
            name: found.name,
            type: found.id === 'moon' || found.id === 'planet_moon' ? 'moon' : (typeMap[found.type] || 'planet'),
            ra: found.coordinates.longitude / 15.0,
            dec: found.coordinates.latitude,
            magnitude: (found as any).magnitude,
            description: found.description
          };
        }
      } else if (targetName) {
        const found = ExplorerAPI.findByName(targetName);
        if (found) {
          skyObj = {
            id: found.id,
            name: found.name,
            type: found.id === 'moon' || found.id === 'planet_moon' ? 'moon' : (typeMap[found.type] || 'planet'),
            ra: found.coordinates.longitude / 15.0,
            dec: found.coordinates.latitude,
            magnitude: (found as any).magnitude,
            description: found.description
          };
        }
      } else if (payload.coords) {
        skyObj = {
          id: 'custom_coords',
          name: 'Target Coordinates',
          type: 'planet',
          ra: payload.coords.longitude / 15.0,
          dec: payload.coords.latitude,
          description: `Coordinates targeted by AI: Lat ${payload.coords.latitude.toFixed(4)}, Lon ${payload.coords.longitude.toFixed(4)}`
        };
      }

      if (skyObj) {
        setSelectedObject(skyObj);
        setIsObserving(true);
        setIsTracked(true);
        
        // Highlight constellation if applicable
        const constLayer = SkySceneService.getLayer<any>('constellation-layer');
        if (constLayer) {
          constLayer.selectConstellation(
            skyObj.id === 'ori' || skyObj.id === 'uma' || skyObj.id === 'umi' || 
            skyObj.id === 'cas' || skyObj.id === 'gem' || skyObj.id === 'leo' || 
            skyObj.id === 'sco' || skyObj.id === 'cyg' || skyObj.id === 'lyr' || 
            skyObj.id === 'aql' ? skyObj.id : null
          );
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [viewer]);

  // Handle updates for tracking or fading during Observe mode
  useEffect(() => {
    SkySceneService.isObserving = isObserving;
    SkySceneService.observedObjectId = isObserving && selectedObject ? selectedObject.id : null;
    SkySceneService.selectedObjectId = selectedObject ? selectedObject.id : null;

    return () => {
      SkySceneService.isObserving = false;
      SkySceneService.observedObjectId = null;
      SkySceneService.selectedObjectId = null;
    };
  }, [isObserving, selectedObject]);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-black text-white">
      {/* 3D Planetarium Canvas Container */}
      <div 
        ref={containerRef}
        id="cesiumContainer"
        className="sky-canvas-container w-full h-full absolute inset-0 z-0"
        style={{ width: '100vw', height: '100vh', position: 'absolute', top: 0, left: 0 }}
      />

      {/* Dynamic Overlay HUD */}
      <ObservationHUD
        onSelectObject={handleSelectObject}
        selectedObject={selectedObject}
        activeHorizonTheme={activeHorizonTheme}
        onSetHorizonTheme={handleSetHorizonTheme}
        cameraHeading={cameraHeading}
        cameraPitch={cameraPitch}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid(!showGrid)}
        showAtmosphere={showAtmosphere}
        onToggleAtmosphere={() => setShowAtmosphere(!showAtmosphere)}
        isCollapsed={isHudCollapsed}
      />

      {/* Spatial Target Pointer reticle/arrow */}
      <TargetGuide 
        viewer={viewer}
        selectedObject={selectedObject}
      />

      {/* Floating Compass slider */}
      {!isHudCollapsed && <Compass headingDegrees={cameraHeading} />}

      {/* Mini Scrub Timeline */}
      <TimelineMini isCollapsed={isHudCollapsed} hasSelectedObject={!!selectedObject} />

      {/* Right Zoom preset controllers */}
      <ZoomControls 
        currentFov={currentFov}
        onPresetChange={handleZoomPresetChange}
        isCollapsed={isHudCollapsed}
      />

      {/* Float Observation Card */}
      {selectedObject && !isHudCollapsed && (
        <ObservationCard
          object={{
            ...selectedObject,
            altitude: selectedObjectAltAz?.altitude,
            azimuth: selectedObjectAltAz?.azimuth
          }}
          onClose={() => {
            setSelectedObject(null);
            setIsObserving(false);
            setIsTracked(false);
            const constLayer = SkySceneService.getLayer<any>('constellation-layer');
            if (constLayer) constLayer.selectConstellation(null);
          }}
          onFocus={handleFocus}
          onObserve={handleObserve}
          isObserving={isObserving}
          isTracked={isTracked}
          onToggleTrack={() => setIsTracked(!isTracked)}
        />
      )}

      {/* Floating HUD toggle button */}
      <button
        onClick={() => setIsHudCollapsed(!isHudCollapsed)}
        className="fixed z-30 flex items-center justify-center w-12 h-12 rounded-full border border-white/10 bg-black/60 hover:bg-white/15 text-white/80 hover:text-white transition-all duration-500 ease-in-out backdrop-blur-md cursor-pointer shadow-lg hover:scale-105 pointer-events-auto"
        style={{
          bottom: selectedObject && !isHudCollapsed ? '196px' : '24px',
          right: '24px'
        }}
        title={isHudCollapsed ? "Show Interface" : "Hide Interface"}
      >
        {isHudCollapsed ? <EyeOff size={20} /> : <Eye size={20} />}
      </button>

      {/* Floating Notifications */}
      {!isHudCollapsed && <Notifications />}
    </main>
  );
}
