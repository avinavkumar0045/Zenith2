import React from 'react';
import { useMoonStore } from '../store/useMoonStore';

export function MoonDetails() {
  const moonData = useMoonStore(state => state.moonData);

  if (!moonData) return null;

  return (
    <div className="mt-4 border-t border-white/10 pt-4 grid grid-cols-2 gap-3 text-xs">
      <div>
        <span className="text-gray-500 block mb-0.5">Moonrise</span>
        <span className="text-gray-200 font-mono">{moonData.moonrise || 'N/A'}</span>
      </div>
      <div>
        <span className="text-gray-500 block mb-0.5">Moonset</span>
        <span className="text-gray-200 font-mono">{moonData.moonset || 'N/A'}</span>
      </div>
      <div>
        <span className="text-gray-500 block mb-0.5">Altitude</span>
        <span className="text-gray-200 font-mono">{moonData.altitude.toFixed(2)}°</span>
      </div>
      <div>
        <span className="text-gray-500 block mb-0.5">Azimuth</span>
        <span className="text-gray-200 font-mono">{moonData.azimuth.toFixed(2)}°</span>
      </div>
      <div>
        <span className="text-gray-500 block mb-0.5">Distance</span>
        <span className="text-gray-200 font-mono">{moonData.distance.toLocaleString('en-US', { maximumFractionDigits: 0 })} km</span>
      </div>
      <div>
        <span className="text-gray-500 block mb-0.5">Age</span>
        <span className="text-gray-200 font-mono">{moonData.age.toFixed(1)} days</span>
      </div>
    </div>
  );
}
