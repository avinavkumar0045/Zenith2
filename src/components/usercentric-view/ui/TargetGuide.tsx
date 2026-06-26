import React, { useEffect, useState, useRef } from 'react';
import * as Cesium from 'cesium';
import { SkyObject } from '../UserCentricView.types';
import { CameraController } from '../services/CameraController';

interface TargetGuideProps {
  viewer: Cesium.Viewer | null;
  selectedObject: (SkyObject & { distanceStr?: string; visibilityScore?: number }) | null;
}

export default function TargetGuide({ viewer, selectedObject }: TargetGuideProps) {
  const [hudState, setHudState] = useState<{
    visible: boolean;
    isOnScreen: boolean;
    x: number;
    y: number;
    angle: number; // For off-screen arrow orientation
    distance: string;
    visibility: string;
  } | null>(null);

  const requestRef = useRef<number | null>(null);

  // Dictionary of static distances
  const DISTANCES: Record<string, string> = {
    sirius: "8.6 Light Years",
    polaris: "433 Light Years",
    betelgeuse: "640 Light Years",
    rigel: "860 Light Years",
    vega: "25 Light Years",
    altair: "16.7 Light Years",
    aldebaran: "65 Light Years",
    pollux: "34 Light Years",
    castor: "52 Light Years",
    regulus: "79 Light Years",
    antares: "550 Light Years",
    deneb: "2,600 Light Years",
    m31: "2.5 Million LY",
    m42: "1,344 Light Years",
    m45: "444 Light Years",
    m8: "4,100 Light Years"
  };

  useEffect(() => {
    if (!viewer || !selectedObject) {
      setHudState(null);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      return;
    }

    const scene = viewer.scene;
    const canvas = scene.canvas;

    const updatePosition = () => {
      if (!viewer || !selectedObject) return;

      // 1. Get Cartesian3 position of target in ECEF
      let targetCartesian: Cesium.Cartesian3 | undefined;

      // We read from the billboard collections or calculate using the engine
      if (selectedObject.type === 'planet') {
        let planetsData: Record<string, any> = {};
        try {
          planetsData = require('@/modules/planets/store/usePlanetStore').usePlanetStore.getState().planets || {};
        } catch (e) {}
        const data = planetsData[selectedObject.id];
        if (data) {
          targetCartesian = require('../engine/CelestialProjectionEngine').CelestialProjectionEngine.altAzToCartesian(
            data.altitude,
            data.azimuth,
            viewer.camera.position,
            350000.0
          );
        }
      } 
      else if (selectedObject.type === 'moon') {
        let moonData: any = null;
        try {
          moonData = require('@/modules/moon/store/useMoonStore').useMoonStore.getState().moonData;
        } catch (e) {}
        const alt = moonData ? moonData.altitude : 45.0;
        const az = moonData ? moonData.azimuth : 180.0;
        targetCartesian = require('../engine/CelestialProjectionEngine').CelestialProjectionEngine.altAzToCartesian(
          alt,
          az,
          viewer.camera.position,
          340000.0
        );
      }
      else if (selectedObject.type === 'satellite') {
        let activeSats: any[] = [];
        try {
          activeSats = require('@/modules/satellites/store/useSatelliteStore').useSatelliteStore.getState().activeSatellites || [];
        } catch (e) {}
        const sat = activeSats.find(s => s.id === selectedObject.id);
        if (sat) {
          const satPos = Cesium.Cartesian3.fromDegrees(sat.longitude, sat.latitude, sat.altitude || 400000);
          const altAz = require('../engine/CelestialProjectionEngine').CelestialProjectionEngine.getAltAzFromCartesian(satPos, viewer.camera.position);
          targetCartesian = require('../engine/CelestialProjectionEngine').CelestialProjectionEngine.altAzToCartesian(
            altAz.altitude,
            altAz.azimuth,
            viewer.camera.position,
            300000.0
          );
        }
      }
      else {
        // Star or Deep Sky
        targetCartesian = require('../engine/CelestialProjectionEngine').CelestialProjectionEngine.projectCelestial(
          selectedObject.ra,
          selectedObject.dec,
          // Observer geodetic location coordinates are near camera position
          Cesium.Math.toDegrees(viewer.camera.positionCartographic.latitude),
          Cesium.Math.toDegrees(viewer.camera.positionCartographic.longitude),
          // date
          new Date(),
          viewer.camera.position,
          380000.0
        );
      }

      if (!targetCartesian) {
        requestRef.current = requestAnimationFrame(updatePosition);
        return;
      }

      // 2. Project Cartesian to screen space
      const screenPos = Cesium.SceneTransforms.worldToWindowCoordinates(scene, targetCartesian);
      
      if (!screenPos) {
        // Behind the camera / not in view frustum
        // Point arrow towards the target azimuth
        const altAz = require('../engine/CelestialProjectionEngine').CelestialProjectionEngine.getAltAz(
          selectedObject.ra,
          selectedObject.dec,
          Cesium.Math.toDegrees(viewer.camera.positionCartographic.latitude),
          Cesium.Math.toDegrees(viewer.camera.positionCartographic.longitude),
          new Date()
        );

        // Find camera heading
        const camHeadingDeg = CameraController.getCameraOrientationDeg().heading;
        const diffAz = (altAz.azimuth - camHeadingDeg + 540) % 360 - 180; // offset direction angle

        setHudState({
          visible: true,
          isOnScreen: false,
          x: canvas.clientWidth / 2,
          y: canvas.clientHeight / 2,
          angle: diffAz,
          distance: DISTANCES[selectedObject.id.toLowerCase()] || selectedObject.distanceStr || "Far Space",
          visibility: selectedObject.visibilityScore ? `${Math.round(selectedObject.visibilityScore * 10)}%` : "Good"
        });
      } else {
        const padding = 60;
        const isXInBounds = screenPos.x >= padding && screenPos.x <= canvas.clientWidth - padding;
        const isYInBounds = screenPos.y >= padding && screenPos.y <= canvas.clientHeight - padding;
        
        if (isXInBounds && isYInBounds) {
          // On screen target reticle
          setHudState({
            visible: true,
            isOnScreen: true,
            x: screenPos.x,
            y: screenPos.y,
            angle: 0,
            distance: DISTANCES[selectedObject.id.toLowerCase()] || selectedObject.distanceStr || "Far Space",
            visibility: selectedObject.visibilityScore ? `${Math.round(selectedObject.visibilityScore * 10)}%` : "Good"
          });
        } else {
          // Off screen pointer arrow at boundaries
          const cx = canvas.clientWidth / 2;
          const cy = canvas.clientHeight / 2;
          const dx = screenPos.x - cx;
          const dy = screenPos.y - cy;
          const angle = Math.atan2(dy, dx); // radians

          // Clamp screen coordinates to edges
          const borderX = cx + Math.cos(angle) * (cx - padding);
          const borderY = cy + Math.sin(angle) * (cy - padding);

          setHudState({
            visible: true,
            isOnScreen: false,
            x: borderX,
            y: borderY,
            angle: angle * (180.0 / Math.PI),
            distance: DISTANCES[selectedObject.id.toLowerCase()] || selectedObject.distanceStr || "Far Space",
            visibility: selectedObject.visibilityScore ? `${Math.round(selectedObject.visibilityScore * 10)}%` : "Good"
          });
        }
      }

      requestRef.current = requestAnimationFrame(updatePosition);
    };

    // Run loop
    updatePosition();

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [viewer, selectedObject]);

  if (!hudState || !hudState.visible) return null;

  return (
    <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden select-none">
      {hudState.isOnScreen ? (
        /* Reticle Around Selected Object */
        <div 
          className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
          style={{ left: `${hudState.x}px`, top: `${hudState.y}px` }}
        >
          {/* Animated Glowing Ring reticle */}
          <div className="w-14 h-14 rounded-full border-2 border-dashed border-cyan-400/80 animate-spin-slow shadow-glow flex items-center justify-center">
            {/* Center target cursor dot */}
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
          </div>

          {/* Quick HUD specs tag */}
          <div className="mt-2.5 flex flex-col items-center bg-black/60 border border-white/10 px-2 py-1 rounded-lg backdrop-blur-md text-[9px] font-bold text-white/90 shadow-md gap-0.5 min-w-[90px]">
            <span className="text-cyan-400 tracking-wide">{selectedObject!.name}</span>
            <span className="text-white/40 text-[7px] uppercase tracking-tighter">DIST: {hudState.distance}</span>
          </div>
        </div>
      ) : (
        /* Off-Screen Guidance Pointer Arrow */
        <div 
          className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-1"
          style={{ left: `${hudState.x}px`, top: `${hudState.y}px` }}
        >
          {/* Glowing Arrow pointing towards the target */}
          <div 
            className="w-10 h-10 flex items-center justify-center animate-pulse"
            style={{ transform: `rotate(${hudState.angle}deg)` }}
          >
            <svg viewBox="0 0 24 24" className="w-8 h-8 fill-cyan-400 filter-glow drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]">
              <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
            </svg>
          </div>
          
          {/* Arrow target tag */}
          <div className="bg-cyan-500/20 border border-cyan-400/40 px-1.5 py-0.5 rounded text-[8px] font-extrabold text-cyan-300 tracking-wide uppercase">
            Look {selectedObject!.name.split(' ')[0]}
          </div>
        </div>
      )}

      <style jsx>{`
        .shadow-glow {
          box-shadow: 0 0 10px rgba(34, 211, 238, 0.4);
        }
        .filter-glow {
          filter: drop-shadow(0 0 4px rgba(34, 211, 238, 0.9));
        }
        .animate-spin-slow {
          animation: spin 8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
