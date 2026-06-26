import React, { useMemo } from 'react';
import { useTimeStore, ObservationWindow } from '../types';
import { WindowEngine } from '../engine/WindowEngine';
import { useLocationStore } from '@/modules/location/store/useLocationStore';
import { formatTime } from '../utils';
import { Sparkles, Calendar, Star, Compass, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';

export const Windows: React.FC = () => {
  const { currentTime, selectedTime, setSelectedTime } = useTimeStore();
  const activeLocation = useLocationStore((state) => state.activeLocation);

  const targets = useMemo(() => [
    { id: 'planet_jupiter', name: 'Jupiter', type: 'planets' as const },
    { id: 'planet_saturn', name: 'Saturn', type: 'planets' as const },
    { id: 'planet_mars', name: 'Mars', type: 'planets' as const },
    { id: 'moon', name: 'Moon', type: 'moon' as const }
  ], []);

  const windows = useMemo(() => {
    if (!activeLocation) return [];
    const lat = activeLocation.latitude;
    const lon = activeLocation.longitude;

    const list: ObservationWindow[] = [];
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
        list.push(win);
      }
    });
    return list;
  }, [activeLocation, currentTime, targets]);

  const handleWindowClick = (startTime: Date) => {
    setSelectedTime(startTime);
  };

  const getQualityBadge = (quality: ObservationWindow['quality']) => {
    const classes = {
      Excellent: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_8px_rgba(16,185,129,0.15)]',
      Good: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 shadow-[0_0_8px_rgba(6,182,212,0.15)]',
      Fair: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      Poor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    }[quality];

    return (
      <span className={clsx("text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border select-none", classes)}>
        {quality}
      </span>
    );
  };

  if (!activeLocation) {
    return null; // The Upcoming component handles the empty location message
  }

  return (
    <div className="flex flex-col gap-3 border-b border-slate-800/60 pb-5">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Observation Windows</span>
        <span className="text-[9px] font-mono text-slate-500">dark & clear sky hours</span>
      </div>

      {windows.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-4 border border-dashed border-slate-800 rounded-lg bg-slate-950/20 text-center">
          <AlertTriangle className="w-4 h-4 text-amber-500/80 mb-1 stroke-[1.5]" />
          <span className="text-[10px] text-slate-400">No stargazing windows resolved.</span>
          <span className="text-[8.5px] text-slate-500 mt-0.5">High cloud cover or day-only transits today.</span>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {windows.map((win) => {
            const baseMs = currentTime.getTime();
            const dayMs = 24 * 3600 * 1000;
            const startPercent = ((win.startTime.getTime() - baseMs) / dayMs) * 100;
            const endPercent = ((win.endTime.getTime() - baseMs) / dayMs) * 100;

            const left = Math.max(0, Math.min(100, startPercent));
            const width = Math.max(0, Math.min(100 - left, endPercent - startPercent));

            const isSelected = selectedTime.getTime() >= win.startTime.getTime() && selectedTime.getTime() <= win.endTime.getTime();

            return (
              <button
                key={win.id}
                onClick={() => handleWindowClick(win.startTime)}
                className={clsx(
                  "flex flex-col gap-2 p-3 rounded-lg border text-left transition-all duration-300 group cursor-pointer w-full select-none outline-none",
                  isSelected
                    ? "bg-cyan-500/[0.03] border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.05)]"
                    : "bg-slate-900/30 border-slate-850 hover:border-slate-750 hover:bg-slate-900/50"
                )}
              >
                {/* Header */}
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-200 group-hover:text-white transition-colors duration-200">
                      {win.targetName}
                    </span>
                  </div>
                  {getQualityBadge(win.quality)}
                </div>

                {/* Premium interval string representation */}
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-1 font-mono text-[10px]">
                    <span className="text-slate-600">━━━</span>
                    <span className="text-slate-300 font-bold group-hover:text-cyan-400 transition-colors duration-200">
                      {formatTime(win.startTime)}
                    </span>
                    <span className="text-slate-600 px-0.5">───</span>
                    <span className="text-slate-300 font-bold group-hover:text-cyan-400 transition-colors duration-200">
                      {formatTime(win.endTime)}
                    </span>
                    <span className="text-slate-600">━━━</span>
                  </div>
                  <span className="text-[9px] text-slate-500 group-hover:text-slate-400 transition-colors duration-200">
                    {Math.round((win.endTime.getTime() - win.startTime.getTime()) / 3600000 * 10) / 10} hours
                  </span>
                </div>

                {/* Visual timeline bar */}
                <div className="relative w-full h-1 bg-slate-950/80 border border-slate-900 rounded-full overflow-hidden mt-1">
                  <div
                    className={clsx(
                      "absolute h-full rounded-full transition-all duration-300",
                      win.quality === 'Excellent' || win.quality === 'Good' 
                        ? "bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]" 
                        : "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"
                    )}
                    style={{
                      left: `${left}%`,
                      width: `${width}%`
                    }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
