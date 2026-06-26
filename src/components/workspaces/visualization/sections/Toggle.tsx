import React from 'react';
import clsx from 'clsx';

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: () => void;
  description?: string;
}

export const Toggle: React.FC<ToggleProps> = ({ label, checked, onChange, description }) => {
  return (
    <div className="flex items-center justify-between py-2.5 px-1 select-none border-b border-slate-900/30">
      <div className="flex flex-col gap-0.5 max-w-[70%]">
        <span className="text-[11px] font-semibold text-slate-200">{label}</span>
        {description && (
          <span className="text-[9px] text-slate-500 leading-relaxed font-sans">{description}</span>
        )}
      </div>

      <button
        onClick={onChange}
        role="switch"
        aria-checked={checked}
        suppressHydrationWarning
        className={clsx(
          "w-8 h-4.5 rounded-full p-0.5 transition-all duration-200 cursor-pointer outline-none relative border flex items-center",
          checked
            ? "bg-cyan-500 border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.3)]"
            : "bg-slate-900 border-slate-800 hover:border-slate-700"
        )}
      >
        <span
          className={clsx(
            "w-3 h-3 rounded-full bg-white transition-transform duration-200 block shadow-sm",
            checked ? "translate-x-3.5" : "translate-x-0.5"
          )}
        />
      </button>
    </div>
  );
};

interface SliderProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
  min?: number;
  max?: number;
}

export const Slider: React.FC<SliderProps> = ({ label, value, onChange, min = 0, max = 100 }) => {
  return (
    <div className="flex flex-col gap-1.5 py-2 px-1 select-none border-b border-slate-900/20 bg-slate-950/10 rounded-md my-0.5">
      <div className="flex items-center justify-between text-[9px] font-mono text-slate-500">
        <span>{label} Opacity</span>
        <span className="text-cyan-400 font-bold">{value}%</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-cyan-500 h-1 bg-slate-900 hover:bg-slate-800 rounded-lg appearance-none cursor-pointer outline-none transition-colors"
      />
    </div>
  );
};
