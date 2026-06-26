import React, { useRef, useEffect } from 'react';
import { 
  Search, MapPin, Moon, Sun, X, Loader2, AlertCircle, 
  Radar, Globe, Sparkles 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { contentFadeVariants, childItemVariants } from './CommandIslandAnimations';
import { CommandIslandState, CommandSearchResultItem, LiveActivityMode } from './CommandIsland.types';
import { SkyIntelligenceEngine } from '@/components/workspaces/mission-brief/engine/SkyIntelligenceEngine';
import clsx from 'clsx';

interface ContentProps {
  state: CommandIslandState;
  notification: { text: string; priority: number } | null;
  activeLocation: any;
  onSearchClick: () => void;
  onCancelSearch: () => void;
  onDismissNotification: () => void;
  
  // Search bindings
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchResults: CommandSearchResultItem[];
  selectResult: (item: CommandSearchResultItem) => void;

  // Live Activity bindings
  liveActivityMode: LiveActivityMode;
  setLiveActivityMode: (mode: LiveActivityMode) => void;
  cycleLiveActivityMode: () => void;
  nextEvent: any;
  eventCountdown: string;
}

export const CommandIslandContent: React.FC<ContentProps> = React.memo(({
  state,
  notification,
  activeLocation,
  onSearchClick,
  onCancelSearch,
  onDismissNotification,
  
  searchQuery,
  setSearchQuery,
  searchResults,
  selectResult,

  liveActivityMode,
  setLiveActivityMode,
  cycleLiveActivityMode,
  nextEvent,
  eventCountdown
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Compile full sky model from telemetry engines
  const model = SkyIntelligenceEngine.compileModel();

  // Auto-focus search input when search triggers
  useEffect(() => {
    if (state === 'search' && inputRef.current) {
      inputRef.current.focus();
    }
  }, [state]);

  // Render: Search & Geolocation Target Search
  if (state === 'search' || state === 'searching') {
    const hasResults = searchResults.length > 0 && searchQuery.trim().length >= 2;
    return (
      <motion.div
        key="search-mode"
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={contentFadeVariants}
        className="w-full flex flex-col font-sans h-full text-left"
      >
        {/* Input top row (Unified Spotlight layout, no nested double card) */}
        <div className="w-full flex items-center justify-between gap-3 h-11 flex-shrink-0 pl-3.5 pr-2">
          <Search className="w-4 h-4 text-cyan-400/80 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search locations, planets, satellites..."
            className="flex-1 bg-transparent border-none outline-none text-xs md:text-sm text-white/95 placeholder-slate-400/80 font-light caret-cyan-400"
          />
          {state === 'searching' && (
            <Loader2 className="w-3.5 h-3.5 text-cyan-400/90 animate-spin flex-shrink-0" />
          )}
          <button
            onClick={onCancelSearch}
            aria-label="Collapse search"
            className="flex-shrink-0 p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live matching results */}
        {hasResults && (
          <div className="mt-3 border-t border-white/10 pt-3 flex flex-col min-w-0">
            <span className="text-[9px] text-cyan-400/80 font-bold tracking-[0.2em] uppercase px-1 mb-2 font-mono">
              SEARCH RESULTS
            </span>
            <div className="flex flex-col gap-1 max-h-[180px] overflow-y-auto pr-1">
              {searchResults.map((item) => {
                let IconComponent = MapPin;
                let colorClass = "text-cyan-400";
                let bgClass = "hover:bg-cyan-500/10 hover:border-cyan-500/20";
                
                if (item.type === 'planet') {
                  IconComponent = Globe;
                  colorClass = "text-indigo-400";
                  bgClass = "hover:bg-indigo-500/10 hover:border-indigo-500/20";
                } else if (item.type === 'satellite') {
                  IconComponent = Radar;
                  colorClass = "text-amber-400";
                  bgClass = "hover:bg-amber-500/10 hover:border-amber-500/20";
                } else if (item.type === 'constellation') {
                  IconComponent = Sparkles;
                  colorClass = "text-emerald-400";
                  bgClass = "hover:bg-emerald-500/10 hover:border-emerald-500/20";
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => selectResult(item)}
                    className={clsx(
                      "w-full flex items-center justify-between px-3 py-2 rounded-xl border border-transparent text-left transition-all group cursor-pointer",
                      bgClass
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <IconComponent className={`w-4 h-4 ${colorClass} flex-shrink-0 group-hover:scale-110 transition-transform`} />
                      <div className="truncate">
                        <span className="text-xs font-semibold text-white/90 group-hover:text-cyan-300 transition-colors block truncate">
                          {item.name}
                        </span>
                        {item.detail && (
                          <span className="text-[10px] text-slate-400/80 block truncate font-medium mt-0.5">
                            {item.detail}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-[8px] text-slate-400 font-mono uppercase bg-slate-900/80 px-2 py-0.5 rounded border border-white/5 flex-shrink-0 group-hover:border-cyan-500/30 transition-colors">
                      {item.type}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </motion.div>
    );
  }

  // Render: Notification State
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
          className="flex-shrink-0 p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </motion.div>
    );
  }

  // Render: Loading State
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

  // Render: Error State
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
          className="flex-shrink-0 p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </motion.div>
    );
  }

  // Render: Geolocation Loaded & Multi-mode Live Activities
  if (state === 'location-ready' && activeLocation) {
    // Color styling variables based on qualitative rating
    let ratingColor = "text-cyan-400";
    if (model?.qualitativeRating === 'Excellent') ratingColor = "text-emerald-400";
    else if (model?.qualitativeRating === 'Good') ratingColor = "text-cyan-400";
    else if (model?.qualitativeRating === 'Fair') ratingColor = "text-amber-400";
    else if (model?.qualitativeRating === 'Poor') ratingColor = "text-rose-400";

    return (
      <motion.div
        key="location-ready-mode"
        initial="hidden"
        animate="visible"
        exit="hidden"
        variants={contentFadeVariants}
        className="w-full flex flex-col font-sans h-full text-left justify-between"
      >
        {/* Main Status row */}
        <div className="w-full flex items-center justify-between gap-4 flex-1 min-w-0">
          
          {/* Left Interactive Widget Area (Cycles widgets on click) */}
          <div 
            onClick={cycleLiveActivityMode}
            className="flex-1 flex items-center gap-3 cursor-pointer group/widget min-w-0 py-0.5 select-none"
          >
            {/* Morphing Widget Rounded Beacon */}
            <div className="relative flex-shrink-0 flex items-center justify-center">
              
              {/* Telemetry View: Translucent SVG celestial twilight orbit ring */}
              {liveActivityMode === 'telemetry' && (
                <div className="relative w-8 h-8 flex-shrink-0 flex items-center justify-center bg-slate-900/60 border border-white/5 rounded-full overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)] group-hover/widget:border-cyan-500/35 transition-colors">
                  <svg className="w-full h-full p-1" viewBox="0 0 32 32">
                    {/* Orbit Ring */}
                    <circle cx="16" cy="16" r="10" fill="none" stroke="rgba(255,255,255,0.08)" strokeDasharray="2,2" strokeWidth="1.2" />
                    {/* Pulsing Sun/Moon based on dayState */}
                    <motion.circle 
                      cx={activeLocation.dayState.toLowerCase().includes('night') ? 23 : 9} 
                      cy="16" 
                      r="2.8" 
                      fill={activeLocation.dayState.toLowerCase().includes('night') ? "#818cf8" : "#fbbf24"} 
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.8, 1, 0.8]
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 3.5,
                        ease: "easeInOut"
                      }}
                    />
                    {/* Mini earth core */}
                    <circle cx="16" cy="16" r="4.2" fill="rgba(6,182,212,0.15)" stroke="rgba(6,182,212,0.3)" strokeWidth="0.8" />
                  </svg>
                </div>
              )}
              
              {/* Sky Score View: Live atmospheric telemetry waveform */}
              {liveActivityMode === 'sky-score' && (
                <div className="relative w-8 h-8 flex-shrink-0 flex items-center justify-center bg-slate-900/60 border border-white/5 rounded-full overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)] group-hover/widget:border-cyan-500/35 transition-colors">
                  <svg className="w-full h-3 absolute overflow-visible" viewBox="0 0 32 12" fill="none">
                    <motion.path 
                      d="M0 6 Q8 1, 16 6 T32 6" 
                      stroke="#06b6d4" 
                      strokeWidth="1.2" 
                      strokeLinecap="round"
                      animate={{
                        d: [
                          "M0 6 Q8 1, 16 6 T32 6",
                          "M0 6 Q8 11, 16 6 T32 6",
                          "M0 6 Q8 1, 16 6 T32 6"
                        ]
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 2.2,
                        ease: "easeInOut"
                      }}
                    />
                    <motion.path 
                      d="M0 6 Q8 9, 16 6 T32 6" 
                      stroke="#10b981" 
                      strokeWidth="0.8" 
                      opacity="0.5"
                      animate={{
                        d: [
                          "M0 6 Q8 9, 16 6 T32 6",
                          "M0 6 Q8 3, 16 6 T32 6",
                          "M0 6 Q8 9, 16 6 T32 6"
                        ]
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 3,
                        ease: "easeInOut"
                      }}
                    />
                  </svg>
                  {/* Glowing core score */}
                  <span className="relative z-10 text-[9px] font-mono font-black text-white/90">
                    {model?.score || 70}
                  </span>
                </div>
              )}

              {/* Event Tracker View: Sweeping conic sonar radar grid */}
              {liveActivityMode === 'event-tracker' && (
                <div className="relative w-8 h-8 flex-shrink-0 bg-slate-900/60 border border-white/5 rounded-full overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.4)] group-hover/widget:border-cyan-500/35 transition-colors flex items-center justify-center">
                  <svg className="w-full h-full" viewBox="0 0 32 32">
                    <circle cx="16" cy="16" r="13" fill="none" stroke="rgba(6,182,212,0.1)" strokeWidth="0.5" />
                    <circle cx="16" cy="16" r="7" fill="none" stroke="rgba(6,182,212,0.1)" strokeWidth="0.5" />
                    <line x1="16" y1="3" x2="16" y2="29" stroke="rgba(6,182,212,0.08)" strokeWidth="0.5" />
                    <line x1="3" y1="16" x2="29" y2="16" stroke="rgba(6,182,212,0.08)" strokeWidth="0.5" />
                  </svg>
                  {/* Sweep gradient */}
                  <motion.div 
                    className="absolute inset-0 rounded-full"
                    style={{
                      background: 'conic-gradient(from 0deg, rgba(6,182,212,0.35) 0deg, transparent 90deg, transparent 360deg)'
                    }}
                    animate={{ rotate: 360 }}
                    transition={{
                      repeat: Infinity,
                      duration: 3.5,
                      ease: "linear"
                    }}
                  />
                  {/* Blip */}
                  <motion.span 
                    className="absolute w-1 h-1 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.8)]"
                    style={{ top: '22%', left: '60%' }}
                    animate={{ opacity: [0.1, 1, 0.1] }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.8,
                      ease: "easeInOut"
                    }}
                  />
                </div>
              )}
            </div>

            {/* Sub-mode content text layout (stagger-animated children) */}
            <motion.div 
              variants={childItemVariants}
              className="flex-1 flex flex-col items-start min-w-0 text-left pl-0.5 justify-center"
            >
              {/* Telemetry view */}
              {liveActivityMode === 'telemetry' && (
                <>
                  <span className="text-[9px] text-slate-400 font-bold tracking-[0.2em] font-mono uppercase leading-none">
                    ZENITH
                  </span>
                  <div className="flex items-center gap-1.5 text-white/90 truncate w-full font-semibold text-xs md:text-sm leading-tight mt-0.5">
                    <span className="truncate">{activeLocation.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-400/90 font-medium font-sans leading-none tracking-wide mt-1 truncate w-full">
                    Time: {activeLocation.localTime || '22:00'} • {activeLocation.dayState}
                  </span>
                </>
              )}

              {/* Sky score view */}
              {liveActivityMode === 'sky-score' && (
                <>
                  <span className="text-[9px] text-slate-400 font-bold tracking-[0.2em] font-mono uppercase leading-none">
                    SKY QUALITY
                  </span>
                  <span className={clsx("font-semibold text-xs md:text-sm mt-0.5", ratingColor)}>
                    {model?.qualitativeRating || 'Good'}
                  </span>
                  <span className="text-[10px] text-slate-400/90 font-medium font-sans leading-none tracking-wide mt-1 truncate w-full">
                    {model?.whyItems[0] || 'Clear viewing conditions'}
                  </span>
                </>
              )}

              {/* Live Event Tracker view */}
              {liveActivityMode === 'event-tracker' && (
                <>
                  <span className="text-[9px] text-slate-400 font-bold tracking-[0.2em] font-mono uppercase leading-none">
                    LIVE TRACKER
                  </span>
                  {nextEvent ? (
                    <>
                      <span className="font-semibold text-xs md:text-sm text-white/95 mt-0.5 truncate w-full">
                        {nextEvent.name}
                      </span>
                      <span className="text-[10px] text-cyan-300 font-mono tracking-wide mt-1 font-semibold">
                        in {eventCountdown}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="font-semibold text-xs md:text-sm text-slate-400 mt-0.5">
                        No Slated Events
                      </span>
                      <span className="text-[10px] text-slate-500 mt-1 font-medium">
                        System unaligned
                      </span>
                    </>
                  )}
                </>
              )}
            </motion.div>
          </div>

          {/* Right Action zone (Spotlight Command Search Trigger & ONLINE indicator) */}
          <div className="flex flex-col items-end gap-1 flex-shrink-0 pr-0.5 select-none text-right justify-center">
            <button
              onClick={onSearchClick}
              suppressHydrationWarning
              className="flex items-center gap-1.5 text-slate-400 hover:text-cyan-300 transition-colors duration-150 focus:outline-none group cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
              <span className="text-[10px] font-light tracking-wide">Search...</span>
            </button>

            {/* ONLINE indicator */}
            <div className="flex items-center gap-1.5 font-mono mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></span>
              <span className="text-[8px] text-emerald-400 font-bold tracking-widest">ONLINE</span>
            </div>
          </div>
        </div>

        {/* Tactile indicator dots for mode cycling */}
        <div className="w-full flex justify-center gap-1.5 pt-1.5 pb-0 flex-shrink-0 border-t border-white/5 mt-1.5">
          {(['telemetry', 'sky-score', 'event-tracker'] as LiveActivityMode[]).map((m) => {
            const isActive = liveActivityMode === m;
            return (
              <button
                key={m}
                onClick={(e) => {
                  e.stopPropagation(); // Avoid triggering left zone clicks
                  setLiveActivityMode(m);
                }}
                className={clsx(
                  "rounded-full transition-all duration-300 cursor-pointer h-1",
                  isActive 
                    ? "bg-cyan-400 w-3.5 shadow-[0_0_8px_rgba(34,211,238,0.8)]" 
                    : "bg-white/20 w-1 hover:bg-white/45"
                )}
                aria-label={`Switch to ${m} view`}
              />
            );
          })}
        </div>
      </motion.div>
    );
  }

  // Render: Idle/Blank State (No location selected yet)
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
        suppressHydrationWarning
        className="flex-1 flex items-center gap-2 py-1.5 text-slate-400 hover:text-cyan-300 transition-colors duration-150 focus:outline-none group max-w-[160px] justify-center cursor-pointer"
      >
        <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
        <span className="text-[9px] md:text-[10px] font-sans font-light tracking-wide text-left select-none text-slate-400/80 truncate">Search celestial objects...</span>
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
