"use client";

import { useSatelliteStore } from '../store/useSatelliteStore';
import { SatelliteService } from '../services/SatelliteService';
import { Radio, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SatellitePanel() {
  const { activeSatellites, satelliteCategories, loading, errors } = useSatelliteStore();

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    SatelliteService.fetchCategory(e.target.value);
  };

  return (
    <div className="bg-black/60 border border-white/10 backdrop-blur-xl rounded-2xl p-4 w-full max-w-sm pointer-events-auto">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-2">
          <Radio className="w-4 h-4 text-amber-500" /> Orbital Infrastructure
        </h3>
        {loading && <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />}
      </div>

      <div className="mb-4">
        <label className="text-xs text-gray-500 block mb-1">Select Category</label>
        <select 
          onChange={handleCategoryChange}
          className="w-full bg-white/5 border border-white/10 text-white rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-amber-500"
          defaultValue="weather"
        >
          {satelliteCategories.map(cat => (
            <option key={cat.id} value={cat.id} className="bg-black text-white">
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {errors && <p className="text-xs text-red-400 mb-2">{errors}</p>}

      <div className="flex justify-between items-center text-sm border-t border-white/10 pt-3 mt-3">
        <span className="text-gray-400">Active Signals</span>
        <span className="text-amber-500 font-mono font-bold">{activeSatellites.length}</span>
      </div>
    </div>
  );
}
