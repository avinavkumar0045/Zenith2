"use client";

import { useSatelliteStore } from '../store/useSatelliteStore';
import { CameraService } from '@/modules/globe/services/CameraService';
import { SatelliteObject } from '../types/satellite.types';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Navigation, Activity, Globe } from 'lucide-react';

export default function SatelliteDetails() {
  const { selectedSatellite, setSelectedSatellite } = useSatelliteStore();

  if (!selectedSatellite) return null;

  const handleClose = () => {
    setSelectedSatellite(null);
    CameraService.stopTracking();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="bg-black/60 border border-amber-500/30 backdrop-blur-xl rounded-2xl p-5 w-full max-w-sm pointer-events-auto shadow-2xl relative"
      >
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6 pr-8">
          <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
            <Activity className="w-5 h-5 text-amber-500" />
          </div>
          <div className="truncate">
            <h2 className="text-lg font-bold text-white truncate">{selectedSatellite.name}</h2>
            <p className="text-sm text-amber-400 font-mono">NORAD: {selectedSatellite.noradId}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400 flex items-center gap-2"><Navigation className="w-4 h-4" /> Altitude</span>
            <span className="text-white font-medium">{(selectedSatellite.altitude / 1000).toFixed(2)} km</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400 flex items-center gap-2"><Activity className="w-4 h-4" /> Velocity</span>
            <span className="text-white font-medium">{selectedSatellite.velocity.toFixed(2)} km/s</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400 flex items-center gap-2"><Globe className="w-4 h-4" /> Inclination</span>
            <span className="text-white font-medium">{selectedSatellite.inclination.toFixed(2)}°</span>
          </div>

          <div className="pt-4 flex justify-between items-center text-xs text-gray-500 border-t border-white/10">
            <span>Lat: {selectedSatellite.latitude.toFixed(4)}</span>
            <span>Lon: {selectedSatellite.longitude.toFixed(4)}</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
