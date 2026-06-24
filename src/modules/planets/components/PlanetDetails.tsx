import React from 'react';
import { usePlanetStore } from '../store/usePlanetStore';
import { motion, AnimatePresence } from 'framer-motion';

export function PlanetDetails() {
  const selectedPlanetId = usePlanetStore(state => state.selectedPlanet);
  const planets = usePlanetStore(state => state.planets);

  const planet = selectedPlanetId ? planets[selectedPlanetId] : null;

  return (
    <AnimatePresence>
      {planet && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-black/30 rounded-lg border border-white/5 overflow-hidden"
        >
          <div className="p-3 bg-purple-900/20 border-b border-white/5">
            <h3 className="text-sm font-bold text-white tracking-wide">{planet.name} Details</h3>
          </div>
          
          <div className="p-3 grid grid-cols-2 gap-3 text-xs">
            <div>
              <span className="text-gray-500 block">Distance</span>
              <span className="text-gray-200 font-mono">{planet.distance.toFixed(4)} AU</span>
            </div>
            <div>
              <span className="text-gray-500 block">Visibility</span>
              <span className={planet.isAboveHorizon ? 'text-green-400 font-medium' : 'text-red-400 font-medium'}>
                {planet.isAboveHorizon ? 'Visible' : 'Below Horizon'}
              </span>
            </div>
            <div>
              <span className="text-gray-500 block">Rise Time</span>
              <span className="text-gray-200 font-mono">{planet.riseTime || '--:--'}</span>
            </div>
            <div>
              <span className="text-gray-500 block">Set Time</span>
              <span className="text-gray-200 font-mono">{planet.setTime || '--:--'}</span>
            </div>
            <div className="col-span-2 pt-2 mt-1 border-t border-white/5">
              <span className="text-gray-500 block mb-1">Sub-Planet Point</span>
              <div className="flex justify-between">
                <span className="text-gray-300">Lat: <span className="font-mono">{planet.subPlanetLatitude.toFixed(4)}°</span></span>
                <span className="text-gray-300">Lon: <span className="font-mono">{planet.subPlanetLongitude.toFixed(4)}°</span></span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
