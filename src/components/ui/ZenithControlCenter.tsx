"use client";

import { useState, useEffect } from 'react';
import SatellitePanel from '@/modules/satellites/components/SatellitePanel';
import { ISSPanel } from '@/modules/iss/components/ISSPanel';
import { PassPanel } from '@/modules/pass-predictions/components/PassPanel';
import { Radio, Navigation, Radar, Globe2, Newspaper, CloudLightning, CircleDot, Sparkles, Compass, ChevronDown, ChevronUp } from 'lucide-react';
import clsx from 'clsx';
import { useSatelliteStore } from '@/modules/satellites/store/useSatelliteStore';
import { motion, AnimatePresence } from 'framer-motion';

import { MoonPanel } from '@/modules/moon/components/MoonPanel';
import { PlanetPanel } from '@/modules/planets/components/PlanetPanel';
import ConstellationPanel from '@/modules/constellations/components/ConstellationPanel';
import ObserverPanel from '@/modules/observer-guidance/components/ObserverPanel';

type Tab = 'satellites' | 'iss' | 'passes' | 'moon' | 'planets' | 'constellations' | 'observer' | 'news' | 'weather';

export default function ZenithControlCenter() {
  const [activeTab, setActiveTab] = useState<Tab | null>('satellites');
  const selectedSatellite = useSatelliteStore(state => state.selectedSatellite);
  
  const [isMobile, setIsMobile] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const tabs: { id: Tab; label: string; icon: React.ReactNode; disabled?: boolean }[] = [
    { id: 'satellites', label: 'Satellites', icon: <Radio className="w-5 h-5" /> },
    { id: 'iss', label: 'ISS', icon: <Navigation className="w-5 h-5" /> },
    { id: 'passes', label: 'Passes', icon: <Radar className="w-5 h-5" />, disabled: !selectedSatellite },
    { id: 'moon', label: 'Moon', icon: <Globe2 className="w-5 h-5" /> },
    { id: 'planets', label: 'Planets', icon: <CircleDot className="w-5 h-5" />, disabled: false },
    { id: 'constellations', label: 'Constellations', icon: <Sparkles className="w-5 h-5" />, disabled: false },
    { id: 'observer', label: 'Observer Guidance', icon: <Compass className="w-5 h-5" />, disabled: false },
  ];

  const renderTabContent = (id: Tab) => {
    switch (id) {
      case 'satellites': return <SatellitePanel />;
      case 'iss': return <ISSPanel />;
      case 'passes': return <PassPanel />;
      case 'moon': return <MoonPanel />;
      case 'planets': return <PlanetPanel />;
      case 'constellations': return <ConstellationPanel />;
      case 'observer': return <ObserverPanel />;
      case 'news': return <div className="text-gray-400 text-sm text-center py-10">News Module coming soon</div>;
      case 'weather': return <div className="text-gray-400 text-sm text-center py-10">Space Weather Module coming soon</div>;
      default: return null;
    }
  };

  return (
    <>
      {isMobile && (
        <button 
          onClick={() => setIsMobileOpen(true)}
          className="fixed bottom-4 right-4 z-50 bg-blue-600/80 backdrop-blur-md text-white p-4 rounded-full shadow-lg border border-white/20 pointer-events-auto"
        >
          <Radar className="w-6 h-6" />
        </button>
      )}

      {isMobile && isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] pointer-events-auto"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <div className={clsx(
        "w-full pointer-events-auto flex flex-col gap-3 custom-scrollbar transition-transform duration-300",
        isMobile 
          ? "fixed inset-x-0 bottom-0 z-[70] bg-black/90 backdrop-blur-2xl p-4 rounded-t-3xl border-t border-white/10 max-h-[85vh] overflow-y-auto transform"
          : "max-w-sm max-h-[85vh] overflow-y-auto pr-2 pb-20",
        isMobile && !isMobileOpen ? "translate-y-full" : "translate-y-0"
      )}>
        {isMobile && (
          <div className="flex justify-between items-center mb-2 px-1">
            <span className="text-sm font-bold text-white uppercase tracking-widest">Control Center</span>
            <button onClick={() => setIsMobileOpen(false)} className="p-2 text-gray-400 hover:text-white bg-white/5 rounded-full">
              <ChevronDown className="w-5 h-5" />
            </button>
          </div>
        )}

        {!isMobile && (
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">
            Control Center Modules
          </div>
        )}
      
      {tabs.map(tab => {
        const isActive = activeTab === tab.id;
        return (
          <div 
            key={tab.id}
            className={clsx(
              "bg-black/60 backdrop-blur-xl rounded-2xl flex flex-col transition-all duration-300",
              isActive ? "border border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.1)]" : "border border-white/10 hover:border-white/20"
            )}
          >
            <button
              onClick={() => !tab.disabled && setActiveTab(isActive ? null : tab.id)}
              disabled={tab.disabled}
              aria-expanded={isActive}
              className={clsx(
                "flex items-center justify-between p-4 w-full text-left rounded-2xl transition-colors outline-none",
                isActive ? "text-white bg-white/5" : "text-gray-300 hover:bg-white/5 hover:text-white",
                tab.disabled && "opacity-50 cursor-not-allowed hover:bg-transparent"
              )}
            >
              <div className="flex items-center gap-3 font-medium text-base">
                <span className={isActive ? "text-blue-400" : "text-gray-400"}>{tab.icon}</span>
                {tab.label}
              </div>
              {!tab.disabled && (
                <div className="text-gray-500">
                  {isActive ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              )}
            </button>

            <AnimatePresence initial={false}>
              {isActive && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                  className="overflow-hidden border-t border-white/10"
                >
                  <div className="p-4">
                    {renderTabContent(tab.id)}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
    </>
  );
}
