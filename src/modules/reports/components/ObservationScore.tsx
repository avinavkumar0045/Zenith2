import React from 'react';
import clsx from 'clsx';

interface ObservationScoreProps {
  score: number;
  quality: string;
}

export const ObservationScore: React.FC<ObservationScoreProps> = ({ score, quality }) => {
  // Determine color based on score
  const colorClass = 
    score >= 8 ? 'text-emerald-400 stroke-emerald-400' :
    score >= 6 ? 'text-blue-400 stroke-blue-400' :
    score >= 4 ? 'text-orange-400 stroke-orange-400' :
    'text-red-400 stroke-red-400';

  const circumference = 2 * Math.PI * 36;
  const strokeDashoffset = circumference - (score / 10) * circumference;

  return (
    <div className="flex flex-col items-center justify-center bg-slate-800/40 rounded-xl p-4 border border-slate-700/50 relative">
      <div className="relative flex items-center justify-center w-24 h-24 mb-2">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
          <circle
            className="stroke-slate-700"
            strokeWidth="6"
            fill="transparent"
            r="36"
            cx="40"
            cy="40"
          />
          <circle
            className={clsx("transition-all duration-1000 ease-out", colorClass)}
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            r="36"
            cx="40"
            cy="40"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={clsx("text-3xl font-bold font-mono tracking-tighter", colorClass.split(' ')[0])}>
            {score}
          </span>
          <span className="text-[10px] text-slate-500 font-medium">/ 10</span>
        </div>
      </div>
      
      <div className={clsx("text-xs font-medium px-3 py-1 rounded-full bg-slate-900/50", colorClass.split(' ')[0])}>
        {quality}
      </div>
    </div>
  );
};
