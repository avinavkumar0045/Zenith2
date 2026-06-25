import React, { useRef, useEffect } from 'react';
import { Search, MapPin, Moon, Sun, X, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { contentFadeVariants } from './CommandIslandAnimations';
import { CommandIslandState } from './CommandIsland.types';
import { LocationIntelligenceObject } from '@/modules/location/types/location.types';
import { useWeatherStore } from '@/modules/weather/store/useWeatherStore';

interface ContentProps {
  state: CommandIslandState;
  notification: { text: string; priority: number } | null;
  activeLocation: LocationIntelligenceObject | null;
  onSearchClick: () => void;
  onCancelSearch: () => void;
  onDismissNotification: () => void;
}

export const CommandIslandContent: React.FC<ContentProps> = React.memo(({
  state,
  notification,
  activeLocation,
  onSearchClick,
  onCancelSearch,
  onDismissNotification
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const weather = useWeatherStore((s) => s.weather);
  const weatherLoading = useWeatherStore((s) => s.loading);

  // Auto-focus input when in search state
  useEffect(() => {
    if (state === 'search' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [state]);

  if (state === 'search' || state === 'searching') {
    return (
      <motion.div
        key="search-mode"
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={contentFadeVariants}
        className="w-full flex items-center justify-between gap-3 font-sans h-full"
      >
        <div className="flex-1 flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-slate-950/80 border border-slate-700/60 focus-within:border-cyan-500/60 transition-colors">
          <Search className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search locations, planets, satellites..."
            className="flex-1 bg-transparent border-none outline-none text-xs md:text-sm text-white placeholder-slate-400 font-medium"
          />
          {state === 'searching' && (
            <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin flex-shrink-0" />
          )}
        </div>
        <button
          onClick={onCancelSearch}
          aria-label="Collapse search"
          className="flex-shrink-0 p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </motion.div>
    );
  }

  if (state === 'notification' && notification) {
    return (
      <motion.div
        key="notification-mode"
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={contentFadeVariants}
        className="w-full flex items-center justify-between gap-4 py-0.5 font-sans h-full"
      >
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0 animate-pulse" />
          <span className="text-[11px] md:text-xs font-semibold tracking-wide text-amber-200 truncate">{notification.text}</span>
        </div>
        <button
          onClick={onDismissNotification}
          aria-label="Dismiss alert"
          className="flex-shrink-0 p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </motion.div>
    );
  }

  if (state === 'loading') {
    return (
      <motion.div
        key="loading-mode"
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={contentFadeVariants}
        className="w-full flex items-center justify-center gap-2 py-0.5 font-sans h-full"
      >
        <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
        <span className="text-[9px] md:text-[10px] tracking-wider text-cyan-100 font-bold font-mono">LOADING TELEMETRY...</span>
      </motion.div>
    );
  }

  if (state === 'error') {
    return (
      <motion.div
        key="error-mode"
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={contentFadeVariants}
        className="w-full flex items-center justify-between gap-4 py-0.5 font-sans h-full"
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 animate-pulse" />
          <span className="text-[11px] md:text-xs font-semibold text-rose-200 truncate">System Telemetry Error</span>
        </div>
        <button
          onClick={onCancelSearch}
          aria-label="Acknowledge error"
          className="flex-shrink-0 p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </motion.div>
    );
  }

  // Location Ready State (Simplified to a concise 2-3 line summary)
  if (state === 'location-ready' && activeLocation) {
    return (
      <motion.div
        key="location-ready-mode"
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={contentFadeVariants}
        className="w-full flex items-center justify-between font-sans gap-3 h-full"
      >
        {/* Left Side: Summary info stacking in exactly 3 lines */}
        <div className="flex-1 flex flex-col items-start min-w-0 select-none text-left gap-0.5 pl-1">
          {/* Line 1: Brand / Context */}
          <span className="text-[8px] text-cyan-400 font-bold tracking-[0.25em] font-mono uppercase leading-none">
            ZENITH
          </span>
          {/* Line 2: Geolocation Title */}
          <div className="flex items-center gap-1.5 text-white truncate w-full font-semibold text-xs md:text-sm leading-tight mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
            <span className="truncate">{activeLocation.name}</span>
            {activeLocation.dayState.toLowerCase().includes('night') ? (
              <Moon className="w-3 h-3 text-indigo-400 flex-shrink-0 animate-pulse" />
            ) : (
              <Sun className="w-3 h-3 text-yellow-400 flex-shrink-0" />
            )}
          </div>
          {/* Line 3: Ready Status */}
          <span className="text-[9px] md:text-[10px] text-slate-300 font-medium leading-none tracking-wide mt-0.5">
            Sky Intelligence Ready
          </span>
        </div>

        {/* Right Side: Command Search Field & Subtle Status (No separators!) */}
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0 pr-1 select-none">
          {/* Spotlight style Command Search Trigger */}
          <button
            onClick={onSearchClick}
            className="flex items-center gap-1.5 text-slate-400 hover:text-cyan-300 transition-colors duration-150 focus:outline-none group"
          >
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
            <span className="text-[9px] md:text-[10px] font-medium tracking-wide">Search...</span>
          </button>

          {/* Minimal Ready status */}
          <div className="flex items-center gap-1.5 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></span>
            <span className="text-[8px] text-emerald-400 font-bold tracking-widest">ONLINE</span>
          </div>
        </div>
      </motion.div>
    );
  }

  // Idle Default State (Compact single row, no dividers)
  return (
    <motion.div
      key="idle-mode"
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={contentFadeVariants}
      className="w-full flex items-center justify-between font-mono tracking-widest uppercase gap-4 h-full px-1"
    >
      {/* 1. Identity */}
      <div className="flex items-center gap-1.5 pl-1 flex-shrink-0 select-none">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
        </span>
        <span className="font-sans font-semibold text-white tracking-[0.25em] text-[11px] md:text-[12px] cursor-default">ZENITH</span>
      </div>

      {/* 2. Spotlight style Command Search Trigger */}
      <button
        onClick={onSearchClick}
        className="flex-1 flex items-center gap-2 py-1.5 text-slate-400 hover:text-cyan-300 transition-colors duration-150 focus:outline-none group max-w-[160px] justify-center"
      >
        <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
        <span className="text-[9px] md:text-[10px] font-sans font-normal tracking-wide text-left select-none text-slate-400/80 truncate">Search...</span>
      </button>

      {/* 3. System Readiness (ONLINE) */}
      <div className="flex items-center gap-1.5 pr-1 flex-shrink-0 select-none">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></span>
        <span className="text-[8px] text-emerald-400 font-bold tracking-widest font-mono">ONLINE</span>
      </div>
    </motion.div>
  );
});

CommandIslandContent.displayName = 'CommandIslandContent';
