import React from 'react';
import { usePassPredictions } from '../hooks/usePassPredictions';
import clsx from 'clsx';

export const UpcomingPasses: React.FC = () => {
  const { passes, selectedPass, setSelectedPass } = usePassPredictions();

  if (passes.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
      {passes.map((pass) => {
        const isSelected = selectedPass?.passId === pass.passId;
        const startDate = new Date(pass.startTime);
        
        return (
          <button
            key={pass.passId}
            onClick={() => setSelectedPass(pass)}
            className={clsx(
              "text-left p-2 rounded-lg border transition-colors flex justify-between items-center",
              isSelected 
                ? "bg-blue-900/40 border-blue-500/50" 
                : "bg-slate-800/40 border-slate-700/50 hover:bg-slate-700/50"
            )}
          >
            <div className="flex flex-col">
              <span className="text-white font-medium text-sm">
                {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
              <span className="text-slate-400 text-xs">
                {startDate.toLocaleDateString([], { month: 'short', day: 'numeric' })}
              </span>
            </div>
            
            <div className="flex flex-col items-end">
              <span className={clsx(
                "text-xs px-2 py-0.5 rounded-full mb-1",
                pass.passQuality === 'Excellent' ? "bg-emerald-500/20 text-emerald-400" :
                pass.passQuality === 'Good' ? "bg-blue-500/20 text-blue-400" :
                pass.passQuality === 'Average' ? "bg-orange-500/20 text-orange-400" :
                "bg-red-500/20 text-red-400"
              )}>
                {pass.passQuality}
              </span>
              <span className="text-slate-400 text-xs">
                Max: {pass.maxElevation.toFixed(0)}°
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};
