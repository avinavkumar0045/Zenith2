"use client";

import dynamic from 'next/dynamic';
import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import LocationSearch from '@/modules/location/components/LocationSearch';
import LocationCard from '@/modules/location/components/LocationCard';
import LocationStatus from '@/modules/location/components/LocationStatus';
import { useLocation } from '@/modules/location/hooks/useLocation';
import { LocationService } from '@/modules/location/services/LocationService';
import { CameraService } from '@/modules/globe/services/CameraService';
import SatelliteDetails from '@/modules/satellites/components/SatelliteDetails';
import OrbitPanel from '@/modules/orbits/components/OrbitPanel';
import OrbitLegend from '@/modules/orbits/components/OrbitLegend';
import OrbitTimeline from '@/modules/orbits/components/OrbitTimeline';
import ZenithControlCenter from '@/components/ui/ZenithControlCenter';
import { CommandIsland } from '@/components/ui/command-island/CommandIsland';
import { MissionBrief } from '@/components/workspaces/mission-brief/MissionBrief';
import { CelestialExplorer } from '@/components/workspaces/celestial-explorer/CelestialExplorer';
import { TimeIntelligence } from '@/components/workspaces/time-intelligence/TimeIntelligence';
import { Visualization } from '@/components/workspaces/visualization/Visualization';
import { ZenithAI } from '@/components/ai/ZenithAI';
import { EventBus } from '@/components/ai/orchestrator/EventBus';
import { useWeatherStore } from '@/modules/weather/store/useWeatherStore';
import { useSkyIntelligenceStore } from '@/modules/reports/store/useSkyIntelligenceStore';
import { useTimeStore } from '@/components/workspaces/time-intelligence/types';
import { CommandIslandAPI } from '@/components/ui/command-island/CommandIslandState';
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

  // AI Event Bus Publishers and store subscriptions
  const weather = useWeatherStore((state) => state.weather);
  const report = useSkyIntelligenceStore((state) => state.report);
  const selectedTime = useTimeStore((state) => state.selectedTime);

  useEffect(() => {
    if (weather) {
      EventBus.emit('WeatherChanged', weather);
    }
  }, [weather]);

  useEffect(() => {
    if (report) {
      EventBus.emit('SkyScoreChanged', report.observationScore);
      if (report.issSummary?.isCurrentlyVisible) {
        EventBus.emit('ISSPassStarted', report.issSummary);
      }
    }
  }, [report]);

  useEffect(() => {
    EventBus.emit('TimelineMoved', selectedTime);
  }, [selectedTime]);

  // AI Proactive Suggestion Listener mapping to Command Island
  useEffect(() => {
    const unsubWeather = EventBus.on('WeatherChanged', (w: any) => {
      if (w && w.cloudCover < 30) {
        CommandIslandAPI.showNotification('AI Suggestion: Clear skies tonight. Plan session?', 1);
      }
    });

    const unsubScore = EventBus.on('SkyScoreChanged', (score: number) => {
      if (score >= 90) {
        CommandIslandAPI.showNotification('AI Suggestion: Excellent stargazing score. Start session?', 1);
      }
    });

    const unsubISS = EventBus.on('ISSPassStarted', (iss: any) => {
      CommandIslandAPI.showNotification('AI Suggestion: ISS Orbit pass arriving. Track ISS?', 1);
    });

    return () => {
      unsubWeather();
      unsubScore();
      unsubISS();
    };
  }, []);

  const handleRecenter = () => {
    if (activeLocation) {
      CameraService.focusLocation(activeLocation.longitude, activeLocation.latitude);
    } else {
      CameraService.resetView();
    }
  };

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
          background: 'radial-gradient(circle at center, rgba(6, 182, 212, 0.02) 0%, rgba(6, 182, 212, 0.06) 45%, rgba(13, 148, 136, 0.01) 65%, rgba(0, 0, 0, 0.72) 100%)'
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
        
        {/* Zenith Command Island */}
        <CommandIsland />

        {/* Center Space: Earth Safe Zone (Interaction Center) */}
        <div className="flex-1 w-full pointer-events-none" />

        {/* Floating Bottom Dock Area: Workspace Selector */}
        <div className="w-full flex justify-center pointer-events-auto z-20 mb-6 sm:mb-8">
          <div className="glass-capsule-dock h-12 p-1 w-full max-w-[280px] sm:max-w-md md:max-w-lg flex items-center justify-around rounded-full select-none relative">
            {workspaces.map((ws) => {
              const Icon = ws.icon;
              const isActive = activeWorkspace === ws.id;
              return (
                <button
                  key={ws.id}
                  onClick={() => setActiveWorkspace(ws.id)}
                  suppressHydrationWarning
                  className={clsx(
                    "relative flex items-center justify-center gap-1.5 px-3 py-1.5 sm:px-4 rounded-full text-xs font-sans tracking-widest uppercase transition-colors duration-[250ms] flex-1 cursor-pointer hover:scale-105 active:scale-95 group",
                    isActive ? "text-white font-bold" : "text-slate-300 hover:text-white"
                  )}
                >
                  {/* Sliding glass capsule background */}
                  {isActive && (
                    <motion.div
                      layoutId="activeWorkspacePill"
                      className="absolute inset-0 bg-white/20 border border-white/30 rounded-full -z-10 shadow-[0_0_12px_rgba(34,211,238,0.3),inset_0_1px_1px_rgba(255,255,255,0.2)]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon className={clsx(
                    "w-4 h-4 transition-all duration-[150ms] group-hover:scale-110",
                    isActive ? "text-cyan-300 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)] scale-105" : "text-slate-400 group-hover:text-cyan-300"
                  )} />
                  <span className="hidden sm:inline text-[9px] md:text-[10px] tracking-wider">{ws.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Context Drawer Area */}
        <MissionBrief 
          isOpen={activeWorkspace === 'Mission'} 
          onClose={() => setActiveWorkspace('')} 
        />
        <CelestialExplorer 
          isOpen={activeWorkspace === 'Objects'} 
          onClose={() => setActiveWorkspace('')} 
        />
        <TimeIntelligence 
          isOpen={activeWorkspace === 'Timeline'} 
          onClose={() => setActiveWorkspace('')} 
        />
        <Visualization 
          isOpen={activeWorkspace === 'Layers'} 
          onClose={() => setActiveWorkspace('')} 
        />
        <ZenithAI 
          isOpen={activeWorkspace === 'AI'} 
          onClose={() => setActiveWorkspace('')} 
        />

        {/* Recenter View Control Button */}
        <div className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 pointer-events-auto flex flex-col gap-3">
          <button
            onClick={handleRecenter}
            suppressHydrationWarning
            className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-slate-950/80 hover:bg-slate-900 border border-white/10 hover:border-cyan-500/30 text-slate-400 hover:text-cyan-400 transition-all duration-[300ms] shadow-[0_4px_16px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.15)] hover:shadow-[0_0_15px_rgba(34,211,238,0.25)] active:scale-95 group relative cursor-pointer"
          >
            {/* Tooltip */}
            <span className="opacity-0 group-hover:opacity-100 pointer-events-none absolute right-12 sm:right-14 bg-slate-950/90 border border-slate-800 text-[9px] font-mono tracking-widest uppercase text-slate-300 px-2.5 py-1 rounded-md transition-opacity duration-200 whitespace-nowrap shadow-md">
              Recenter Globe
            </span>
            <Compass className="w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-[400ms] group-hover:rotate-45" />
          </button>
        </div>
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
