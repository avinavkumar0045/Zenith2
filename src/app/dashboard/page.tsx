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
import { X, Sparkles, Compass, MapPin, Loader2 } from 'lucide-react';
import clsx from 'clsx';

// Dynamically import the Cesium globe to avoid SSR issues
const CesiumGlobe = dynamic(() => import('@/modules/globe/CesiumGlobe'), {
  ssr: false,
  loading: () => null,
});

import { useAppStore } from '@/store/useAppStore';

function WelcomePanel() {
  return (
    <div className="bg-black/60 border border-white/10 backdrop-blur-xl rounded-2xl p-5 w-full max-w-sm pointer-events-auto shadow-2xl flex flex-col gap-4">
      <div className="flex items-center gap-2 text-blue-400">
        <Sparkles className="w-5 h-5 animate-pulse" />
        <h2 className="text-sm font-bold uppercase tracking-wider">Zenith Telemetry Standby</h2>
      </div>
      <p className="text-sm text-gray-300 leading-relaxed">
        Welcome to Project Zenith. The celestial mapping system is active. Search a location or load tracking modules to begin scanning look angles.
      </p>
      <div className="border-t border-white/10 pt-4 flex flex-col gap-3">
        <div className="flex items-start gap-2.5 text-xs text-gray-400">
          <span className="w-5 h-5 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center flex-shrink-0 font-bold">1</span>
          <p className="leading-snug">Use the search bar at the top to target any global city or coordinates.</p>
        </div>
        <div className="flex items-start gap-2.5 text-xs text-gray-400">
          <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center flex-shrink-0 font-bold">2</span>
          <p className="leading-snug">Expand modules in the Control Center (right side) to track satellites, constellations, or ISS passes.</p>
        </div>
      </div>
    </div>
  );
}

function AppOverlay() {
  const { activeLocation } = useLocation();
  const searchParams = useSearchParams();
  const action = searchParams.get('action');
  
  const isGlobeReady = useAppStore(state => state.isGlobeReady);
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
  
  // Transition state
  const [isTransitioning, setIsTransitioning] = useState(action === 'analyze');
  const [transitionStatus, setTransitionStatus] = useState("Initializing Telemetry...");

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

  // Loading state when Cesium globe is instantiating
  if (!isGlobeReady) {
    return (
      <div className="absolute inset-0 bg-black flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          <div className="text-white text-xs tracking-widest uppercase opacity-75">
            Initializing System...
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 3D Background Layer */}
      <div className="absolute inset-0 z-0">
        <CesiumGlobe />
      </div>

      {/* Cinematic Transition Overlay */}
      {isTransitioning && (
        <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center z-50 transition-opacity duration-700">
          <div className="flex flex-col items-center gap-4 animate-pulse">
            <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            <p className="text-white text-sm font-light tracking-widest uppercase">
              {transitionStatus}
            </p>
          </div>
        </div>
      )}

      {/* Main UI Layer (Always active, top level) */}
      <div className={clsx(
        "absolute inset-0 z-20 pointer-events-none flex flex-col p-4 md:p-6 justify-between h-full transition-all duration-1000",
        isTransitioning ? "opacity-0 scale-95" : "opacity-100 scale-100"
      )}>
        
        {/* Top Header Area: Search and Status */}
        <div className="flex flex-row justify-between items-center gap-4 w-full pointer-events-none z-30">
          <div className="w-full md:w-auto flex-1 max-w-xl pointer-events-auto">
            <LocationSearch />
          </div>
          
          <div className="hidden md:block pointer-events-auto">
            <LocationStatus />
          </div>
        </div>

        {/* Floating Layout Area */}
        <div className="flex-1 w-full min-h-0 flex flex-row justify-between items-stretch py-4 md:py-6 gap-6 pointer-events-none relative">
          
          {/* Left side panel: Location + Orbit + Reports */}
          <div className={clsx(
            "fixed md:relative top-0 left-0 h-full z-40 md:z-auto w-80 md:w-96 flex flex-col gap-4 bg-black/90 md:bg-transparent backdrop-blur-xl md:backdrop-blur-none p-6 md:p-0 transition-transform duration-300 pointer-events-auto border-r border-white/10 md:border-none",
            leftSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          )}>
            {/* Mobile close header */}
            <div className="flex md:hidden items-center justify-between border-b border-white/10 pb-3 mb-2">
              <span className="text-sm font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> System Telemetry
              </span>
              <button className="text-gray-400 hover:text-white" onClick={() => setLeftSidebarOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable container for panel stack */}
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4 pr-1">
              {activeLocation ? (
                <>
                  <LocationCard />
                  <CelestialReport />
                  <OrbitPanel />
                  <OrbitLegend />
                </>
              ) : (
                <WelcomePanel />
              )}
            </div>
          </div>

          {/* Right side panels: Zenith Control Center */}
          <div className={clsx(
            "fixed md:relative top-0 right-0 h-full z-40 md:z-auto w-80 md:w-96 flex flex-col gap-4 bg-black/90 md:bg-transparent backdrop-blur-xl md:backdrop-blur-none p-6 md:p-0 transition-transform duration-300 pointer-events-auto border-l border-white/10 md:border-none",
            rightSidebarOpen ? "translate-x-0" : "translate-x-full md:translate-x-0"
          )}>
            {/* Mobile close header */}
            <div className="flex md:hidden items-center justify-between border-b border-white/10 pb-3 mb-2">
              <span className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <Compass className="w-4 h-4" /> Control Center
              </span>
              <button className="text-gray-400 hover:text-white" onClick={() => setRightSidebarOpen(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable container for control center */}
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-4 pr-1">
              <SatelliteDetails />
              <ZenithControlCenter />
            </div>
          </div>
        </div>

        {/* Floating HUD triggers for Mobile/Tablet */}
        <div className="fixed bottom-6 left-6 z-30 md:hidden pointer-events-auto flex gap-3">
          <button 
            onClick={() => setLeftSidebarOpen(true)}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-blue-600/90 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)] backdrop-blur-sm border border-blue-400/20 active:scale-95 transition-all"
          >
            <MapPin className="w-5 h-5" />
          </button>
          <button 
            onClick={() => setRightSidebarOpen(true)}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/90 text-white shadow-[0_0_15px_rgba(245,158,11,0.4)] backdrop-blur-sm border border-amber-400/20 active:scale-95 transition-all"
          >
            <Compass className="w-5 h-5" />
          </button>
        </div>

        {/* Phase 3A: Orbit Timeline HUD (bottom center, nested cleanly) */}
        <div className="w-full flex justify-center pointer-events-auto z-10">
          <OrbitTimeline />
        </div>
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
