"use client";

import { useOrbitStore } from '../store/useOrbitStore';
import { Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function OrbitTimeline() {
  const { activeOrbit } = useOrbitStore();

  if (!activeOrbit) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-black/80 border border-white/10 backdrop-blur-xl rounded-full px-6 py-3 pointer-events-auto flex items-center gap-6 shadow-2xl"
      >
        <Clock className="w-5 h-5 text-cyan-500" />
        <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
          <span>T-30m</span>
          <div className="w-16 h-[2px] bg-gradient-to-r from-transparent to-gray-500 rounded-full" />
          <span className="text-white font-bold bg-cyan-500/20 px-2 py-1 rounded">NOW</span>
          <div className="w-24 h-[2px] bg-gradient-to-r from-cyan-500 to-transparent rounded-full" />
          <span>T+90m</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
