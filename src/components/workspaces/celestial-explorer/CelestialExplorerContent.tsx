import React, { useState, useEffect } from 'react';
import { X, Search as SearchIcon, Compass, Sparkles } from 'lucide-react';
import { Search } from './sections/Search';
import { Categories } from './sections/Categories';
import { Featured } from './sections/Featured';
import { ObjectList } from './sections/ObjectList';
import { ObjectPreview } from './sections/ObjectPreview';
import { ExplorerModel, ExplorerObject, useCelestialExplorerStore } from './CelestialExplorer.types';

interface ContentProps {
  model: ExplorerModel | null;
  onClose: () => void;
  onFocusObject: (obj: ExplorerObject) => void;
}

export const CelestialExplorerContent: React.FC<ContentProps> = ({
  model,
  onClose,
  onFocusObject
}) => {
  const { selectedObjectId, setSelectedObjectId } = useCelestialExplorerStore();
  const [freshnessText, setFreshnessText] = useState('Syncing...');

  // Track freshness sync time
  useEffect(() => {
    if (!model) return;

    const updateFreshness = () => {
      const diffSec = Math.round((Date.now() - model.lastUpdated) / 1000);
      if (diffSec < 10) {
        setFreshnessText('Updated just now');
      } else if (diffSec < 60) {
        setFreshnessText(`Updated ${diffSec}s ago`);
      } else {
        const diffMin = Math.floor(diffSec / 60);
        setFreshnessText(`Updated ${diffMin}m ago`);
      }
    };

    updateFreshness();
    const interval = setInterval(updateFreshness, 5000);
    return () => clearInterval(interval);
  }, [model]);

  if (!model) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20 gap-3 select-none">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase animate-pulse">
          Aligning Celestial Grid...
        </span>
      </div>
    );
  }

  // Find the selected object details
  const selectedObject = model.allObjects.find((o) => o.id === selectedObjectId) || 
                         model.featuredObjects.find((o) => o.id === selectedObjectId);

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 select-none">
        <div className="flex flex-col items-start gap-0.5">
          <span className="text-[10px] text-cyan-400 font-bold tracking-[0.25em] font-mono leading-none">
            CELESTIAL EXPLORER
          </span>
          <h2 className="text-sm font-semibold text-white tracking-wide uppercase font-sans mt-0.5">
            Object Telemetry
          </h2>
          <span className="text-[8px] text-slate-500 font-mono tracking-wider font-light mt-0.5 uppercase">
            {freshnessText}
          </span>
        </div>
        <button
          onClick={onClose}
          aria-label="Close panel"
          suppressHydrationWarning
          className="p-1.5 rounded-full hover:bg-white/10 text-slate-400 hover:text-white transition-colors focus:outline-none cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Flow Grid */}
      <div className="flex-1 flex flex-col gap-3.5 min-h-0 overflow-hidden">
        {/* 1. Search */}
        <Search />

        {/* 2. Categories */}
        <Categories counts={model.categoryCounts} />

        {/* 3. Featured Tonight (curated objects) */}
        {!selectedObject && model.featuredObjects.length > 0 && (
          <Featured objects={model.featuredObjects} />
        )}

        {/* Separator / Title */}
        <div className="flex items-center justify-between text-[8px] font-bold font-mono tracking-widest text-slate-400 uppercase select-none border-t border-white/5 pt-3">
          <span>OBJECT CATALOG</span>
          <span className="text-slate-600 font-mono font-medium">{model.allObjects.length} Targets</span>
        </div>

        {/* 4. Scrollable Main List */}
        <ObjectList 
          objects={model.allObjects} 
          onFocusObject={onFocusObject}
        />
      </div>

      {/* 5. Object Details Preview */}
      {selectedObject && (
        <div className="flex-shrink-0 border-t border-white/10 pt-3">
          <ObjectPreview 
            object={selectedObject} 
            onFocus={() => onFocusObject(selectedObject)} 
            onClose={() => setSelectedObjectId(null)}
          />
        </div>
      )}
    </div>
  );
};
