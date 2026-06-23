import React from 'react';
import { useISS } from '../hooks/useISS';

export const ISSStatusBar: React.FC = () => {
  const { iss } = useISS();

  if (!iss) return null;

  return (
    <div className="fixed bottom-4 right-4 z-40 md:hidden bg-slate-900/90 backdrop-blur border border-slate-700/50 rounded-full px-4 py-2 flex items-center gap-4 text-xs font-mono shadow-xl pointer-events-auto text-slate-300">
      <span className="flex items-center gap-1.5 text-white">
        <span className="text-sm">🛰️</span> ISS
      </span>
      <span className="text-blue-400">Alt: {(iss.altitude / 1000).toFixed(0)}km</span>
      <span className="text-orange-400">Vel: {iss.velocity.toFixed(1)}km/s</span>
    </div>
  );
};
