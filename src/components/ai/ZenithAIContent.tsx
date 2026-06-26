import React, { useState } from 'react';
import { X, Sparkles, Send, Loader2 } from 'lucide-react';
import { Suggestions } from './ui/Suggestions';
import { Chat } from './ui/Chat';
import { History } from './ui/History';
import { ZenithAI } from './orchestrator/ZenithAI';
import { useConversationMemoryStore } from './memory/ConversationMemory';

interface ContentProps {
  onClose: () => void;
}

export const ZenithAIContent: React.FC<ContentProps> = ({ onClose }) => {
  const [inputValue, setInputValue] = useState('');
  const { isThinking } = useConversationMemoryStore();

  const handleSend = () => {
    const text = inputValue.trim();
    if (!text || isThinking) return;

    setInputValue('');
    ZenithAI.processPrompt(text);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 select-none">
        <div className="flex flex-col items-start gap-0.5">
          <span className="text-[10px] text-cyan-400 font-bold tracking-[0.25em] font-mono leading-none">
            ZENITH ORCHESTRATOR
          </span>
          <h2 className="text-sm font-semibold text-white tracking-wide uppercase font-sans mt-0.5">
            Agentic Platform Brain
          </h2>
          <span className="text-[8px] text-slate-500 font-mono tracking-wider font-light mt-0.5 uppercase">
            proactive multi-agent network
          </span>
        </div>
        <button
          onClick={onClose}
          aria-label="Close AI panel"
          suppressHydrationWarning
          className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors focus:outline-none cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main scrollable body */}
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto pr-0.5 gap-4 scrollbar-thin">
        {/* 1. Prompt Suggestions */}
        <Suggestions />

        {/* 2. Messages conversation feed */}
        <Chat />

        {/* 3. Audit History logs */}
        <div className="border-t border-white/5 pt-3">
          <History />
        </div>
      </div>

      {/* Input bar capsulated row */}
      <div className="relative flex items-center select-none w-full border-t border-white/10 pt-3">
        <div className="relative w-full flex items-center">
          <span className="absolute left-3.5 text-slate-500 pointer-events-none">
            {isThinking ? (
              <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
            )}
          </span>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isThinking}
            placeholder={isThinking ? 'AI is processing plan steps...' : 'Observe ISS then Saturn / Plan observation session...'}
            className="w-full text-[10.5px] font-sans text-white bg-slate-950/70 border border-white/10 rounded-xl pl-9 pr-10 py-3 placeholder-slate-500 focus:placeholder-slate-400 focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 transition-all font-light disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isThinking}
            suppressHydrationWarning
            className="absolute right-2.5 p-1.5 rounded-lg bg-cyan-500 text-slate-950 hover:bg-cyan-400 disabled:bg-slate-900 disabled:text-slate-650 transition-all cursor-pointer outline-none active:scale-95 disabled:scale-100"
          >
            <Send className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
export default ZenithAIContent;
