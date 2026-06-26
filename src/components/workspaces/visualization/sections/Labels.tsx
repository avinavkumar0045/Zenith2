import React from 'react';
import { useVisualizationStore } from '../Visualization.types';
import { Toggle, Slider } from './Toggle';

export const Labels: React.FC = () => {
  const store = useVisualizationStore();

  const showAnyLabel = store.showPlanetLabels || store.showSatelliteLabels || store.showConstellationLabels || store.showCities || store.showCoordinates;

  return (
    <div className="flex flex-col gap-1 border-b border-slate-800/60 pb-4">
      <div className="flex items-center justify-between px-1 mb-1">
        <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Labels & Grids</span>
        <span className="text-[9px] font-mono text-slate-500">typographic annotation</span>
      </div>

      <Toggle
        label="Planet Labels"
        checked={store.showPlanetLabels}
        onChange={() => store.toggleOption('showPlanetLabels')}
        description="Show uppercase labels over planet locations."
      />
      <Toggle
        label="Satellite Labels"
        checked={store.showSatelliteLabels}
        onChange={() => store.toggleOption('showSatelliteLabels')}
        description="Display name tags and NORAD IDs for satellites."
      />
      <Toggle
        label="Constellation Labels"
        checked={store.showConstellationLabels}
        onChange={() => store.toggleOption('showConstellationLabels')}
        description="Display names of target star clusters."
      />
      <Toggle
        label="Cities & Locations"
        checked={store.showCities}
        onChange={() => store.toggleOption('showCities')}
        description="Render geocoded city markers on Earth."
      />
      <Toggle
        label="Coordinate Readouts"
        checked={store.showCoordinates}
        onChange={() => store.toggleOption('showCoordinates')}
        description="Show latitude and longitude numbers at observer coordinates."
      />
      {showAnyLabel && (
        <Slider
          label="Label"
          value={store.opacityLabels}
          onChange={(val) => store.setOpacity('opacityLabels', val)}
        />
      )}

      <Toggle
        label="Geographic Grid"
        checked={store.showGrid}
        onChange={() => store.toggleOption('showGrid')}
        description="Overlay a coordinate latitude/longitude grid."
      />
      {store.showGrid && (
        <Slider
          label="Grid"
          value={store.opacityGrid}
          onChange={(val) => store.setOpacity('opacityGrid', val)}
        />
      )}
    </div>
  );
};
