import React from 'react';
import { usePassPredictions } from '../hooks/usePassPredictions';

export const PassTimeline: React.FC = () => {
  const { passes } = usePassPredictions();

  if (passes.length === 0) return null;

  return (
    <div className="w-full flex items-center justify-between text-xs text-slate-500 mt-2 px-1 relative">
      <div className="absolute left-0 right-0 h-[1px] bg-slate-700/50 top-1/2 -translate-y-1/2 z-0" />
      {passes.slice(0, 4).map((pass, i) => (
        <div key={pass.passId} className="z-10 flex flex-col items-center bg-slate-900 px-1">
          <div className={`w-2 h-2 rounded-full mb-1 ${i === 0 ? 'bg-blue-400' : 'bg-slate-600'}`} />
          <span className={i === 0 ? 'text-blue-400 font-medium' : ''}>
            {new Date(pass.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      ))}
    </div>
  );
};
