import React from 'react';
import { Target, Compass, Eye, Clock, Layers, Star, Info, X } from 'lucide-react';
import { ExplorerObject } from '../CelestialExplorer.types';
import clsx from 'clsx';

interface ObjectPreviewProps {
  object: ExplorerObject;
  onFocus: () => void;
  onClose: () => void;
}

export const ObjectPreview: React.FC<ObjectPreviewProps> = ({ object, onFocus, onClose }) => {
  const getRatingColor = (score: number) => {
    if (score >= 8) return 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5';
    if (score >= 6) return 'text-cyan-400 border-cyan-500/20 bg-cyan-500/5';
    if (score >= 4) return 'text-amber-400 border-amber-500/20 bg-amber-500/5';
    return 'text-rose-400 border-rose-500/20 bg-rose-500/5';
  };

  const getVisibilityColor = (state: string) => {
    if (state.includes('Visible') || state.includes('Orbit')) return 'text-emerald-400';
    return 'text-slate-400';
  };

  return (
    <div className="flex flex-col p-3 bg-slate-950/85 border border-white/10 rounded-2xl shadow-xl select-none animate-in fade-in slide-in-from-bottom-2 duration-[250ms]">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 border-b border-white/5 pb-2">
        <div className="flex flex-col min-w-0">
          <span className="text-[8px] font-bold font-mono tracking-widest text-cyan-400 uppercase">
            {object.type === 'deep-sky' ? 'Deep Sky Object' : object.type}
          </span>
          <h3 className="text-xs font-bold text-white tracking-wide truncate mt-0.5">
            {object.name}
          </h3>
        </div>

        {/* Action / Badges */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <div className={clsx(
            "flex items-center gap-1 text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-full border",
            getRatingColor(object.observationRating)
          )}>
            <Star className="w-2.5 h-2.5 fill-current" />
            <span>{object.observationRating}/10</span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close details"
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grid of parameters */}
      <div className="grid grid-cols-2 gap-2.5 my-2">
        {/* Visibility */}
        <div className="flex items-center gap-1.5">
          <div className="p-1 bg-white/5 rounded-lg text-slate-400">
            <Eye className="w-3 h-3" />
          </div>
          <div className="flex flex-col">
            <span className="text-[7.5px] text-slate-500 font-medium uppercase font-sans">Visibility</span>
            <span className={clsx("text-[10px] font-semibold mt-0.5", getVisibilityColor(object.visibilityState))}>
              {object.visibilityState}
            </span>
          </div>
        </div>

        {/* Best observation time */}
        <div className="flex items-center gap-1.5">
          <div className="p-1 bg-white/5 rounded-lg text-slate-400">
            <Clock className="w-3 h-3" />
          </div>
          <div className="flex flex-col">
            <span className="text-[7.5px] text-slate-500 font-medium uppercase font-sans">Best Time</span>
            <span className="text-[10px] font-semibold text-slate-200 mt-0.5 truncate max-w-[80px]">
              {object.bestObservationTime || 'N/A'}
            </span>
          </div>
        </div>

        {/* Direction */}
        <div className="flex items-center gap-1.5">
          <div className="p-1 bg-white/5 rounded-lg text-slate-400">
            <Compass className="w-3 h-3" />
          </div>
          <div className="flex flex-col">
            <span className="text-[7.5px] text-slate-500 font-medium uppercase font-sans">Direction</span>
            <span className="text-[10px] font-semibold text-slate-200 mt-0.5">
              {object.direction}
            </span>
          </div>
        </div>

        {/* Altitude */}
        <div className="flex items-center gap-1.5">
          <div className="p-1 bg-white/5 rounded-lg text-slate-400">
            <Layers className="w-3 h-3" />
          </div>
          <div className="flex flex-col">
            <span className="text-[7.5px] text-slate-500 font-medium uppercase font-sans">Altitude</span>
            <span className="text-[10px] font-semibold text-slate-200 mt-0.5">
              {object.altitude.toFixed(1)}°
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="text-[9px] text-slate-400 leading-relaxed font-light mt-0.5 mb-2.5 flex items-start gap-1 bg-white/2 p-1.5 rounded-xl border border-white/5">
        <Info className="w-2.5 h-2.5 text-cyan-400 mt-0.5 flex-shrink-0" />
        <span>{object.description}</span>
      </div>

      {/* Focus Action Button */}
      <button
        onClick={onFocus}
        className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl font-sans text-[10px] font-semibold text-white tracking-widest uppercase cursor-pointer hover:scale-[1.01] active:scale-[0.98] transition-all bg-gradient-to-r from-cyan-500 to-indigo-500 border border-white/10 hover:shadow-[0_0_12px_rgba(6,182,212,0.4)]"
      >
        <Target className="w-3.5 h-3.5" />
        <span>Focus telemetry</span>
      </button>
    </div>
  );
};
