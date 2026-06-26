import React from 'react';
import { Sparkles, Star, Globe, Moon, Orbit, Eye } from 'lucide-react';
import { ExplorerObject, useCelestialExplorerStore } from '../CelestialExplorer.types';
import clsx from 'clsx';

interface FeaturedProps {
  objects: ExplorerObject[];
}

export const Featured: React.FC<FeaturedProps> = ({ objects }) => {
  const { selectedObjectId, setSelectedObjectId } = useCelestialExplorerStore();

  if (objects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-4 border border-white/5 rounded-2xl bg-white/2">
        <Sparkles className="w-4 h-4 text-slate-500 animate-pulse mb-1.5" />
        <span className="text-[10px] text-slate-400 font-sans">No key objects visible tonight</span>
      </div>
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'planets':
        return <Globe className="w-3.5 h-3.5 text-indigo-400" />;
      case 'moon':
        return <Moon className="w-3.5 h-3.5 text-amber-300" />;
      case 'stations':
      case 'satellites':
        return <Orbit className="w-3.5 h-3.5 text-cyan-400" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  const getRatingColor = (score: number) => {
    if (score >= 8) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (score >= 6) return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
    if (score >= 4) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  };

  return (
    <div className="flex flex-col gap-2 select-none">
      <div className="flex items-center gap-1.5 px-0.5">
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span className="text-[10px] font-bold font-mono tracking-widest text-cyan-400 uppercase">
          FEATURED TONIGHT
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {objects.map((obj) => {
          const isSelected = selectedObjectId === obj.id;
          return (
            <button
              key={obj.id}
              onClick={() => setSelectedObjectId(obj.id)}
              className={clsx(
                "flex flex-col items-start text-left p-2.5 rounded-xl border transition-all duration-[200ms] cursor-pointer relative overflow-hidden group hover:scale-[1.02]",
                isSelected
                  ? "bg-white/10 border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                  : "bg-slate-900/40 border-white/5 hover:bg-slate-800/40 hover:border-white/10"
              )}
            >
              {/* Highlight bar if selected */}
              {isSelected && (
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-cyan-500 to-indigo-500" />
              )}
              
              <div className="flex items-center justify-between w-full gap-1 mb-1.5">
                <div className="p-1 bg-white/5 rounded-lg">
                  {getTypeIcon(obj.type)}
                </div>
                <div className={clsx(
                  "text-[8px] font-mono font-bold px-1.5 py-0.5 rounded border flex items-center gap-0.5",
                  getRatingColor(obj.observationRating)
                )}>
                  <Star className="w-2 h-2 fill-current" />
                  <span>{obj.observationRating}</span>
                </div>
              </div>

              <span className={clsx(
                "text-[10px] font-semibold tracking-wide truncate w-full group-hover:text-cyan-300 transition-colors",
                isSelected ? "text-cyan-300" : "text-white/90"
              )}>
                {obj.name}
              </span>
              <span className="text-[8px] text-slate-400/90 font-sans tracking-wide truncate w-full mt-0.5 uppercase">
                {obj.type === 'deep-sky' ? 'Deep Sky' : obj.type}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
