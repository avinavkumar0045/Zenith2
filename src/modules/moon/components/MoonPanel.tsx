import React from 'react';
import { useMoonStore } from '../store/useMoonStore';
import { useMoonPositionStore } from '../store/useMoonPositionStore';
import { useLocationStore } from '../../location/store/useLocationStore';
import { MoonPhaseVisualizer } from './MoonPhaseVisualizer';
import { MoonDetails } from './MoonDetails';
import { Globe2, Loader2, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

export function MoonPanel() {
  const moonData = useMoonStore(state => state.moonData);
  const loading = useMoonStore(state => state.loading);
  const activeLocation = useLocationStore(state => state.activeLocation);
  const moonPosition = useMoonPositionStore();

  if (!activeLocation) {
    return (
      <div className="w-full text-center py-10 text-gray-400 text-sm">
        Select a location to view Lunar Intelligence.
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-2">
          <Globe2 className="w-4 h-4 text-slate-300" /> Lunar Intelligence
        </h3>
        {loading && <Loader2 className="w-4 h-4 text-slate-300 animate-spin" />}
      </div>

      {moonData ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-xl p-4"
        >
          <div className="flex items-center gap-4">
            <MoonPhaseVisualizer phase={moonData.phase} />
            
            <div className="flex-1">
              <h4 className="text-lg font-bold text-white mb-1">{moonData.phaseName}</h4>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>{(moonData.illumination * 100).toFixed(1)}% Illuminated</span>
                <span className="text-gray-600">•</span>
                {moonData.isVisible ? (
                  <span className="flex items-center gap-1 text-emerald-400"><Eye className="w-3 h-3"/> Visible</span>
                ) : (
                  <span className="flex items-center gap-1 text-gray-500"><EyeOff className="w-3 h-3"/> Below Horizon</span>
                )}
              </div>
              <div className="mt-2 text-xs flex items-center gap-2">
                <span className="text-gray-500">Observation Score:</span>
                <span className={`font-bold ${moonData.observationScore > 7 ? 'text-emerald-400' : moonData.observationScore > 4 ? 'text-amber-400' : 'text-red-400'}`}>
                  {moonData.observationScore} / 10
                </span>
              </div>
            </div>
          </div>

          <MoonDetails />

          {/* MOON POSITION EXTENSION (PHASE 6B) */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <h5 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-3">Moon Position</h5>
            <div className="bg-black/20 rounded-lg p-3">
              <div className="text-xs text-gray-400 mb-1">Currently Above</div>
              <div className="text-sm text-white font-medium mb-3">{moonPosition.regionName || 'Calculating...'}</div>
              
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500 block">Sub-Lunar Latitude</span>
                  <span className="text-gray-200 font-mono">
                    {moonPosition.subLunarLatitude !== null ? `${moonPosition.subLunarLatitude.toFixed(2)}°` : '--'}
                  </span>
                </div>
                <div>
                  <span className="text-gray-500 block">Sub-Lunar Longitude</span>
                  <span className="text-gray-200 font-mono">
                    {moonPosition.subLunarLongitude !== null ? `${moonPosition.subLunarLongitude.toFixed(2)}°` : '--'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        !loading && <div className="text-gray-400 text-sm">No lunar data available.</div>
      )}
    </div>
  );
}
