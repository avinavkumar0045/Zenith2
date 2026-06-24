import React from 'react';
import { usePlanetStore } from '../store/usePlanetStore';
import { useLocationStore } from '../../location/store/useLocationStore';
import { PlanetDetails } from './PlanetDetails';
import { Globe2, Loader2, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';

export function PlanetPanel() {
  const planets = usePlanetStore(state => state.planets);
  const loading = usePlanetStore(state => state.loading);
  const selectedPlanet = usePlanetStore(state => state.selectedPlanet);
  const setSelectedPlanet = usePlanetStore(state => state.setSelectedPlanet);
  const activeLocation = useLocationStore(state => state.activeLocation);

  if (!activeLocation) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-gray-400">
        <Globe2 className="w-8 h-8 mb-2 opacity-50" />
        <p className="text-sm">Select a location to view planets</p>
      </div>
    );
  }

  const planetList = Object.values(planets);

  return (
    <div className="flex flex-col h-full bg-black/40 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden">
      <div className="p-4 border-b border-white/10 flex justify-between items-center bg-black/60">
        <div className="flex items-center space-x-2">
          <Globe2 className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-bold text-white tracking-wide">Planetary Intelligence</h2>
        </div>
        {loading && <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {planetList.length > 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="grid grid-cols-1 gap-2">
              {planetList.map(planet => (
                <div 
                  key={planet.id}
                  onClick={() => setSelectedPlanet(planet.id === selectedPlanet ? null : planet.id)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer ${
                    selectedPlanet === planet.id 
                      ? 'bg-purple-900/30 border-purple-500/50' 
                      : 'bg-black/20 border-white/5 hover:bg-white/5'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${planet.isAboveHorizon ? 'bg-green-400' : 'bg-red-400'}`} />
                      <span className="text-sm font-semibold text-white">{planet.name}</span>
                    </div>
                    {planet.isAboveHorizon ? (
                      <div className="flex items-center text-xs text-green-400">
                        <Eye className="w-3 h-3 mr-1" /> Visible
                      </div>
                    ) : (
                      <div className="flex items-center text-xs text-red-400">
                        <EyeOff className="w-3 h-3 mr-1" /> Below Horizon
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                    <div>
                      <span className="text-gray-500 block text-[10px] uppercase">Altitude</span>
                      <span className="text-gray-300">{planet.altitude.toFixed(1)}°</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[10px] uppercase">Azimuth</span>
                      <span className="text-gray-300">{planet.azimuth.toFixed(1)}°</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block text-[10px] uppercase">Score</span>
                      <span className="text-purple-300 font-bold">{planet.observationScore}/10</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <PlanetDetails />
          </motion.div>
        ) : (
          !loading && <div className="text-gray-400 text-sm">No planet data available.</div>
        )}
      </div>
    </div>
  );
}
