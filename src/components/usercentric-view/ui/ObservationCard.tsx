import React from 'react';
import { X, Eye, Target, Compass, Sparkles, Orbit } from 'lucide-react';
import { SkyObject } from '../UserCentricView.types';

interface ObservationCardProps {
  object: SkyObject & {
    riseTime?: string | null;
    setTime?: string | null;
    visibilityScore?: number;
    distanceStr?: string;
  };
  onClose: () => void;
  onFocus: () => void;
  onObserve: () => void;
  isObserving: boolean;
  isTracked: boolean;
  onToggleTrack: () => void;
}

const FACTS: Record<string, string> = {
  jupiter: "Jupiter is the largest planet in our Solar System and rotates once every 10 hours, creating its distinct banded cloud zones.",
  saturn: "Saturn's rings are composed of billions of individual ice and rock particles, ranging in size from tiny dust specks to massive house-sized boulders.",
  mars: "Mars is home to Olympus Mons, the largest volcano in the Solar System, which stands three times taller than Mount Everest.",
  venus: "Venus has a thick, toxic atmosphere that traps heat in a runaway greenhouse effect, making it the hottest planet in the Solar System.",
  mercury: "Mercury has extreme temperature swings, rising to 430°C in the day and plunging to -180°C at night.",
  moon: "The Moon is tidally locked to Earth, meaning we always see the same face. The dark spots are ancient volcanic plains called Maria.",
  polaris: "Polaris lies almost exactly above the Earth's North Pole, making it a fixed point of navigation in the night sky.",
  sirius: "Sirius is the brightest star in the night sky and is actually a binary star system containing a main-sequence star and a white dwarf.",
  betelgeuse: "Betelgeuse is a red supergiant nearing the end of its life cycle and is expected to go supernova within the next 100,000 years.",
  rigel: "Rigel is a blue supergiant star that shines with the light of 120,000 Suns combined.",
  m31: "The Andromeda Galaxy is on a collision course with our Milky Way. In about 4.5 billion years, they will merge into a single giant galaxy.",
  m42: "The Orion Nebula is a stellar nursery where hundreds of new stars are currently being born from dust and gas.",
  m45: "The Pleiades are an open cluster of young blue stars born together around 100 million years ago.",
  m8: "The Lagoon Nebula is a giant space cloud spanning 110 light-years across, heated by massive baby stars inside."
};

export default function ObservationCard({
  object,
  onClose,
  onFocus,
  onObserve,
  isObserving,
  isTracked,
  onToggleTrack
}: ObservationCardProps) {
  
  // Resolve fact
  const fact = FACTS[object.id.toLowerCase()] || 
    object.description || 
    `A celestial target located at Right Ascension ${object.ra.toFixed(2)}h and Declination ${object.dec.toFixed(1)}°.`;

  // Resolve direction label
  const getDirectionLabel = (az?: number) => {
    if (az === undefined) return 'N/A';
    const val = Math.round(az) % 360;
    if (val >= 337.5 || val < 22.5) return `N (${val}°)`;
    if (val >= 22.5 && val < 67.5) return `NE (${val}°)`;
    if (val >= 67.5 && val < 112.5) return `E (${val}°)`;
    if (val >= 112.5 && val < 157.5) return `SE (${val}°)`;
    if (val >= 157.5 && val < 202.5) return `S (${val}°)`;
    if (val >= 202.5 && val < 247.5) return `SW (${val}°)`;
    if (val >= 247.5 && val < 292.5) return `W (${val}°)`;
    return `NW (${val}°)`;
  };

  // Visibility quality
  const getVisibilityText = (score?: number) => {
    const s = score || 5.0;
    if (s >= 8.5) return 'Excellent';
    if (s >= 6.5) return 'Good';
    if (s >= 4.5) return 'Average';
    return 'Poor';
  };

  const getVisibilityColorClass = (score?: number) => {
    const s = score || 5.0;
    if (s >= 8.5) return 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5';
    if (s >= 6.5) return 'text-cyan-400 border-cyan-400/20 bg-cyan-400/5';
    if (s >= 4.5) return 'text-amber-400 border-amber-400/20 bg-amber-400/5';
    return 'text-rose-400 border-rose-400/20 bg-rose-400/5';
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-30 w-full h-[180px] bg-black/60 border-t border-white/10 p-4 backdrop-blur-lg shadow-2xl flex flex-row gap-4 select-none pointer-events-auto animate-in slide-in-from-bottom duration-300 font-sans text-white">
      
      {/* COLUMN 1: Header / Title */}
      <div className="flex flex-col justify-between w-1/5 min-w-[180px] border-r border-white/5 pr-4 relative">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-black tracking-widest text-cyan-400 uppercase flex items-center gap-1">
            <Orbit size={10} className="animate-spin-slow" />
            {object.type}
          </span>
          <span className="text-xl font-black tracking-wide text-white leading-tight break-words">
            {object.name}
          </span>
        </div>
        
        <span className="text-[9px] text-white/30 font-semibold tracking-wide">
          Zenith Observation Mode
        </span>
      </div>

      {/* COLUMN 2: Coordinates Widgets */}
      <div className="flex gap-2 w-1/4 border-r border-white/5 pr-4">
        {/* Alt/Az Widget */}
        <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col justify-between">
          <span className="text-[8px] font-bold text-white/40 uppercase tracking-wider flex items-center gap-1">
            <Compass size={10} />
            Altitude
          </span>
          <div className="flex flex-col">
            <span className="text-lg font-black text-cyan-400">
              {object.altitude !== undefined ? `${Math.round(object.altitude)}°` : 'N/A'}
            </span>
            <span className="text-[9px] text-white/50 font-semibold">Above horizon</span>
          </div>
        </div>

        {/* Direction Widget */}
        <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col justify-between">
          <span className="text-[8px] font-bold text-white/40 uppercase tracking-wider flex items-center gap-1">
            <Compass size={10} />
            Bearing
          </span>
          <div className="flex flex-col">
            <span className="text-lg font-black text-white">
              {getDirectionLabel(object.azimuth).split(' ')[0]}
            </span>
            <span className="text-[9px] text-white/50 font-semibold">
              {object.azimuth !== undefined ? `${Math.round(object.azimuth)}°` : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* COLUMN 3: Telemetry Widgets */}
      <div className="flex gap-2 w-1/4 border-r border-white/5 pr-4">
        {/* Visibility Widget */}
        <div className={`flex-1 border rounded-2xl p-3 flex flex-col justify-between ${getVisibilityColorClass(object.visibilityScore)}`}>
          <span className="text-[8px] font-bold text-white/40 uppercase tracking-wider">Visibility</span>
          <div className="flex flex-col">
            <span className="text-base font-black">
              {getVisibilityText(object.visibilityScore)}
            </span>
            <span className="text-[9px] text-white/40 font-semibold">Seeing quality</span>
          </div>
        </div>

        {/* Magnitude Widget */}
        <div className="flex-1 bg-white/5 border border-white/10 rounded-2xl p-3 flex flex-col justify-between">
          <span className="text-[8px] font-bold text-white/40 uppercase tracking-wider">Magnitude</span>
          <div className="flex flex-col">
            <span className="text-base font-black text-white/90">
              {object.magnitude !== undefined ? object.magnitude.toFixed(1) : 'N/A'}
            </span>
            <span className="text-[9px] text-white/50 font-semibold">Apparent brightness</span>
          </div>
        </div>
      </div>

      {/* COLUMN 4: Facts */}
      <div className="flex-1 bg-white/5 border border-white/5 rounded-2xl p-3.5 flex flex-col gap-1.5 overflow-y-auto max-h-[148px] scrollbar-thin pr-1">
        <span className="text-[9px] font-extrabold uppercase text-cyan-300 tracking-widest flex items-center gap-1">
          <Sparkles size={10} />
          Educational Insight
        </span>
        <p className="text-[11px] leading-relaxed text-white/70">
          {fact}
        </p>
      </div>

      {/* COLUMN 5: Actions */}
      <div className="flex flex-col gap-2 justify-center pl-2 w-[140px]">
        {/* Focus Button */}
        <button
          onClick={onFocus}
          className="w-full py-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white hover:text-white/90 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Target size={14} />
          Center View
        </button>

        {/* Observe Button */}
        <button
          onClick={onObserve}
          className={`w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all duration-300 cursor-pointer ${
            isObserving 
              ? 'bg-emerald-500/20 border border-emerald-400/50 text-emerald-300' 
              : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-lg shadow-cyan-500/20 hover:scale-102'
          }`}
        >
          <Eye size={14} fill={isObserving ? 'transparent' : 'black'} />
          {isObserving ? 'Observing' : 'Observe'}
        </button>
      </div>

      {/* Close button at the absolute top-right */}
      <button 
        onClick={onClose}
        className="absolute top-3 right-3 p-1 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-all cursor-pointer border-none bg-transparent"
        title="Close Panel"
      >
        <X size={16} />
      </button>

      <style jsx>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 3px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
