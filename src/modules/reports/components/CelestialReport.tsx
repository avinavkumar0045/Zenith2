import React from 'react';
import { useSkyIntelligenceStore } from '../store/useSkyIntelligenceStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Moon, Sun, CloudLightning, Globe2, AlertTriangle, CheckCircle2, Navigation } from 'lucide-react';
import { useLocationStore } from '../../location/store/useLocationStore';

export function CelestialReport() {
  const report = useSkyIntelligenceStore(state => state.report);
  const activeLocation = useLocationStore(state => state.activeLocation);

  if (!activeLocation) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="w-80 bg-black/60 border border-white/10 backdrop-blur-xl rounded-2xl p-5 shadow-2xl pointer-events-auto flex flex-col max-h-[85vh] overflow-y-auto custom-scrollbar"
      >
        <div className="flex items-center space-x-2 mb-4 border-b border-white/10 pb-3">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <h2 className="text-lg font-bold text-white tracking-wide">Unified Sky Report</h2>
        </div>

        {!report ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-500">
            <CloudLightning className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">Calculating intelligence...</p>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* Observation Score */}
            <div className="bg-white/5 rounded-lg p-3 border border-white/10">
              <div className="flex justify-between items-end">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Observation Score</span>
                <span className="text-2xl font-bold text-purple-400">{report.observationScore.toFixed(1)} <span className="text-sm text-gray-500">/ 10</span></span>
              </div>
            </div>

            {/* Best Target */}
            {report.bestObservationTarget && (
              <div className="bg-purple-900/20 rounded-lg p-3 border border-purple-500/30">
                <span className="text-xs font-semibold text-purple-300 uppercase tracking-wider flex items-center mb-1">
                  <CheckCircle2 className="w-3 h-3 mr-1" /> Best Target
                </span>
                <p className="text-white font-bold text-lg">{report.bestObservationTarget.name}</p>
                <p className="text-xs text-gray-400 mt-1 leading-tight">{report.bestObservationTarget.reason}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              {/* Moon Summary */}
              <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                <span className="text-[10px] text-gray-500 uppercase block mb-1">Moon</span>
                {report.moonSummary.isVisible ? (
                  <>
                    <p className="text-sm text-gray-200 font-medium truncate">{report.moonSummary.phase}</p>
                    <p className="text-xs text-gray-400">Alt: {report.moonSummary.altitude.toFixed(0)}°</p>
                  </>
                ) : (
                  <p className="text-xs text-gray-500 mt-1">Below Horizon</p>
                )}
              </div>

              {/* ISS Summary */}
              <div className="bg-white/5 rounded-lg p-2 border border-white/10">
                <span className="text-[10px] text-gray-500 uppercase block mb-1">ISS</span>
                {report.issSummary.isCurrentlyVisible ? (
                  <p className="text-sm text-green-400 font-medium">Currently Visible</p>
                ) : (
                  <>
                    <p className="text-xs text-gray-400">Next Pass</p>
                    <p className="text-sm text-gray-200 font-mono">{report.issSummary.nextPassTime || 'None soon'}</p>
                  </>
                )}
              </div>
            </div>

            {/* Planets Summary */}
            <div className="bg-white/5 rounded-lg p-3 border border-white/10 text-xs">
              <span className="text-[10px] text-gray-500 uppercase block mb-2">Planets</span>
              <div className="flex flex-wrap gap-1">
                {report.planetSummary.visiblePlanets.map(p => (
                  <span key={p} className="px-2 py-0.5 bg-green-500/20 text-green-300 rounded text-[10px] border border-green-500/30">{p} Visible</span>
                ))}
                {report.planetSummary.hiddenPlanets.map(p => (
                  <span key={p} className="px-2 py-0.5 bg-red-500/10 text-red-400/50 rounded text-[10px] border border-red-500/10">{p} Hidden</span>
                ))}
              </div>
            </div>

            {/* Satellites Summary */}
            <div className="bg-white/5 rounded-lg p-3 border border-white/10 flex justify-between items-center text-xs">
              <span className="text-[10px] text-gray-500 uppercase">Satellites</span>
              <div className="text-right">
                <p className="text-gray-300">{report.satelliteSummary.activeCount} Active</p>
                <p className="text-purple-300">{report.satelliteSummary.strongPassesCount} Strong Passes Tonight</p>
              </div>
            </div>

            {/* Recommendations */}
            {report.recommendations.length > 0 && (
              <div className="pt-2 border-t border-white/10 space-y-2">
                <span className="text-[10px] text-gray-500 uppercase">Recommendations</span>
                <ul className="space-y-1.5">
                  {report.recommendations.map((rec, i) => (
                    <li key={i} className="text-xs text-gray-300 flex items-start">
                      <span className="text-purple-400 mr-2 mt-0.5">•</span>
                      <span className="leading-tight">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Warnings */}
            {report.warnings.length > 0 && (
              <div className="pt-2 border-t border-white/10 space-y-2">
                <span className="text-[10px] text-red-500/70 uppercase">Warnings</span>
                <ul className="space-y-1.5">
                  {report.warnings.map((warn, i) => (
                    <li key={i} className="text-xs text-red-300/80 flex items-start">
                      <AlertTriangle className="w-3 h-3 text-red-500 mr-1.5 mt-0.5 shrink-0" />
                      <span className="leading-tight">{warn}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
