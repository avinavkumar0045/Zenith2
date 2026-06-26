import React from 'react';
import { useVisualizationStore } from '../Visualization.types';
import { Toggle } from './Toggle';

export const Analytics: React.FC = () => {
  const store = useVisualizationStore();

  return (
    <div className="flex flex-col gap-1 border-b border-slate-800/60 pb-4">
      <div className="flex items-center justify-between px-1 mb-1">
        <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase">Scientific Analytics</span>
        <span className="text-[9px] font-mono text-slate-500">observation statistics</span>
      </div>

      <Toggle
        label="Observation Windows"
        checked={store.showObservationWindows}
        onChange={() => store.toggleOption('showObservationWindows')}
        description="Calculate and overlay clear sky stargazing window ranges."
      />
      <Toggle
        label="Sky Score details"
        checked={store.showObservationScore}
        onChange={() => store.toggleOption('showObservationScore')}
        description="Display relative visibility scores for visible bodies."
      />
      <Toggle
        label="Best Target Spotlight"
        checked={store.showBestTarget}
        onChange={() => store.toggleOption('showBestTarget')}
        description="Glow-highlight the top recommended target tonight."
      />
      <Toggle
        label="Altitude Markings"
        checked={store.showAltitudeLines}
        onChange={() => store.toggleOption('showAltitudeLines')}
        description="Overlay local altitude angle elevation circles."
      />
      <Toggle
        label="Azimuth Markings"
        checked={store.showAzimuthLines}
        onChange={() => store.toggleOption('showAzimuthLines')}
        description="Overlay compass bearing azimuth degree segments."
      />
      <Toggle
        label="Direction Guides"
        checked={store.showDirectionGuides}
        onChange={() => store.toggleOption('showDirectionGuides')}
        description="Draw cardinal directions axis lines (N, S, E, W)."
      />
    </div>
  );
};
