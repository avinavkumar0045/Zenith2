import React from 'react';
import { useISS } from '../hooks/useISS';
import { ISSDetails } from './ISSDetails';
import { Navigation, X } from 'lucide-react';
import clsx from 'clsx';

export const ISSPanel: React.FC = () => {
  const { iss, isTracking, locateISS, stopTracking } = useISS();

  if (!iss) return null;

  return (
    <div className="absolute right-4 top-24 z-50 w-80 max-w-full">
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden flex flex-col pointer-events-auto transition-all">
        <div className="p-4 border-b border-slate-700/50 bg-slate-800/50 flex justify-between items-center">
          <div className="flex items-center gap-2 text-white">
            <span className="text-xl">🛰️</span>
            <h2 className="font-semibold text-lg tracking-wide">ISS Tracker</h2>
          </div>
          
          <button 
            onClick={isTracking ? stopTracking : locateISS}
            className={clsx(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2",
              isTracking 
                ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" 
                : "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
            )}
          >
            {isTracking ? (
              <>
                <X size={16} /> Stop Tracking
              </>
            ) : (
              <>
                <Navigation size={16} /> Locate ISS
              </>
            )}
          </button>
        </div>
        
        <div className="p-4">
          <ISSDetails iss={iss} />
        </div>
      </div>
    </div>
  );
};
