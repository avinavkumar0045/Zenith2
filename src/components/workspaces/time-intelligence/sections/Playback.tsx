import React from 'react';
import { useTimeStore } from '../types';
import { PlaybackEngine } from '../engine/PlaybackEngine';
import { Play, Pause, ChevronLeft, ChevronRight, RotateCcw, FastForward } from 'lucide-react';
import clsx from 'clsx';

export const Playback: React.FC = () => {
  const { isPlaying, playbackSpeed, setPlaybackSpeed, resetToNow } = useTimeStore();

  const handlePlayToggle = () => {
    if (isPlaying) {
      PlaybackEngine.stopPlayback();
    } else {
      PlaybackEngine.startPlayback();
    }
  };

  const speedOptions = [
    { label: '1m/s', value: 60 },
    { label: '10m/s', value: 600 },
    { label: '1h/s', value: 3600 },
    { label: '4h/s', value: 14400 },
  ];

  return (
    <div className="flex flex-col gap-4 border-b border-slate-800/60 pb-5">
      {/* Playback Buttons Control Bar */}
      <div className="flex items-center justify-between">
        {/* Step backward */}
        <button
          onClick={() => PlaybackEngine.stepBackward()}
          className="p-2 rounded bg-slate-900/60 hover:bg-slate-800/80 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 transition-all duration-200 cursor-pointer active:scale-90"
          title="Step Backward (15 mins)"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Core Play/Pause Toggle */}
        <button
          onClick={handlePlayToggle}
          className={clsx(
            "p-3 rounded-full cursor-pointer flex items-center justify-center transition-all duration-[300ms] shadow-md border active:scale-95",
            isPlaying 
              ? "bg-cyan-500 text-slate-950 border-cyan-400 hover:bg-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.5)]" 
              : "bg-slate-950 text-cyan-400 border-slate-800 hover:bg-slate-900 hover:border-cyan-500/30 hover:text-cyan-300"
          )}
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-slate-950 stroke-slate-950" />
          ) : (
            <Play className="w-5 h-5 fill-cyan-400 stroke-cyan-400 pl-0.5" />
          )}
        </button>

        {/* Step forward */}
        <button
          onClick={() => PlaybackEngine.stepForward()}
          className="p-2 rounded bg-slate-900/60 hover:bg-slate-800/80 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 transition-all duration-200 cursor-pointer active:scale-90"
          title="Step Forward (15 mins)"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Speed & Sync controls */}
      <div className="flex items-center justify-between gap-4">
        {/* Speed Segmented Pill */}
        <div className="flex bg-slate-950/80 border border-slate-800/80 p-0.5 rounded-lg flex-1">
          {speedOptions.map((opt) => {
            const isSelected = playbackSpeed === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setPlaybackSpeed(opt.value)}
                className={clsx(
                  "flex-1 text-[10px] font-mono py-1 rounded-md transition-all duration-200 cursor-pointer select-none",
                  isSelected 
                    ? "bg-slate-800 text-cyan-400 font-bold border border-slate-700/50 shadow-inner" 
                    : "text-slate-500 hover:text-slate-300"
                )}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Sync Now button */}
        <button
          onClick={resetToNow}
          className="p-1.5 rounded bg-slate-900/60 hover:bg-slate-800/80 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700 transition-all duration-200 flex-shrink-0 cursor-pointer active:scale-90"
          title="Sync simulated time to device clock"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
