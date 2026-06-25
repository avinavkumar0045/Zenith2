"use client";

import { motion, useTransform } from 'framer-motion';
import { useParallax } from './ParallaxController';

export default function NebulaLayer() {
  const { x, y } = useParallax();

  // Moderate parallax shift for the nebula clouds
  const shiftX = useTransform(x, [-1, 1], [-8, 8]);
  const shiftY = useTransform(y, [-1, 1], [-8, 8]);

  return (
    <motion.div 
      className="absolute inset-[-100px] pointer-events-none mix-blend-screen opacity-[0.06] will-change-transform"
      style={{ x: shiftX, y: shiftY }}
    >
      {/* Cloud 1 (Deep Purple/Blue) */}
      <div className="absolute top-[10%] left-[20%] w-[60%] h-[50%] bg-[radial-gradient(ellipse_at_center,_#4c1d95_0%,_#1e3a8a_30%,_transparent_70%)] blur-[120px] transform rotate-12" />
      
      {/* Cloud 2 (Subtle Cyan/Blue) */}
      <div className="absolute bottom-[20%] right-[10%] w-[70%] h-[60%] bg-[radial-gradient(ellipse_at_center,_#0891b2_0%,_#172554_40%,_transparent_70%)] blur-[150px] transform -rotate-12" />
      
      {/* Cloud 3 (Core depth - Dark Blue) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[40%] bg-[radial-gradient(ellipse_at_center,_#1d4ed8_0%,_#1e3a8a_20%,_transparent_60%)] blur-[150px]" />
    </motion.div>
  );
}
