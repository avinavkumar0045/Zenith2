"use client";

import Link from 'next/link';
import { CosmicParallaxBg } from "@/components/ui/parallax-cosmic-background";

export default function Home() {
  return (
    <main className="relative w-screen h-screen overflow-hidden bg-black flex flex-col justify-center items-center">
      {/* Top-Right sleek, minimalist dashboard gateway link */}
      <div className="absolute top-6 right-8 z-30 pointer-events-auto">
        <Link 
          href="/dashboard?action=analyze" 
          className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white text-sm font-medium tracking-wide transition-all duration-300 backdrop-blur-sm"
        >
          Go to Dashboard
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Cosmic Parallax Hero Background matching the mock image exactly, with Zenith branding */}
      <CosmicParallaxBg 
        head="Zenith" 
        text="Discover, Track, Predict" 
        loop={true}
        className="absolute inset-0"
      />

      {/* Centered Go to Dashboard Button inside the Hero Section Overlay */}
      <div className="absolute z-30 bottom-24 md:bottom-28 flex flex-col items-center gap-4 pointer-events-auto">
        <Link 
          href="/dashboard?action=analyze" 
          className="group relative px-8 py-3.5 bg-blue-600/90 hover:bg-blue-500 text-white font-medium text-lg rounded-full shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all duration-300 transform hover:scale-105 border border-blue-400/20 overflow-hidden"
        >
          <span className="relative z-10 flex items-center gap-2 tracking-wide font-light">
            Go to Dashboard
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5 transform group-hover:translate-x-1 transition-transform" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
          <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-blue-500 to-indigo-600 transition-transform duration-500 ease-out z-0"></div>
        </Link>
      </div>
    </main>
  );
}
