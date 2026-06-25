"use client";

import LandingNav from '@/components/ui/LandingNav';
import { CosmicParallaxBg } from '@/components/ui/parallax-cosmic-background';
import { motion } from 'framer-motion';

const chapters = [
  { id: "intro", title: "1. Introduction" },
  { id: "dashboard", title: "2. Dashboard Overview" },
  { id: "search", title: "3. Location Search" },
  { id: "sky-report", title: "4. Unified Sky Report" },
  { id: "satellites", title: "5. Satellites Module" },
  { id: "iss", title: "6. ISS Module" },
  { id: "planets", title: "7. Planet Observation" },
  { id: "constellations", title: "8. Constellations" },
  { id: "guidance", title: "9. Observer Guidance" },
  { id: "workflow", title: "10. Navigation Workflow" },
  { id: "responsive", title: "11. Responsive Experience" },
  { id: "roadmap", title: "12. Future Roadmap" }
];

// Reusable Image Placeholder Component
const DocImage = ({ title, desc }: { title: string, desc: string }) => (
  <figure className="my-8 rounded-xl overflow-hidden border border-white/10 bg-black/40 backdrop-blur-md shadow-2xl">
    <div className="aspect-video w-full flex flex-col items-center justify-center bg-blue-900/10 border-b border-white/5 relative overflow-hidden group">
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[gradient_3s_linear_infinite]" />
      <div className="w-16 h-16 rounded-full border border-blue-500/30 flex items-center justify-center mb-4 text-blue-400 bg-blue-500/10">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
      <p className="text-gray-400 font-medium tracking-widest uppercase text-sm">[ {title} Screenshot ]</p>
    </div>
    <figcaption className="p-4 text-sm text-gray-400 border-t border-white/5 bg-white/5">
      {desc}
    </figcaption>
  </figure>
);

export default function DocsPage() {
  return (
    <main className="relative min-h-screen bg-transparent text-gray-300 selection:bg-blue-500/30 overflow-x-hidden">
      <LandingNav />
      
      {/* Cosmic Parallax Background */}
      <CosmicParallaxBg 
        head="" 
        text="" 
        loop={true}
        className="fixed inset-0 z-0 pointer-events-none"
      />

      <div className="relative z-10 pt-24 max-w-screen-2xl mx-auto flex flex-col md:flex-row">
        
        {/* Sidebar Navigation */}
        <aside className="w-full md:w-64 lg:w-80 flex-shrink-0 border-r border-white/10 hidden md:block bg-black/20 backdrop-blur-sm">
          <div className="sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto px-6 pb-20 custom-scrollbar">
            <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-6 mt-4">Contents</h3>
            <nav className="space-y-1">
              {chapters.map(chapter => (
                <a 
                  key={chapter.id} 
                  href={`#${chapter.id}`}
                  className="block py-2 px-3 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  {chapter.title}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <article className="flex-1 px-6 md:px-12 lg:px-24 py-12 max-w-4xl font-sans pb-40 bg-black/40 backdrop-blur-md rounded-2xl mx-4 md:mx-12 my-8 border border-white/10 shadow-2xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">User Manual</h1>
            <p className="text-xl text-blue-300/80 font-light mb-16">The complete guide to Project Zenith's Space Situational Awareness platform.</p>

            {/* 1. Intro */}
            <section id="intro" className="mb-20 scroll-mt-24">
              <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-4 mb-6">1. Introduction</h2>
              <p className="mb-4 leading-relaxed text-gray-400">
                Project Zenith is an advanced Space Situational Awareness (SSA) platform designed for real-time celestial and orbital tracking. 
                Whether you are an amateur astronomer, an educator, or a mission operator, Zenith consolidates massive amounts of astronomical 
                data—satellites, planets, constellations, and the ISS—into a single unified 3D platform.
              </p>
              <p className="leading-relaxed text-gray-400">
                The platform intelligently correlates weather, time, and positioning to deliver a unified "Observation Score" 
                for any location on Earth, telling you exactly when to look up and what you will see.
              </p>
            </section>

            {/* 2. Dashboard Overview */}
            <section id="dashboard" className="mb-20 scroll-mt-24">
              <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-4 mb-6">2. Dashboard Overview</h2>
              <p className="mb-4 leading-relaxed text-gray-400">
                The Zenith Dashboard is engineered for rapid intelligence gathering without clutter. The interface relies on dynamic panels over a highly performant CesiumJS 3D globe.
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-400 mb-8">
                <li><strong>Globe:</strong> The central 3D visualization engine.</li>
                <li><strong>Location Search:</strong> Positioned top-left for instant relocation.</li>
                <li><strong>Unified Sky Report:</strong> The primary intelligence panel on the left.</li>
                <li><strong>Control Center:</strong> The modular stack of specialized tracking tools on the right.</li>
              </ul>
              <DocImage 
                title="Full Dashboard Layout" 
                desc="Annotated view showing the Unified Sky Report on the left and the Control Center panels on the right." 
              />
            </section>

            {/* 3. Location Search */}
            <section id="search" className="mb-20 scroll-mt-24">
              <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-4 mb-6">3. Location Search</h2>
              <p className="mb-4 leading-relaxed text-gray-400">
                To begin, enter a city, coordinate, or famous observatory into the top-left Search Panel. Upon selection, the globe smoothly flies to the location. 
                Crucially, the entire intelligence engine recomputes instantly for that specific coordinate.
              </p>
              <DocImage 
                title="Search Panel" 
                desc="The Search Panel actively querying geocoding APIs and instantly flying the Cesium camera." 
              />
            </section>

            {/* 4. Unified Sky Report */}
            <section id="sky-report" className="mb-20 scroll-mt-24">
              <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-4 mb-6">4. Unified Sky Report</h2>
              <p className="mb-4 leading-relaxed text-gray-400">
                The Unified Sky Report is Zenith's core innovation. Instead of giving you raw data, it processes astronomy algorithms to produce an actionable report.
              </p>
              <ul className="space-y-4 text-gray-400">
                <li><strong className="text-white">Observation Quality:</strong> A 0-100 score analyzing light pollution, moon phase, and target altitudes.</li>
                <li><strong className="text-white">Environment & Forecast:</strong> Integrates weather conditions to warn you of cloud cover or degraded visibility.</li>
                <li><strong className="text-white">Best Target:</strong> Highlights the single most spectacular object visible right now.</li>
              </ul>
              <DocImage 
                title="Unified Sky Report" 
                desc="The left-hand panel showing an Observation Quality of 85% with an optimal target highlighted." 
              />
            </section>

            {/* 5. Satellites */}
            <section id="satellites" className="mb-20 scroll-mt-24">
              <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-4 mb-6">5. Satellites Module</h2>
              <p className="mb-4 leading-relaxed text-gray-400">
                Located in the Control Center, the Satellites module tracks over a dozen high-visibility satellites (e.g., Hubble, NOAA, Starlink). 
                It calculates exactly which satellites are currently passing overhead and displays their altitude and azimuth.
              </p>
              <DocImage 
                title="Satellite Control Center" 
                desc="Active satellite tracking panel showing real-time elevation angles." 
              />
            </section>

            {/* 6. ISS */}
            <section id="iss" className="mb-20 scroll-mt-24">
              <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-4 mb-6">6. ISS Module</h2>
              <p className="mb-4 leading-relaxed text-gray-400">
                The International Space Station requires dedicated tracking due to its high speed and observer interest. This module predicts the next flyover time based on your selected location and counts down to visibility.
              </p>
              <DocImage 
                title="ISS Tracker" 
                desc="ISS countdown timer and current orbital coordinates." 
              />
            </section>

            {/* 7. Planets */}
            <section id="planets" className="mb-20 scroll-mt-24">
              <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-4 mb-6">7. Planet Observation</h2>
              <p className="mb-4 leading-relaxed text-gray-400">
                Planets are calculated in real-time. The system intelligently grays out planets that are "Below Horizon" and highlights those currently visible, saving you from setting up a telescope for a planet that has already set.
              </p>
              <DocImage 
                title="Planet Panels" 
                desc="Mars and Jupiter shown Above Horizon, while Saturn is dimmed Below Horizon." 
              />
            </section>

            {/* 8. Constellations */}
            <section id="constellations" className="mb-20 scroll-mt-24">
              <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-4 mb-6">8. Constellations</h2>
              <p className="mb-4 leading-relaxed text-gray-400">
                Wondering what those stars form? Zenith computes which major constellations are currently near the zenith (straight up) from your location, aiding naked-eye observers.
              </p>
            </section>

            {/* 9. Observer Guidance */}
            <section id="guidance" className="mb-20 scroll-mt-24">
              <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-4 mb-6">9. Observer Guidance</h2>
              <p className="mb-4 leading-relaxed text-gray-400">
                Synthesizing all previous data, the Observer Guidance provides clear, human-readable instructions. For example: "Grab binoculars and look East at 45° to catch Jupiter before the clouds roll in at 22:00."
              </p>
            </section>

            {/* 10. Navigation Workflow */}
            <section id="workflow" className="mb-20 scroll-mt-24">
              <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-4 mb-6">10. Navigation Workflow</h2>
              <div className="flex flex-col items-center justify-center space-y-4 my-10 p-10 border border-white/10 rounded-2xl bg-white/5">
                <div className="px-6 py-3 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">1. Search Location</div>
                <div className="w-px h-6 bg-white/20" />
                <div className="px-6 py-3 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">2. Engines Compute</div>
                <div className="w-px h-6 bg-white/20" />
                <div className="px-6 py-3 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">3. Forecast Sync</div>
                <div className="w-px h-6 bg-white/20" />
                <div className="px-6 py-3 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">4. Recommendations</div>
                <div className="w-px h-6 bg-white/20" />
                <div className="px-6 py-3 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">5. Observation</div>
              </div>
            </section>

            {/* 11. Responsive Experience */}
            <section id="responsive" className="mb-20 scroll-mt-24">
              <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-4 mb-6">11. Responsive Experience</h2>
              <p className="mb-4 leading-relaxed text-gray-400">
                Zenith is built as a truly adaptive application. On desktop, it acts as a command center. On mobile, the interface seamlessly reorganizes into an interactive bottom-sheet architecture, keeping the globe visible while making panels easily accessible via touch.
              </p>
            </section>

            {/* 12. Future Roadmap */}
            <section id="roadmap" className="mb-20 scroll-mt-24">
              <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-4 mb-6">12. Future Roadmap</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-400">
                <li>Integration with telescope motorized mounts.</li>
                <li>Deep-sky object (DSO) catalog integration.</li>
                <li>Augmented Reality (AR) mobile overlay.</li>
              </ul>
            </section>

          </motion.div>
        </article>
      </div>
    </main>
  );
}
