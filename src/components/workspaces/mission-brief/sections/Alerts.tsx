import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface AlertsProps {
  warnings: string[];
}

export const Alerts: React.FC<AlertsProps> = ({ warnings }) => {
  if (warnings.length === 0) return null;

  return (
    <div className="py-4 select-none">
      <span className="text-[9px] text-amber-500 font-bold tracking-wider font-mono uppercase leading-none">
        System Warnings
      </span>
      <div className="flex flex-col gap-2.5 mt-3 pl-1">
        {warnings.map((warn, idx) => (
          <div key={idx} className="flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0 animate-pulse" />
            <p className="text-xs md:text-sm text-amber-200/90 font-medium leading-relaxed">
              {warn}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
