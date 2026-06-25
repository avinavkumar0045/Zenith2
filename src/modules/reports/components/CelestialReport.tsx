import React, { useState, useEffect, useRef } from 'react';
import { useSkyIntelligenceStore } from '../store/useSkyIntelligenceStore';
import { useSkyCorrelationStore } from '../../sky-correlation/store/useSkyCorrelationStore';
import { useSSAStore } from '../../ssa/store/useSSAStore';
import { useEventStore } from '../../events/store/useEventStore';
import { useOpportunityStore } from '../../opportunity/store/useOpportunityStore';
import { SkyDirectionTranslator } from '../../observer-guidance/services/SkyDirectionTranslator';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Moon, Sun, CloudLightning, Globe2, AlertTriangle, CheckCircle2, Navigation, Activity, ChevronDown, ChevronUp, Radar, ShieldAlert, BellRing, Target } from 'lucide-react';
import { useLocationStore } from '../../location/store/useLocationStore';
import { useWeatherStore } from '../../weather/store/useWeatherStore';
import { CloudRain } from 'lucide-react';
import clsx from 'clsx';

export function CelestialReport() {
  const _report = useSkyIntelligenceStore(state => state.report);
  const _correlationReport = useSkyCorrelationStore(state => state.report);
  const _ssaReport = useSSAStore(state => state.report);
  const { topEvent: _topEvent, importantEvents: _importantEvents } = useEventStore();
  const { bestOpportunity: _bestOpportunity, forecastQuality: _forecastQuality, forecastSummary: _forecastSummary } = useOpportunityStore();
  const activeLocation = useLocationStore(state => state.activeLocation);
  const { weather: _weather } = useWeatherStore();

  const [report, setReport] = useState(_report);
  const [correlationReport, setCorrelationReport] = useState(_correlationReport);
  const [ssaReport, setSsaReport] = useState(_ssaReport);
  const [topEvent, setTopEvent] = useState(_topEvent);
  const [importantEvents, setImportantEvents] = useState(_importantEvents);
  const [bestOpportunity, setBestOpportunity] = useState(_bestOpportunity);
  const [forecastQuality, setForecastQuality] = useState(_forecastQuality);
  const [forecastSummary, setForecastSummary] = useState(_forecastSummary);
  const [weather, setWeather] = useState(_weather);

  useEffect(() => { if (_report) setReport(_report); }, [_report]);
  useEffect(() => { if (_correlationReport) setCorrelationReport(_correlationReport); }, [_correlationReport]);
  useEffect(() => { if (_ssaReport) setSsaReport(_ssaReport); }, [_ssaReport]);
  useEffect(() => { if (_topEvent !== undefined) setTopEvent(_topEvent); }, [_topEvent]);
  useEffect(() => { if (_importantEvents) setImportantEvents(_importantEvents); }, [_importantEvents]);
  useEffect(() => { if (_bestOpportunity !== undefined) setBestOpportunity(_bestOpportunity); }, [_bestOpportunity]);
  useEffect(() => { if (_forecastQuality) setForecastQuality(_forecastQuality); }, [_forecastQuality]);
  useEffect(() => { if (_forecastSummary) setForecastSummary(_forecastSummary); }, [_forecastSummary]);
  useEffect(() => { if (_weather) setWeather(_weather); }, [_weather]);

  const [isExpanded, setIsExpanded] = useState(true);
  const [width, setWidth] = useState(280);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('zenith-report-width');
    if (saved) {
      setWidth(Number(saved));
    }
  }, []);

  useEffect(() => {
    if (!isResizing) return;

    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!containerRef.current) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const rect = containerRef.current.getBoundingClientRect();
      let newWidth = clientX - rect.left;
      
      if (newWidth < 280) newWidth = 280;
      if (newWidth > 600) newWidth = 600;
      
      setWidth(newWidth);
    };

    const handleUp = () => {
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', handleUp);
    document.addEventListener('touchmove', handleMove, { passive: false });
    document.addEventListener('touchend', handleUp);

    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleUp);
    };
  }, [isResizing]);

  useEffect(() => {
    if (!isResizing) {
      localStorage.setItem('zenith-report-width', width.toString());
    }
  }, [width, isResizing]);

  const handleDoubleClick = () => {
    if (isMobile) return;
    const newWidth = width === 280 ? 450 : 280;
    setWidth(newWidth);
  };

  const startResize = (e: React.MouseEvent | React.TouchEvent) => {
    if (isMobile) return; 
    e.preventDefault();
    setIsResizing(true);
  };

  if (!activeLocation) return null;

  const isCompact = width < 320;
  const isComfort = width >= 450;

  return (
    <AnimatePresence>
      <motion.div
        key="celestial-report"
        ref={containerRef}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="bg-black/60 border border-white/10 backdrop-blur-xl rounded-2xl shadow-2xl pointer-events-auto flex flex-col relative max-h-full min-h-0 shrink"
        style={{ 
          width: isMobile ? '100%' : `${width}px`,
          userSelect: isResizing ? 'none' : 'auto' 
        }}
      >
        {!isMobile && (
          <div 
            className="absolute top-0 right-0 w-3 h-full cursor-col-resize hover:bg-white/5 active:bg-white/10 transition-colors z-20 flex items-center justify-center opacity-0 hover:opacity-100 group"
            onMouseDown={startResize}
            onTouchStart={startResize}
            onDoubleClick={handleDoubleClick}
          >
            <div className="w-1 h-12 bg-white/30 rounded-full group-hover:bg-white/60 transition-colors" />
          </div>
        )}

        <div className={clsx("flex-none pb-3 border-b border-white/10", isCompact ? "p-3" : isComfort ? "p-6" : "p-5")}>
          <div className="flex items-center justify-between cursor-pointer pr-4" onClick={() => setIsExpanded(!isExpanded)}>
            <div className="flex items-center space-x-2">
              <Sparkles className={clsx("text-purple-400", isCompact ? "w-4 h-4" : isComfort ? "w-6 h-6" : "w-5 h-5")} />
              <h2 className={clsx("font-bold text-white tracking-wide", isCompact ? "text-base" : isComfort ? "text-xl" : "text-lg")}>Unified Sky Report</h2>
            </div>
            {isExpanded ? <ChevronDown className="w-4 h-4 text-gray-400" /> : <ChevronUp className="w-4 h-4 text-gray-400" />}
          </div>
        </div>

        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              key="expanded-content"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="overflow-hidden flex flex-col min-h-0"
            >
              <div className={clsx("pt-0 overflow-y-auto custom-scrollbar", isCompact ? "p-3 pr-4" : isComfort ? "p-6 pr-6" : "p-5 pr-6")}>
                {!report ? (
                  <div className="flex flex-col items-center justify-center py-10 text-gray-500">
                    <CloudLightning className="w-8 h-8 mb-2 opacity-50" />
                    <p className={clsx(isCompact ? "text-xs" : isComfort ? "text-base" : "text-sm")}>Calculating intelligence...</p>
                  </div>
                ) : (
                  <div className={clsx(isCompact ? "space-y-3 pb-2" : isComfort ? "space-y-6 pb-4" : "space-y-4 pb-2")}>

                    {/* NEXT BEST OPPORTUNITY (Phase 9C) */}
                    {bestOpportunity && (
                      <div className={clsx("bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border border-cyan-500/30 rounded-lg", isCompact ? "p-2.5" : isComfort ? "p-5" : "p-3")}>
                        <span className={clsx("font-bold text-cyan-400 uppercase tracking-widest flex items-center mb-2", isCompact ? "text-[9px]" : isComfort ? "text-xs" : "text-[10px]")}>
                          <Target className={clsx("mr-1.5", isCompact ? "w-2.5 h-2.5" : isComfort ? "w-4 h-4" : "w-3 h-3")} /> Next Best Opportunity
                        </span>
                        
                        <div className={clsx("flex items-center mb-2", isComfort ? "mb-4" : "")}>
                          <span className={clsx("mr-2 leading-none", isCompact ? "text-lg" : isComfort ? "text-3xl" : "text-xl")}>
                            {bestOpportunity.category === 'ISS' ? '🚀' : bestOpportunity.category === 'MOON' ? '🌙' : bestOpportunity.category === 'PLANET' ? '🪐' : bestOpportunity.category === 'CONSTELLATION' ? '✨' : '🔭'}
                          </span>
                          <span className={clsx("font-bold text-white", isCompact ? "text-xs" : isComfort ? "text-lg" : "text-sm")}>{bestOpportunity.title}</span>
                        </div>

                        <div className={clsx("grid mb-2 pb-2 border-b border-cyan-500/20", isComfort ? "grid-cols-3 gap-4" : "grid-cols-2 gap-2 text-xs", isComfort ? "text-sm" : "")}>
                          <div>
                            <span className={clsx("text-gray-400 uppercase block", isCompact ? "text-[8px]" : isComfort ? "text-[10px]" : "text-[9px]")}>Best Time</span>
                            <span className="text-cyan-200">{new Date(bestOpportunity.bestTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div>
                            <span className={clsx("text-gray-400 uppercase block", isCompact ? "text-[8px]" : isComfort ? "text-[10px]" : "text-[9px]")}>Starts In</span>
                            <span className="text-cyan-200">{bestOpportunity.minutesUntil} min</span>
                          </div>
                          <div className={isComfort ? "" : "col-span-2"}>
                            <span className={clsx("text-gray-400 uppercase block", isCompact ? "text-[8px]" : isComfort ? "text-[10px]" : "text-[9px]")}>Confidence</span>
                            <span className={bestOpportunity.confidence === 'High' ? 'text-green-400' : bestOpportunity.confidence === 'Medium' ? 'text-yellow-400' : 'text-red-400'}>{bestOpportunity.confidence}</span>
                          </div>
                        </div>

                        <div className={clsx("grid", isComfort ? "grid-cols-2 gap-4" : "grid-cols-1 gap-2")}>
                          <div className="mb-2">
                            <span className={clsx("text-cyan-400/80 uppercase block mb-0.5", isCompact ? "text-[8px]" : isComfort ? "text-[10px] mb-1" : "text-[9px]")}>Reason</span>
                            <span className={clsx("text-gray-300 leading-tight", isCompact ? "text-[10px]" : isComfort ? "text-sm" : "text-xs")}>{bestOpportunity.description}</span>
                          </div>

                          {(bestOpportunity.azimuth !== undefined && bestOpportunity.altitude !== undefined) && (
                            <div className={clsx("bg-cyan-900/20 rounded border border-cyan-500/20", isComfort ? "p-3" : "p-2")}>
                              <span className={clsx("text-cyan-300 uppercase block mb-0.5", isCompact ? "text-[8px]" : isComfort ? "text-[10px] mb-1" : "text-[9px]")}>Guidance</span>
                              <span className={clsx("text-cyan-100 italic", isCompact ? "text-[10px]" : isComfort ? "text-sm" : "text-xs")}>{SkyDirectionTranslator.generateInstruction(bestOpportunity.azimuth, bestOpportunity.altitude)}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* FORECAST QUALITY (Phase 9C) */}
                    <div className={clsx("bg-white/5 border border-white/10 rounded-lg", isCompact ? "p-2.5" : isComfort ? "p-5" : "p-3")}>
                       <span className={clsx("font-bold text-gray-400 uppercase tracking-widest block mb-1", isCompact ? "text-[9px]" : isComfort ? "text-xs" : "text-[10px]")}>Forecast Quality</span>
                       <span className={clsx("font-bold block mb-1", isCompact ? "text-xs" : isComfort ? "text-base mb-2" : "text-sm", forecastQuality === 'EXCELLENT' ? 'text-green-400' : forecastQuality === 'GOOD' ? 'text-blue-400' : forecastQuality === 'AVERAGE' ? 'text-yellow-400' : 'text-red-400')}>
                         {forecastQuality}
                       </span>
                       <p className={clsx("text-gray-400 leading-tight", isCompact ? "text-[10px]" : isComfort ? "text-sm" : "text-[11px]")}>{forecastSummary}</p>
                    </div>

                    {/* UPCOMING EVENTS (Phase 9B) */}
                    {(topEvent || (importantEvents && importantEvents.length > 0)) && (
                      <div className={clsx("bg-gradient-to-br from-amber-900/30 to-orange-900/30 border border-amber-500/30 rounded-lg", isCompact ? "p-2.5" : isComfort ? "p-5" : "p-3")}>
                        <span className={clsx("font-bold text-amber-400 uppercase tracking-widest flex items-center mb-2", isCompact ? "text-[9px]" : isComfort ? "text-xs" : "text-[10px]")}>
                          <BellRing className={clsx("mr-1.5", isCompact ? "w-2.5 h-2.5" : isComfort ? "w-4 h-4" : "w-3 h-3")} /> Upcoming Events
                        </span>
                        
                        <div className={clsx(isComfort ? "grid grid-cols-2 gap-4" : "space-y-2")}>
                          {topEvent && (
                            <div className={clsx("flex items-start bg-amber-500/10 rounded border border-amber-500/20", isComfort ? "p-3" : "p-2")}>
                              <span className={clsx("mr-2 leading-none", isCompact ? "text-base" : isComfort ? "text-2xl" : "text-lg")}>
                                {topEvent.category === 'ISS' ? '🚀' : topEvent.category === 'MOON' ? '🌙' : topEvent.category === 'PLANET' ? '🪐' : topEvent.category === 'CONSTELLATION' ? '✨' : '🔭'}
                              </span>
                              <div>
                                <span className={clsx("font-bold text-amber-200 block leading-tight", isCompact ? "text-[10px]" : isComfort ? "text-sm" : "text-xs")}>{topEvent.title}</span>
                                <span className={clsx("text-amber-100/70 leading-tight block mt-0.5", isCompact ? "text-[9px]" : isComfort ? "text-xs mt-1" : "text-[10px]")}>{topEvent.description}</span>
                              </div>
                            </div>
                          )}

                          {importantEvents && importantEvents.length > 0 && (
                            <ul className={clsx(isComfort ? "space-y-2" : "space-y-1 mt-2")}>
                              {importantEvents.map(event => (
                                <li key={event.id} className={clsx("text-gray-300 flex items-start", isCompact ? "text-[10px]" : isComfort ? "text-sm" : "text-xs")}>
                                  <span className={clsx("mr-1.5 leading-none", isComfort ? "mt-1" : "mt-0.5")}>
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
                      <div className={clsx("bg-gradient-to-br from-green-900/30 to-emerald-900/30 border border-emerald-500/30 rounded-lg", isCompact ? "p-2.5" : isComfort ? "p-5" : "p-3")}>
                        <span className={clsx("font-bold text-emerald-400 uppercase tracking-widest flex items-center mb-2", isCompact ? "text-[9px]" : isComfort ? "text-xs" : "text-[10px]")}>
                          <ShieldAlert className={clsx("mr-1.5", isCompact ? "w-2.5 h-2.5" : isComfort ? "w-4 h-4" : "w-3 h-3")} /> Space Environment
                        </span>
                        
                        <div className={clsx("grid grid-cols-2 mb-2 border-b border-white/5", isComfort ? "gap-4 pb-4" : "gap-2 pb-2")}>
                          <div>
                            <span className={clsx("text-gray-400 uppercase block", isCompact ? "text-[8px]" : isComfort ? "text-[10px]" : "text-[9px]")}>Activity Index</span>
                            <span className={clsx("font-bold text-emerald-300", isCompact ? "text-xs" : isComfort ? "text-base" : "text-sm")}>{ssaReport.spaceActivityIndex.toFixed(1)} / 10</span>
                          </div>
                          <div className="text-right">
                            <span className={clsx("text-gray-400 uppercase block", isCompact ? "text-[8px]" : isComfort ? "text-[10px]" : "text-[9px]")}>Most Relevant</span>
                            <span className={clsx("font-bold text-white", isCompact ? "text-xs" : isComfort ? "text-base" : "text-sm")}>{ssaReport.mostRelevantAsset}</span>
                          </div>
                        </div>

                        <div className={clsx("grid", isComfort ? "grid-cols-2 gap-4" : "grid-cols-1 gap-2")}>
                          <div className="mb-2">
                            <span className={clsx("text-gray-400 uppercase block", isCompact ? "text-[8px] mb-0.5" : isComfort ? "text-[10px] mb-1.5" : "text-[9px] mb-1")}>Top Objects</span>
                            <div className="flex flex-wrap gap-1">
                              {ssaReport.overheadAssets.slice(0, 3).map(asset => (
                                <span key={asset} className={clsx("bg-white/10 rounded border border-white/10 text-gray-200", isCompact ? "text-[8px] px-1 py-0.5" : isComfort ? "text-xs px-2 py-1" : "text-[9px] px-1.5 py-0.5")}>{asset}</span>
                              ))}
                            </div>
                          </div>

                          <div className={clsx("bg-black/20 rounded border border-white/5", isComfort ? "p-3" : "p-2")}>
                            <p className={clsx("text-emerald-100/90 leading-tight italic", isCompact ? "text-[10px]" : isComfort ? "text-sm" : "text-[11px]")}>"{ssaReport.environmentSummary}"</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* SKY ABOVE THIS LOCATION (Phase 8B) */}
                    {correlationReport && (
                      <div className={clsx("bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-500/30 rounded-lg", isCompact ? "p-2.5" : isComfort ? "p-5" : "p-3")}>
                        <span className={clsx("font-bold text-indigo-300 uppercase tracking-widest flex items-center mb-2", isCompact ? "text-[9px]" : isComfort ? "text-xs" : "text-[10px]")}>
                          <Radar className={clsx("mr-1.5", isCompact ? "w-2.5 h-2.5" : isComfort ? "w-4 h-4" : "w-3 h-3")} /> Sky Above This Location
                        </span>
                        
                        <div className={clsx("grid grid-cols-2 mb-2 border-b border-white/5", isComfort ? "gap-4 pb-4" : "gap-2 pb-2")}>
                          <div>
                            <span className={clsx("text-gray-400 uppercase block", isCompact ? "text-[8px]" : isComfort ? "text-[10px]" : "text-[9px]")}>Best Target</span>
                            <span className={clsx("font-bold text-white", isCompact ? "text-xs" : isComfort ? "text-base" : "text-sm")}>{correlationReport.bestTarget}</span>
                          </div>
                          <div className="text-right">
                            <span className={clsx("text-gray-400 uppercase block", isCompact ? "text-[8px]" : isComfort ? "text-[10px]" : "text-[9px]")}>Direction</span>
                            <span className={clsx("font-bold text-indigo-200", isCompact ? "text-xs" : isComfort ? "text-base" : "text-sm")}>{correlationReport.bestDirection}</span>
                          </div>
                        </div>

                        <div className={clsx(isComfort ? "grid grid-cols-2 gap-x-4 gap-y-2" : "space-y-1")}>
                          {correlationReport.skySummary.map((stmt, idx) => (
                            <div key={idx} className="flex items-start">
                              <span className={clsx("text-indigo-400 mr-1.5 text-[10px]", isComfort ? "mt-1.5" : "mt-0.5")}>■</span>
                              <p className={clsx("text-gray-200 leading-tight", isCompact ? "text-[10px]" : isComfort ? "text-sm" : "text-[11px]")}>{stmt}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className={clsx("grid", isComfort ? "grid-cols-2 gap-4" : "grid-cols-1 gap-2")}>
                      {/* Observation Score */}
                      <div className={clsx("bg-white/5 rounded-lg border border-white/10", isCompact ? "p-2.5" : isComfort ? "p-5" : "p-3")}>
                        <div className={clsx("flex justify-between items-end", isComfort ? "flex-col items-start gap-2" : "")}>
                          <span className={clsx("font-semibold text-gray-400 uppercase tracking-wider", isCompact ? "text-[10px]" : isComfort ? "text-sm" : "text-xs")}>Observation Score</span>
                          <span className={clsx("font-bold text-purple-400", isCompact ? "text-xl" : isComfort ? "text-4xl" : "text-2xl")}>{report.observationScore.toFixed(1)} <span className={clsx("text-gray-500", isComfort ? "text-lg" : "text-sm")}>/ 10</span></span>
                        </div>
                      </div>

                      {/* Best Target */}
                      {report.bestObservationTarget && (
                        <div className={clsx("bg-purple-900/20 rounded-lg border border-purple-500/30", isCompact ? "p-2.5" : isComfort ? "p-5" : "p-3")}>
                          <span className={clsx("font-semibold text-purple-300 uppercase tracking-wider flex items-center mb-1", isCompact ? "text-[10px]" : isComfort ? "text-sm mb-2" : "text-xs")}>
                            <CheckCircle2 className={clsx("mr-1", isCompact ? "w-2.5 h-2.5" : isComfort ? "w-4 h-4" : "w-3 h-3")} /> Best Target
                          </span>
                          <p className={clsx("text-white font-bold", isCompact ? "text-base" : isComfort ? "text-2xl" : "text-lg")}>{report.bestObservationTarget.name}</p>
                          <p className={clsx("text-gray-400 leading-tight", isCompact ? "text-[10px] mt-0.5" : isComfort ? "text-sm mt-2" : "text-xs mt-1")}>{report.bestObservationTarget.reason}</p>
                        </div>
                      )}
                    </div>

                    {/* Astronomical Weather Conditions (Phase 7C) */}
                    {weather && (
                      <div className={clsx("bg-blue-900/10 border border-blue-500/20 rounded-lg flex justify-between items-center", isCompact ? "p-2" : isComfort ? "p-4" : "p-2")}>
                        <div className="flex items-center space-x-2">
                          <CloudRain className={clsx("text-blue-400", isCompact ? "w-3 h-3" : isComfort ? "w-6 h-6 mr-2" : "w-4 h-4")} />
                          <div>
                            <span className={clsx("text-gray-400 uppercase block leading-none", isCompact ? "text-[8px]" : isComfort ? "text-[11px] mb-1" : "text-[9px]")}>Conditions</span>
                            <span className={clsx("text-blue-200 font-medium leading-none inline-block", isCompact ? "text-[10px] mt-0.5" : isComfort ? "text-sm mt-1" : "text-xs mt-0.5")}>{weather.weatherCondition}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={clsx("text-gray-400 uppercase block leading-none", isCompact ? "text-[8px]" : isComfort ? "text-[11px] mb-1" : "text-[9px]")}>Cloud / Vis</span>
                          <span className={clsx("text-gray-300 leading-none inline-block", isCompact ? "text-[10px] mt-0.5" : isComfort ? "text-sm mt-1" : "text-xs mt-0.5")}>{weather.cloudCover}% / {weather.visibilityKm}km</span>
                        </div>
                      </div>
                    )}

                    <div className={clsx("grid", isComfort ? "grid-cols-4 gap-4" : "grid-cols-2 gap-2")}>
                      {/* Moon Summary */}
                      <div className={clsx("bg-white/5 rounded-lg border border-white/10", isCompact ? "p-2" : isComfort ? "p-4" : "p-2")}>
                        <span className={clsx("text-gray-500 uppercase block", isCompact ? "text-[9px] mb-0.5" : isComfort ? "text-xs mb-2" : "text-[10px] mb-1")}>Moon</span>
                        {report.moonSummary.isVisible ? (
                          <>
                            <p className={clsx("text-gray-200 font-medium truncate", isCompact ? "text-xs" : isComfort ? "text-base mb-1" : "text-sm")}>{report.moonSummary.phase}</p>
                            <p className={clsx("text-gray-400", isCompact ? "text-[10px]" : isComfort ? "text-sm" : "text-xs")}>Alt: {report.moonSummary.altitude.toFixed(0)}°</p>
                          </>
                        ) : (
                          <p className={clsx("text-gray-500 mt-1", isCompact ? "text-[10px]" : isComfort ? "text-sm" : "text-xs")}>Below Horizon</p>
                        )}
                      </div>

                      {/* ISS Summary */}
                      <div className={clsx("bg-white/5 rounded-lg border border-white/10", isCompact ? "p-2" : isComfort ? "p-4" : "p-2")}>
                        <span className={clsx("text-gray-500 uppercase block", isCompact ? "text-[9px] mb-0.5" : isComfort ? "text-xs mb-2" : "text-[10px] mb-1")}>ISS</span>
                        {report.issSummary.isCurrentlyVisible ? (
                          <p className={clsx("text-green-400 font-medium", isCompact ? "text-xs" : isComfort ? "text-base" : "text-sm")}>Currently Visible</p>
                        ) : (
                          <>
                            <p className={clsx("text-gray-400", isCompact ? "text-[10px]" : isComfort ? "text-sm mb-1" : "text-xs")}>Next Pass</p>
                            <p className={clsx("text-gray-200 font-mono", isCompact ? "text-xs" : isComfort ? "text-base" : "text-sm")}>{report.issSummary.nextPassTime || 'None soon'}</p>
                          </>
                        )}
                      </div>

                      {/* Planets Summary */}
                      <div className={clsx("bg-white/5 rounded-lg border border-white/10", isCompact ? "p-2" : isComfort ? "col-span-2 p-4" : "p-3 col-span-2 text-xs")}>
                        <span className={clsx("text-gray-500 uppercase block", isCompact ? "text-[9px] mb-1" : isComfort ? "text-xs mb-3" : "text-[10px] mb-2")}>Planets</span>
                        <div className={clsx("flex flex-wrap", isComfort ? "gap-2" : "gap-1")}>
                          {report.planetSummary.visiblePlanets.map(p => (
                            <span key={p} className={clsx("bg-green-500/20 text-green-300 rounded border border-green-500/30", isCompact ? "px-1.5 py-0.5 text-[9px]" : isComfort ? "px-3 py-1 text-xs" : "px-2 py-0.5 text-[10px]")}>{p} Visible</span>
                          ))}
                          {report.planetSummary.hiddenPlanets.map(p => (
                            <span key={p} className={clsx("bg-red-500/10 text-red-400/50 rounded border border-red-500/10", isCompact ? "px-1.5 py-0.5 text-[9px]" : isComfort ? "px-3 py-1 text-xs" : "px-2 py-0.5 text-[10px]")}>{p} Hidden</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className={clsx("grid", isComfort ? "grid-cols-2 gap-4" : "grid-cols-1 gap-2")}>
                      {/* Satellites Summary */}
                      <div className={clsx("bg-white/5 rounded-lg border border-white/10 flex justify-between items-center", isCompact ? "p-2" : isComfort ? "p-4" : "p-3 text-xs")}>
                        <span className={clsx("text-gray-500 uppercase", isCompact ? "text-[9px]" : isComfort ? "text-xs" : "text-[10px]")}>Satellites</span>
                        <div className="text-right">
                          <p className={clsx("text-gray-300", isComfort ? "text-sm mb-1" : "")}>{report.satelliteSummary.activeCount} Active</p>
                          <p className={clsx("text-purple-300", isComfort ? "text-sm" : "")}>{report.satelliteSummary.strongPassesCount} Strong Passes Tonight</p>
                        </div>
                      </div>

                      {/* Recommendations */}
                      {report.recommendations.length > 0 && (
                        <div className={clsx("border-white/10 space-y-2", isComfort ? "border-t pt-4" : "border-t pt-2")}>
                          <span className={clsx("text-gray-500 uppercase", isCompact ? "text-[9px]" : isComfort ? "text-xs" : "text-[10px]")}>Recommendations</span>
                          <ul className={clsx(isComfort ? "space-y-2" : "space-y-1.5")}>
                            {report.recommendations.map((rec, i) => (
                              <li key={i} className={clsx("text-gray-300 flex items-start", isCompact ? "text-[10px]" : isComfort ? "text-sm" : "text-xs")}>
                                <span className={clsx("text-purple-400 mr-2", isComfort ? "mt-1" : "mt-0.5")}>•</span>
                                <span className="leading-tight">{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Warnings */}
                    {report.warnings.length > 0 && (
                      <div className={clsx("border-t border-white/10", isComfort ? "pt-4 space-y-3" : "pt-2 space-y-2")}>
                        <span className={clsx("text-red-500/70 uppercase", isCompact ? "text-[9px]" : isComfort ? "text-xs" : "text-[10px]")}>Warnings</span>
                        <ul className={clsx(isComfort ? "space-y-2" : "space-y-1.5")}>
                          {report.warnings.map((warn, i) => (
                            <li key={i} className={clsx("text-red-300/80 flex items-start", isCompact ? "text-[10px]" : isComfort ? "text-sm" : "text-xs")}>
                              <AlertTriangle className={clsx("text-red-500 shrink-0", isCompact ? "w-2.5 h-2.5 mr-1 mt-0.5" : isComfort ? "w-4 h-4 mr-2 mt-0.5" : "w-3 h-3 mr-1.5 mt-0.5")} />
                              <span className="leading-tight">{warn}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Observation Plan Integration (Phase 7B) */}
                    {report.observationPlan && report.observationPlan.rankedTargets.length > 0 && (
                      <div className={clsx("border-t border-white/10", isComfort ? "pt-5 mt-5 space-y-5" : "pt-3 mt-3 space-y-3")}>
                        <h3 className={clsx("font-bold text-white uppercase tracking-widest flex items-center mb-2", isCompact ? "text-[10px]" : isComfort ? "text-sm" : "text-xs")}>
                          <Navigation className={clsx("text-blue-400", isCompact ? "w-2.5 h-2.5 mr-1" : isComfort ? "w-4 h-4 mr-2" : "w-3 h-3 mr-1.5")} /> Observation Plan
                        </h3>

                        <div className={clsx("grid", isComfort ? "grid-cols-2 gap-4 text-sm" : "grid-cols-2 gap-2 text-xs")}>
                          <div className={clsx("bg-white/5 rounded border border-white/10", isComfort ? "p-4" : "p-2")}>
                            <span className={clsx("text-gray-500 uppercase block", isCompact ? "text-[8px] mb-0.5" : isComfort ? "text-[10px] mb-1.5" : "text-[9px] mb-0.5")}>Tonight's Quality</span>
                            <span className="text-gray-200 font-medium">{report.observationPlan.overallQuality}</span>
                          </div>
                          <div className={clsx("bg-white/5 rounded border border-white/10", isComfort ? "p-4" : "p-2")}>
                            <span className={clsx("text-gray-500 uppercase block", isCompact ? "text-[8px] mb-0.5" : isComfort ? "text-[10px] mb-1.5" : "text-[9px] mb-0.5")}>Best Time</span>
                            <span className="text-blue-300 font-medium">
                              {report.observationPlan.bestTargetTime ? new Date(report.observationPlan.bestTargetTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                            </span>
                          </div>
                        </div>

                        <div className={clsx(isComfort ? "space-y-3" : "space-y-1.5")}>
                          <span className={clsx("text-gray-500 uppercase block mb-1", isCompact ? "text-[9px]" : isComfort ? "text-xs" : "text-[10px]")}>Chronological Agenda</span>
                          {report.observationPlan.agenda.slice(0, 4).map((item, i) => (
                            <div key={i} className={clsx("flex justify-between items-center bg-white/5 rounded", isCompact ? "px-1.5 py-1 text-[10px]" : isComfort ? "px-4 py-3 text-sm" : "px-2 py-1.5 text-xs")}>
                              <div className="flex items-center space-x-2">
                                <span className={clsx("text-gray-400 font-mono", isCompact ? "text-[9px]" : isComfort ? "text-xs" : "text-[10px]")}>{new Date(item.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                <span className="text-gray-200 font-medium">{item.targetName}</span>
                              </div>
                              <span className={clsx("rounded border", isCompact ? "text-[8px] px-1 py-0.5" : isComfort ? "text-xs px-2 py-1" : "text-[9px] px-1.5 py-0.5",
                                item.quality === 'Excellent' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                                item.quality === 'Good' ? 'bg-blue-500/20 text-blue-300 border-blue-500/30' :
                                item.quality === 'Average' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30' :
                                'bg-red-500/20 text-red-300 border-red-500/30'
                              )}>
                                {item.quality}
                              </span>
                            </div>
                          ))}
                          {report.observationPlan.agenda.length > 4 && (
                            <div className={clsx("text-center text-gray-500", isCompact ? "text-[9px] pt-1" : isComfort ? "text-xs pt-3" : "text-[10px] pt-1")}>+ {report.observationPlan.agenda.length - 4} more targets</div>
                          )}
                        </div>
                      </div>
                    )}

                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
