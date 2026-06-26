import React, { useEffect, useState } from 'react';
import { MissionBriefDrawer } from './MissionBriefDrawer';
import { MissionBriefHeader } from './MissionBriefHeader';
import { MissionBriefContent } from './MissionBriefContent';
import { SkyIntelligenceEngine } from './engine/SkyIntelligenceEngine';
import { useLocationStore } from '@/modules/location/store/useLocationStore';
import { useWeatherStore } from '@/modules/weather/store/useWeatherStore';
import { useMoonStore } from '@/modules/moon/store/useMoonStore';
import { usePlanetStore } from '@/modules/planets/store/usePlanetStore';
import { usePassStore } from '@/modules/pass-predictions/store/usePassStore';
import { SkyIntelligenceModel } from './MissionBrief.types';

interface MissionBriefProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MissionBrief: React.FC<MissionBriefProps> = ({ isOpen, onClose }) => {
  const activeLocation = useLocationStore((state) => state.activeLocation);
  const weatherLoading = useWeatherStore((state) => state.loading);
  const weatherError = useWeatherStore((state) => state.error);
  
  // Track updates across all sub-stores to recalculate model
  const weather = useWeatherStore((state) => state.weather);
  const moonData = useMoonStore((state) => state.moonData);
  const planets = usePlanetStore((state) => state.planets);
  const upcomingPasses = usePassStore((state) => state.upcomingPasses);

  const [model, setModel] = useState<SkyIntelligenceModel | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    
    // Compile presentation model
    const compiled = SkyIntelligenceEngine.compileModel();
    setModel(compiled);
  }, [isOpen, activeLocation, weather, moonData, planets, upcomingPasses]);

  return (
    <MissionBriefDrawer isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col h-full gap-4">
        {/* Header Section */}
        <MissionBriefHeader 
          onClose={onClose} 
          lastUpdated={model ? model.lastUpdated : null} 
        />
        
        {/* Body Content Section */}
        <MissionBriefContent 
          loading={weatherLoading && !model} 
          error={weatherError} 
          model={model} 
        />
      </div>
    </MissionBriefDrawer>
  );
};
