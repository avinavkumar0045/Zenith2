import React, { useState } from 'react';
import { ChevronDown, ChevronUp, CheckSquare } from 'lucide-react';

interface ActionsProps {
  recommendations: string[];
}

export const Actions: React.FC<ActionsProps> = ({ recommendations }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (recommendations.length === 0) return null;

  return (
    <div className="py-4 select-none border-b border-white/5">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="text-[9px] text-cyan-400 font-bold tracking-wider font-mono uppercase leading-none">
          Recommended Next Steps
        </span>
        <button className="text-slate-400 hover:text-white transition-colors focus:outline-none">
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="flex flex-col gap-3 mt-3 pl-1">
          {recommendations.map((rec, idx) => (
            <div key={idx} className="flex items-start gap-2.5">
              <CheckSquare className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs md:text-sm text-slate-300 font-light leading-relaxed">
                {rec}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
