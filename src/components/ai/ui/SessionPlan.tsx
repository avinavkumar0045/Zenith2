import React from 'react';
import { AISessionPlan } from '../ZenithAI.types';
import { Clock, Star, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import { ToolRegistry } from '../registry/ToolRegistry';
import { CommandIslandAPI } from '@/components/ui/command-island/CommandIslandState';
import clsx from 'clsx';

interface SessionPlanProps {
  plan: AISessionPlan;
}

export const SessionPlan: React.FC<SessionPlanProps> = ({ plan }) => {
  const [executing, setExecuting] = React.useState(false);
  const [complete, setComplete] = React.useState(false);

  const handleExecute = async () => {
    setExecuting(true);
    CommandIslandAPI.showNotification('AI Orchestrator: Setting up Workspace...', 1);

    // Sequence tools:
    // 1. Set visualization mode to observation preset
    ToolRegistry.execute('visualization', { action: 'preset', value: 'observation' });
    
    // 2. Focus on the best target coordinates
    if (plan.targets.length > 0) {
      const best = plan.targets[0];
      await new Promise(resolve => setTimeout(resolve, 800));
      
      let payload = {};
      if (best.name.toLowerCase() === 'moon') {
        payload = { targetId: 'moon_primary' };
      } else {
        payload = { targetName: best.name };
      }
      
      ToolRegistry.execute('focus', payload);
      CommandIslandAPI.showNotification(`Focused on best target: ${best.name}`, 2);
    }

    // 3. Start logging session
    await new Promise(resolve => setTimeout(resolve, 600));
    ToolRegistry.execute('feed', { 
      action: 'start_session', 
      targetId: plan.targets[0]?.id || 'session_plan', 
      targetName: plan.targets[0]?.name || 'Plan' 
    });

    setExecuting(false);
    setComplete(true);
    CommandIslandAPI.showNotification('Workspace Ready for Observation!', 2);
  };

  return (
    <div className="flex flex-col gap-3 p-3.5 bg-cyan-950/15 border border-cyan-500/15 rounded-2xl select-none my-2 animate-fade-in">
      {/* Title block */}
      <div className="flex items-center justify-between border-b border-white/5 pb-2">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[10px] font-bold tracking-widest text-white uppercase font-mono">
            {plan.title}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[8px] font-mono text-slate-500 uppercase">Confidence</span>
          <span className="text-[9px] font-bold font-mono text-cyan-400 bg-cyan-950/45 px-1.5 py-0.5 rounded border border-cyan-500/10">
            {plan.confidence}%
          </span>
        </div>
      </div>

      {/* Weather summaries */}
      <div className="flex items-center justify-between text-[9px] text-slate-400 bg-slate-950/40 p-2 rounded-lg border border-white/5 font-sans leading-relaxed">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3 h-3 text-slate-500" />
          <span>Forecast: {plan.weatherSummary}</span>
        </div>
        <span className="text-[8.5px] font-bold text-emerald-400 uppercase font-mono">
          {plan.overallQuality} Quality
        </span>
      </div>

      {/* Targets Agendas */}
      <div className="flex flex-col gap-2">
        {plan.targets.map((target, idx) => {
          const isExcellent = target.quality.toLowerCase() === 'excellent';
          const isGood = target.quality.toLowerCase() === 'good';
          
          return (
            <div
              key={target.id}
              className="flex items-start justify-between p-2 rounded-xl border border-white/5 bg-slate-950/20 hover:border-slate-800 transition-colors"
            >
              <div className="flex items-start gap-2.5">
                <div className="flex items-center justify-center w-5 h-5 rounded bg-white/5 text-[9px] font-mono text-slate-400 font-bold border border-white/10 mt-0.5">
                  {idx + 1}
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10.5px] font-bold text-slate-200">{target.name}</span>
                  <span className="text-[8px] font-mono text-slate-500 uppercase">{target.type} ● {target.windowLabel}</span>
                  <p className="text-[8.5px] text-slate-450 leading-relaxed font-sans mt-0.5 max-w-[190px]">
                    {target.reasoning}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <span className={clsx(
                  "text-[7.5px] font-bold font-mono px-1.5 py-0.5 rounded border uppercase tracking-wider",
                  isExcellent 
                    ? "text-cyan-400 bg-cyan-950/30 border-cyan-500/20" 
                    : isGood 
                      ? "text-emerald-450 bg-emerald-950/30 border-emerald-500/20" 
                      : "text-amber-450 bg-amber-950/30 border-amber-500/20"
                )}>
                  {target.quality}
                </span>
                <div className="flex items-center gap-0.5 text-[8.5px] font-mono text-slate-500">
                  <Star className="w-2.5 h-2.5 text-amber-500 fill-amber-500" />
                  <span className="font-bold text-slate-350">{target.score}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Execution button */}
      {!complete ? (
        <button
          onClick={handleExecute}
          disabled={executing}
          className="w-full flex items-center justify-center gap-2 mt-1 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-[10px] font-bold transition-all border border-cyan-400 active:scale-98 shadow-md shadow-cyan-950/50 cursor-pointer disabled:opacity-50"
        >
          {executing ? (
            <>
              <div className="w-3.5 h-3.5 border border-slate-950 border-t-transparent rounded-full animate-spin" />
              <span>Orchestrating subsystems...</span>
            </>
          ) : (
            <span>Apply and Execute Plan</span>
          )}
        </button>
      ) : (
        <div className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-emerald-500/20 bg-emerald-950/20 text-emerald-400 text-[10.5px] font-bold select-none">
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Agenda Executed successfully</span>
        </div>
      )}
    </div>
  );
};
export default SessionPlan;
