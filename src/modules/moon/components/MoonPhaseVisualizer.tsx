import React from 'react';

export function MoonPhaseVisualizer({ phase }: { phase: number }) {
  const isWaxing = phase <= 0.5;
  const normalizedPhase = isWaxing ? phase * 2 : (phase - 0.5) * 2; 
  
  return (
    <div className="relative w-16 h-16 rounded-full bg-slate-800 shadow-[inset_-4px_0_10px_rgba(0,0,0,0.5)] overflow-hidden border border-white/5 flex-shrink-0">
      <div className="absolute inset-0 bg-white"
        style={{
          clipPath: isWaxing 
            ? `inset(0 0 0 ${100 - (normalizedPhase * 100)}%)`
            : `inset(0 ${(normalizedPhase * 100)}% 0 0)`,
          opacity: 0.9
        }}
      ></div>
      <div className="absolute inset-0 rounded-full shadow-[inset_-8px_-4px_16px_rgba(0,0,0,0.6)]"></div>
    </div>
  );
}
