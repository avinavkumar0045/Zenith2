"use client";

import dynamic from 'next/dynamic';
import { Suspense, useEffect } from 'react';
import HeroSection from '@/components/hero/HeroSection';
import LocationSearch from '@/modules/location/components/LocationSearch';
import LocationCard from '@/modules/location/components/LocationCard';
import LocationStatus from '@/modules/location/components/LocationStatus';
import RecentLocations from '@/modules/location/components/RecentLocations';
import { useLocation } from '@/modules/location/hooks/useLocation';
import SatellitePanel from '@/modules/satellites/components/SatellitePanel';
import SatelliteDetails from '@/modules/satellites/components/SatelliteDetails';
import OrbitPanel from '@/modules/orbits/components/OrbitPanel';
import OrbitLegend from '@/modules/orbits/components/OrbitLegend';
import OrbitTimeline from '@/modules/orbits/components/OrbitTimeline';
import { ISSPanel } from '@/modules/iss/components/ISSPanel';
import { ISSStatusBar } from '@/modules/iss/components/ISSStatusBar';
import { PassPanel } from '@/modules/pass-predictions/components/PassPanel';
import { PassPredictionService } from '@/modules/pass-predictions/services/PassPredictionService';
import { CelestialReport } from '@/modules/reports/components/CelestialReport';
import { ReportService } from '@/modules/reports/services/ReportService';

// Dynamically import the Cesium globe to avoid SSR issues
const CesiumGlobe = dynamic(() => import('@/modules/globe/CesiumGlobe'), {
  ssr: false,
  loading: () => null,
});

function AppOverlay() {
  const { activeLocation } = useLocation();

  useEffect(() => {
    PassPredictionService.initialize();
    ReportService.initialize();
    
    return () => {
      PassPredictionService.destroy();
      ReportService.destroy();
    };
  }, []);

  return (
    <>
      {/* 3D Background Layer */}
      <div className="absolute inset-0 z-0">
        <CesiumGlobe />
      </div>

      {/* Hero overlay fades out when an active location exists */}
      {!activeLocation && <HeroSection />}
      
      {/* Phase 3B: ISS Components */}
      <ISSPanel />
      <ISSStatusBar />

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
        <div className="flex-1 w-full flex flex-col md:flex-row items-end justify-between pb-4 md:pb-0 gap-4 mt-auto md:mt-0">
          {/* Left side panels: Location + Orbit + Reports */}
          <div className="flex flex-col gap-4 items-start w-full md:w-auto max-h-full overflow-y-auto custom-scrollbar pointer-events-auto pr-2 pb-20">
            <RecentLocations />
            <LocationCard />
            <CelestialReport />
            {/* Phase 3A: Orbit Visualization Controls */}
            <OrbitPanel />
            <OrbitLegend />
          </div>

          
          {/* Right side panels: Satellite & Pass Predictions */}
          <div className="flex flex-col gap-4 items-end w-full md:w-auto pointer-events-none">
            <SatelliteDetails />
            <SatellitePanel />
            <PassPanel />
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
