import React from 'react';
import { Sparkles } from 'lucide-react';

interface RecommendationPanelProps {
  recommendations: string[];
}

export const RecommendationPanel: React.FC<RecommendationPanelProps> = ({ recommendations }) => {
  if (recommendations.length === 0) return null;

  return (
    <div className="bg-slate-800/40 rounded-xl p-3 border border-slate-700/50">
      <div className="flex items-center gap-2 mb-2 text-slate-300">
        <Sparkles size={14} className="text-purple-400" />
        <h3 className="text-xs font-medium uppercase tracking-wider">Recommendations</h3>
      </div>
      
      <ul className="flex flex-col gap-2">
        {recommendations.map((rec, i) => (
          <li key={i} className="text-sm text-slate-400 bg-slate-900/40 p-2 rounded-lg leading-snug">
            {rec}
          </li>
        ))}
      </ul>
    </div>
  );
};
