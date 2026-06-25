"use client";

import { useState, useEffect } from 'react';
import { useLocationStore } from '../store/useLocationStore';
import { MapPin, Clock, Sunrise, Sunset, Moon, Sun, X, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

export default function LocationCard() {
  const activeLocation = useLocationStore((state) => state.activeLocation);
  const clearLocation = useLocationStore((state) => state.clearLocation);
  
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setIsExpanded(true);
      } else {
        setIsExpanded(false); // Default to compact on mobile
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!activeLocation) return null;

  const isNight = activeLocation.dayState.toLowerCase().includes('night');

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="bg-black/60 border border-white/10 backdrop-blur-xl rounded-2xl p-4 md:p-5 w-full md:max-w-sm pointer-events-auto shadow-2xl relative"
      >
        <button 
          onClick={clearLocation}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          aria-label="Clear location"
        >
          <X className="w-5 h-5" />
        </button>

        <div 
          className={clsx("flex items-center gap-3 pr-8 cursor-pointer md:cursor-default", isExpanded ? "mb-6" : "mb-0")}
          onClick={() => isMobile && setIsExpanded(!isExpanded)}
        >
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
            <MapPin className="w-5 h-5 text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base md:text-lg font-bold text-white truncate">{activeLocation.name}</h2>
            <div className="flex items-center gap-2">
              <p className="text-xs md:text-sm text-gray-400 truncate">{activeLocation.country}</p>
              {!isExpanded && isMobile && (
                <>
                  <span className="text-gray-600">•</span>
                  <span className="text-xs text-gray-300">{activeLocation.localTime}</span>
                  <span className="text-gray-600">•</span>
                  <span className="text-xs text-gray-300 flex items-center gap-1">
                    {isNight ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
                  </span>
                </>
              )}
            </div>
          </div>
          {isMobile && (
            <div className="text-gray-500">
              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          )}
        </div>

        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={isMobile ? { height: 0, opacity: 0 } : false}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 flex items-center gap-2"><Clock className="w-4 h-4" /> Local Time</span>
                  <span className="text-white font-medium">{activeLocation.localTime} ({activeLocation.timezone})</span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400 flex items-center gap-2">
                    {isNight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />} Status
                  </span>
                  <span className="text-white font-medium">{activeLocation.dayState}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/10">
                  <div>
                    <span className="text-xs text-gray-400 flex items-center gap-1 mb-1"><Sunrise className="w-3 h-3" /> Sunrise</span>
                    <span className="text-sm font-medium text-white">{activeLocation.sunrise}</span>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 flex items-center gap-1 mb-1"><Sunset className="w-3 h-3" /> Sunset</span>
                    <span className="text-sm font-medium text-white">{activeLocation.sunset}</span>
                  </div>
                </div>

                <div className="pt-4 flex justify-between items-center text-xs text-gray-500">
                  <span>Lat: {activeLocation.latitude.toFixed(4)}</span>
                  <span>Lon: {activeLocation.longitude.toFixed(4)}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
