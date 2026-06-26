import React, { useEffect } from 'react';
import { useTimeStore } from '../../workspaces/time-intelligence/types';
import { PlaybackEngine } from '../../workspaces/time-intelligence/engine/PlaybackEngine';
import { Play, Pause, RotateCcw, FastForward, Rewind } from 'lucide-react';

export default function TimelineMini({ isCollapsed, hasSelectedObject }: { isCollapsed?: boolean; hasSelectedObject?: boolean }) {
  const selectedTime = useTimeStore((state) => state.selectedTime);
  const isPlaying = useTimeStore((state) => state.isPlaying);
  const playbackSpeed = useTimeStore((state) => state.playbackSpeed);
  const setSelectedTime = useTimeStore((state) => state.setSelectedTime);
  const setPlaybackSpeed = useTimeStore((state) => state.setPlaybackSpeed);
  const resetToNow = useTimeStore((state) => state.resetToNow);

  // Play/Pause toggler
  const togglePlay = () => {
    if (isPlaying) {
      PlaybackEngine.stopPlayback();
    } else {
      PlaybackEngine.startPlayback();
    }
  };

  // Convert time to horizontal slider ratio (0 to 1439 minutes of the day)
  const getMinutesOfDay = (date: Date) => {
    return date.getHours() * 60 + date.getMinutes();
  };

  // Handle slider scrub
  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const minutes = parseInt(e.target.value);
    const nextTime = new Date(selectedTime);
    nextTime.setHours(Math.floor(minutes / 60));
    nextTime.setMinutes(minutes % 60);
    setSelectedTime(nextTime);
  };

  // Format date display
  const formatTimeStr = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  };

  const formatDateStr = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  };

  // Clean up playback loop on unmount
  useEffect(() => {
    return () => {
      PlaybackEngine.stopPlayback();
    };
  }, []);

  return (
    <div 
      className="absolute bottom-24 left-1/2 z-20 w-[450px] bg-black/45 border border-white/10 p-3 rounded-2xl backdrop-blur-md shadow-2xl flex flex-col gap-3 select-none pointer-events-auto transition-transform duration-500 ease-in-out"
      style={{ transform: `translate(-50%, ${isCollapsed ? '170%' : hasSelectedObject ? '-110px' : '0px'})` }}
    >
      {/* Time details and Live reset */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-sm font-bold text-white tracking-wide">{formatTimeStr(selectedTime)}</span>
          <span className="text-[10px] text-white/40 font-semibold">{formatDateStr(selectedTime).toUpperCase()}</span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Live Indicator / Reset */}
          <button 
            onClick={resetToNow}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-[10px] font-bold tracking-wider uppercase transition-all duration-300 cursor-pointer"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            Live Now
          </button>
        </div>
      </div>

      {/* Slider Track with Twilight Sky-Color Gradient representation */}
      <div className="relative w-full h-5 flex items-center">
        {/* Underlay Gradient mapping: 
            Dawn (5 AM - 7 AM): Orange
            Day (7 AM - 5 PM): Blue
            Golden/Twilight (5 PM - 8 PM): Purple/Orange
            Night (8 PM - 5 AM): Black
        */}
        <div className="absolute left-0 right-0 h-1.5 rounded-full bg-gradient-to-r from-slate-950 via-amber-600/30 via-sky-400/40 via-indigo-950 to-slate-950 -z-10 pointer-events-none" />
        
        <input 
          type="range"
          min="0"
          max="1439"
          value={getMinutesOfDay(selectedTime)}
          onChange={handleScrub}
          className="w-full accent-cyan-400 h-1.5 bg-transparent rounded-lg outline-none cursor-pointer"
        />
      </div>

      {/* Playback Controls and speed selectors */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Rewind */}
          <button 
            onClick={() => PlaybackEngine.stepBackward()}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
            title="Step Back 15m"
          >
            <Rewind size={14} />
          </button>

          {/* Play/Pause */}
          <button 
            onClick={togglePlay}
            className="p-2 rounded-full bg-cyan-500 hover:bg-cyan-400 text-black hover:scale-105 transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
          >
            {isPlaying ? <Pause size={16} fill="black" /> : <Play size={16} fill="black" />}
          </button>

          {/* Fast-forward */}
          <button 
            onClick={() => PlaybackEngine.stepForward()}
            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
            title="Step Forward 15m"
          >
            <FastForward size={14} />
          </button>
        </div>

        {/* Speed selectors */}
        <div className="flex items-center bg-white/5 p-0.5 rounded-lg border border-white/5">
          {[
            { label: 'Real', val: 1 },
            { label: '10m/s', val: 600 },
            { label: '1h/s', val: 3600 },
            { label: '3h/s', val: 10800 }
          ].map(s => {
            const isCurrent = playbackSpeed === s.val;
            return (
              <button
                key={s.label}
                onClick={() => setPlaybackSpeed(s.val)}
                className={`px-2 py-1 text-[9px] font-bold rounded-md uppercase tracking-wider transition-all duration-300 cursor-pointer ${
                  isCurrent 
                    ? 'bg-cyan-500/20 text-cyan-400' 
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
