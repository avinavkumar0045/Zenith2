"use client";

import { useState } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { GeocodingService, GeocodingResult } from '../services/GeocodingService';
import { LocationService } from '../services/LocationService';

export default function LocationSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    
    setIsSearching(true);
    setIsOpen(true);
    const searchResults = await GeocodingService.search(query);
    setResults(searchResults);
    setIsSearching(false);
  };

  const handleSelect = async (result: GeocodingResult) => {
    setIsOpen(false);
    setQuery('');
    await LocationService.setLocationFromResult(result);
  };

  return (
    <div className="relative w-full max-w-md mx-auto pointer-events-auto">
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search locations..."
          className="w-full bg-black/50 border border-white/20 text-white placeholder-gray-400 rounded-full py-3 pl-12 pr-4 focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/50 backdrop-blur-md transition-all"
        />
        <div className="absolute inset-y-0 left-0 flex items-center pl-4">
          {isSearching ? <Loader2 className="w-5 h-5 text-gray-400 animate-spin" /> : <Search className="w-5 h-5 text-gray-400" />}
        </div>
      </form>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-black/80 border border-white/10 rounded-2xl overflow-hidden backdrop-blur-xl shadow-2xl z-50">
          <ul className="py-2">
            {results.map((r, i) => (
              <li key={i}>
                <button
                  onClick={() => handleSelect(r)}
                  className="w-full text-left px-4 py-3 hover:bg-white/10 flex items-center gap-3 transition-colors text-white"
                >
                  <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <div className="truncate flex-1">
                    <span className="font-medium text-sm block truncate">{r.name}</span>
                    <span className="text-xs text-gray-400 block truncate">{r.country}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
