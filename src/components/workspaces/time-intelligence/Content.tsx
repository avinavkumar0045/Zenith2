import React from 'react';
import { X, Clock } from 'lucide-react';
import { Header } from './sections/Header';
import { TimelineRail } from './sections/TimelineRail';
import { Playback } from './sections/Playback';
import { Windows } from './sections/Windows';
import { Upcoming } from './sections/Upcoming';

interface ContentProps {
  onClose: () => void;
}

export const Content: React.FC<ContentProps> = ({ onClose }) => {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Drawer Title Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 select-none">
        <div className="flex flex-col items-start gap-0.5">
          <span className="text-[10px] text-cyan-400 font-bold tracking-[0.25em] font-mono leading-none">
            TIME INTELLIGENCE
          </span>
          <h2 className="text-sm font-semibold text-white tracking-wide uppercase font-sans mt-0.5">
            Predictive Playback
          </h2>
          <span className="text-[8px] text-slate-500 font-mono tracking-wider font-light mt-0.5 uppercase">
            Global Temporal Sync
          </span>
        </div>
        <button
          onClick={onClose}
          aria-label="Close panel"
          suppressHydrationWarning
          className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors focus:outline-none cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable Body Content */}
      <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4 mt-4 custom-scrollbar select-none">
        {/* Time display & confidence */}
        <Header />

        {/* Playback Controls */}
        <Playback />

        {/* Timeline Rail & Preview Tooltip */}
        <TimelineRail />

        {/* Target observation windows */}
        <Windows />

        {/* Upcoming events list */}
        <Upcoming />
      </div>

      {/* Branded Attribution Footer */}
      <div className="pt-4 pb-1 mt-auto border-t border-white/10 text-center select-none">
        <span className="text-[7.5px] font-mono tracking-[0.3em] text-slate-500 uppercase">
          ZENITH TIME INTELLIGENCE // SECURE COMMS
        </span>
      </div>
    </div>
  );
};
