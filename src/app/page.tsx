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
    </main>
  );
}
