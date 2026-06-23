"use client";

import { useLocationStore } from '../store/useLocationStore';
import { MapPin, Clock, Sunrise, Sunset, Moon, Sun, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LocationCard() {
  const activeLocation = useLocationStore((state) => state.activeLocation);
  const clearLocation = useLocationStore((state) => state.clearLocation);

  if (!activeLocation) return null;

  const isNight = activeLocation.dayState.toLowerCase().includes('night');

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="bg-black/60 border border-white/10 backdrop-blur-xl rounded-2xl p-5 w-full max-w-sm pointer-events-auto shadow-2xl relative"
      >
        <button 
          onClick={clearLocation}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6 pr-8">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-5 h-5 text-blue-400" />
          </div>
          <div className="truncate">
            <h2 className="text-lg font-bold text-white truncate">{activeLocation.name}</h2>
            <p className="text-sm text-gray-400 truncate">{activeLocation.country}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400 flex items-center gap-2"><Clock className="w-4 h-4" /> Local Time</span>
            <span className="text-white font-medium">{activeLocation.localTime} ({activeLocation.timezone})</span>
          </div>

          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400 flex items-center gap-2">
              {isNight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />} Status
            </span>
            <span className="text-white font-medium">{activeLocation.dayState}</span>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
            <div>
              <span className="text-xs text-gray-400 flex items-center gap-1 mb-1"><Sunrise className="w-3 h-3" /> Sunrise</span>
              <span className="text-sm font-medium text-white">{activeLocation.sunrise}</span>
            </div>
            <div>
              <span className="text-xs text-gray-400 flex items-center gap-1 mb-1"><Sunset className="w-3 h-3" /> Sunset</span>
              <span className="text-sm font-medium text-white">{activeLocation.sunset}</span>
            </div>
          </div>

          <div className="pt-4 flex justify-between items-center text-xs text-gray-500">
            <span>Lat: {activeLocation.latitude.toFixed(4)}</span>
            <span>Lon: {activeLocation.longitude.toFixed(4)}</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
