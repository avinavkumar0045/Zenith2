"use client";

import dynamic from 'next/dynamic';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import LocationSearch from '@/modules/location/components/LocationSearch';
import LocationCard from '@/modules/location/components/LocationCard';
import LocationStatus from '@/modules/location/components/LocationStatus';
import { useLocation } from '@/modules/location/hooks/useLocation';
import { LocationService } from '@/modules/location/services/LocationService';
import SatelliteDetails from '@/modules/satellites/components/SatelliteDetails';
import OrbitPanel from '@/modules/orbits/components/OrbitPanel';
import OrbitLegend from '@/modules/orbits/components/OrbitLegend';
import OrbitTimeline from '@/modules/orbits/components/OrbitTimeline';
import ZenithControlCenter from '@/components/ui/ZenithControlCenter';
import { PassPredictionService } from '@/modules/pass-predictions/services/PassPredictionService';
import { CelestialReport } from '@/modules/reports/components/CelestialReport';
import { SkyIntelligenceService } from '@/modules/reports/services/SkyIntelligenceService';
import { ObservationPlanningService } from '@/modules/reports/services/ObservationPlanningService';
import { MoonService } from '@/modules/moon/services/MoonService';
import { MoonPositionService } from '@/modules/moon/services/MoonPositionService';
import { PlanetPositionService } from '@/modules/planets/services/PlanetPositionService';
import { WeatherService } from '@/modules/weather/services/WeatherService';
import { ConstellationIntelligenceService } from '@/modules/constellations/services/ConstellationIntelligenceService';
import { SkyCorrelationService } from '@/modules/sky-correlation/services/SkyCorrelationService';
import { ObserverGuidanceService } from '@/modules/observer-guidance/services/ObserverGuidanceService';
import { SSAIntelligenceService } from '@/modules/ssa/services/SSAIntelligenceService';
import { EventIntelligenceService } from '@/modules/events/services/EventIntelligenceService';
import { OpportunityIntelligenceService } from '@/modules/opportunity/services/OpportunityIntelligenceService';
import { X, Sparkles, Compass, MapPin, Loader2, Target, Clock, Layers, Sun, Moon, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { useLocationStore } from '@/modules/location/store/useLocationStore';

// Dynamically import the Cesium globe to avoid SSR issues
const CesiumGlobe = dynamic(() => import('@/modules/globe/CesiumGlobe'), {
  ssr: false,
  loading: () => null,
});

import { useAppStore } from '@/store/useAppStore';

function AppOverlay() {
  const searchParams = useSearchParams();
  const action = searchParams.get('action');
  
  const isGlobeReady = useAppStore(state => state.isGlobeReady);
  
  // Transition state
  const [isTransitioning, setIsTransitioning] = useState(action === 'analyze');
  const [transitionStatus, setTransitionStatus] = useState("Initializing Telemetry...");
  
  // Design & workspace states
  const activeLocation = useLocationStore((state) => state.activeLocation);
  const [activeWorkspace, setActiveWorkspace] = useState("Mission");

  useEffect(() => {
    WeatherService.initialize();
    ConstellationIntelligenceService.initialize();
    SkyCorrelationService.initialize();
    ObserverGuidanceService.initialize();
    SSAIntelligenceService.initialize();
    EventIntelligenceService.initialize();
    OpportunityIntelligenceService.initialize();
    PassPredictionService.initialize();
    SkyIntelligenceService.initialize();
    ObservationPlanningService.initialize();
    MoonService.initialize();
    MoonPositionService.initialize();
    PlanetPositionService.initialize();
    
    return () => {
      WeatherService.destroy();
      ConstellationIntelligenceService.destroy();
      SkyCorrelationService.destroy();
      ObserverGuidanceService.destroy();
      SSAIntelligenceService.destroy();
      EventIntelligenceService.destroy();
      OpportunityIntelligenceService.destroy();
      PassPredictionService.destroy();
      SkyIntelligenceService.destroy();
      ObservationPlanningService.destroy();
      MoonService.destroy();
      MoonPositionService.destroy();
      PlanetPositionService.destroy();
    };
  }, []);

  // Cinematic Geolocation & flyTo animation sequence when arriving from landing hero
  useEffect(() => {
    if (action === 'analyze' && isGlobeReady) {
      setIsTransitioning(true);
      setTransitionStatus("Determining orbital coordinates...");
      
      const runTransition = async () => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              setTransitionStatus("Aligning celestial telemetry...");
              
              // Focus location (this triggers Cesium's flyTo, duration is 2.0s)
              await LocationService.setLocationFromCoordinates(latitude, longitude, "Current Location");
              
              // Wait for the flyTo animation to complete
              setTimeout(() => {
                setIsTransitioning(false);
              }, 2200);
            },
            async (error) => {
              console.warn("Geolocation denied or failed, using global overview fallback", error);
              setTransitionStatus("Aligning global overview...");
              
              // Fallback default coordinates (London)
              await LocationService.setLocationFromCoordinates(51.5074, -0.1278, "Global Overview");
              
              setTimeout(() => {
                setIsTransitioning(false);
              }, 2200);
            }
          );
        } else {
          setTransitionStatus("Aligning global overview...");
          await LocationService.setLocationFromCoordinates(51.5074, -0.1278, "Global Overview");
          
          setTimeout(() => {
            setIsTransitioning(false);
          }, 2200);
        }
      };

      runTransition();
    }
  }, [action, isGlobeReady]);

  const workspaces = [
    { id: "Mission", label: "Mission", icon: Target },
    { id: "Objects", label: "Objects", icon: Compass },
    { id: "Timeline", label: "Timeline", icon: Clock },
    { id: "Layers", label: "Layers", icon: Layers },
    { id: "AI", label: "AI", icon: Sparkles }
  ];

  return (
    <>
      {/* 3D Background Layer */}
      <div className="absolute inset-0 z-0">
        <CesiumGlobe />
      </div>

      {/* Ambient Earth Glow Overlay (Atmospheric safe zone framing) */}
      <div 
        className="absolute inset-0 z-10 pointer-events-none select-none overflow-hidden"
        style={{
          background: 'radial-gradient(circle at center, transparent 35%, rgba(34, 211, 238, 0.02) 60%, rgba(34, 211, 238, 0.06) 80%, rgba(0,0,0,0.55) 100%)'
        }}
      />

      {/* Loading state when Cesium globe is instantiating */}
      {!isGlobeReady && (
        <div className="absolute inset-0 bg-black flex items-center justify-center z-50">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-cyan-500 animate-spin" />
            <div className="text-white text-xs tracking-widest uppercase opacity-75">
              Initializing System...
            </div>
          </div>
        </div>
      )}

      {/* Cinematic Transition Overlay */}
      {isTransitioning && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center z-50 transition-opacity duration-700">
          <div className="flex flex-col items-center gap-4 animate-pulse">
            <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
            <p className="text-white text-sm font-light tracking-widest uppercase">
              {transitionStatus}
            </p>
          </div>
        </div>
      )}

      {/* Main Workspace Layout */}
      <div className={clsx(
        "absolute inset-0 z-20 pointer-events-none flex flex-col justify-between p-4 sm:p-6 h-full transition-all duration-1000",
        isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"
      )}>
        
        {/* Zenith Command Island (Merged Single Capsule) */}
        <div className="w-full flex justify-center pointer-events-auto z-20">
          <div className="glass-capsule-heavy h-12 w-full max-w-xs sm:max-w-md md:max-w-xl flex items-center justify-between px-3 md:px-4 text-[10px] md:text-xs text-white/50 font-mono tracking-widest uppercase rounded-full select-none gap-2">
            {/* 1. Brand Identity */}
            <div className="flex items-center gap-1.5 pl-1.5 flex-shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
              </span>
              <span className="font-sans font-semibold text-white tracking-[0.25em] text-[11px] md:text-[12px] hover:text-cyan-400 transition-colors duration-200 cursor-default">ZENITH</span>
            </div>

            <div className="w-px h-4 bg-white/10 flex-shrink-0" />

            {/* 2. Current Location */}
            <div className="flex items-center gap-1.5 text-white/80 max-w-[80px] sm:max-w-[130px] md:max-w-[170px] truncate flex-shrink-0">
              <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
              {activeLocation ? (
                <div className="flex items-center gap-1 truncate font-sans">
                  <span className="font-medium truncate text-[10px] md:text-[11px] text-white/95">{activeLocation.name}</span>
                  {activeLocation.dayState.toLowerCase().includes('night') ? (
                    <Moon className="w-3 h-3 text-indigo-400 flex-shrink-0" />
                  ) : (
                    <Sun className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                  )}
                </div>
              ) : (
                <span className="text-[9px] md:text-[10px] text-white/30 tracking-wider font-sans">GLOBAL ORBIT</span>
              )}
            </div>

            <div className="w-px h-4 bg-white/10 flex-shrink-0" />

            {/* 3. Search Trigger (Primary CTA - Sleek Input Shell style) */}
            <div className="flex-1 max-w-[120px] sm:max-w-[160px] md:max-w-[200px] flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 hover:bg-white/15 hover:border-white/20 text-white/50 hover:text-white/80 transition-all duration-[150ms] cursor-pointer shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
              <Search className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
              <span className="text-[9px] md:text-[10px] font-sans font-normal tracking-wide text-left select-none text-white/40 truncate">Search location...</span>
            </div>

            <div className="w-px h-4 bg-white/10 flex-shrink-0" />

            {/* 4. System Status */}
            <div className="flex items-center gap-1.5 pr-1 flex-shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></span>
              <span className="text-[8px] md:text-[9px] text-emerald-400/90 font-bold tracking-widest">SYS_READY</span>
            </div>
          </div>
        </div>

        {/* Center Space: Earth Safe Zone (Interaction Center) */}
        <div className="flex-1 w-full pointer-events-none" />

        {/* Floating Bottom Dock Area: Workspace Selector */}
        <div className="w-full flex justify-center pointer-events-auto z-20 mb-6 sm:mb-8">
          <div className="glass-capsule-heavy h-12 p-1 w-full max-w-[280px] sm:max-w-md md:max-w-lg flex items-center justify-around rounded-full select-none relative">
            {workspaces.map((ws) => {
              const Icon = ws.icon;
              const isActive = activeWorkspace === ws.id;
              return (
                <button
                  key={ws.id}
                  onClick={() => setActiveWorkspace(ws.id)}
                  className={clsx(
                    "relative flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-4 rounded-full text-xs font-sans tracking-widest uppercase transition-colors duration-[250ms] flex-1 cursor-pointer hover:scale-105 active:scale-95 group",
                    isActive ? "text-white font-semibold" : "text-white/40 hover:text-white/80"
                  )}
                >
                  {/* Sliding glass capsule background */}
                  {isActive && (
                    <motion.div
                      layoutId="activeWorkspacePill"
                      className="absolute inset-0 bg-white/10 border border-white/15 rounded-full -z-10 shadow-[0_4px_12px_rgba(6,182,212,0.15),inset_0_1px_1px_rgba(255,255,255,0.1)]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon className={clsx(
                    "w-4 h-4 transition-all duration-[150ms] group-hover:scale-110",
                    isActive ? "text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]" : "text-white/40 group-hover:text-cyan-300"
                  )} />
                  <span className="hidden sm:inline text-[9px] md:text-[10px] tracking-wider">{ws.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Context Drawer Area (Closed by default) */}
        <div id="context-drawer-placeholder" className="hidden" aria-hidden="true" />
      </div>

      {/* Hidden components archive (Preserves 100% of features and compilation states for future phases) */}
      <div className="hidden" aria-hidden="true">
        <LocationSearch />
        <LocationStatus />
        <LocationCard />
        <CelestialReport />
        <OrbitPanel />
        <OrbitLegend />
        <OrbitTimeline />
        <SatelliteDetails />
        <ZenithControlCenter />
      </div>
    </>
  );
}

export default function Home() {
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-black">
      <Suspense fallback={null}>
        <AppOverlay />
      </Suspense>
    </main>
  );
}
