import React from 'react';
import { Compass, Sparkles, Camera, MapPin } from 'lucide-react';
import { ZenithAI } from '../orchestrator/ZenithAI';

export const Suggestions: React.FC = () => {
  const suggestions = [
    {
      text: 'Plan observation tonight',
      icon: Sparkles,
      color: 'hover:border-emerald-500/30 text-emerald-400'
    },
    {
      text: 'Track the ISS',
      icon: Compass,
      color: 'hover:border-cyan-500/30 text-cyan-400'
    },
    {
      text: 'Prepare for astrophotography',
      icon: Camera,
      color: 'hover:border-purple-500/30 text-purple-400'
    },
    {
      text: 'Recenter globe',
      icon: MapPin,
      color: 'hover:border-slate-500/30 text-slate-400'
    }
  ];

  const handleClick = (text: string) => {
    ZenithAI.processPrompt(text);
  };

  return (
    <div className="flex flex-col gap-2 py-2 select-none border-b border-white/5 pb-4">
      <span className="text-[9px] font-bold font-mono tracking-widest text-slate-500 uppercase">Suggested Prompts</span>
      <div className="grid grid-cols-2 gap-2 mt-1">
        {suggestions.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => handleClick(item.text)}
              className={`flex items-center gap-2 p-2.5 rounded-xl border border-white/5 bg-slate-950/20 hover:bg-slate-900/40 text-left transition-all duration-200 group cursor-pointer outline-none ${item.color} active:scale-95`}
            >
              <Icon className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="text-[9.5px] font-medium leading-tight text-slate-350 font-sans group-hover:text-white transition-colors line-clamp-2">
                {item.text}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
export default Suggestions;
