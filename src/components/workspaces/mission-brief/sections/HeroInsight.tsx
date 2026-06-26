import React from 'react';
import { Telescope } from 'lucide-react';

interface HeroInsightProps {
  insight: { headline: string; target: string | null; detail: string };
}

export const HeroInsight: React.FC<HeroInsightProps> = ({ insight }) => {
  return (
    <div className="py-4 select-none border-b border-white/5">
      <div className="flex items-start gap-3">
        <Telescope className="w-4 h-4 text-cyan-400 mt-0.5 flex-shrink-0" />
        <div className="flex flex-col gap-0.5">
          <span className="text-[9px] text-cyan-400/70 font-bold tracking-wider font-mono uppercase leading-none">
            {insight.headline}
          </span>
          {insight.target && (
            <span className="text-lg font-bold text-white leading-tight tracking-tight mt-0.5">
              {insight.target}
            </span>
          )}
          <p className="text-xs text-slate-300 font-normal leading-snug mt-0.5">
            {insight.detail}
          </p>
        </div>
      </div>
    </div>
  );
};
