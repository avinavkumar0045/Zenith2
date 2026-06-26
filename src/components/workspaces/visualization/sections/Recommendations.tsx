import React, { useMemo } from 'react';
import { useVisualizationStore } from '../Visualization.types';
import { useTimeStore } from '../../time-intelligence/types';
import { usePassStore } from '@/modules/pass-predictions/store/usePassStore';
import { Sparkles, ArrowRight, ShieldAlert } from 'lucide-react';
import clsx from 'clsx';

export const Recommendations: React.FC = () => {
  const { activeProfile, setProfile } = useVisualizationStore();
  const selectedTime = useTimeStore((state) => state.selectedTime);
  const upcomingPasses = usePassStore((state) => state.upcomingPasses);

  // Find if there is an ISS pass starting soon or active now
  const activeISSPass = useMemo(() => {
    if (!upcomingPasses) return null;
    const baseTimeMs = selectedTime.getTime();

    // Look for ISS (satelliteId '25544') within a 15-minute future window or 3-minute past window (active)
    return upcomingPasses.find((p) => {
      const isISS = p.satelliteId === '25544' || p.satelliteId === 'sat_25544';
      if (!isISS) return false;
      const startMs = new Date(p.startTime).getTime();
      const endMs = new Date(p.endTime).getTime();
      return (baseTimeMs >= startMs - 60000 && baseTimeMs <= endMs) || // active now
             (startMs > baseTimeMs && startMs <= baseTimeMs + 15 * 60000); // starts in 15 mins
    });
  }, [upcomingPasses, selectedTime]);

  const timeLabel = useMemo(() => {
    if (!activeISSPass) return '';
    const baseTimeMs = selectedTime.getTime();
    const startMs = new Date(activeISSPass.startTime).getTime();
    const endMs = new Date(activeISSPass.endTime).getTime();

    if (baseTimeMs >= startMs && baseTimeMs <= endMs) {
      return 'Active Now';
    }
    const diffMin = Math.round((startMs - baseTimeMs) / 60000);
    return diffMin <= 1 ? 'in less than a minute' : `in ${diffMin} min`;
  }, [activeISSPass, selectedTime]);

  const handleRecommendationClick = () => {
    setProfile('satellite');
  };

  // Only show recommendation if an ISS pass is pending/active and satellite profile is not already applied
  if (!activeISSPass || activeProfile === 'satellite') return null;

  return (
    <div className="flex flex-col gap-2 p-3 bg-cyan-950/20 border border-cyan-500/20 rounded-2xl select-none animate-pulse-slow">
      <div className="flex items-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
        <span className="text-[9px] font-bold tracking-widest text-cyan-400 uppercase font-mono">
          Smart Recommendation
        </span>
      </div>

      <div className="flex flex-col gap-1.5 mt-0.5">
        <span className="text-[11px] font-medium text-slate-200">
          ISS Orbital Pass Detected {timeLabel}
        </span>
        <p className="text-[9px] text-slate-400 leading-relaxed font-sans">
          Align the workspace to track this pass. This will enable orbital trajectories, sensor cones, and lock the camera view onto the ISS entity.
        </p>

        <button
          onClick={handleRecommendationClick}
          className="flex items-center justify-between mt-1 px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 hover:bg-cyan-400 transition-all duration-200 text-[10px] font-bold group cursor-pointer border border-cyan-400 active:scale-95 shadow-md shadow-cyan-950/40"
        >
          <span>Switch to Satellite Tracking</span>
          <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
        </button>
      </div>
    </div>
  );
};
