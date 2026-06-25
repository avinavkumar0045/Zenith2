"use client";

import { ParallaxProvider } from './ParallaxController';
import StarLayer from './StarLayer';
import NebulaLayer from './NebulaLayer';
import OrbitalLayer from './OrbitalLayer';
import AmbientGlow from './AmbientGlow';
import ConstellationLayer from './ConstellationLayer';

export default function SpaceBackground() {
  return (
    <ParallaxProvider>
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-[#020408]">
        {/* Deep Space Base Gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#051024_0%,_#010308_100%)] opacity-90" />
        
        {/* Layer Stack */}
        <NebulaLayer />
        <ConstellationLayer />
        <StarLayer />
        <OrbitalLayer />
        <AmbientGlow />
      </div>
    </ParallaxProvider>
  );
}
