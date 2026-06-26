import React from 'react';
import { useVisualizationStore } from '../Visualization.types';
import { Toggle } from './Toggle';

export const Objects: React.FC = () => {
  const store = useVisualizationStore();

  return (
    <div className="flex flex-col gap-1 border-b border-slate-800/60 pb-4">
      <div className="flex items-center justify-between px-1 mb-1">
        <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Celestial Objects</span>
        <span className="text-[9px] font-mono text-slate-500">primary entities</span>
      </div>

      <Toggle
        label="Planets"
        checked={store.showPlanets}
        onChange={() => store.toggleOption('showPlanets')}
        description="Render solar system planets on their sub-planet coordinates."
      />
      <Toggle
        label="Moon"
        checked={store.showMoon}
        onChange={() => store.toggleOption('showMoon')}
        description="Display sub-lunar overhead point and orbit status."
      />
      <Toggle
        label="ISS Tracker"
        checked={store.showISS}
        onChange={() => store.toggleOption('showISS')}
        description="Show International Space Station position beacon."
      />
      <Toggle
        label="Active Satellites"
        checked={store.showSatellites}
        onChange={() => store.toggleOption('showSatellites')}
        description="Show communication, weather, and science payloads."
      />
      <Toggle
        label="Space Stations"
        checked={store.showSpaceStations}
        onChange={() => store.toggleOption('showSpaceStations')}
        description="Render alternate active stations (e.g. Tiangong)."
      />
      <Toggle
        label="Constellations"
        checked={store.showConstellations}
        onChange={() => store.toggleOption('showConstellations')}
        description="Toggle constellation boundaries and alignments."
      />
      <Toggle
        label="Deep Sky Objects"
        checked={store.showDeepSky}
        onChange={() => store.toggleOption('showDeepSky')}
        description="Display Messier catalog coordinates and nebulas."
      />
    </div>
  );
};
