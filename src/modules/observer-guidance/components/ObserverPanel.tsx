import React from 'react';
import { useObserverGuidanceStore } from '../store/useObserverGuidanceStore';
import SkyDomeVisualizer from './SkyDomeVisualizer';
import { Navigation, Compass, Star, Crosshair } from 'lucide-react';

export default function ObserverPanel() {
  const { report } = useObserverGuidanceStore();

  if (!report) {
    return (
      <div className="w-[360px] h-full flex flex-col items-center justify-center text-gray-500 bg-black/40 rounded-lg p-4">
        <Navigation className="w-8 h-8 mb-2 opacity-50" />
        <p className="text-sm">Calculating guidance...</p>
      </div>
    );
  }

  // Generate stars string based on score (0-10 -> 0-5 stars)
  const getStars = (score: number) => {
    const outOfFive = Math.round(score / 2);
    const filled = '★'.repeat(outOfFive);
    const empty = '☆'.repeat(5 - outOfFive);
    return filled + empty;
  };

  return (
    <div className="w-[360px] h-full flex flex-col pointer-events-auto">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-white/10 flex items-center space-x-3 bg-black/20">
        <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
          <Compass className="w-5 h-5 text-blue-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white tracking-wide uppercase">Observer Guidance</h2>
          <p className="text-xs text-gray-400">Sky Navigation Assistant</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 bg-black/40">
        
        {/* Look Here Now Block */}
        <div className="bg-gradient-to-br from-blue-900/40 to-indigo-900/40 border border-blue-500/30 rounded-lg p-4">
          <h3 className="text-xs font-bold text-blue-300 uppercase tracking-widest flex items-center mb-3">
            <Crosshair className="w-4 h-4 mr-1.5" /> Look Here Now
          </h3>

          <div className="space-y-3">
            <div className="flex justify-between items-end border-b border-white/10 pb-2">
              <span className="text-[10px] text-gray-400 uppercase">Target</span>
              <span className="text-lg font-bold text-white">{report.bestTargetName}</span>
            </div>

            <div className="grid grid-cols-2 gap-3 pb-2 border-b border-white/10">
              <div>
                <span className="text-[10px] text-gray-400 uppercase block mb-0.5">Direction</span>
                <span className="text-sm text-gray-200 font-medium">{report.bestTargetDirection}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-gray-400 uppercase block mb-0.5">Elevation</span>
                <span className="text-sm text-gray-200 font-medium">{report.bestTargetElevation}</span>
              </div>
            </div>

            <div className="bg-black/20 p-2 rounded border border-white/5">
              <span className="text-[10px] text-blue-300/80 uppercase block mb-1">Instruction</span>
              <p className="text-sm font-medium text-white italic">"{report.bestTargetInstruction}"</p>
            </div>

            <div className="flex justify-between items-center pt-1">
              <span className="text-[10px] text-gray-400 uppercase">Visibility</span>
              <span className={`text-xs px-2 py-0.5 rounded border ${
                report.bestTargetVisibility === 'Excellent' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                report.bestTargetVisibility === 'Good' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
              }`}>
                {report.bestTargetVisibility}
              </span>
            </div>
          </div>
        </div>

        {/* Sky Dome */}
        <div>
          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest px-1 block mb-2">Observer Sky Dome</span>
          <SkyDomeVisualizer />
        </div>

        {/* Ranked Objects */}
        <div>
          <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest px-1 block mb-2">Ranked Objects</span>
          <div className="space-y-1.5">
            {report.rankedObjects.map((obj) => (
              <div key={obj.id} className="flex items-center justify-between bg-white/5 rounded p-2 border border-white/10">
                <div className="flex items-center space-x-2">
                  <Star className={`w-3 h-3 ${obj.isBestTarget ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500'}`} />
                  <div>
                    <p className="text-xs font-bold text-gray-200 leading-tight">{obj.name}</p>
                    <p className="text-[9px] text-gray-400 leading-tight">{obj.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-yellow-500 tracking-widest">{getStars(obj.observationScore)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
