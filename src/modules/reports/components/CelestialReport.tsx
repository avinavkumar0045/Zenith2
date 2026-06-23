import React from 'react';
import { useReport } from '../hooks/useReport';
import { ObservationScore } from './ObservationScore';
import { ObservationCard } from './ObservationCard';
import { RecommendationPanel } from './RecommendationPanel';
import { FileText, Loader2 } from 'lucide-react';

export const CelestialReport: React.FC = () => {
  const { report, loading } = useReport();

  if (!report) return null;

  return (
    <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-2xl shadow-2xl p-4 w-80 max-w-full pointer-events-auto flex flex-col mt-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2 text-white">
          <FileText size={18} className="text-purple-400" />
          <h2 className="font-semibold tracking-wide">Celestial Report</h2>
        </div>
        {loading && <Loader2 size={16} className="text-slate-400 animate-spin" />}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="col-span-2">
          <ObservationScore score={report.observationScore} quality={report.observationQuality} />
        </div>
        
        <ObservationCard 
          label="Location" 
          value={report.locationName} 
          highlight 
        />
        <ObservationCard 
          label="Conditions" 
          value={report.dayState} 
        />
        <ObservationCard 
          label="Satellites Overhead" 
          value={report.satellitesOverheadCount} 
        />
        <ObservationCard 
          label="Best Elevation" 
          value={report.bestElevation ? `${report.bestElevation.toFixed(1)}°` : 'N/A'} 
        />
      </div>

      <RecommendationPanel recommendations={report.recommendations} />
    </div>
  );
};
