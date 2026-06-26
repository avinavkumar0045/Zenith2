import React, { useEffect, useRef } from 'react';
import { useConversationMemoryStore } from '../memory/ConversationMemory';
import { Message, AIAction } from '../ZenithAI.types';
import { SessionPlan } from './SessionPlan';
import { ToolRegistry } from '../registry/ToolRegistry';
import { useSessionMemoryStore } from '../memory/SessionMemory';
import { Sparkles, Terminal, CheckCircle2, Play, Circle, Loader2 } from 'lucide-react';
import clsx from 'clsx';

export const Chat: React.FC = () => {
  const { messages, isThinking, activeReasoningStep, updateMessage } = useConversationMemoryStore();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking, activeReasoningStep]);

  const handleRunAction = (messageId: string, actionIndex: number, action: AIAction) => {
    // Set executing state
    const msg = messages.find(m => m.id === messageId);
    if (!msg || !msg.actions) return;

    const updatedActions = [...msg.actions];
    updatedActions[actionIndex] = { ...action, status: 'executing' };
    updateMessage(messageId, { actions: updatedActions });

    // Simulate small execution delay
    setTimeout(() => {
      let toolName = '';
      let payload = action.payload;

      if (action.type === 'apply_preset') {
        toolName = 'visualization';
        payload = { action: 'preset', value: action.payload.value || action.payload.preset };
      } else if (action.type === 'focus') {
        toolName = 'focus';
      } else if (action.type === 'set_speed' || action.type === 'step_time') {
        toolName = 'timeline';
      } else if (action.type === 'open_workspace') {
        toolName = 'explorer';
        payload = { action: 'category', value: 'all' };
      } else if (action.type === 'start_session') {
        toolName = 'feed';
      } else {
        toolName = action.type;
      }

      const result = ToolRegistry.execute(toolName, payload);
      const isError = result.toLowerCase().includes('error') || result.toLowerCase().includes('failed');

      updatedActions[actionIndex] = {
        ...action,
        status: isError ? 'failed' : 'completed',
        result
      };

      updateMessage(messageId, { actions: updatedActions });
      useSessionMemoryStore.getState().logAction(`User triggered: ${action.label} - ${result}`);
    }, 400);
  };

  // Staged reasoning render helper
  const renderReasoning = () => {
    if (!isThinking) return null;

    const steps = ['Analyzing Sky', 'Checking Weather', 'Checking Timeline', 'Computing Visibility', 'Planning Session'];
    const currentIdx = steps.indexOf(activeReasoningStep);

    return (
      <div className="flex flex-col gap-2 p-3 rounded-2xl bg-slate-950/45 border border-white/5 mx-1 my-1 animate-pulse-slow">
        <div className="flex items-center gap-2">
          <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
          <span className="text-[10px] font-bold font-mono tracking-widest text-cyan-400 uppercase">
            AI Agent Reasoning...
          </span>
        </div>
        <div className="flex flex-col gap-1.5 mt-1 border-t border-white/5 pt-2 font-mono text-[9px]">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentIdx;
            const isRunning = idx === currentIdx;

            return (
              <div key={idx} className="flex items-center gap-2 text-slate-500">
                {isCompleted ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-450" />
                ) : isRunning ? (
                  <Loader2 className="w-3 h-3 text-cyan-450 animate-spin" />
                ) : (
                  <Circle className="w-2.5 h-2.5 text-slate-800" />
                )}
                <span className={clsx(
                  isCompleted && "text-slate-350",
                  isRunning && "text-cyan-300 font-bold",
                  !isCompleted && !isRunning && "text-slate-650"
                )}>
                  {step} {isRunning && '...'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-y-auto pr-1.5 custom-scrollbar gap-3 select-none">
      {messages.map((msg) => {
        const isAI = msg.sender === 'ai';
        const isSystem = msg.sender === 'system';

        return (
          <div
            key={msg.id}
            className={clsx(
              "flex flex-col gap-1.5 max-w-[90%] my-0.5 rounded-2xl p-3 border",
              isAI
                ? "bg-slate-950/30 border-white/5 self-start text-slate-200"
                : isSystem
                  ? "bg-cyan-950/5 border-dashed border-cyan-500/10 text-cyan-450 self-center text-center text-[9px] font-mono p-2 w-full max-w-full"
                  : "bg-cyan-500/10 border-cyan-500/25 self-end text-cyan-100"
            )}
          >
            {/* Header info */}
            {!isSystem && (
              <div className="flex items-center gap-1.5 border-b border-white/5 pb-1 select-none">
                {isAI ? (
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                ) : (
                  <Terminal className="w-3 h-3 text-cyan-500" />
                )}
                <span className="text-[8.5px] font-bold font-mono tracking-widest uppercase text-slate-500">
                  {isAI ? 'Zenith AI Conductor' : 'Observer'}
                </span>
              </div>
            )}

            {/* Message Body */}
            <p className={clsx(
              "text-[10.5px] leading-relaxed font-sans mt-0.5",
              isSystem ? "font-mono" : "font-sans"
            )}>
              {msg.text}
            </p>

            {/* Optional plan card */}
            {msg.plan && <SessionPlan plan={msg.plan} />}

            {/* Optional action triggers */}
            {msg.actions && msg.actions.length > 0 && (
              <div className="flex flex-col gap-2 mt-2 border-t border-white/5 pt-2">
                <span className="text-[8.5px] font-bold font-mono text-slate-500 uppercase">Suggested Actions</span>
                <div className="flex flex-col gap-1.5">
                  {msg.actions.map((act, idx) => {
                    const isCompleted = act.status === 'completed';
                    const isExecuting = act.status === 'executing';
                    
                    return (
                      <div
                        key={act.id}
                        className="flex items-center justify-between p-2 rounded-xl border border-white/5 bg-slate-950/40"
                      >
                        <div className="flex flex-col gap-0.5 max-w-[70%]">
                          <span className="text-[9.5px] font-bold text-slate-350">{act.label}</span>
                          <span className="text-[8px] text-slate-500 leading-tight">{act.description}</span>
                          {act.result && (
                            <span className="text-[7.5px] font-mono text-cyan-400/70 mt-0.5 truncate">{act.result}</span>
                          )}
                        </div>

                        {!isCompleted ? (
                          <button
                            onClick={() => handleRunAction(msg.id, idx, act)}
                            disabled={isExecuting}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-[9px] font-bold transition-all cursor-pointer active:scale-95 disabled:opacity-50"
                          >
                            {isExecuting ? (
                              <Loader2 className="w-2.5 h-2.5 animate-spin" />
                            ) : (
                              <Play className="w-2.5 h-2.5 fill-slate-950" />
                            )}
                            <span>Run</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-1 text-[8.5px] text-emerald-450 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Done</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Reasoning log */}
      {renderReasoning()}

      <div ref={messagesEndRef} />
    </div>
  );
};
export default Chat;
