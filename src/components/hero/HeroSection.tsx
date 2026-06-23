"use client";

import { motion } from 'framer-motion';
import { useAppStore } from '@/store/useAppStore';

export default function HeroSection() {
  const isGlobeReady = useAppStore((state) => state.isGlobeReady);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.5,
        delayChildren: 1.5, // Wait for Earth to appear
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: 'easeOut' as const },
    },
  };

  if (!isGlobeReady) {
    return (
      <div className="absolute inset-0 bg-black flex items-center justify-center z-50">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, repeat: Infinity, repeatType: "reverse" }}
          className="text-white text-sm tracking-widest uppercase"
        >
          Initializing Zenith...
        </motion.div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-10 px-4">
      {/* Dark overlay at the bottom for better text contrast if needed */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 -z-10" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="text-center max-w-4xl"
      >
        <motion.h1 
          variants={itemVariants}
          className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-white mb-6 drop-shadow-lg"
          style={{ textShadow: '0 4px 30px rgba(0,0,0,0.5)' }}
        >
          PROJECT ZENITH
        </motion.h1>

        <motion.p 
          variants={itemVariants}
          className="text-lg md:text-2xl text-gray-200 mb-10 tracking-wide font-light drop-shadow-md"
        >
          Discover What Exists Above Any Point On Earth
        </motion.p>

        <motion.div 
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-6 justify-center pointer-events-auto"
        >
          <button className="px-8 py-4 bg-white text-black rounded-full font-medium text-lg hover:bg-gray-100 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.3)]">
            Analyze My Sky
          </button>
          
          <button className="px-8 py-4 bg-transparent border border-white/30 text-white rounded-full font-medium text-lg hover:bg-white/10 backdrop-blur-md transition-colors">
            Explore Earth
          </button>
        </motion.div>
      </motion.div>
    </div>
  );
}
