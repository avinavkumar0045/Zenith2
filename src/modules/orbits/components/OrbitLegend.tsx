"use client";

import { useOrbitStore } from '../store/useOrbitStore';
import { OrbitTheme } from '../utils/OrbitTheme';
import { motion, AnimatePresence } from 'framer-motion';

export default function OrbitLegend() {
  const { activeOrbit } = useOrbitStore();

  if (!activeOrbit) return null;

  const hexColor = OrbitTheme.getColorForCategory(activeOrbit.category);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        className="bg-black/40 border border-white/5 backdrop-blur-md rounded-2xl p-3 mt-4 w-full max-w-[250px] pointer-events-auto"
      >
        <div className="flex flex-col gap-2 text-xs text-gray-300">
          <div className="flex items-center gap-3">
            <div className="w-6 h-[2px] border-b border-dashed border-white/50" style={{ borderColor: `${hexColor}80` }} />
            <span>Past Trajectory</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-1 rounded-full shadow-[0_0_8px]" style={{ backgroundColor: hexColor, color: hexColor }} />
            <span>Future Trajectory</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-[2px] opacity-50" style={{ backgroundColor: hexColor }} />
            <span>Ground Track</span>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
