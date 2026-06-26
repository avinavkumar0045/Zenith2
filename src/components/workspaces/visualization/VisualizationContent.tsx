import React from 'react';
import { X, Search as SearchIcon, Layers, Sliders, Sparkles } from 'lucide-react';
import { useVisualizationStore } from './Visualization.types';
import { filterControls } from './Visualization.utils';
import { Toggle, Slider } from './sections/Toggle';
import { Profiles } from './sections/Profiles';
import { Recommendations } from './sections/Recommendations';
import { Camera } from './sections/Camera';
import { Objects } from './sections/Objects';
import { Environment } from './sections/Environment';
import { Paths } from './sections/Paths';
import { Labels } from './sections/Labels';
import { Analytics } from './sections/Analytics';

interface ContentProps {
  onClose: () => void;
}

export const VisualizationContent: React.FC<ContentProps> = ({ onClose }) => {
  const store = useVisualizationStore();
  const { searchQuery, setSearchQuery } = store;

  // Filtered controls if search query is active
  const filtered = React.useMemo(() => {
    return filterControls(searchQuery);
  }, [searchQuery]);

  // Helper to determine if a toggle has an associated opacity slider
  const getAssociatedOpacitySlider = (key: string) => {
    if (key === 'showClouds' && store.showClouds) {
      return { key: 'opacityClouds' as const, label: 'Clouds' };
    }
    if (key === 'showGroundTracks' && store.showGroundTracks) {
      return { key: 'opacityGroundTracks' as const, label: 'Ground Track / Orbit' };
    }
    if (key === 'showAtmosphere' && store.showAtmosphere) {
      return { key: 'opacityAtmosphere' as const, label: 'Atmosphere' };
    }
    if (key === 'showGrid' && store.showGrid) {
      return { key: 'opacityGrid' as const, label: 'Grid' };
    }
    if (['showPlanetLabels', 'showSatelliteLabels', 'showConstellationLabels', 'showCities', 'showCoordinates'].includes(key)) {
      const isAnyLabelActive = store.showPlanetLabels || store.showSatelliteLabels || store.showConstellationLabels || store.showCities || store.showCoordinates;
      if (isAnyLabelActive) {
        return { key: 'opacityLabels' as const, label: 'Label' };
      }
    }
    return null;
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 select-none">
        <div className="flex flex-col items-start gap-0.5">
          <span className="text-[10px] text-cyan-400 font-bold tracking-[0.25em] font-mono leading-none">
            VISUALIZATION
          </span>
          <h2 className="text-sm font-semibold text-white tracking-wide uppercase font-sans mt-0.5">
            Workspace Layers
          </h2>
          <span className="text-[8px] text-slate-500 font-mono tracking-wider font-light mt-0.5 uppercase">
            Cesium render engine config
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

      {/* Search Input */}
      <div className="relative flex items-center select-none w-full">
        <SearchIcon className="absolute left-3 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter controls by name, tag, or category..."
          className="w-full text-[11px] font-sans text-white bg-slate-950/70 border border-white/10 rounded-xl pl-9 pr-8 py-2.5 placeholder-slate-500 focus:placeholder-slate-400 focus:outline-none focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/20 transition-all font-light"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            suppressHydrationWarning
            className="absolute right-2.5 p-1 rounded-full text-slate-500 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Main Flow Grid */}
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto pr-1.5 custom-scrollbar gap-4">
        {searchQuery ? (
          /* Search results flat-list view */
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-[8px] font-bold font-mono tracking-widest text-slate-400 uppercase select-none border-b border-white/5 pb-2">
              <span>Matching Controls</span>
              <span className="text-cyan-400 font-mono font-medium">{filtered.length} Found</span>
            </div>

            {filtered.length > 0 ? (
              <div className="flex flex-col gap-1.5">
                {filtered.map((item) => {
                  const opacitySlider = getAssociatedOpacitySlider(item.key);
                  const isChecked = store[item.key] as boolean;

                  return (
                    <div
                      key={item.key}
                      className="p-2.5 rounded-xl border border-white/5 bg-slate-950/20 hover:bg-slate-950/30 transition-colors flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[8.5px] font-bold font-mono tracking-wider text-cyan-400/70 uppercase">
                          {item.category}
                        </span>
                      </div>
                      <Toggle
                        label={item.label}
                        checked={isChecked}
                        onChange={() => store.toggleOption(item.key)}
                        description={item.description}
                      />
                      {opacitySlider && (
                        <div className="mt-1">
                          <Slider
                            label={opacitySlider.label}
                            value={store[opacitySlider.key] as number}
                            onChange={(val) => store.setOpacity(opacitySlider.key, val)}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center select-none gap-2">
                <Sliders className="w-8 h-8 text-slate-700 animate-pulse" />
                <span className="text-[10px] text-slate-400 font-medium">
                  No controls match "{searchQuery}"
                </span>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-2 text-[9px] font-bold font-mono tracking-wider text-cyan-400 hover:text-cyan-300 uppercase underline cursor-pointer"
                >
                  Clear Search Filter
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Default workspace categorized sections flow */
          <div className="flex flex-col gap-5 pb-8">
            <Profiles />
            <Recommendations />
            <Camera />
            <Objects />
            <Environment />
            <Paths />
            <Labels />
            <Analytics />
          </div>
        )}
      </div>
    </div>
  );
};

export default VisualizationContent;
