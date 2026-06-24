import React from 'react';
import { useISS } from '../hooks/useISS';
import { ISSDetails } from './ISSDetails';
import { Navigation, X } from 'lucide-react';
import clsx from 'clsx';
import { useISSStore } from '../store/useISSStore';

export const ISSPanel: React.FC = () => {

  const { isTracking, locateISS, stopTracking } = useISS();
  const hasISS = useISSStore(state => state.iss !== null);

  if (!hasISS) return null;

  return (
    <div className="w-full">
      <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden flex flex-col pointer-events-auto transition-all">
        <div className="p-4 border-b border-white/10 flex justify-between items-center">
          <div className="flex items-center gap-2 text-white">
            <span className="text-xl">🛰️</span>
            <h2 className="font-semibold text-sm tracking-wide">ISS Tracker</h2>
          </div>
          
          <button 
            onClick={isTracking ? stopTracking : locateISS}
            className={clsx(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-2",
              isTracking 
                ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" 
                : "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
            )}
          >
            {isTracking ? (
              <>
                <X size={14} /> Stop Tracking
              </>
            ) : (
              <>
                <Navigation size={14} /> Locate ISS
              </>
            )}
          </button>
        </div>
        
        <div className="p-4">
          <ISSDetails />
        </div>
      </div>
    </div>
  );
};

