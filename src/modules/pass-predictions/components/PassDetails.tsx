import React from 'react';
import { usePassPredictions } from '../hooks/usePassPredictions';

export const PassDetails: React.FC = () => {
  const { selectedPass } = usePassPredictions();

  if (!selectedPass) return null;

  const rise = new Date(selectedPass.startTime);
  const peak = new Date(selectedPass.peakTime);
  const set = new Date(selectedPass.endTime);

  return (
    <div className="bg-slate-800/40 rounded-lg p-3 mt-3 border border-slate-700/50">
      <h3 className="text-white text-sm font-medium mb-3 border-b border-slate-700/50 pb-2">
        Pass Details
      </h3>
      
      <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3">
        <div className="flex flex-col">
          <span className="text-slate-500 mb-1">Rise</span>
          <span className="text-slate-300 font-mono">{rise.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div className="flex flex-col border-x border-slate-700/50">
          <span className="text-slate-500 mb-1">Peak</span>
          <span className="text-blue-400 font-mono font-bold">{peak.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-slate-500 mb-1">Set</span>
          <span className="text-slate-300 font-mono">{set.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="flex justify-between bg-slate-900/50 px-2 py-1.5 rounded">
          <span className="text-slate-500">Duration:</span>
          <span className="text-white">{Math.floor(selectedPass.durationSeconds / 60)}m {selectedPass.durationSeconds % 60}s</span>
        </div>
        <div className="flex justify-between bg-slate-900/50 px-2 py-1.5 rounded">
          <span className="text-slate-500">Elevation:</span>
          <span className="text-white">{selectedPass.maxElevation.toFixed(1)}°</span>
        </div>
      </div>
    </div>
  );
};
