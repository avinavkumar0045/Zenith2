"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import LandingNav from '@/components/ui/LandingNav';
import { ChevronRight, Globe2, Sparkles, Navigation, Radar, Compass, CloudLightning, CircleDot, Radio } from 'lucide-react';
import clsx from 'clsx';
import { StaticCosmicBackground } from '@/components/ui/StaticCosmicBackground';

export default function LandingPage() {
  return (
    <main className="relative min-h-screen bg-transparent overflow-x-hidden text-white selection:bg-blue-500/30">
      <LandingNav />
      
      {/* Static CSS Space Background */}
      <StaticCosmicBackground />

      <div className="relative z-10">
        {/* HERO SECTION */}
        <section className="relative min-h-[100svh] flex flex-col items-center justify-center px-4 pt-20 text-center overflow-hidden">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative z-10 flex flex-col items-center max-w-4xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-sm mb-8 backdrop-blur-md">
              <Sparkles className="w-4 h-4" />
              <span>Real-Time Celestial Intelligence</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-[0.2em] mb-6 bg-gradient-to-br from-white via-blue-100 to-blue-900 bg-clip-text text-transparent">
              ZENITH
            </h1>
            
            <p className="text-lg md:text-2xl text-gray-400 mb-12 max-w-2xl font-light tracking-[0.3em] uppercase">
              Observe • Understand • Anticipate Space
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-center w-full sm:w-auto">
              <Link 
                href="/dashboard"
                className="w-full sm:w-auto px-8 py-4 bg-white text-black hover:bg-gray-200 rounded-full font-bold transition-all duration-200 ease-out shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_50px_rgba(255,255,255,0.4)] hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
              >
                Launch Dashboard <ChevronRight className="w-5 h-5" />
              </Link>
              <Link 
                href="/docs"
                className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 rounded-full font-medium text-white transition-all duration-200 ease-out backdrop-blur-md hover:-translate-y-1 active:scale-95 text-center shadow-[0_0_20px_rgba(255,255,255,0)] hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              >
                Documentation
              </Link>
            </div>
          </motion.div>
        </section>

        {/* SECTION 1: WHAT IS ZENITH */}
        <section className="py-32 px-6 max-w-6xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Unprecedented Orbital Visibility</h2>
            <p className="text-xl text-gray-400 leading-relaxed">
              Zenith brings satellite tracking, celestial positioning, space weather intelligence, and observation planning into a single unified 3D platform. Engineered for astronomy, education, and Space Situational Awareness.
            </p>
          </motion.div>
        </section>

        {/* SECTION 2: CAPABILITIES */}
        <section className="py-20 px-6 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Radar />, title: 'Satellite Tracking', desc: 'Real-time positioning and pass predictions for orbital assets.' },
              { icon: <Navigation />, title: 'ISS Monitoring', desc: 'Predict passes and observe the International Space Station.' },
              { icon: <CircleDot />, title: 'Planet Observation', desc: 'Track planetary ascensions and visibility scoring.' },
              { icon: <Sparkles />, title: 'Constellations', desc: 'Identify star patterns currently transiting the zenith.' },
              { icon: <Globe2 />, title: 'Unified Sky Intelligence', desc: 'Comprehensive correlation of all visible celestial bodies.' },
              { icon: <Compass />, title: 'Observer Guidance', desc: 'Step-by-step navigation for ground-based observation.' },
              { icon: <Radio />, title: 'Predictive Opportunities', desc: 'Forecast engine evaluating upcoming optimal viewing windows.' },
              { icon: <CloudLightning />, title: 'Weather Intelligence', desc: 'Atmospheric degradation models modifying observation scores.' }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white/5 border border-white/10 rounded-3xl p-6 backdrop-blur-md hover:bg-white/10 hover:backdrop-blur-xl hover:border-blue-500/40 hover:-translate-y-2 hover:shadow-[0_10px_40px_rgba(59,130,246,0.15)] transition-all duration-300 ease-out group"
              >
                <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-sm text-gray-400 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* SECTION 3: WORKFLOW */}
        <section className="py-32 px-6">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left relative">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-y-1/2 z-0" />
            
            {['Location Input', 'Engines Compute', 'Forecast Sync', 'Dashboard Render'].map((step, i) => (
              <div key={i} className="relative z-10 flex flex-col items-center bg-black/50 p-4 rounded-xl backdrop-blur-sm border border-white/5">
                <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold mb-3">
                  {i + 1}
                </div>
                <span className="font-medium text-sm text-gray-300">{step}</span>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 4: TECH STACK */}
        <section className="py-20 px-6 max-w-5xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-10 text-gray-300 tracking-widest uppercase">Engineered With</h2>
          <div className="flex flex-wrap justify-center gap-4">
            {['Next.js', 'React', 'TypeScript', 'CesiumJS', 'Tailwind CSS', 'Framer Motion', 'Zustand'].map(tech => (
              <span key={tech} className="px-6 py-3 rounded-full bg-white/5 border border-white/10 text-gray-300 font-medium backdrop-blur-md">
                {tech}
              </span>
            ))}
          </div>
        </section>

        {/* SECTION 5: CTA */}
        <section className="py-32 px-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto bg-gradient-to-b from-blue-900/20 to-transparent border border-blue-500/20 rounded-[3rem] p-12 md:p-24 text-center backdrop-blur-xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-blue-500/5 blur-[100px]" />
            <h2 className="text-4xl md:text-6xl font-bold mb-6 relative z-10">Ready to Explore the Sky?</h2>
            <p className="text-xl text-blue-200/60 mb-10 max-w-2xl mx-auto relative z-10">
              Launch the live dashboard to access real-time orbit tracking, SSA intelligence, and celestial calculations.
            </p>
            <Link 
              href="/dashboard"
              className="inline-flex relative z-10 px-10 py-5 bg-white text-black hover:bg-gray-200 rounded-full font-bold text-lg transition-all shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:shadow-[0_0_60px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95 items-center justify-center gap-3"
            >
              Initialize Dashboard <ChevronRight className="w-6 h-6" />
            </Link>
          </motion.div>
        </section>

        {/* FOOTER */}
        <footer className="py-10 text-center border-t border-white/10 text-gray-500 text-sm backdrop-blur-md bg-black/50">
          <p>© {new Date().getFullYear()} Zenith. Engineered for deep space situational awareness.</p>
        </footer>
      </div>
    </main>
  );
}
