"use client";

import { useState } from 'react';
import SatellitePanel from '@/modules/satellites/components/SatellitePanel';
import { ISSPanel } from '@/modules/iss/components/ISSPanel';
import { PassPanel } from '@/modules/pass-predictions/components/PassPanel';
import { Radio, Navigation, Radar, Globe2, Newspaper, CloudLightning, CircleDot, Sparkles, Compass } from 'lucide-react';
import clsx from 'clsx';
import { useSatelliteStore } from '@/modules/satellites/store/useSatelliteStore';

import { MoonPanel } from '@/modules/moon/components/MoonPanel';
import { PlanetPanel } from '@/modules/planets/components/PlanetPanel';
import ConstellationPanel from '@/modules/constellations/components/ConstellationPanel';
import ObserverPanel from '@/modules/observer-guidance/components/ObserverPanel';

type Tab = 'satellites' | 'iss' | 'passes' | 'moon' | 'planets' | 'constellations' | 'observer' | 'news' | 'weather';

export default function ZenithControlCenter() {
  const [activeTab, setActiveTab] = useState<Tab>('satellites');
  const selectedSatellite = useSatelliteStore(state => state.selectedSatellite);

  const tabs: { id: Tab; label: string; icon: React.ReactNode; disabled?: boolean }[] = [
    { id: 'satellites', label: 'Satellites', icon: <Radio className="w-4 h-4" /> },
    { id: 'iss', label: 'ISS', icon: <Navigation className="w-4 h-4" /> },
    { id: 'passes', label: 'Passes', icon: <Radar className="w-4 h-4" />, disabled: !selectedSatellite },
    // Moon Module
    { id: 'moon', label: 'Moon', icon: <Globe2 className="w-4 h-4" /> },
    // Planets Module
    { id: 'planets', label: 'Planets', icon: <CircleDot className="w-4 h-4" />, disabled: false },
    // Constellations Module
    { id: 'constellations', label: 'Constellations', icon: <Sparkles className="w-4 h-4" />, disabled: false },
    // Observer Guidance Module
    { id: 'observer', label: 'Observer', icon: <Compass className="w-4 h-4" />, disabled: false },
    // Future scalability tabs
    { id: 'news', label: 'News', icon: <Newspaper className="w-4 h-4" />, disabled: true },
    { id: 'weather', label: 'Space Wx', icon: <CloudLightning className="w-4 h-4" />, disabled: true },
  ];

  return (
    <div className="bg-black/60 border border-white/10 backdrop-blur-xl rounded-2xl w-full max-w-sm pointer-events-auto flex flex-col shadow-2xl overflow-hidden">
      
      {/* Tabs Header */}
      <div className="flex overflow-x-auto custom-scrollbar border-b border-white/10 p-2 gap-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            disabled={tab.disabled}
            className={clsx(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-colors",
              activeTab === tab.id 
                ? "bg-white/20 text-white" 
                : "text-gray-400 hover:bg-white/5 hover:text-gray-200",
              tab.disabled && "opacity-50 cursor-not-allowed hover:bg-transparent"
            )}
            title={tab.disabled ? "Select a target first or Feature not available" : ""}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content Area */}
      <div className="p-4 min-h-[300px] flex flex-col custom-scrollbar overflow-y-auto">
        {activeTab === 'satellites' && <SatellitePanel />}
        {activeTab === 'iss' && <ISSPanel />}
        {activeTab === 'passes' && <PassPanel />}
        {activeTab === 'moon' && <MoonPanel />}
        {activeTab === 'planets' && <PlanetPanel />}
        {activeTab === 'constellations' && <ConstellationPanel />}
        {activeTab === 'observer' && <ObserverPanel />}
        {activeTab === 'news' && <div className="text-gray-400 text-sm text-center py-10">News Module coming soon</div>}
        {activeTab === 'weather' && <div className="text-gray-400 text-sm text-center py-10">Space Weather Module coming soon</div>}
      </div>

    </div>
  );
}
