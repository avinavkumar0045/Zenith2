"use client";

import { motion, useTransform } from 'framer-motion';
import { useParallax } from './ParallaxController';

export default function AmbientGlow() {
  const { x, y } = useParallax();

  // Subtle parallax for the ambient hero glow
  const shiftX = useTransform(x, [-1, 1], [-15, 15]);
  const shiftY = useTransform(y, [-1, 1], [-15, 15]);

  return (
    <>
      <motion.div 
        className="absolute inset-0 pointer-events-none mix-blend-screen flex items-center justify-center overflow-hidden will-change-transform"
        style={{ x: shiftX, y: shiftY }}
      >
        <div className="w-[80vw] h-[80vw] sm:w-[50vw] sm:h-[50vw] max-w-[800px] max-h-[800px] bg-[radial-gradient(circle_at_center,_rgba(30,64,175,0.15)_0%,_rgba(15,23,42,0.05)_40%,_transparent_70%)] blur-[100px] rounded-full" />
      </motion.div>
      
      {/* Faint sub-surface atmospheric glow at the very bottom (No visible planet) */}
      <div className="absolute bottom-0 inset-x-0 h-[10vh] bg-gradient-to-t from-sky-900/10 to-transparent pointer-events-none blur-2xl" />
    </>
  );
}
