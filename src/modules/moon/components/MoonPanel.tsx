import React from 'react';
import { useMoonStore } from '../store/useMoonStore';
import { useLocationStore } from '../../location/store/useLocationStore';
import { MoonPhaseVisualizer } from './MoonPhaseVisualizer';
import { MoonDetails } from './MoonDetails';
import { Globe2, Loader2, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

export function MoonPanel() {
  const moonData = useMoonStore(state => state.moonData);
  const loading = useMoonStore(state => state.loading);
  const activeLocation = useLocationStore(state => state.activeLocation);

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
        </motion.div>
      ) : (
        !loading && <div className="text-gray-400 text-sm">No lunar data available.</div>
      )}
    </div>
  );
}
