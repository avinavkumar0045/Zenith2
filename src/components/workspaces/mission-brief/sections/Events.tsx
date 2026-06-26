import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { SkyEvent } from '../MissionBrief.types';

interface EventsProps {
  events: SkyEvent[];
}

export const Events: React.FC<EventsProps> = ({ events }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (events.length === 0) return null;

  return (
    <div className="py-4 select-none border-b border-white/5">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="text-[9px] text-cyan-400 font-bold tracking-wider font-mono uppercase leading-none">
          Upcoming Events
        </span>
        <button className="text-slate-400 hover:text-white transition-colors focus:outline-none">
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="flex flex-col gap-2.5 mt-3 pl-1">
          {events.map((evt) => (
            <div key={evt.id} className="flex items-center justify-between text-xs md:text-sm">
              <div className="flex items-center gap-2 text-white font-medium">
                <Clock className="w-3.5 h-3.5 text-cyan-400/80 flex-shrink-0" />
                <span>{evt.name}</span>
              </div>
              <span className="text-[10px] md:text-[11px] text-cyan-300 font-semibold font-mono tracking-wider">
                {evt.timeLabel}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
