import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Star } from 'lucide-react';

interface OpportunityProps {
  bestTarget: {
    name: string;
    reason: string;
  } | null;
}

export const Opportunity: React.FC<OpportunityProps> = ({ bestTarget }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!bestTarget) return null;

  return (
    <div className="py-4 select-none border-b border-white/5">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="text-[9px] text-cyan-400 font-bold tracking-wider font-mono uppercase leading-none">
          Best Opportunity
        </span>
        <button className="text-slate-400 hover:text-white transition-colors focus:outline-none">
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      <div className="flex flex-col gap-1.5 mt-3 pl-1">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-cyan-400 fill-cyan-400/20 flex-shrink-0 animate-pulse" />
          <span className="text-sm font-semibold text-white tracking-wide">
            {bestTarget.name}
          </span>
        </div>
        
        {isExpanded && (
          <p className="text-[10px] md:text-[11px] text-slate-300 font-light leading-relaxed pl-6 mt-0.5">
            {bestTarget.reason}
          </p>
        )}
      </div>
    </div>
  );
};
