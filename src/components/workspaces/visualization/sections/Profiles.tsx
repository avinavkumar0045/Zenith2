import React from 'react';
import { useVisualizationStore, VisualizationProfile } from '../Visualization.types';
import { Shield, Compass, Radar, Camera, Grid, Lock, Unlock } from 'lucide-react';
import clsx from 'clsx';

export const Profiles: React.FC = () => {
  const { activeProfile, setProfile } = useVisualizationStore();

  const profileCards = [
    {
      id: 'minimal' as const,
      label: 'Minimal',
      icon: Shield,
      desc: 'Earth-first view. Basic twilight and moon metrics only.',
      details: 'Day/Night ● Moon Overhead',
      color: 'text-slate-400 border-slate-500/20'
    },
    {
      id: 'observation' as const,
      label: 'Observation',
      icon: Compass,
      desc: 'Optimal stargazing setup. Displays planets, deep sky, and weather.',
      details: 'Planets ● DSO ● Weather ● Guides',
      color: 'text-emerald-400 border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.1)]'
    },
    {
      id: 'satellite' as const,
      label: 'Satellite',
      icon: Radar,
      desc: 'Orbital tracking. Displays satellite orbits, tracks, and visibility cones.',
      details: 'ISS ● Satellites ● Orbits ● Cones',
      color: 'text-cyan-400 border-cyan-500/20 shadow-[0_0_8px_rgba(34,211,238,0.1)]'
    },
    {
      id: 'astrophotography' as const,
      label: 'Astrophoto',
      icon: Camera,
      desc: 'Dark sky focus. Hides cities, coordinates, and labels.',
      details: 'Milky Way ● Horizon ● Clean Labels',
      color: 'text-purple-400 border-purple-500/20'
    },
    {
      id: 'everything' as const,
      label: 'Everything',
      icon: Grid,
      desc: 'Render all spatial analytics and coordinates simultaneously.',
      details: 'All Elements ● All Labels ● Grid',
      color: 'text-amber-400 border-amber-500/20'
    }
  ];

  return (
    <div className="flex flex-col gap-3 border-b border-slate-800/60 pb-5">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Workspace Profiles</span>
        <span className="text-[9px] font-mono text-slate-500">Preset Configurations</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {profileCards.map((prof) => {
          const isSelected = activeProfile === prof.id;
          const Icon = prof.icon;

          return (
            <button
              key={prof.id}
              onClick={() => setProfile(prof.id)}
              className={clsx(
                "flex flex-col p-3 rounded-xl border text-left transition-all duration-300 group cursor-pointer w-full select-none outline-none relative overflow-hidden",
                isSelected
                  ? "bg-slate-950/80 border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.1),inset_0_1px_1px_rgba(255,255,255,0.1)]"
                  : "bg-slate-900/30 border-slate-850 hover:border-slate-750 hover:bg-slate-900/50"
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-1.5">
                  <Icon className={clsx(
                    "w-3.5 h-3.5 transition-transform duration-300 group-hover:scale-110",
                    isSelected ? "text-cyan-400" : "text-slate-400"
                  )} />
                  <span className={clsx(
                    "text-[11px] font-bold transition-colors duration-200",
                    isSelected ? "text-white" : "text-slate-300"
                  )}>
                    {prof.label}
                  </span>
                </div>
                {isSelected ? (
                  <Lock className="w-3 h-3 text-cyan-400/80" />
                ) : (
                  <Unlock className="w-3 h-3 text-slate-600 group-hover:text-slate-400 transition-colors" />
                )}
              </div>

              {/* Sub details */}
              <span className="text-[8.5px] text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                {prof.desc}
              </span>
              <span className="text-[7.5px] font-mono text-cyan-400/50 mt-1 opacity-80 truncate">
                {prof.details}
              </span>
            </button>
          );
        })}

        {/* Custom status node */}
        {activeProfile === 'custom' && (
          <div className="col-span-2 flex items-center justify-between p-2.5 rounded-lg border border-dashed border-amber-500/20 bg-amber-500/5 text-slate-400 select-none">
            <div className="flex items-center gap-2">
              <Unlock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="text-[10px] font-medium text-slate-300">Custom Configuration Unlocked</span>
            </div>
            <span className="text-[8px] font-mono text-slate-500 uppercase">Tweak mode active</span>
          </div>
        )}
      </div>
    </div>
  );
};
