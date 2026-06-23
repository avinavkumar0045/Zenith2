"use client";

import { useLocationStore } from '../store/useLocationStore';
import { MapPin, Moon, Sun } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LocationStatus() {
  const activeLocation = useLocationStore((state) => state.activeLocation);

  if (!activeLocation) return null;

  const isNight = activeLocation.dayState.toLowerCase().includes('night');

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="flex items-center gap-4 bg-black/40 border border-white/10 backdrop-blur-md rounded-full px-5 py-2 pointer-events-auto"
      >
        <div className="flex items-center gap-2 text-white font-medium text-sm border-r border-white/10 pr-4">
          <MapPin className="w-4 h-4 text-blue-400" />
          <span className="max-w-[120px] truncate">{activeLocation.name}</span>
        </div>
        
        <div className="flex items-center gap-2 text-gray-300 text-sm">
          {isNight ? <Moon className="w-4 h-4 text-indigo-400" /> : <Sun className="w-4 h-4 text-yellow-400" />}
          <span>{activeLocation.dayState}</span>
        </div>

        <div className="text-gray-300 font-mono text-sm pl-4 border-l border-white/10">
          {activeLocation.localTime}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
