import React from 'react';
import { Loader2, MapPin, Info } from 'lucide-react';
import { SkyIntelligenceModel } from './MissionBrief.types';
import { HeroInsight } from './sections/HeroInsight';
import { SkyScore } from './sections/SkyScore';
import { Opportunity } from './sections/Opportunity';
import { Events } from './sections/Events';
import { Conditions } from './sections/Conditions';
import { Actions } from './sections/Actions';
import { Alerts } from './sections/Alerts';

interface ContentProps {
  loading: boolean;
  error: string | null;
  model: SkyIntelligenceModel | null;
}

export const MissionBriefContent: React.FC<ContentProps> = ({ loading, error, model }) => {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3 select-none">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        <span className="text-[10px] text-cyan-100/60 font-mono tracking-widest uppercase">
          ALIGNING TELEMETRY...
        </span>
      </div>
    );
  }

  if (error && !model) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center px-4 select-none">
        <span className="text-sm font-semibold text-rose-400 uppercase tracking-wider">
          Telemetry Offline
        </span>
        <p className="text-xs text-slate-400 mt-2 max-w-xs leading-relaxed">
          {error}
        </p>
      </div>
    );
  }

  if (!model) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center px-6 select-none">
        <MapPin className="w-8 h-8 text-cyan-400/50 mb-3 animate-pulse" />
        <p className="text-xs md:text-sm font-normal text-slate-300 leading-relaxed max-w-[240px]">
          Select a location to align coordinates and retrieve observation intelligence.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable Body Content */}
      <div className="flex-1 overflow-y-auto pr-1 flex flex-col gap-1 custom-scrollbar">
        {/* Partial Telemetry Mode Alert (Online Mode / Weather offline fallback) */}
        {model.isPartialTelemetry && (
          <div className="flex items-start gap-2 bg-amber-950/20 border border-amber-500/10 rounded-xl p-2.5 my-2 select-none">
            <Info className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
            <div className="flex flex-col gap-0.5">
              <span className="text-[8px] text-amber-400 font-bold tracking-wider font-mono">
                PARTIAL TELEMETRY
              </span>
              <p className="text-[9px] text-slate-300 font-light leading-relaxed">
                Weather systems offline. Displaying local astronomical prediction models only.
              </p>
            </div>
          </div>
        )}

        {/* 1. Hero Insight (Primary Dynamic Headline) */}
        <HeroInsight insight={model.heroInsight} />

        {/* 2. Typographic Sky Score & Why Explanation */}
        <SkyScore 
          score={model.score} 
          confidenceText={model.confidenceText}
          whyItems={model.whyItems}
        />

        {/* 3. Recommended Opportunity (Spotlight target) */}
        <Opportunity bestTarget={model.bestTarget} />

        {/* 4. Upcoming Events (Chronological passes/rises) */}
        <Events events={model.events} />

        {/* 5. Observation Conditions Grid (2x2 Grid) */}
        <Conditions metrics={model.metrics} />

        {/* 6. Recommended Next Steps (Actions) */}
        <Actions recommendations={model.recommendations} />

        {/* 7. System Warnings (Alerts) */}
        <Alerts warnings={model.warnings} />
      </div>

      {/* Branded Attribution Footer */}
      <div className="pt-4 pb-1 mt-auto border-t border-white/10 text-center select-none">
        <span className="text-[8px] md:text-[9px] text-slate-500 font-medium tracking-wide uppercase font-sans">
          Powered by NOAA, CelesTrak & Astronomical Models
        </span>
      </div>
    </div>
  );
};
