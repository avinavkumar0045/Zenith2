import React, { useState } from 'react';
import Link from 'next/link';
import { Compass, Cloud, Sun, Eye, Layers, MapPin, ArrowLeft, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useLocationStore } from '../../../modules/location/store/useLocationStore';
import { useWeatherStore } from '../../../modules/weather/store/useWeatherStore';
import { usePlanetStore } from '../../../modules/planets/store/usePlanetStore';
import { useMoonStore } from '../../../modules/moon/store/useMoonStore';
import { SkyObject, HorizonTheme } from '../UserCentricView.types';
import { BRIGHT_STARS } from '../assets/starCatalog';
import { LocationService } from '../../../modules/location/services/LocationService';
import { GeocodingService } from '../../../modules/location/services/GeocodingService';

interface ObservationHUDProps {
  onSelectObject: (obj: SkyObject) => void;
  selectedObject: SkyObject | null;
  activeHorizonTheme: HorizonTheme;
  onSetHorizonTheme: (theme: HorizonTheme) => void;
  cameraHeading: number;
  cameraPitch: number;
  showGrid: boolean;
  onToggleGrid: () => void;
  showAtmosphere: boolean;
  onToggleAtmosphere: () => void;
  isCollapsed?: boolean;
}

export default function ObservationHUD({
  onSelectObject,
  selectedObject,
  activeHorizonTheme,
  onSetHorizonTheme,
  cameraHeading,
  cameraPitch,
  showGrid,
  onToggleGrid,
  showAtmosphere,
  onToggleAtmosphere,
  isCollapsed
}: ObservationHUDProps) {
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [customLat, setCustomLat] = useState("");
  const [customLon, setCustomLon] = useState("");
  const [isLeftPanelCollapsed, setIsLeftPanelCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const activeLocation = useLocationStore((state) => state.activeLocation);
  const weatherState = useWeatherStore((state) => state.weather);
  const planetsData = usePlanetStore((state) => state.planets);
  const moonData = useMoonStore((state) => state.moonData);

  // Fallback observer location details
  const locName = activeLocation ? `${activeLocation.name}, ${activeLocation.country}` : "Chennai, India";
  const coords = activeLocation 
    ? `${activeLocation.latitude.toFixed(4)}° N, ${activeLocation.longitude.toFixed(4)}° E` 
    : "13.0827° N, 80.2707° E";

  // Weather/seeing stats
  const cloudCover = weatherState ? weatherState.cloudCover : 12;
  const observationQuality = weatherState ? weatherState.observationQuality : "Excellent";
  const temp = weatherState ? weatherState.temperature : 21;
  const humidity = weatherState ? weatherState.humidity : 62;

  // Compile list of visible objects
  const getVisibleObjects = (): SkyObject[] => {
    const list: SkyObject[] = [];

    // Add Moon if visible
    if (moonData && moonData.altitude > 0) {
      list.push({
        id: 'moon',
        name: 'Moon',
        type: 'moon',
        ra: 12.0, // dummy, calculated via AltAz
        dec: 0.0,
        magnitude: -12.7 * moonData.illumination, // scale brightness
        description: `Lunar Phase: ${moonData.phaseName} (${Math.round(moonData.illumination * 100)}% illuminated)`
      });
    }

    // Add Planets
    Object.values(planetsData || {}).forEach(p => {
      if (p.altitude > 0) {
        list.push({
          id: p.id,
          name: p.name,
          type: 'planet',
          ra: p.subPlanetLongitude / 15.0, // rough
          dec: p.subPlanetLatitude,
          magnitude: p.id === 'venus' ? -4.4 : p.id === 'jupiter' ? -2.2 : 0.5,
          description: `Altitude: ${Math.round(p.altitude)}°, Direction: ${p.azimuth.toFixed(0)}°`
        });
      }
    });

    // Add key bright stars (Polaris, Sirius, Betelgeuse, Rigel, Vega)
    BRIGHT_STARS.slice(0, 8).forEach(s => {
      list.push({
        id: s.id,
        name: s.name,
        type: 'star',
        ra: s.ra,
        dec: s.dec,
        magnitude: s.magnitude,
        description: `A bright magnitude ${s.magnitude} star.`
      });
    });

    // Add Deep Sky Objects
    list.push({
      id: 'm31',
      name: 'Andromeda Galaxy',
      type: 'deepsky',
      ra: 0.71,
      dec: 41.27,
      magnitude: 3.4,
      description: 'Nearest spiral galaxy to the Milky Way.'
    });
    list.push({
      id: 'm42',
      name: 'Orion Nebula',
      type: 'deepsky',
      ra: 5.59,
      dec: -5.38,
      magnitude: 4.0,
      description: 'Stellar nursery in the constellation of Orion.'
    });

    return list;
  };

  const visibleObjects = getVisibleObjects();

  return (
    <div className="absolute inset-0 z-10 pointer-events-none flex flex-col justify-between p-6 select-none font-sans">
      
      {/* HEADER SECTION */}
      <div className={`w-full flex items-start justify-between pointer-events-auto transition-all duration-500 ease-in-out ${
        isCollapsed ? 'opacity-0 -translate-y-10 pointer-events-none' : 'opacity-100 translate-y-0'
      }`}>
        {/* Top-Left: Logo & Location */}
        <div className="flex items-center gap-4">
          <Link 
            href="/dashboard"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/10 bg-black/60 hover:bg-white/15 text-white/70 hover:text-white text-xs font-bold transition-all backdrop-blur-md cursor-pointer"
          >
            <ArrowLeft size={14} />
            Dashboard
          </Link>
          
          <div 
            onClick={() => setShowLocationPicker(!showLocationPicker)}
            className="flex flex-col bg-black/60 border border-white/10 px-4 py-2 rounded-2xl backdrop-blur-md shadow-lg gap-0.5 cursor-pointer hover:bg-white/10 transition-all group"
            title="Click to select location"
          >
            <span className="text-[10px] font-bold text-cyan-400 tracking-wider uppercase flex items-center gap-1 group-hover:text-cyan-300 transition-colors">
              <MapPin size={10} className="animate-bounce" />
              Observer Location ▾
            </span>
            <span className="text-sm font-black text-white group-hover:text-cyan-100 transition-colors">{locName}</span>
            <span className="text-[10px] text-white/50 font-semibold">{coords}</span>
          </div>
        </div>

        {/* Top-Right: Sky Quality Index */}
        <div className="flex bg-black/50 border border-white/10 p-3 rounded-2xl backdrop-blur-md shadow-lg items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[9px] font-extrabold text-cyan-400 tracking-wider uppercase">Tonight at a Glance</span>
            <span className="text-xs font-bold text-white/80">{observationQuality} Sky Quality</span>
            <span className="text-[10px] text-white/40 font-medium">Bortle Class 3 • {temp}°C</span>
          </div>
          
          <div className="w-12 h-12 rounded-full border-2 border-cyan-400/35 flex items-center justify-center flex-col relative bg-cyan-400/5">
            <span className="text-xs font-black text-white">92</span>
            <span className="text-[7px] text-white/40 font-bold uppercase tracking-tighter">Score</span>
          </div>
        </div>
      </div>

      {/* LOCATION PICKER FLOATING DROPDOWN */}
      {showLocationPicker && !isCollapsed && (
        <div className="absolute left-[130px] top-[74px] w-80 bg-black/85 border border-cyan-500/20 p-5 rounded-2xl backdrop-blur-lg shadow-2xl z-50 flex flex-col gap-4 pointer-events-auto animate-in fade-in slide-in-from-top-4 duration-300 max-h-[500px] overflow-y-auto scrollbar-thin">
          <div className="flex items-center justify-between border-b border-white/5 pb-2">
            <span className="text-xs font-black text-white flex items-center gap-1.5 uppercase tracking-wide">
              <MapPin size={12} className="text-cyan-400" />
              Select Location
            </span>
            <button 
              onClick={() => {
                setShowLocationPicker(false);
                setSearchQuery("");
                setSearchResults([]);
              }}
              className="text-white/40 hover:text-white text-xs font-bold px-1.5 py-0.5 rounded hover:bg-white/5 transition-all cursor-pointer border-none bg-transparent"
            >
              ✕
            </button>
          </div>

          {/* Text Search Input */}
          <div className="flex flex-col gap-2">
            <span className="text-[9px] font-bold text-white/40 tracking-wider uppercase">Search City</span>
            <div className="relative flex items-center">
              <Search size={12} className="absolute left-2.5 text-white/30" />
              <input
                type="text"
                value={searchQuery}
                onChange={async (e) => {
                  setSearchQuery(e.target.value);
                  const q = e.target.value;
                  if (q.trim().length >= 2) {
                    setIsSearching(true);
                    try {
                      const results = await GeocodingService.search(q);
                      setSearchResults(results);
                    } catch (err) {
                      console.error("Geocoding failed", err);
                    }
                    setIsSearching(false);
                  } else {
                    setSearchResults([]);
                  }
                }}
                placeholder="e.g. Paris, Tokyo, London..."
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-8 pr-8 py-1.5 text-xs text-white outline-none focus:border-cyan-400/50"
              />
              {isSearching && (
                <div className="absolute right-2.5 w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
              )}
            </div>
          </div>

          {/* Search Results Dropdown List */}
          {searchResults.length > 0 && (
            <div className="flex flex-col gap-1 max-h-36 overflow-y-auto bg-white/5 border border-white/10 rounded-lg p-1">
              {searchResults.map((result, idx) => (
                <button
                  key={`${result.latitude}-${result.longitude}-${idx}`}
                  onClick={async () => {
                    await LocationService.setLocationFromResult(result);
                    setSearchQuery("");
                    setSearchResults([]);
                    setShowLocationPicker(false);
                  }}
                  className="w-full py-1.5 px-2 text-left text-[10px] text-white hover:bg-cyan-500/20 hover:text-cyan-300 rounded transition-all cursor-pointer border-none bg-transparent"
                >
                  <div className="font-bold">{result.name}</div>
                  <div className="text-[8px] text-white/40">{result.country}</div>
                </button>
              ))}
            </div>
          )}

          {/* Presets List */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] font-bold text-white/40 tracking-wider uppercase">Presets</span>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { name: "Chennai", lat: 13.0827, lon: 80.2707, desc: "India" },
                { name: "New York", lat: 40.7128, lon: -74.0060, desc: "USA" },
                { name: "London", lat: 51.5074, lon: -0.1278, desc: "UK" },
                { name: "Tokyo", lat: 35.6762, lon: 139.6503, desc: "Japan" },
                { name: "Sydney", lat: -33.8688, lon: 151.2093, desc: "Australia" },
                { name: "Reykjavik", lat: 64.1466, lon: -21.9426, desc: "Iceland" }
              ].map(city => (
                <button
                  key={city.name}
                  onClick={async () => {
                    await LocationService.setLocationFromCoordinates(city.lat, city.lon, 'User Preset');
                    setShowLocationPicker(false);
                  }}
                  className="py-2 px-2.5 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-cyan-400/30 text-white text-[10px] font-bold text-left transition-all cursor-pointer flex flex-col justify-center"
                >
                  <span>{city.name}</span>
                  <span className="text-[8px] text-white/40 font-semibold">{city.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="w-full h-[1px] bg-white/5" />

          {/* Custom Coordinates input */}
          <div className="flex flex-col gap-2">
            <span className="text-[9px] font-bold text-white/40 tracking-wider uppercase">Custom Coordinates</span>
            <div className="flex gap-2">
              <div className="flex flex-col gap-1 w-1/2">
                <span className="text-[8px] font-bold text-white/50">Latitude</span>
                <input
                  type="number"
                  step="0.0001"
                  value={customLat}
                  onChange={e => setCustomLat(e.target.value)}
                  placeholder="e.g. 13.0827"
                  className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-cyan-400/50"
                />
              </div>
              <div className="flex flex-col gap-1 w-1/2">
                <span className="text-[8px] font-bold text-white/50">Longitude</span>
                <input
                  type="number"
                  step="0.0001"
                  value={customLon}
                  onChange={e => setCustomLon(e.target.value)}
                  placeholder="e.g. 80.2707"
                  className="bg-white/5 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-white outline-none focus:border-cyan-400/50"
                />
              </div>
            </div>
            <button
              onClick={async () => {
                const lat = parseFloat(customLat);
                const lon = parseFloat(customLon);
                if (!isNaN(lat) && !isNaN(lon)) {
                  await LocationService.setLocationFromCoordinates(lat, lon, 'Custom Entry');
                  setShowLocationPicker(false);
                }
              }}
              className="w-full py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all cursor-pointer mt-1"
            >
              Apply Coordinates
            </button>
          </div>

          <div className="w-full h-[1px] bg-white/5" />

          {/* Geolocation */}
          <button
            onClick={async () => {
              await LocationService.requestBrowserLocation();
              setShowLocationPicker(false);
            }}
            className="w-full py-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Compass size={12} className="animate-spin-slow" />
            Detect My Location
          </button>
        </div>
      )}

      {/* LEFT PANELS: Catalogs and horizon settings */}
      <div className={`absolute left-6 top-48 w-80 max-h-[50%] bg-black/45 border border-white/10 p-4 rounded-2xl backdrop-blur-md shadow-2xl flex flex-col gap-4 pointer-events-auto transition-all duration-500 ease-in-out ${
        isCollapsed 
          ? 'opacity-0 -translate-x-[115%] pointer-events-none' 
          : isLeftPanelCollapsed 
            ? '-translate-x-[calc(100%+24px)]' 
            : 'opacity-100 translate-x-0'
      }`}>

        {/* Panel collapse toggle button */}
        {!isCollapsed && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsLeftPanelCollapsed(!isLeftPanelCollapsed);
            }}
            className="absolute top-1/2 -translate-y-1/2 right-[-28px] w-7 h-12 flex items-center justify-center rounded-r-xl border border-l-0 border-white/15 bg-black/75 hover:bg-white/15 text-white/80 hover:text-white transition-all duration-300 backdrop-blur-md cursor-pointer pointer-events-auto shadow-md"
            title={isLeftPanelCollapsed ? "Expand panel" : "Collapse panel"}
          >
            {isLeftPanelCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        )}
        {/* Header visible objects */}
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] font-bold text-cyan-400 tracking-wider uppercase flex items-center gap-1">
            <Compass size={10} />
            Visible Tonight
          </span>
          <span className="text-xs font-medium text-white/50">Click to center and observe targets</span>
        </div>

        {/* List scroll */}
        <div className="flex flex-col gap-1.5 max-h-56 overflow-y-auto pr-1">
          {visibleObjects.map(obj => {
            const isSelected = selectedObject && selectedObject.id === obj.id;
            return (
              <button
                key={obj.id}
                onClick={() => onSelectObject(obj)}
                className={`w-full py-2 px-3 rounded-xl border flex items-center justify-between text-left transition-all duration-300 cursor-pointer ${
                  isSelected 
                    ? 'bg-cyan-500/20 border-cyan-400/40 text-cyan-300' 
                    : 'bg-white/5 border-white/5 text-white hover:bg-white/10'
                }`}
              >
                <div className="flex flex-col">
                  <span className="text-xs font-extrabold">{obj.name}</span>
                  <span className="text-[9px] text-white/40 font-semibold">{obj.type.toUpperCase()}</span>
                </div>
                
                <span className="text-[9px] text-cyan-400/70 font-black tracking-wider">
                  Mag: {obj.magnitude !== undefined ? obj.magnitude.toFixed(1) : 'N/A'}
                </span>
              </button>
            );
          })}
        </div>

        {/* Horizon theme selector */}
        <div className="flex flex-col gap-2 border-t border-white/5 pt-3">
          <span className="text-[9px] font-bold text-cyan-400 tracking-wider uppercase flex items-center gap-1">
            <Layers size={10} />
            Horizon Theme
          </span>
          
          <div className="grid grid-cols-5 gap-1 text-[9px] font-bold">
            {(['mountains', 'forest', 'city', 'ocean', 'desert'] as HorizonTheme[]).map(theme => {
              const isActive = activeHorizonTheme === theme;
              return (
                <button
                  key={theme}
                  onClick={() => onSetHorizonTheme(theme)}
                  className={`py-1.5 rounded-lg border text-center transition-all cursor-pointer capitalize ${
                    isActive 
                      ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300' 
                      : 'bg-white/5 border-white/5 text-white/50 hover:bg-white/10 hover:text-white/80'
                  }`}
                >
                  {theme}
                </button>
              );
            })}
          </div>
        </div>

        {/* Toggles section */}
        <div className="flex flex-col gap-3 border-t border-white/5 pt-3 text-[9px] font-bold">
          {/* Coordinates Grid */}
          <div className="flex items-center justify-between">
            <span className="text-cyan-400 tracking-wider uppercase flex items-center gap-1">
              <Compass size={10} />
              Sky Coordinates Grid
            </span>
            <button
              onClick={onToggleGrid}
              className={`px-2.5 py-1 rounded-lg text-[8px] font-extrabold border transition-all cursor-pointer ${
                showGrid 
                  ? 'bg-cyan-500/20 border-cyan-400/40 text-cyan-300' 
                  : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:text-white/80'
              }`}
            >
              {showGrid ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>

          {/* Atmosphere Scattering (Daytime Sky) */}
          <div className="flex items-center justify-between">
            <span className="text-cyan-400 tracking-wider uppercase flex items-center gap-1">
              <Sun size={10} />
              Daytime Sky Effect
            </span>
            <button
              onClick={onToggleAtmosphere}
              className={`px-2.5 py-1 rounded-lg text-[8px] font-extrabold border transition-all cursor-pointer ${
                showAtmosphere 
                  ? 'bg-cyan-500/20 border-cyan-400/40 text-cyan-300' 
                  : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:text-white/80'
              }`}
            >
              {showAtmosphere ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
