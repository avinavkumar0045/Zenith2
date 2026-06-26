import React from 'react';
import { useVisualizationStore } from '../Visualization.types';
import { Toggle, Slider } from './Toggle';

export const Paths: React.FC = () => {
  const store = useVisualizationStore();

  const showAnyPath = store.showGroundTracks || store.showFutureOrbits || store.showPastOrbits;

  return (
    <div className="flex flex-col gap-1 border-b border-slate-800/60 pb-4">
      <div className="flex items-center justify-between px-1 mb-1">
        <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Orbits & Paths</span>
        <span className="text-[9px] font-mono text-slate-500">spatial vectors</span>
      </div>

      <Toggle
        label="Ground Tracks"
        checked={store.showGroundTracks}
        onChange={() => store.toggleOption('showGroundTracks')}
        description="Project orbital path lines onto the Earth's surface."
      />
      <Toggle
        label="Future Orbits"
        checked={store.showFutureOrbits}
        onChange={() => store.toggleOption('showFutureOrbits')}
        description="Render 3D forward-propagated orbits in space."
      />
      <Toggle
        label="Past Orbits"
        checked={store.showPastOrbits}
        onChange={() => store.toggleOption('showPastOrbits')}
        description="Render 3D historical decay orbit lines."
      />
      {showAnyPath && (
        <Slider
          label="Ground Track / Orbit"
          value={store.opacityGroundTracks}
          onChange={(val) => store.setOpacity('opacityGroundTracks', val)}
        />
      )}

      <Toggle
        label="Visibility Cones"
        checked={store.showVisibilityCones}
        onChange={() => store.toggleOption('showVisibilityCones')}
        description="Display sensor coverage cones from the satellite body."
      />
      <Toggle
        label="Observer Horizon Range"
        checked={store.showObserverHorizon}
        onChange={() => store.toggleOption('showObserverHorizon')}
        description="Draw a circle representing local observer horizon constraints."
      />
    </div>
  );
};
