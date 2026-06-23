import React from 'react';
import { usePassPredictions } from '../hooks/usePassPredictions';
import { UpcomingPasses } from './UpcomingPasses';
import { PassDetails } from './PassDetails';
import { PassTimeline } from './PassTimeline';
import { Radar, Loader2 } from 'lucide-react';
import { useSatelliteStore } from '../../satellites/store/useSatelliteStore';

export const PassPanel: React.FC = () => {
  const { passes, loading } = usePassPredictions();
  const selectedSatellite = useSatelliteStore(state => state.selectedSatellite);

  if (!selectedSatellite) return null;

  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-2xl p-4 w-80 max-w-full pointer-events-auto flex flex-col mt-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 text-white">
          <Radar size={18} className="text-blue-400" />
          <h2 className="font-semibold tracking-wide">Pass Predictions</h2>
        </div>
        {loading && <Loader2 size={16} className="text-slate-400 animate-spin" />}
      </div>

      <div className="text-xs text-slate-400 mb-3 border-b border-slate-700/50 pb-2">
        Tracking: <span className="text-white font-medium">{selectedSatellite.name}</span>
      </div>

      {passes.length > 0 ? (
        <>
          <UpcomingPasses />
          <PassDetails />
          <PassTimeline />
        </>
      ) : (
        <div className="text-slate-500 text-sm text-center py-6">
          {loading ? "Calculating orbits..." : "No visible passes in the next 24 hours."}
        </div>
      )}
    </div>
  );
};
