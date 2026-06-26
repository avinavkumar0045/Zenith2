import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { ObservationMetric } from '../MissionBrief.types';

interface ConditionsProps {
  metrics: ObservationMetric[];
}

export const Conditions: React.FC<ConditionsProps> = ({ metrics }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (metrics.length === 0) return null;

  return (
    <div className="py-4 select-none border-b border-white/5">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="text-[9px] text-cyan-400 font-bold tracking-wider font-mono uppercase leading-none">
          Observation Conditions
        </span>
        <button className="text-slate-400 hover:text-white transition-colors focus:outline-none">
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="grid grid-cols-2 gap-4 mt-3 pl-1">
          {metrics.map((metric, idx) => (
            <div key={idx} className="flex flex-col gap-0.5">
              <span className="text-[9px] text-slate-400 font-bold tracking-wide uppercase">
                {metric.label}
              </span>
              <span className="text-sm md:text-base font-semibold text-white mt-0.5">
                {metric.value}
              </span>
              <span className="text-[8px] md:text-[9px] text-slate-500 font-normal leading-normal mt-0.5 max-w-[150px]">
                {metric.detail}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
