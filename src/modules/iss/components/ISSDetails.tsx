import React from 'react';
import { ISSObject } from '../types/iss.types';

interface ISSDetailsProps {
  iss: ISSObject;
}

export const ISSDetails: React.FC<ISSDetailsProps> = ({ iss }) => {
  return (
    <div className="flex flex-col gap-3 text-slate-300 text-sm">
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-slate-800/40 p-2 rounded-lg">
          <div className="text-slate-500 text-xs mb-1">Name</div>
          <div className="font-mono text-white truncate" title={iss.name}>{iss.name}</div>
        </div>
        <div className="bg-slate-800/40 p-2 rounded-lg">
          <div className="text-slate-500 text-xs mb-1">NORAD ID</div>
          <div className="font-mono text-white">{iss.noradId}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-slate-800/40 p-2 rounded-lg">
          <div className="text-slate-500 text-xs mb-1">Altitude</div>
          <div className="font-mono text-blue-400">{(iss.altitude / 1000).toFixed(1)} km</div>
        </div>
        <div className="bg-slate-800/40 p-2 rounded-lg">
          <div className="text-slate-500 text-xs mb-1">Velocity</div>
          <div className="font-mono text-orange-400">{iss.velocity.toFixed(2)} km/s</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="bg-slate-800/40 p-2 rounded-lg">
          <div className="text-slate-500 text-xs mb-1">Inclination</div>
          <div className="font-mono text-emerald-400">{iss.inclination.toFixed(2)}°</div>
        </div>
        <div className="bg-slate-800/40 p-2 rounded-lg">
          <div className="text-slate-500 text-xs mb-1">Crew</div>
          <div className="font-mono text-purple-400">{iss.crewCount || '?'}</div>
        </div>
      </div>

      <div className="mt-2 text-xs text-slate-500 flex justify-between">
        <span>Source: {iss.source}</span>
        <span>Updated: {new Date(iss.timestamp).toLocaleTimeString()}</span>
      </div>
    </div>
  );
};
