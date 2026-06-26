import React from 'react';

export function StaticCosmicBackground() {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none bg-gradient-to-b from-[#040814] via-[#0a1128] to-[#040814] overflow-hidden">
      {/* Soft radial blue glow behind the title (top center) */}
      <div className="absolute top-[30%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/10 rounded-full blur-[120px]" />
      
      {/* Static Stars via CSS repeating radial gradients */}
      <div className="absolute inset-0 css-stars opacity-60 animate-twinkle-slow" />
      <div className="absolute inset-0 css-stars-2 opacity-40 animate-twinkle" />
      
      {/* Subtle background vignette for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />
    </div>
  );
}
