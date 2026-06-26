import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useTimeStore, ObservationWindow } from '../types';
import { TimelineEngine } from '../engine/TimelineEngine';
import { VisibilityEngine } from '../engine/VisibilityEngine';
import { WindowEngine } from '../engine/WindowEngine';
import { EventResolver } from '../engine/EventResolver';
import { useLocationStore } from '@/modules/location/store/useLocationStore';
import { useMoonStore } from '@/modules/moon/store/useMoonStore';
import { getRelativeTimeLabel } from '../utils';
import * as SunCalc from 'suncalc';
import clsx from 'clsx';
import { Sparkles, Moon, Sun, ArrowUp, Star } from 'lucide-react';

export const TimelineRail: React.FC = () => {
  const { currentTime, selectedTime, setSelectedTime } = useTimeStore();
  const activeLocation = useLocationStore((state) => state.activeLocation);
  const moonData = useMoonStore((state) => state.moonData);

  const railRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverPercent, setHoverPercent] = useState<number | null>(null);
  const [hoverX, setHoverX] = useState<number | null>(null);

  // Compute observation windows for key targets tonight
  const observationWindows = useMemo(() => {
    if (!activeLocation) return [];
    const lat = activeLocation.latitude;
    const lon = activeLocation.longitude;

    const targets = [
      { id: 'planet_jupiter', name: 'Jupiter', type: 'planets' as const },
      { id: 'planet_saturn', name: 'Saturn', type: 'planets' as const },
      { id: 'planet_mars', name: 'Mars', type: 'planets' as const },
      { id: 'moon', name: 'Moon', type: 'moon' as const }
    ];

    const windows: ObservationWindow[] = [];
    targets.forEach((t) => {
      const win = WindowEngine.calculateObservationWindow(
        t.id,
        t.name,
        t.type,
        lat,
        lon,
        currentTime
      );
      if (win) {
        windows.push(win);
      }
    });

    return windows;
  }, [activeLocation, currentTime]);

  // Resolve all upcoming events within the 24-hour scope
  const upcomingEvents = useMemo(() => {
    return EventResolver.resolveUpcomingEvents(currentTime, observationWindows);
  }, [currentTime, observationWindows]);

  // Compile anchors and markers
  const anchors = TimelineEngine.compileTimeAnchors(currentTime);
  const markers = TimelineEngine.compileTimelineMarkers(currentTime, upcomingEvents);

  // Selected time offset percentage (0 to 100)
  const duration24h = 24 * 60 * 60 * 1000;
  const currentOffset = Math.max(0, Math.min(100, ((selectedTime.getTime() - currentTime.getTime()) / duration24h) * 100));

  const handleScrub = (clientX: number) => {
    if (!railRef.current) return;
    const rect = railRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    const newTime = new Date(currentTime.getTime() + (percent / 100) * duration24h);
    setSelectedTime(newTime);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    handleScrub(e.clientX);
  };

  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMoveGlobal = (e: MouseEvent) => {
      handleScrub(e.clientX);
    };
    const handleMouseUpGlobal = () => {
      setIsDragging(false);
    };
    window.addEventListener('mousemove', handleMouseMoveGlobal);
    window.addEventListener('mouseup', handleMouseUpGlobal);
    return () => {
      window.removeEventListener('mousemove', handleMouseMoveGlobal);
      window.removeEventListener('mouseup', handleMouseUpGlobal);
    };
  }, [isDragging, currentTime]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!railRef.current) return;
    const rect = railRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setHoverPercent(percent);
    setHoverX(x);
  };

  const handleMouseLeave = () => {
    setHoverPercent(null);
    setHoverX(null);
  };

  // Generate hour ticks (every 3 hours)
  const ticks = [];
  for (let i = 0; i <= 24; i += 3) {
    const tickTime = new Date(currentTime.getTime() + (i / 24) * duration24h);
    const label = tickTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    ticks.push({ percent: (i / 24) * 100, label });
  }

  // Calculate hover metadata
  let hoverTime: Date | null = null;
  let hoverSunAlt = 0;
  let hoverSkyState = 'Day';
  let hoverVisibleObjects: string[] = [];

  if (hoverPercent !== null && activeLocation) {
    const lat = activeLocation.latitude;
    const lon = activeLocation.longitude;
    hoverTime = new Date(currentTime.getTime() + (hoverPercent / 100) * duration24h);

    // Sun altitude for twilight state
    const sunPos = SunCalc.getPosition(hoverTime, lat, lon);
    hoverSunAlt = sunPos.altitude * (180 / Math.PI);
    
    if (hoverSunAlt < -18) hoverSkyState = 'Deep Night';
    else if (hoverSunAlt < -12) hoverSkyState = 'Astronomical Twilight';
    else if (hoverSunAlt < -6) hoverSkyState = 'Nautical Twilight';
    else if (hoverSunAlt < -0.83) hoverSkyState = 'Civil Twilight';
    else hoverSkyState = 'Daylight';

    // Check visible objects
    const planetIds = ['mercury', 'venus', 'mars', 'jupiter', 'saturn'] as const;
    planetIds.forEach((pId) => {
      const v = VisibilityEngine.getPlanetVisibility(pId, lat, lon, hoverTime!);
      if (v.isVisible && v.altitude > 10) {
        hoverVisibleObjects.push(pId.charAt(0).toUpperCase() + pId.slice(1));
      }
    });

    const moonV = VisibilityEngine.getMoonVisibility(lat, lon, hoverTime);
    if (moonV.isVisible && moonV.altitude > 10) {
      hoverVisibleObjects.push(`Moon (${Math.round(moonV.illumination * 100)}%)`);
    }
  }

  return (
    <div className="flex flex-col gap-8 select-none py-2 relative">
      {/* Rail Container */}
      <div 
        ref={railRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="h-10 bg-slate-900/60 hover:bg-slate-900/80 rounded-lg border border-slate-800 relative cursor-ew-resize flex items-center transition-all duration-300 shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]"
      >
        {/* Progress Fill */}
        <div 
          className="absolute left-0 top-0 bottom-0 bg-cyan-500/[0.04] border-r border-cyan-500/10 rounded-l-lg pointer-events-none transition-all duration-100"
          style={{ width: `${currentOffset}%` }}
        />

        {/* Major ticks */}
        {ticks.map((t, index) => (
          <div 
            key={index}
            className="absolute top-0 bottom-0 border-l border-slate-800/40 pointer-events-none flex flex-col justify-between py-1"
            style={{ left: `${t.percent}%` }}
          >
            <span className="text-[7.5px] font-mono text-slate-600 pl-1 mt-0.5">{t.label}</span>
            <div className="h-1 w-[1px] bg-slate-700/50" />
          </div>
        ))}

        {/* Anchors (Dotted lines / names) */}
        {anchors.map((a) => {
          const isNow = a.label === 'NOW';
          return (
            <div
              key={a.id}
              className={clsx(
                "absolute top-0 bottom-0 pointer-events-none flex flex-col justify-end items-center",
                isNow ? "z-20" : "z-10"
              )}
              style={{ left: `${a.offset}%` }}
            >
              <div 
                className={clsx(
                  "w-[1px] h-6 border-l border-dashed",
                  isNow ? "border-emerald-500/70" : "border-slate-700/50"
                )}
              />
              <span 
                className={clsx(
                  "text-[6.5px] font-bold tracking-widest uppercase mb-1.5 px-1 rounded-sm",
                  isNow ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20" : "text-slate-500"
                )}
                style={{ transform: 'translateX(-50%)' }}
              >
                {a.label === 'PEAK DARKNESS' ? 'NADIR' : a.label}
              </span>
            </div>
          );
        })}

        {/* Event Blip Markers */}
        {markers.map((m) => {
          const colorClass = {
            iss: 'bg-yellow-400 shadow-[0_0_6px_rgba(250,204,21,0.6)]',
            moonrise: 'bg-blue-400 shadow-[0_0_6px_rgba(96,165,250,0.6)]',
            moonset: 'bg-indigo-400 shadow-[0_0_6px_rgba(129,140,248,0.6)]',
            transit: 'bg-purple-400 shadow-[0_0_6px_rgba(192,132,252,0.6)]',
            satellite: 'bg-cyan-400 shadow-[0_0_6px_rgba(34,211,238,0.6)]',
            weather: 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.6)]',
            twilight: 'bg-orange-400 shadow-[0_0_6px_rgba(251,146,60,0.6)]'
          }[m.type] || 'bg-slate-400';

          return (
            <div
              key={m.id}
              className="absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full pointer-events-none transition-transform duration-200 hover:scale-150"
              style={{ 
                left: `${m.relativeOffset}%`,
                transform: 'translate(-50%, -50%)'
              }}
              title={`${m.label} (${m.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`}
            >
              <div className={clsx("w-full h-full rounded-full", colorClass)} />
            </div>
          );
        })}

        {/* Selected Scrubber Handle */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-cyan-500 border-2 border-white pointer-events-none flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.8)] z-30 transition-all duration-75 cursor-grab active:cursor-grabbing"
          style={{ 
            left: `${currentOffset}%`,
            transform: 'translate(-50%, -50%)'
          }}
        >
          <div className="w-1 h-1 bg-cyan-950 rounded-full" />
        </div>

        {/* Hover Line */}
        {hoverPercent !== null && (
          <div 
            className="absolute top-0 bottom-0 w-[1px] bg-cyan-400/40 pointer-events-none z-20"
            style={{ left: `${hoverPercent}%` }}
          />
        )}
      </div>

      {/* Hover Time Travel Preview Tooltip */}
      {hoverPercent !== null && hoverTime && hoverX !== null && (
        <div 
          className="absolute -top-32 bg-slate-950/95 border border-cyan-500/30 rounded-lg p-3 w-48 shadow-[0_4px_20px_rgba(0,0,0,0.6),0_0_15px_rgba(6,182,212,0.15)] backdrop-blur-md z-50 pointer-events-none flex flex-col gap-2 transition-all duration-150"
          style={{ 
            left: `${hoverPercent}%`,
            transform: `translateX(-50%)`
          }}
        >
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-1.5">
            <span className="text-[11px] font-bold text-white font-mono">
              {hoverTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
            </span>
            <span className="text-[8px] font-medium text-cyan-400 bg-cyan-500/10 px-1 rounded-sm">
              {getRelativeTimeLabel(hoverTime.getTime(), currentTime.getTime())}
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5 text-[9px] text-slate-300 font-medium">
              {hoverSunAlt < -6 ? (
                <Moon className="w-3 h-3 text-cyan-400" />
              ) : (
                <Sun className="w-3 h-3 text-amber-400" />
              )}
              <span>{hoverSkyState}</span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Visible Targets</span>
              {hoverVisibleObjects.length > 0 ? (
                <div className="flex flex-wrap gap-1 mt-0.5">
                  {hoverVisibleObjects.map((obj, i) => (
                    <span 
                      key={i}
                      className="text-[8px] bg-slate-800 border border-slate-700/60 rounded px-1 py-0.5 font-medium text-slate-300 flex items-center gap-0.5"
                    >
                      <Star className="w-2 h-2 text-cyan-400 fill-cyan-400" />
                      {obj}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-[9px] text-slate-500 italic mt-0.5">No primary objects visible</span>
              )}
            </div>
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1.5 w-3 h-3 bg-slate-950 border-r border-b border-cyan-500/30 rotate-45" />
        </div>
      )}
    </div>
  );
};
