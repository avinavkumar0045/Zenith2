import React from 'react';
import { useVisualizationStore } from '../Visualization.types';
import { Toggle, Slider } from './Toggle';

export const Environment: React.FC = () => {
  const store = useVisualizationStore();

  return (
    <div className="flex flex-col gap-1 border-b border-slate-800/60 pb-4">
      <div className="flex items-center justify-between px-1 mb-1">
        <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Atmosphere & Environment</span>
        <span className="text-[9px] font-mono text-slate-500">lighting and physics</span>
      </div>

      <Toggle
        label="Day/Night Shadows"
        checked={store.showDayNight}
        onChange={() => store.toggleOption('showDayNight')}
        description="Enable real-time solar terminator shadows on the globe."
      />
      
      <Toggle
        label="Atmospheric Glow"
        checked={store.showAtmosphere}
        onChange={() => store.toggleOption('showAtmosphere')}
        description="Render the light-scattering halo layer of the Earth."
      />
      {store.showAtmosphere && (
        <Slider
          label="Atmosphere"
          value={store.opacityAtmosphere}
          onChange={(val) => store.setOpacity('opacityAtmosphere', val)}
        />
      )}

      <Toggle
        label="Clouds Simulation"
        checked={store.showClouds}
        onChange={() => store.toggleOption('showClouds')}
        description="Display translucent weather cloud coverage overlays."
      />
      {store.showClouds && (
        <Slider
          label="Clouds"
          value={store.opacityClouds}
          onChange={(val) => store.setOpacity('opacityClouds', val)}
        />
      )}

      <Toggle
        label="Weather Systems"
        checked={store.showWeather}
        onChange={() => store.toggleOption('showWeather')}
        description="Render local precipitation and wind vector data."
      />
      <Toggle
        label="Stars Backdrop"
        checked={store.showStars}
        onChange={() => store.toggleOption('showStars')}
        description="Show dynamic background star map on the celestial vault."
      />
      <Toggle
        label="Milky Way Galaxy"
        checked={store.showMilkyWay}
        onChange={() => store.toggleOption('showMilkyWay')}
        description="Render the core band of the Milky Way."
      />
      <Toggle
        label="Light Pollution Overlay"
        checked={store.showLightPollution}
        onChange={() => store.toggleOption('showLightPollution')}
        description="Glow-render regional city skyglow zones (Bortle index)."
      />
    </div>
  );
};
