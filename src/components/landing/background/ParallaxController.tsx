"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { motion, useMotionValue, useSpring, MotionValue, useReducedMotion } from 'framer-motion';

interface ParallaxContextType {
  x: MotionValue<number>;
  y: MotionValue<number>;
  reducedMotion: boolean;
}

const ParallaxContext = createContext<ParallaxContextType | null>(null);

export function useParallax() {
  const context = useContext(ParallaxContext);
  if (!context) throw new Error("useParallax must be used within ParallaxProvider");
  return context;
}

export function ParallaxProvider({ children }: { children: ReactNode }) {
  const [isMobile, setIsMobile] = useState(true);
  const shouldReduceMotion = useReducedMotion();

  // Raw mouse position (-1 to 1 based on screen center)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs to damp the movement
  const springConfig = { damping: 40, stiffness: 100, mass: 1 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobile || shouldReduceMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      // Normalize from -1 to 1
      const normalizedX = (e.clientX - centerX) / centerX;
      const normalizedY = (e.clientY - centerY) / centerY;

      mouseX.set(normalizedX);
      mouseY.set(normalizedY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isMobile, mouseX, mouseY, shouldReduceMotion]);

  return (
    <ParallaxContext.Provider value={{ x: smoothX, y: smoothY, reducedMotion: !!shouldReduceMotion }}>
      {children}
    </ParallaxContext.Provider>
  );
}
