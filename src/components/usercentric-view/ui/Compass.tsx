import React, { useEffect, useState, useRef } from 'react';
import { CameraController } from '../services/CameraController';

interface CompassProps {
  headingDegrees: number;
}

export default function Compass({ headingDegrees }: CompassProps) {
  const directions = [
    { label: 'N', deg: 0 },
    { label: 'NE', deg: 45 },
    { label: 'E', deg: 90 },
    { label: 'SE', deg: 135 },
    { label: 'S', deg: 180 },
    { label: 'SW', deg: 225 },
    { label: 'W', deg: 270 },
    { label: 'NW', deg: 315 },
    { label: 'N', deg: 360 }
  ];

  // We want to draw a horizontal ruler centered on headingDegrees
  // A scale of 360 degrees, where each degree is 2 pixels wide.
  // The viewport of the ruler shows about 180px, so 90 degrees.
  const rulerRef = useRef<HTMLDivElement>(null);

  // Get display text for current heading
  const getHeadingLabel = (h: number) => {
    const val = Math.round(h) % 360;
    if (val >= 338.5 || val < 22.5) return 'North';
    if (val >= 22.5 && val < 67.5) return 'Northeast';
    if (val >= 67.5 && val < 112.5) return 'East';
    if (val >= 112.5 && val < 157.5) return 'Southeast';
    if (val >= 157.5 && val < 202.5) return 'South';
    if (val >= 202.5 && val < 247.5) return 'Southwest';
    if (val >= 247.5 && val < 292.5) return 'West';
    return 'Northwest';
  };

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center select-none pointer-events-none">
      {/* Current heading numeric display */}
      <div className="px-3 py-1 rounded-full border border-white/10 bg-black/60 backdrop-blur-md text-white/90 text-xs font-semibold tracking-wider flex items-center gap-1.5 shadow-lg mb-2">
        <span className="text-cyan-400 font-bold">{Math.round(headingDegrees)}°</span>
        <span className="text-white/50">|</span>
        <span>{getHeadingLabel(headingDegrees).toUpperCase()}</span>
      </div>

      {/* Sliding Compass strip */}
      <div className="w-80 h-10 relative overflow-hidden flex items-center justify-center border-b border-white/10 mask-fade-horizontal bg-gradient-to-t from-black/40 to-transparent">
        {/* Center alignment tick */}
        <div className="absolute top-0 bottom-0 w-0.5 bg-cyan-400 z-10 shadow-glow" />

        {/* Sliding strip container */}
        <div 
          ref={rulerRef}
          className="absolute flex items-end h-full transition-transform duration-75 ease-out"
          style={{
            transform: `translateX(${-headingDegrees * 2.5}px)`, // 2.5px per degree
            width: `${360 * 2.5}px`
          }}
        >
          {/* Create ticks at 5 degree intervals */}
          {Array.from({ length: 73 }).map((_, i) => {
            const deg = i * 5;
            const isMajor = deg % 30 === 0;
            const dir = directions.find(d => d.deg === deg);

            return (
              <div 
                key={deg} 
                className="absolute bottom-0 flex flex-col items-center justify-end"
                style={{ 
                  left: `${deg * 2.5}px`,
                  transform: 'translateX(-50%)'
                }}
              >
                {dir ? (
                  <span className="text-[10px] font-extrabold text-white tracking-tighter mb-1.5">
                    {dir.label}
                  </span>
                ) : isMajor ? (
                  <span className="text-[8px] font-medium text-white/40 mb-1.5">
                    {deg}
                  </span>
                ) : null}
                
                <div 
                  className={`w-0.5 rounded-full ${
                    dir ? 'h-3 bg-cyan-400/80' : isMajor ? 'h-2 bg-white/30' : 'h-1 bg-white/10'
                  }`} 
                />
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Visual styling for fading edges */}
      <style jsx>{`
        .mask-fade-horizontal {
          mask-image: linear-gradient(to right, transparent, white 20%, white 80%, transparent);
          -webkit-mask-image: linear-gradient(to right, transparent, white 20%, white 80%, transparent);
        }
        .shadow-glow {
          box-shadow: 0 0 8px rgba(34, 211, 238, 0.8);
        }
      `}</style>
    </div>
  );
}
