import React from 'react';
import { useSessionMemoryStore } from '../memory/SessionMemory';
import { useConversationMemoryStore } from '../memory/ConversationMemory';
import { Trash2, ShieldAlert, Activity } from 'lucide-react';

export const History: React.FC = () => {
  const { recentActions, clearMemory } = useSessionMemoryStore();
  const { clearConversation } = useConversationMemoryStore();

  const handleFlush = () => {
    clearMemory();
    clearConversation();
  };

  return (
    <div className="flex flex-col gap-2.5 py-2 select-none">
      <div className="flex items-center justify-between text-[9px] font-bold font-mono tracking-widest text-slate-500 uppercase">
        <span>Execution Audit Logs</span>
        <button
          onClick={handleFlush}
          className="flex items-center gap-1 text-[8.5px] text-rose-400 hover:text-rose-300 font-mono tracking-normal uppercase transition-colors hover:bg-rose-500/10 px-2 py-0.5 rounded cursor-pointer"
        >
          <Trash2 className="w-2.5 h-2.5" />
          <span>Flush Logs</span>
        </button>
      </div>

      <div className="flex flex-col gap-1.5 max-h-[140px] overflow-y-auto pr-1">
        {recentActions.length > 0 ? (
          recentActions.map((act, i) => (
            <div
              key={i}
              className="flex items-start gap-2 p-2 rounded-lg bg-slate-950/30 border border-white/5 text-[9px] text-slate-350 leading-relaxed font-mono"
            >
              <Activity className="w-3 h-3 text-cyan-500 mt-0.5 flex-shrink-0" />
              <span className="truncate w-full">{act}</span>
            </div>
          ))
        ) : (
          <div className="flex items-center gap-2 p-2.5 rounded-lg border border-dashed border-white/5 bg-slate-950/10 text-slate-500 text-[8.5px] font-mono select-none">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>No orchestrator actions logged in this session.</span>
          </div>
        )}
      </div>
    </div>
  );
};
export default History;
