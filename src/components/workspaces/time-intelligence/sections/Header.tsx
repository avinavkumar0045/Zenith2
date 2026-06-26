import React from 'react';
import { useTimeStore } from '../types';
import { PredictionEngine } from '../engine/PredictionEngine';
import { useLocationStore } from '@/modules/location/store/useLocationStore';
import { getGMST } from '../utils';
import { Clock, RefreshCw, ShieldCheck, ShieldAlert, Shield } from 'lucide-react';

export const Header: React.FC = () => {
  const { currentTime, selectedTime, resetToNow } = useTimeStore();
  const activeLocation = useLocationStore((state) => state.activeLocation);

  const isLive = Math.abs(selectedTime.getTime() - currentTime.getTime()) < 60000;
  const confidence = PredictionEngine.getConfidenceLevel(selectedTime, currentTime);

  // Calculate Local Sidereal Time (LST)
  const gmst = getGMST(selectedTime);
  const lon = activeLocation ? activeLocation.longitude : 0;
  let lstHours = (gmst + lon / 15) % 24;
  if (lstHours < 0) lstHours += 24;

  const lstH = Math.floor(lstHours);
  const lstM = Math.floor((lstHours * 60) % 60);
  const lstS = Math.floor((lstHours * 3600) % 60);
  const lstString = `${String(lstH).padStart(2, '0')}:${String(lstM).padStart(2, '0')}:${String(lstS).padStart(2, '0')}`;

  const formattedLocalDate = selectedTime.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  const formattedLocalTime = selectedTime.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const confidenceDetails = {
    High: {
      color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5',
      icon: ShieldCheck,
      desc: 'High resolution prediction telemetry',
    },
    Moderate: {
      color: 'text-amber-400 border-amber-500/20 bg-amber-500/5',
      icon: Shield,
      desc: 'Minor variance risk due to offset',
    },
    Low: {
      color: 'text-rose-400 border-rose-500/20 bg-rose-500/5',
      icon: ShieldAlert,
      desc: 'High weather/decay uncertainty',
    },
  }[confidence];

  const ConfidenceIcon = confidenceDetails.icon;

  return (
    <div className="flex flex-col gap-4 border-b border-slate-800/60 pb-4">
      {/* Simulation Banner / Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isLive ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              NOW ● LIVE
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-[0_0_12px_rgba(6,182,212,0.15)]">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              SIMULATING
            </span>
          )}
        </div>

        {!isLive && (
          <button
            onClick={resetToNow}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700/80 text-[10px] font-medium text-slate-300 hover:text-white transition-all duration-200 border border-slate-700/50 hover:border-slate-600/80 active:scale-95 cursor-pointer shadow-sm"
          >
            <RefreshCw className="w-3 h-3" />
            Reset to Now
          </button>
        )}
      </div>

      {/* Primary Time Display */}
      <div className="flex flex-col select-none">
        <div className="flex items-baseline justify-between">
          <span className="text-3xl font-mono font-bold tracking-tight text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.1)]">
            {formattedLocalTime}
          </span>
          <span className="text-[10px] font-mono tracking-widest text-cyan-400/80 uppercase">
            LST {lstString}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium mt-1">
          <span>{formattedLocalDate}</span>
          <span className="font-mono text-[10px] text-slate-500">
            {activeLocation ? activeLocation.name : 'UTC'}
          </span>
        </div>
      </div>

      {/* Prediction Confidence Badge Card */}
      <div className={`flex items-start gap-3 p-3 rounded-lg border ${confidenceDetails.color} transition-all duration-300`}>
        <ConfidenceIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider">
              {confidence} Confidence
            </span>
          </div>
          <span className="text-[10px] opacity-80 leading-relaxed font-sans">
            {confidenceDetails.desc}
          </span>
        </div>
      </div>
    </div>
  );
};
