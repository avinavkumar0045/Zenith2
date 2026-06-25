"use client";

import { motion, useTransform } from 'framer-motion';
import { useParallax } from './ParallaxController';

export default function OrbitalLayer() {
  const { x, y, reducedMotion } = useParallax();

  // Subtle parallax for the orbital rings
  const shiftX = useTransform(x, [-1, 1], [-4, 4]);
  const shiftY = useTransform(y, [-1, 1], [-4, 4]);

  return (
    <motion.div 
      className="absolute inset-[-50px] pointer-events-none mix-blend-screen will-change-transform"
      style={{ x: shiftX, y: shiftY }}
    >
      {/* Ring 1 (Inner arc) */}
      <motion.div 
        animate={reducedMotion ? {} : { rotate: 360 }}
        transition={{ duration: 420, repeat: Infinity, ease: 'linear' }} // 7 minutes
        className="absolute top-[10%] left-[-20%] w-[140%] aspect-square rounded-full border border-sky-400 opacity-[0.03] transform origin-center will-change-transform"
      >
        <div className="absolute top-0 left-[30%] w-[2px] h-[2px] bg-white rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
      </motion.div>

      {/* Ring 2 (Outer arc) */}
      <motion.div 
        animate={reducedMotion ? {} : { rotate: -360 }}
        transition={{ duration: 600, repeat: Infinity, ease: 'linear' }} // 10 minutes
        className="absolute top-[-10%] left-[10%] w-[120%] aspect-square rounded-full border border-blue-500 opacity-[0.02] transform origin-center will-change-transform"
      >
        <div className="absolute bottom-0 left-[60%] w-[2px] h-[2px] bg-white rounded-full -translate-x-1/2 translate-y-1/2 shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
      </motion.div>

      {/* Ring 3 (Deep arc, no satellite) */}
      <motion.div 
        animate={reducedMotion ? {} : { rotate: 360 }}
        transition={{ duration: 800, repeat: Infinity, ease: 'linear' }} // ~13 minutes
        className="absolute top-[-5%] left-[-15%] w-[160%] aspect-square rounded-full border border-indigo-400 opacity-[0.02] transform origin-center will-change-transform"
      />
    </motion.div>
  );
}
