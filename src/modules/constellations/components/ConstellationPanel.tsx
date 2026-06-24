import React from 'react';
import { useConstellationStore } from '../store/useConstellationStore';
import { Sparkles, Map, Target, AlertTriangle } from 'lucide-react';

export default function ConstellationPanel() {
  const { visibleConstellations, bestConstellation, nearZenithConstellation } = useConstellationStore();

  const sortedConstellations = [...visibleConstellations].sort((a, b) => b.visibilityScore - a.visibilityScore);

  return (
    <div className="w-[360px] h-full flex flex-col pointer-events-auto">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-white/10 flex items-center space-x-3 bg-black/20">
        <div className="p-2 bg-purple-500/20 rounded-lg border border-purple-500/30">
          <Sparkles className="w-5 h-5 text-purple-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white tracking-wide uppercase">Constellations</h2>
          <p className="text-xs text-gray-400">Deep Space Intelligence</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 bg-black/40">
        {visibleConstellations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-gray-500 bg-white/5 rounded-lg border border-white/10">
            <AlertTriangle className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">No major constellations visible</p>
            <p className="text-xs mt-1">Wait for nightfall or clearer skies</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3">
              {/* Best Positioned */}
              <div className="bg-white/5 rounded-lg p-3 border border-purple-500/30">
                <span className="text-[10px] text-purple-300 uppercase tracking-wider flex items-center mb-1">
                  <Target className="w-3 h-3 mr-1" /> Best Positioned
                </span>
                <p className="text-white font-bold text-lg">{bestConstellation ? bestConstellation.name : 'None'}</p>
                <p className="text-xs text-gray-400">{bestConstellation ? `Score: ${bestConstellation.visibilityScore.toFixed(1)}/10` : ''}</p>
              </div>

              {/* Near Zenith */}
              <div className="bg-white/5 rounded-lg p-3 border border-blue-500/30">
                <span className="text-[10px] text-blue-300 uppercase tracking-wider flex items-center mb-1">
                  <Map className="w-3 h-3 mr-1" /> Near Zenith
                </span>
                <p className="text-white font-bold text-lg">{nearZenithConstellation ? nearZenithConstellation.name : 'None'}</p>
                <p className="text-xs text-gray-400">{nearZenithConstellation ? `Alt: ${nearZenithConstellation.altitude.toFixed(1)}°` : 'None directly overhead'}</p>
              </div>
            </div>

            {/* List */}
            <div className="space-y-2">
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-1">Top Observation Scores</h3>
              {sortedConstellations.map((c) => (
                <div key={c.id} className="bg-white/5 border border-white/10 rounded-lg p-3 flex justify-between items-center hover:bg-white/10 transition-colors">
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-bold text-gray-200">{c.name}</p>
                      <span className="text-[10px] bg-white/10 text-gray-300 px-1.5 py-0.5 rounded">{c.abbreviation}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-1">{c.description}</p>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className={`text-xs font-mono px-2 py-0.5 rounded border ${
                      c.visibilityScore > 8 ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                      c.visibilityScore > 5 ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                      'bg-red-500/20 text-red-300 border-red-500/30'
                    }`}>
                      {c.visibilityScore.toFixed(1)}
                    </span>
                    <span className="text-[10px] text-gray-500 mt-1">Alt {c.altitude.toFixed(0)}°</span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
