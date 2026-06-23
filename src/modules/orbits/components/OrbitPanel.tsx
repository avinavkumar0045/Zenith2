"use client";

import { useOrbitStore } from '../store/useOrbitStore';
import { ToggleLeft, ToggleRight, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OrbitPanel() {
  const { 
    activeOrbit, 
    showPastOrbit, 
    showFutureOrbit, 
    showGroundTrack,
    togglePastOrbit,
    toggleFutureOrbit,
    toggleGroundTrack
  } = useOrbitStore();

  if (!activeOrbit) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="bg-black/60 border border-white/10 backdrop-blur-xl rounded-2xl p-4 w-full max-w-[250px] pointer-events-auto shadow-2xl"
      >
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-2 mb-4">
          <Layers className="w-4 h-4 text-cyan-500" /> Orbit Layers
        </h3>

        <div className="space-y-3 text-sm">
          <button onClick={togglePastOrbit} className="flex items-center justify-between w-full text-white hover:text-cyan-400 transition-colors">
            <span>Past Trajectory (-30m)</span>
            {showPastOrbit ? <ToggleRight className="w-5 h-5 text-cyan-500" /> : <ToggleLeft className="w-5 h-5 text-gray-500" />}
          </button>
          
          <button onClick={toggleFutureOrbit} className="flex items-center justify-between w-full text-white hover:text-cyan-400 transition-colors">
            <span>Future Trajectory (+90m)</span>
            {showFutureOrbit ? <ToggleRight className="w-5 h-5 text-cyan-500" /> : <ToggleLeft className="w-5 h-5 text-gray-500" />}
          </button>

          <button onClick={toggleGroundTrack} className="flex items-center justify-between w-full text-white hover:text-cyan-400 transition-colors">
            <span>Ground Track Projection</span>
            {showGroundTrack ? <ToggleRight className="w-5 h-5 text-cyan-500" /> : <ToggleLeft className="w-5 h-5 text-gray-500" />}
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
