"use client";

import { useLocationStore } from '../store/useLocationStore';
import { LocationIntelligenceObject } from '../types/location.types';
import { LocationService } from '../services/LocationService';
import { MapPin, History } from 'lucide-react';

export default function RecentLocations() {
  const recentLocations = useLocationStore((state) => state.recentLocations);

  if (recentLocations.length === 0) return null;

  const handleSelect = (loc: LocationIntelligenceObject) => {
    // Simply fetch fresh intelligence object for the coordinates
    LocationService.setLocationFromCoordinates(loc.latitude, loc.longitude, 'Recent');
  };

  return (
    <div className="bg-black/60 border border-white/10 backdrop-blur-xl rounded-2xl p-4 w-full max-w-sm pointer-events-auto">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-2">
        <History className="w-4 h-4" /> Recent
      </h3>
      <div className="flex flex-col gap-2">
        {recentLocations.slice(0, 5).map((loc) => (
          <button
            key={loc.id}
            onClick={() => handleSelect(loc)}
            className="flex items-center gap-3 w-full text-left p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-4 h-4 text-blue-400" />
            </div>
            <div className="truncate">
              <p className="text-sm font-medium text-white truncate">{loc.name}</p>
              <p className="text-xs text-gray-400 truncate">{loc.country}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
