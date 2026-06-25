"use client";

import { motion, useTransform } from 'framer-motion';
import { useParallax } from './ParallaxController';
import { mulberry32 } from '@/utils/prng';
import { useMemo } from 'react';

export default function ConstellationLayer() {
  const { x, y } = useParallax();

  const shiftX = useTransform(x, [-1, 1], [-8, 8]);
  const shiftY = useTransform(y, [-1, 1], [-8, 8]);

  const lines = useMemo(() => {
    const random = mulberry32(9999); // Fixed seed for constellations
    const nodes = [];
    const generatedLines = [];

    // Generate random nodes
    for (let i = 0; i < 25; i++) {
      nodes.push({
        x: random() * 100, // percentage
        y: random() * 100, // percentage
      });
    }

    // Connect some nearby nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Only connect if they are close enough, and only randomly
        if (dist < 15 && random() > 0.4) {
          generatedLines.push(
            <line
              key={`${i}-${j}`}
              x1={`${nodes[i].x}%`}
              y1={`${nodes[i].y}%`}
              x2={`${nodes[j].x}%`}
              y2={`${nodes[j].y}%`}
              stroke="rgba(255, 255, 255, 0.05)"
              strokeWidth="0.5"
            />
          );
        }
      }
    }
    return generatedLines;
  }, []);

  return (
    <motion.svg 
      className="absolute inset-[-50px] w-[calc(100%+100px)] h-[calc(100%+100px)] pointer-events-none will-change-transform"
      style={{ x: shiftX, y: shiftY }}
      xmlns="http://www.w3.org/2000/svg"
    >
      {lines}
    </motion.svg>
  );
}
