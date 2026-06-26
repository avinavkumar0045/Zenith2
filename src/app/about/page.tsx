"use client";

import LandingNav from '@/components/ui/LandingNav';
import { StaticCosmicBackground } from '@/components/ui/StaticCosmicBackground';
import { motion } from 'framer-motion';

export default function AboutPage() {
  return (
    <main className="relative min-h-screen bg-transparent text-white">
      <LandingNav />
      <StaticCosmicBackground />
      
      <div className="relative z-10 pt-32 pb-20 px-6 max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-sm mb-6">
            About The Project
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-12 bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">
            Zenith
          </h1>

          <div className="space-y-12">
            <section>
              <h2 className="text-2xl font-bold mb-4">Overview</h2>
              <p className="text-gray-400 leading-relaxed text-lg">
                Zenith is an advanced Space Situational Awareness (SSA) and celestial intelligence platform. Designed to bridge the gap between complex astronomical computations and intuitive user interfaces, Zenith allows users to understand exactly what exists in the sky above them at any given moment.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Mission</h2>
              <p className="text-gray-400 leading-relaxed text-lg">
                To provide a unified, accessible, and highly accurate visualization of the Earth's orbital and celestial environment. By synthesizing data from satellite tracking, lunar physics, planetary observation, and real-time space weather, Zenith empowers educators, astronomers, and space enthusiasts with professional-grade intelligence.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-6">Architecture & Technology</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { title: 'Frontend Framework', desc: 'Next.js & React 18' },
                  { title: '3D Visualization', desc: 'CesiumJS WebGL Engine' },
                  { title: 'State Management', desc: 'Zustand Reactive Stores' },
                  { title: 'Styling', desc: 'Tailwind CSS & Framer Motion' },
                  { title: 'Orbital Math', desc: 'SGP4 Satellite Propagation' },
                  { title: 'Celestial Math', desc: 'Astronomical Algorithms' }
                ].map(item => (
                  <div key={item.title} className="bg-white/5 border border-white/10 rounded-xl p-5">
                    <h3 className="font-bold text-white mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-400">{item.desc}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">Future Roadmap</h2>
              <ul className="list-disc list-inside text-gray-400 space-y-2 leading-relaxed text-lg">
                <li>Integration of comprehensive Space Weather APIs.</li>
                <li>Real-time astronomical News Module.</li>
                <li>Enhanced deep-space object catalogs (Messier, NGC).</li>
                <li>Mobile-native augmented reality (AR) sky views.</li>
              </ul>
            </section>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
