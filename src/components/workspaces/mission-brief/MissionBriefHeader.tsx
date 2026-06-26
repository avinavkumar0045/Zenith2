import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { MissionBriefHeaderProps } from './MissionBrief.types';

export const MissionBriefHeader: React.FC<MissionBriefHeaderProps & { lastUpdated: number | null }> = ({
  onClose,
  lastUpdated
}) => {
  const [freshnessText, setFreshnessText] = useState('Syncing...');

  useEffect(() => {
    if (!lastUpdated) return;

    const updateFreshness = () => {
      const diffSec = Math.round((Date.now() - lastUpdated) / 1000);
      if (diffSec < 10) {
        setFreshnessText('Updated just now');
      } else if (diffSec < 60) {
        setFreshnessText(`Updated ${diffSec}s ago`);
      } else {
        const diffMin = Math.floor(diffSec / 60);
        setFreshnessText(`Updated ${diffMin}m ago`);
      }
    };

    updateFreshness();
    const interval = setInterval(updateFreshness, 5000);
    return () => clearInterval(interval);
  }, [lastUpdated]);

  return (
    <div className="flex items-center justify-between pb-4 border-b border-white/10 select-none">
      <div className="flex flex-col items-start gap-0.5">
        <span className="text-[10px] text-cyan-400 font-bold tracking-[0.25em] font-mono leading-none">
          SKY INTELLIGENCE
        </span>
        <h2 className="text-sm font-semibold text-white tracking-wide uppercase font-sans mt-0.5">
          Today's Sky
        </h2>
        <span className="text-[8px] text-slate-500 font-mono tracking-wider font-light mt-0.5 uppercase">
          {freshnessText}
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
  );
};
