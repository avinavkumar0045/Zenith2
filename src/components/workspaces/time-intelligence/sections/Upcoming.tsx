import React, { useMemo } from 'react';
import { useTimeStore, UpcomingEvent, ObservationWindow } from '../types';
import { EventResolver } from '../engine/EventResolver';
import { WindowEngine } from '../engine/WindowEngine';
import { useLocationStore } from '@/modules/location/store/useLocationStore';
import { Sun, Moon, Star, Compass, Clock, MapPin, ChevronRight, Activity } from 'lucide-react';
import clsx from 'clsx';

export const Upcoming: React.FC = () => {
  const { currentTime, selectedTime, setSelectedTime } = useTimeStore();
  const activeLocation = useLocationStore((state) => state.activeLocation);

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

  // Resolve all upcoming chronological events
  const events = useMemo(() => {
    return EventResolver.resolveUpcomingEvents(selectedTime, observationWindows);
  }, [selectedTime, observationWindows]);

  const handleEventClick = (timestamp: number) => {
    setSelectedTime(new Date(timestamp));
  };

  const getEventIcon = (type: UpcomingEvent['type']) => {
    switch (type) {
      case 'observation-start':
        return <Star className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />;
      case 'observation-end':
        return <Star className="w-3.5 h-3.5 text-slate-500" />;
      case 'iss-pass':
        return <Activity className="w-3.5 h-3.5 text-amber-400" />;
      case 'satellite-pass':
        return <Compass className="w-3.5 h-3.5 text-cyan-400" />;
      case 'planet-peak':
        return <Compass className="w-3.5 h-3.5 text-purple-400" />;
      case 'moonrise':
        return <Moon className="w-3.5 h-3.5 text-blue-400" />;
      case 'moonset':
        return <Moon className="w-3.5 h-3.5 text-indigo-400" />;
      case 'twilight':
        return <Sun className="w-3.5 h-3.5 text-orange-400" />;
      default:
        return <Clock className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  if (!activeLocation) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center px-4">
        <MapPin className="w-8 h-8 text-slate-600 mb-2 stroke-[1.5]" />
        <span className="text-xs text-slate-400 font-medium">No Observer Location Set</span>
        <span className="text-[10px] text-slate-500 mt-1">Select a location to resolve chronological sky predictions.</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 flex-1 overflow-hidden">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Chronological Telemetry</span>
        <span className="text-[9px] font-mono text-slate-500">24h prediction window</span>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-6 text-[10px] text-slate-500 italic">
          No upcoming events predicted in this window.
        </div>
      ) : (
        <div className="flex flex-col gap-2 overflow-y-auto pr-1 max-h-[220px] scrollbar-thin scrollbar-thumb-slate-800">
          {events.map((evt) => {
            const isPast = evt.timestamp < selectedTime.getTime();
            return (
              <button
                key={evt.id}
                onClick={() => handleEventClick(evt.timestamp)}
                className={clsx(
                  "flex items-center justify-between p-2 rounded-lg border text-left transition-all duration-200 group cursor-pointer w-full outline-none",
                  isPast 
                    ? "bg-slate-950/20 border-slate-900/40 opacity-40 hover:opacity-60" 
                    : "bg-slate-900/30 border-slate-800 hover:border-slate-700/60 hover:bg-slate-900/60 hover:shadow-sm"
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={clsx(
                    "p-1.5 rounded bg-slate-950/60 border border-slate-800 group-hover:border-slate-700 transition-colors duration-200",
                    isPast ? "opacity-60" : "opacity-100"
                  )}>
                    {getEventIcon(evt.type)}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[11px] font-medium text-slate-200 group-hover:text-white transition-colors duration-200">
                      {evt.label}
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono">
                      {evt.relativeTime}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-slate-400 group-hover:text-cyan-400 transition-colors duration-200 bg-slate-950/50 px-1.5 py-0.5 rounded border border-slate-800/40">
                    {evt.timeLabel}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-500 transition-all duration-200 group-hover:translate-x-0.5" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
