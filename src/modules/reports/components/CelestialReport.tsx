import React, { useState } from 'react';
import { useSkyIntelligenceStore } from '../store/useSkyIntelligenceStore';
import { useSkyCorrelationStore } from '../../sky-correlation/store/useSkyCorrelationStore';
import { useSSAStore } from '../../ssa/store/useSSAStore';
import { useEventStore } from '../../events/store/useEventStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Moon, Sun, CloudLightning, Globe2, AlertTriangle, CheckCircle2, Navigation, Activity, ChevronDown, ChevronUp, Radar, ShieldAlert, BellRing } from 'lucide-react';
import { useLocationStore } from '../../location/store/useLocationStore';
import { useWeatherStore } from '../../weather/store/useWeatherStore';
import { CloudRain } from 'lucide-react';

export function CelestialReport() {
  const report = useSkyIntelligenceStore(state => state.report);
  const correlationReport = useSkyCorrelationStore(state => state.report);
  const ssaReport = useSSAStore(state => state.report);
  const { topEvent, importantEvents } = useEventStore();
  const activeLocation = useLocationStore(state => state.activeLocation);
  const { weather } = useWeatherStore();
  const [isExpanded, setIsExpanded] = useState(true);

  if (!activeLocation) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="w-80 bg-black/60 border border-white/10 backdrop-blur-xl rounded-2xl p-5 shadow-2xl pointer-events-auto flex flex-col max-h-[85vh] overflow-y-auto custom-scrollbar"
      >
        <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-bold text-white tracking-wide">Unified Sky Report</h2>
          </div>
          {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronUp className="w-4 h-4 text-gray-400" />}
        </div>

        {isExpanded && (!report ? (
          <div className="flex flex-col items-center justify-center py-10 text-gray-500">
            <CloudLightning className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-sm">Calculating intelligence...</p>
          </div>
        ) : (
          <div className="space-y-4">

            {/* UPCOMING EVENTS (Phase 9B) */}
            {(topEvent || importantEvents.length > 0) && (
              <div className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 border border-amber-500/30 rounded-lg p-3">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest flex items-center mb-2">
                  <BellRing className="w-3 h-3 mr-1.5" /> Upcoming Events
                </span>
                
                <div className="space-y-2">
                  {topEvent && (
                    <div className="flex items-start bg-amber-500/10 p-2 rounded border border-amber-500/20">
                      <span className="text-lg mr-2 leading-none">
                        {topEvent.category === 'ISS' ? '🚀' : topEvent.category === 'MOON' ? '🌙' : topEvent.category === 'PLANET' ? '🪐' : topEvent.category === 'CONSTELLATION' ? '✨' : '🔭'}
                      </span>
                      <div>
                        <span className="text-xs font-bold text-amber-200 block leading-tight">{topEvent.title}</span>
                        <span className="text-[10px] text-amber-100/70 leading-tight block mt-0.5">{topEvent.description}</span>
                      </div>
                    </div>
                  )}

                  {importantEvents.length > 0 && (
                    <ul className="space-y-1 mt-2">
                      {importantEvents.map(event => (
                        <li key={event.id} className="text-xs text-gray-300 flex items-start">
                          <span className="mr-1.5 leading-none mt-0.5">
                            {event.category === 'ISS' ? '🚀' : event.category === 'MOON' ? '🌙' : event.category === 'PLANET' ? '🪐' : event.category === 'CONSTELLATION' ? '✨' : '🔭'}
                          </span>
                          <span className="leading-tight">{event.title}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {/* SPACE ENVIRONMENT (Phase 9A) */}
            {ssaReport && (
              <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-emerald-500/30 rounded-lg p-3">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center mb-2">
                  <ShieldAlert className="w-3 h-3 mr-1.5" /> Space Environment
                </span>
                
                <div className="grid grid-cols-2 gap-2 mb-2 border-b border-white/5 pb-2">
                  <div>
                    <span className="text-[9px] text-gray-400 uppercase block">Activity Index</span>
                    <span className="text-sm font-bold text-emerald-300">{ssaReport.spaceActivityIndex.toFixed(1)} / 10</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-gray-400 uppercase block">Most Relevant</span>
                    <span className="text-sm font-bold text-white">{ssaReport.mostRelevantAsset}</span>
                  </div>
                </div>

                <div className="mb-2">
                  <span className="text-[9px] text-gray-400 uppercase block mb-1">Top Objects</span>
                  <div className="flex flex-wrap gap-1">
                    {ssaReport.overheadAssets.slice(0, 3).map(asset => (
                      <span key={asset} className="text-[9px] px-1.5 py-0.5 bg-white/10 rounded border border-white/10 text-gray-200">{asset}</span>
                    ))}
                  </div>
                </div>

                <div className="bg-black/20 p-2 rounded border border-white/5">
                  <p className="text-[11px] text-emerald-100/90 leading-tight italic">"{ssaReport.environmentSummary}"</p>
                </div>
              </div>
            )}

            {/* SKY ABOVE THIS LOCATION (Phase 8B) */}
            {correlationReport && (
              <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-lg p-3">
                <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-widest flex items-center mb-2">
                  <Radar className="w-3 h-3 mr-1.5" /> Sky Above This Location
                </span>
                
                <div className="grid grid-cols-2 gap-2 mb-2 border-b border-white/5 pb-2">
                  <div>
                    <span className="text-[9px] text-gray-400 uppercase block">Best Target</span>
                    <span className="text-sm font-bold text-white">{correlationReport.bestTarget}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-gray-400 uppercase block">Direction</span>
                    <span className="text-sm font-bold text-indigo-200">{correlationReport.bestDirection}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  {correlationReport.skySummary.map((stmt, idx) => (
                    <div key={idx} className="flex items-start">
                      <span className="text-indigo-400 mr-1.5 mt-0.5 text-[10px]">■</span>
                      <p className="text-[11px] text-gray-200 leading-tight">{stmt}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
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

            {/* Astronomical Weather Conditions (Phase 7C) */}
            {weather && (
              <div className="bg-blue-900/10 border border-blue-500/20 rounded-lg p-2 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <CloudRain className="w-4 h-4 text-blue-400" />
                  <div>
                    <span className="text-[9px] text-gray-400 uppercase block leading-none">Conditions</span>
                    <span className="text-xs text-blue-200 font-medium leading-none mt-0.5 inline-block">{weather.weatherCondition}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-gray-400 uppercase block leading-none">Cloud / Vis</span>
                  <span className="text-xs text-gray-300 leading-none mt-0.5 inline-block">{weather.cloudCover}% / {weather.visibilityKm}km</span>
                </div>
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

            {/* Observation Plan Integration (Phase 7B) */}
            {report.observationPlan && report.observationPlan.rankedTargets.length > 0 && (
              <div className="pt-3 mt-3 border-t border-white/10 space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center mb-2">
                  <Navigation className="w-3 h-3 mr-1.5 text-blue-400" /> Observation Plan
                </h3>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white/5 rounded p-2 border border-white/10">
                    <span className="text-[9px] text-gray-500 uppercase block mb-0.5">Tonight's Quality</span>
                    <span className="text-gray-200 font-medium">{report.observationPlan.overallQuality}</span>
                  </div>
                  <div className="bg-white/5 rounded p-2 border border-white/10">
                    <span className="text-[9px] text-gray-500 uppercase block mb-0.5">Best Time</span>
                    <span className="text-blue-300 font-medium">
                      {report.observationPlan.bestTargetTime ? new Date(report.observationPlan.bestTargetTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] text-gray-500 uppercase">Chronological Agenda</span>
                  {report.observationPlan.agenda.slice(0, 4).map((item, i) => (
                    <div key={i} className="flex justify-between items-center bg-white/5 px-2 py-1.5 rounded text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-400 font-mono text-[10px]">{new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        <span className="text-gray-200 font-medium">{item.targetName}</span>
                      </div>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded border ${
                        item.quality === 'Excellent' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                        item.quality === 'Good' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                        item.quality === 'Average' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                        'bg-red-500/20 text-red-300 border-red-500/30'
                      }`}>
                        {item.quality}
                      </span>
                    </div>
                  ))}
                  {report.observationPlan.agenda.length > 4 && (
                    <div className="text-center text-[10px] text-gray-500 pt-1">+ {report.observationPlan.agenda.length - 4} more targets</div>
                  )}
                </div>
              </div>
            )}

          </div>
        ))}
      </motion.div>
    </AnimatePresence>
  );
}
