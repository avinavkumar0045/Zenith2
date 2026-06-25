"use client";

import LandingNav from '@/components/ui/LandingNav';
import SpaceBackground from '@/components/landing/background/SpaceBackground';
import { motion } from 'framer-motion';

export default function DocsPage() {
  const sections = [
    'Introduction',
    'Dashboard Overview',
    'Location Search',
    'Observer Guidance',
    'Satellites',
    'ISS',
    'Planets',
    'Constellations',
    'Unified Sky Report',
    'SSA Intelligence',
    'Forecast Engine',
    'Opportunity Engine',
    'Responsive Controls',
    'Future Roadmap'
  ];

  return (
    <main className="relative min-h-screen bg-transparent text-white">
      <LandingNav />
      <SpaceBackground />
      
      <div className="relative z-10 pt-24 flex flex-col md:flex-row h-screen">
        {/* Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0 border-r border-white/10 bg-black/50 overflow-y-auto hidden md:block">
          <div className="p-6">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6">User Manual</h3>
            <ul className="space-y-2">
              {sections.map(section => (
                <li key={section}>
                  <button className="text-sm text-gray-400 hover:text-white transition-colors w-full text-left py-1.5 px-3 rounded-lg hover:bg-white/5">
                    {section}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 md:p-12 lg:p-20">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-sm mb-6">
              Documentation
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Introduction</h1>
            <p className="text-lg text-gray-400 leading-relaxed mb-8">
              Welcome to the Project Zenith Documentation. This manual provides comprehensive guidance on utilizing the Space Situational Awareness platform, interpreting celestial intelligence, and maximizing the observation prediction engines.
            </p>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8 backdrop-blur-sm">
              <h2 className="text-2xl font-bold mb-4">Getting Started</h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                To begin using Zenith, simply launch the dashboard and enter your location. The intelligence engines will automatically synchronize and begin processing real-time orbital and celestial data above your coordinates.
              </p>
              <p className="text-gray-500 text-sm italic">
                (Note: Complete documentation content will be populated in future phases.)
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
