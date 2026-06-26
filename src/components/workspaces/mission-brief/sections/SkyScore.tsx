import React, { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { getScoreRating } from '../MissionBrief.utils';

interface SkyScoreProps {
  score: number;
  confidenceText: 'High' | 'Moderate' | 'Low';
  whyItems: string[];
}

export const SkyScore: React.FC<SkyScoreProps> = ({ score, confidenceText, whyItems }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const ratingDetails = getScoreRating(score);

  return (
    <div className="py-4 select-none border-b border-white/5">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="text-[9px] text-cyan-400 font-bold tracking-wider font-mono uppercase leading-none">
          Observation Quality
        </span>
        <button className="text-slate-400 hover:text-white transition-colors focus:outline-none">
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      <div className="flex flex-col gap-2 mt-3">
        {/* Rating and Score Row */}
        <div className="flex items-baseline justify-between">
          <span className={`text-xl md:text-2xl font-bold tracking-tight ${ratingDetails.colorClass}`}>
            {ratingDetails.rating}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-semibold text-white">{score}</span>
            <span className="text-[10px] text-slate-500 font-medium">/ 100</span>
          </div>
        </div>

        {/* Confidence level indicator */}
        <div className="flex flex-col gap-0.5 mt-3">
          <span className="text-[9px] text-slate-400 font-medium font-sans">
            Observation Confidence
          </span>
          <span className={`text-xs font-bold font-mono tracking-wider ${
            confidenceText === 'High' ? 'text-emerald-400' : confidenceText === 'Moderate' ? 'text-amber-400' : 'text-rose-400'
          }`}>
            {confidenceText}
          </span>
        </div>

        {/* Explaining "Why" (Collapsible details) */}
        {isExpanded && whyItems.length > 0 && (
          <div className="mt-3 bg-white/[0.02] border border-white/5 rounded-xl p-3 flex flex-col gap-2 transition-all duration-[200ms]">
            <span className="text-[9px] text-slate-400 font-bold tracking-wider font-sans uppercase">
              Key Factors:
            </span>
            <ul className="flex flex-col gap-1.5 pl-0.5">
              {whyItems.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-[10px] md:text-[11px] text-slate-300 font-light leading-relaxed">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};
