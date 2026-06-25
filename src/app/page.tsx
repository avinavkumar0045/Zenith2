"use client";

import dynamic from 'next/dynamic';
import { Suspense, useEffect } from 'react';
import HeroSection from '@/components/hero/HeroSection';
import LocationSearch from '@/modules/location/components/LocationSearch';
import LocationCard from '@/modules/location/components/LocationCard';
import LocationStatus from '@/modules/location/components/LocationStatus';
import RecentLocations from '@/modules/location/components/RecentLocations';
import { useLocation } from '@/modules/location/hooks/useLocation';
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

// Dynamically import the Cesium globe to avoid SSR issues
const CesiumGlobe = dynamic(() => import('@/modules/globe/CesiumGlobe'), {
  ssr: false,
  loading: () => null,
});

import { useAppStore } from '@/store/useAppStore';

function AppOverlay() {
  const { activeLocation } = useLocation();
  const currentView = useAppStore(state => state.currentView);

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

  return (
    <>
      {/* 3D Background Layer */}
      <div className="absolute inset-0 z-0">
        <CesiumGlobe />
      </div>

      {/* Hero overlay fades out when an active location exists or in explore mode */}
      {!activeLocation && currentView !== 'explore' && <HeroSection />}
      
      {/* Main UI Layer (Always active, top level) */}
      <div className="absolute inset-0 z-20 pointer-events-none flex flex-col p-4 md:p-8">
        
        {/* Top Header Area: Search and Status */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
          <div className="w-full md:w-auto flex-1 max-w-xl">
            <LocationSearch />
          </div>
          
          <div className="hidden md:block">
            <LocationStatus />
          </div>
        </div>

        {/* Floating Components Area */}
        <div className="flex-1 w-full min-h-0 flex flex-col md:flex-row items-stretch justify-between pb-4 md:pb-0 gap-4 mt-auto md:mt-0 pointer-events-none">
          {/* Left side panels: Location + Orbit + Reports */}
          <div className="flex flex-col gap-4 items-start w-full md:w-auto h-full min-h-0 pointer-events-auto pr-2 pb-20">
            {/* <RecentLocations /> */}
            <div className="flex-none w-full">
              <LocationCard />
            </div>
            
            <div className="flex-1 min-h-0 w-full flex flex-col">
              <CelestialReport />
            </div>

            {/* Phase 3A: Orbit Visualization Controls */}
            <div className="flex-none w-full flex flex-col gap-4">
              <OrbitPanel />
              <OrbitLegend />
            </div>
          </div>

          
          {/* Right side panels: Zenith Control Center */}
          <div className="flex flex-col justify-end gap-4 items-end w-full md:w-96 pointer-events-none h-full">
            <SatelliteDetails />
            <ZenithControlCenter />
          </div>
        </div>



        {/* Phase 3A: Orbit Timeline HUD (bottom center) */}
        <OrbitTimeline />
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
