import React from 'react';

interface ObservationCardProps {
  label: string;
  value: string | number;
  highlight?: boolean;
}

export const ObservationCard: React.FC<ObservationCardProps> = ({ label, value, highlight }) => {
  return (
    <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/50 flex flex-col justify-center">
      <span className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">{label}</span>
      <span className={`text-sm font-medium ${highlight ? 'text-white' : 'text-slate-300 font-mono'}`}>
        {value}
      </span>
    </div>
  );
};
