import React from 'react';
import { useObserverGuidanceStore } from '../store/useObserverGuidanceStore';

export default function SkyDomeVisualizer() {
  const { report } = useObserverGuidanceStore();

  if (!report || report.skyDomeObjects.length === 0) {
    return (
      <div className="w-full h-48 bg-black/40 rounded-lg border border-white/10 flex items-center justify-center">
        <p className="text-xs text-gray-500">No objects currently visible overhead</p>
      </div>
    );
  }

  // SVG parameters
  const size = 300;
  const center = size / 2;
  const maxRadius = (size / 2) - 20; // Padding

  // Concentric altitude rings (0, 30, 60, 90)
  const rings = [
    { alt: 0, r: maxRadius },
    { alt: 30, r: maxRadius * (60 / 90) },
    { alt: 60, r: maxRadius * (30 / 90) }
  ];

  return (
    <div className="w-full aspect-square bg-black/40 rounded-lg border border-white/10 flex items-center justify-center overflow-hidden relative p-4">
      <svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} className="overflow-visible">
        
        {/* Sky Background */}
        <circle cx={center} cy={center} r={maxRadius} fill="rgba(30,27,75, 0.4)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
        
        {/* Altitude Rings */}
        {rings.map((ring, idx) => (
          <circle key={idx} cx={center} cy={center} r={ring.r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="4 4" />
        ))}

        {/* Crosshairs */}
        <line x1={center} y1={center - maxRadius} x2={center} y2={center + maxRadius} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        <line x1={center - maxRadius} y1={center} x2={center + maxRadius} y2={center} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

        {/* Cardinal Directions */}
        <text x={center} y={center - maxRadius - 5} fill="rgba(255,255,255,0.5)" fontSize="10" textAnchor="middle">N</text>
        <text x={center} y={center + maxRadius + 12} fill="rgba(255,255,255,0.5)" fontSize="10" textAnchor="middle">S</text>
        <text x={center + maxRadius + 8} y={center + 3} fill="rgba(255,255,255,0.5)" fontSize="10" textAnchor="start">E</text>
        <text x={center - maxRadius - 8} y={center + 3} fill="rgba(255,255,255,0.5)" fontSize="10" textAnchor="end">W</text>

        {/* Objects */}
        {report.skyDomeObjects.map((obj) => {
          // r = distance from zenith (center)
          // altitude 90 = r 0 (center)
          // altitude 0 = r maxRadius (edge)
          const r = ((90 - obj.altitude) / 90) * maxRadius;
          
          // Azimuth 0 = North (top). SVG top is -Y.
          // Convert azimuth to radians (subtract 90 to align 0 with North)
          const rad = (obj.azimuth - 90) * (Math.PI / 180);
          
          const x = center + (r * Math.cos(rad));
          const y = center + (r * Math.sin(rad));

          const isBest = obj.isBestTarget;
          
          // Colors
          let color = '#fff';
          if (obj.type === 'Moon') color = '#e2e8f0';
          if (obj.type === 'Planet') color = '#fbbf24';
          if (obj.type === 'ISS') color = '#4ade80';
          if (obj.type === 'Constellation') color = '#c084fc';

          return (
            <g key={obj.id} transform={`translate(${x}, ${y})`}>
              {isBest && (
                <>
                  <circle r={8} fill="none" stroke={color} strokeWidth="1" strokeDasharray="2 2" className="animate-spin-slow" />
                  <circle r={12} fill={color} fillOpacity="0.1" />
                </>
              )}
              <circle r={isBest ? 4 : 2} fill={color} />
              {isBest && (
                <text y={-10} fill="white" fontSize="9" fontWeight="bold" textAnchor="middle" className="drop-shadow-md">
                  {obj.name}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
