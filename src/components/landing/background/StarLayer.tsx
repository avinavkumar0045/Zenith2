"use client";

import { motion, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useParallax } from './ParallaxController';
import { mulberry32 } from '@/utils/prng';

// Use a fixed seed for deterministic stars across refreshes
const seed = 12345;

const generateStars = (count: number, maxSize: number = 2, layerSeedOffset: number) => {
  let shadows = '';
  const random = mulberry32(seed + layerSeedOffset);
  
  for (let i = 0; i < count; i++) {
    const x = Math.floor(random() * 2000);
    const y = Math.floor(random() * 2000);
    const size = random() * maxSize;
    const opacity = 0.2 + random() * 0.8;
    shadows += `${x}px ${y}px 0 ${size}px rgba(255, 255, 255, ${opacity})${i < count - 1 ? ',' : ''}`;
  }
  return shadows;
};

export default function StarLayer() {
  const [layers, setLayers] = useState<string[]>([]);
  const { x, y, reducedMotion } = useParallax();

  // Define very subtle parallax translations (max 10px shift per request)
  const xBackground = useTransform(x, [-1, 1], [-2, 2]);
  const yBackground = useTransform(y, [-1, 1], [-2, 2]);

  const xMedium = useTransform(x, [-1, 1], [-5, 5]);
  const yMedium = useTransform(y, [-1, 1], [-5, 5]);

  const xForeground = useTransform(x, [-1, 1], [-10, 10]);
  const yForeground = useTransform(y, [-1, 1], [-10, 10]);

  useEffect(() => {
    setLayers([
      generateStars(500, 0.8, 0),    // Background (dense, tiny)
      generateStars(200, 1.5, 100),  // Medium (twinkle)
      generateStars(50, 2.5, 200),   // Foreground (sparse, bright)
    ]);
  }, []);

  if (layers.length === 0) return null;

  return (
    <>
      {/* Background Stars: Dense, almost static */}
      <motion.div 
        className="absolute inset-[-50px] will-change-transform"
        style={{ 
          boxShadow: layers[0], width: '1px', height: '1px', borderRadius: '50%',
          x: xBackground, y: yBackground 
        }}
      />
      
      {/* Medium Stars: Twinkle */}
      <motion.div 
        className="absolute inset-[-50px] will-change-transform"
        style={{ 
          boxShadow: layers[1], width: '1px', height: '1px', borderRadius: '50%',
          x: xMedium, y: yMedium 
        }}
        animate={reducedMotion ? {} : { opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      
      {/* Foreground Stars: Brighter, slow drifting drift over long time */}
      <motion.div 
        className="absolute inset-[-50px] will-change-transform"
        style={{ 
          boxShadow: layers[2], width: '1px', height: '1px', borderRadius: '50%',
          x: xForeground, y: yForeground 
        }}
        animate={reducedMotion ? {} : { opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
      />
    </>
  );
}
