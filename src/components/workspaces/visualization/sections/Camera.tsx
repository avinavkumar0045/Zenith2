import React from 'react';
import { useVisualizationStore, CameraMode } from '../Visualization.types';
import { useSatelliteStore } from '@/modules/satellites/store/useSatelliteStore';
import { usePlanetStore } from '@/modules/planets/store/usePlanetStore';
import { Globe, Video, Anchor, Compass, Activity } from 'lucide-react';
import clsx from 'clsx';

export const Camera: React.FC = () => {
  const { cameraMode, setCameraMode } = useVisualizationStore();
  
  const selectedSat = useSatelliteStore((state) => state.selectedSatellite);
  const selectedPlanet = usePlanetStore((state) => state.selectedPlanet);

  const activeTargetName = selectedSat 
    ? selectedSat.name 
    : (selectedPlanet ? selectedPlanet.toUpperCase() : null);

  const cameraModes = [
    {
      id: 'free' as const,
      label: 'Free Orbit',
      icon: Compass,
      desc: 'Manual mouse orbital navigation and zoom.'
    },
    {
      id: 'earth-lock' as const,
      label: 'Earth Lock',
      icon: Anchor,
      desc: 'Lock camera to observer coordinates. Rotates with the Earth.'
    },
    {
      id: 'follow-iss' as const,
      label: 'Follow ISS',
      icon: Activity,
      desc: 'Track the International Space Station trajectory.'
    },
    {
      id: 'track-moon' as const,
      label: 'Track Moon',
      icon: Globe,
      desc: 'Track Moon ground position coordinates.'
    },
    {
      id: 'track-selected' as const,
      label: 'Track Target',
      icon: Video,
      desc: activeTargetName ? `Track active target: ${activeTargetName}` : 'Track selected explorer target.'
    }
  ];

  return (
    <div className="flex flex-col gap-3 border-b border-slate-800/60 pb-5">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Globe Camera Controls</span>
        <span className="text-[9px] font-mono text-slate-500">CameraEngine targeting</span>
      </div>

      <div className="flex flex-col gap-2">
        {cameraModes.map((mode) => {
          const isActive = cameraMode === mode.id;
          const isTrackTarget = mode.id === 'track-selected';
          const isDisabled = isTrackTarget && !activeTargetName;
          const Icon = mode.icon;

          return (
            <button
              key={mode.id}
              disabled={isDisabled}
              onClick={() => setCameraMode(mode.id)}
              className={clsx(
                "flex items-start gap-3 p-2.5 rounded-xl border text-left transition-all duration-[250ms] group w-full select-none outline-none relative overflow-hidden",
                isActive
                  ? "bg-cyan-500/[0.03] border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.06)]"
                  : isDisabled
                    ? "opacity-35 cursor-not-allowed border-slate-900 bg-slate-950/10"
                    : "bg-slate-900/30 border-slate-850 hover:border-slate-750 hover:bg-slate-900/50 cursor-pointer"
              )}
            >
              <div className={clsx(
                "p-1.5 rounded-lg border transition-all duration-300",
                isActive 
                  ? "bg-cyan-500/10 border-cyan-500/30 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.2)]" 
                  : "bg-slate-950/60 border-slate-800 text-slate-500 group-hover:text-slate-300 group-hover:border-slate-700"
              )}>
                <Icon className="w-3.5 h-3.5" />
              </div>

              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className={clsx(
                    "text-[10.5px] font-bold transition-colors duration-200",
                    isActive ? "text-white" : "text-slate-300"
                  )}>
                    {mode.label}
                  </span>
                  {isTrackTarget && activeTargetName && (
                    <span className="text-[8px] font-bold text-cyan-400 bg-cyan-500/10 px-1 py-0.5 rounded-sm border border-cyan-500/20 uppercase animate-pulse">
                      Active
                    </span>
                  )}
                </div>
                <span className="text-[8.5px] text-slate-500 leading-relaxed font-sans mt-0.5">
                  {mode.desc}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
export default Camera;
