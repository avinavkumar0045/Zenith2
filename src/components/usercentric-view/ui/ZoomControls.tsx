import React from 'react';
import { ZoomLevel } from '../UserCentricView.types';
import { CameraController } from '../services/CameraController';

interface ZoomControlsProps {
  currentFov: number;
  onPresetChange: (level: ZoomLevel) => void;
  isCollapsed?: boolean;
}

export default function ZoomControls({ currentFov, onPresetChange, isCollapsed }: ZoomControlsProps) {
  const presets: { id: ZoomLevel; label: string; desc: string; fov: number; scale: string }[] = [
    { id: 'eye', label: 'Eye', desc: 'Naked eye overview', fov: 60, scale: '1x' },
    { id: 'binocular', label: 'Binocular', desc: 'Standard 7x binoculars', fov: 8, scale: '7x' },
    { id: 'telescope', label: 'Telescope', desc: '50x visual telescope', fov: 1, scale: '50x' },
    { id: 'deepsky', label: 'Deep Sky', desc: '150x deep sky tracking', fov: 0.3, scale: '150x' }
  ];

  // Determine active preset based on closest FOV match
  const getActivePreset = (): ZoomLevel => {
    let closestPreset = presets[0].id;
    let minDiff = Infinity;
    
    presets.forEach(p => {
      const diff = Math.abs(p.fov - currentFov);
      if (diff < minDiff) {
        minDiff = diff;
        closestPreset = p.id;
      }
    });

    return closestPreset;
  };

  const activePreset = getActivePreset();

  return (
    <div 
      className="absolute right-6 top-1/2 z-20 flex flex-col items-center gap-4 bg-black/40 border border-white/10 p-3 rounded-2xl backdrop-blur-md shadow-2xl select-none transition-transform duration-500 ease-in-out"
      style={{ transform: `translate(${isCollapsed ? '160%' : '0px'}, -50%)` }}
    >
      <div className="text-[10px] font-bold text-white/40 tracking-widest uppercase">Zoom Mode</div>
      
      {/* Zoom level presets */}
      <div className="flex flex-col gap-2 w-24">
        {presets.map(p => {
          const isSelected = p.id === activePreset;
          return (
            <button
              key={p.id}
              onClick={() => onPresetChange(p.id)}
              className={`w-full py-2 px-2.5 rounded-xl border flex flex-col items-center justify-center transition-all duration-300 pointer-events-auto cursor-pointer ${
                isSelected 
                  ? 'bg-cyan-500/20 border-cyan-400/50 text-white shadow-glow' 
                  : 'bg-white/5 border-white/5 text-white/50 hover:bg-white/10 hover:text-white/80'
              }`}
            >
              <span className="text-xs font-bold tracking-wide">{p.label}</span>
              <span className={`text-[9px] font-semibold ${isSelected ? 'text-cyan-300' : 'text-white/30'}`}>
                {p.scale}
              </span>
            </button>
          );
        })}
      </div>

      {/* Vertical divider */}
      <div className="w-full h-[1px] bg-white/10" />

      {/* Raw FOV numeric display */}
      <div className="flex flex-col items-center">
        <span className="text-xs font-bold text-cyan-400">{currentFov.toFixed(1)}°</span>
        <span className="text-[8px] font-semibold text-white/40 uppercase tracking-tighter">FOV</span>
      </div>

      {/* Manual zoom slider */}
      <div className="h-28 relative flex items-center justify-center pointer-events-auto">
        <input 
          type="range"
          min="0.2"
          max="65.0"
          step="0.1"
          value={65.0 - currentFov} // Invert slider direction so slide-up zooms in
          onChange={(e) => {
            const fov = 65.0 - parseFloat(e.target.value);
            CameraController.currentFov = Math.max(0.1, fov);
            // Trigger manually
            if ((CameraController as any).onCameraChangeCallback) {
              (CameraController as any).onCameraChangeCallback();
            }
          }}
          className="accent-cyan-400 rotate-270 h-20 w-1 cursor-pointer bg-white/10 rounded-lg outline-none"
        />
      </div>

      <style jsx>{`
        .rotate-270 {
          transform: rotate(270deg);
        }
        .shadow-glow {
          box-shadow: 0 0 10px rgba(6, 182, 212, 0.4);
        }
      `}</style>
    </div>
  );
}
