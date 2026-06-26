"use client";

import LandingNav from '@/components/ui/LandingNav';
import { StaticCosmicBackground } from '@/components/ui/StaticCosmicBackground';
import { motion } from 'framer-motion';

const chapters = [
  { id: "intro", title: "1. Introduction" },
  { id: "dashboard", title: "2. Dashboard Overview" },
  { id: "search", title: "3. Location Search" },
  { id: "tracking-satellite", title: "4. Tracking a Satellite" },
  { id: "sky-report", title: "5. Unified Sky Report" },
  { id: "iss", title: "6. ISS Module" },
  { id: "planets", title: "7. Planet Observation" },
  { id: "constellations", title: "8. Constellations" },
  { id: "guidance", title: "9. Observer Guidance" },
  { id: "workflow", title: "10. Navigation Workflow" },
  { id: "responsive", title: "11. Responsive Experience" },
  { id: "roadmap", title: "12. Future Roadmap" }
];

// Responsive Image Component for Documentation
const DocImage = ({ src, alt, desc }: { src: string, alt: string, desc: string }) => (
  <figure className="my-8 rounded-xl overflow-hidden border border-white/10 bg-black/40 backdrop-blur-md shadow-2xl">
    <div className="relative w-full border-b border-white/5 bg-black/50">
      <img src={src} alt={alt} className="w-full h-auto object-contain max-h-[70vh] mx-auto" />
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
      <StaticCosmicBackground />

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
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">Zenith User Manual</h1>
            <p className="text-xl text-blue-300/80 font-light mb-16">The definitive guide to understanding and operating the Space Situational Awareness platform.</p>

            {/* 1. Intro */}
            <section id="intro" className="mb-20 scroll-mt-24">
              <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-4 mb-6">1. Introduction</h2>
              <DocImage 
                src="/docs/images/landing-page.png" 
                alt="Zenith Landing Page"
                desc="The Zenith landing page providing access to the Dashboard and Documentation." 
              />
              <h3 className="text-lg font-semibold text-white mt-8 mb-2">What is Zenith?</h3>
              <p className="mb-4 leading-relaxed text-gray-400">
                Zenith is an advanced Space Situational Awareness (SSA) platform designed for real-time celestial and orbital tracking. 
                Whether you are an amateur astronomer, an educator, or a space enthusiast, Zenith consolidates massive amounts of astronomical 
                data—satellites, planets, constellations, and the ISS—into a single unified 3D platform.
              </p>
              <h3 className="text-lg font-semibold text-white mt-8 mb-2">How do I use it?</h3>
              <p className="mb-4 leading-relaxed text-gray-400">
                From the landing page, simply click "Launch Dashboard". The platform will automatically attempt to locate your position via browser geolocation. Once authorized, the entire intelligence engine calculates the sky exactly as it appears above you right now.
              </p>
              <h3 className="text-lg font-semibold text-white mt-8 mb-2">How should I interpret the information?</h3>
              <p className="leading-relaxed text-gray-400">
                Zenith is designed to filter out the noise. Instead of just showing raw data, the platform intelligently correlates local weather, time, and positioning to deliver a unified "Observation Score", telling you exactly when to look up and what you will see.
              </p>
            </section>

            {/* 2. Dashboard Overview */}
            <section id="dashboard" className="mb-20 scroll-mt-24">
              <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-4 mb-6">2. Dashboard Overview</h2>
              <DocImage 
                src="/docs/images/dashboard.png" 
                alt="Full Dashboard Layout"
                desc="The main command interface featuring the 3D globe, Sky Report, and Control Center." 
              />
              <h3 className="text-lg font-semibold text-white mt-8 mb-2">What is this feature?</h3>
              <p className="mb-4 leading-relaxed text-gray-400">
                The Zenith Dashboard is your central command interface. It relies on translucent glassmorphic panels overlaid on a highly performant CesiumJS 3D globe.
              </p>
              <h3 className="text-lg font-semibold text-white mt-8 mb-2">How do I use it?</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-400 mb-8">
                <li><strong>Globe Interaction:</strong> Click and drag to pan the Earth. Use your scroll wheel (or two fingers on trackpad/mobile) to zoom in and out. Right-click and drag to tilt the camera.</li>
                <li><strong>Location Search (Top-Left):</strong> Instantly teleport to any coordinates globally.</li>
                <li><strong>Unified Sky Report (Left Panel):</strong> Your primary intelligence readout for astronomical events.</li>
                <li><strong>Control Center (Right Panel):</strong> A modular stack of specialized tracking tools for satellites and planets.</li>
              </ul>
              <h3 className="text-lg font-semibold text-white mt-8 mb-2">Tips</h3>
              <p className="leading-relaxed text-gray-400">
                The sidebars are independently scrollable. If you need a cleaner view of the globe, you can collapse specific panels using their header controls.
              </p>
            </section>

            {/* 3. Location Search */}
            <section id="search" className="mb-20 scroll-mt-24">
              <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-4 mb-6">3. Location Search</h2>
              <DocImage 
                src="/docs/images/location-search.png" 
                alt="Location Search Input"
                desc="The Search Panel querying location data and instantly updating the astronomical engines." 
              />
              <h3 className="text-lg font-semibold text-white mt-8 mb-2">What is this feature?</h3>
              <p className="mb-4 leading-relaxed text-gray-400">
                The Location Search bar allows you to reposition your observation point to anywhere on Earth. Because what you see in the sky depends entirely on where you are standing, changing your location re-calculates all tracking data instantly.
              </p>
              <h3 className="text-lg font-semibold text-white mt-8 mb-2">How do I use it?</h3>
              <p className="mb-4 leading-relaxed text-gray-400">
                The search bar supports multiple formats. You can type in exactly what you are looking for:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-400 mb-4">
                <li>
                  <strong className="text-white">Place Name:</strong> Type any city, country, or landmark.<br/>
                  <em>Examples: "New Delhi", "London", "Sydney"</em>
                </li>
                <li>
                  <strong className="text-white">Latitude + Longitude:</strong> Enter precise coordinates separated by a comma or space.<br/>
                  <em>Examples: "28.6139, 77.2090", "40.7128, -74.0060"</em>
                </li>
                <li>
                  <strong className="text-white">Decimal Coordinates:</strong> Standard decimal degree format is automatically validated.
                </li>
              </ul>
              <h3 className="text-lg font-semibold text-white mt-8 mb-2">Expected Outcome</h3>
              <p className="leading-relaxed text-gray-400">
                Upon a successful search, the 3D globe will smoothly fly to the new coordinates. Instantly, all astronomy engines—including the ISS tracker, Satellite orbits, Planet visibility, and Sky Report—will recompute for the new location's exact timezone, latitude, and longitude.
              </p>
            </section>

            {/* 4. Tracking a Selected Satellite */}
            <section id="tracking-satellite" className="mb-20 scroll-mt-24">
              <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-4 mb-6">4. Tracking a Selected Satellite</h2>
              <DocImage 
                src="/docs/images/satellites.png" 
                alt="Satellite Tracking Details"
                desc="Selecting a specific satellite locks the telemetry panel and visualizes its orbital trajectory." 
              />
              <h3 className="text-lg font-semibold text-white mt-8 mb-2">What is this feature?</h3>
              <p className="mb-4 leading-relaxed text-gray-400">
                The Satellite module doesn't just list objects overhead; it allows you to actively track a specific satellite, rendering its orbit and predicting its behavior.
              </p>
              <h3 className="text-lg font-semibold text-white mt-8 mb-2">How to Use</h3>
              <ol className="list-decimal pl-6 space-y-2 text-gray-400 mb-4">
                <li>Open the <strong>Satellites</strong> panel in the Control Center on the right.</li>
                <li>Review the list of currently visible satellites (e.g., Hubble, Starlink).</li>
                <li>Click the <strong>Target Icon</strong> (or the satellite card itself) to select it.</li>
              </ol>
              <h3 className="text-lg font-semibold text-white mt-8 mb-2">Understanding the Information</h3>
              <p className="mb-4 leading-relaxed text-gray-400">
                Once selected, the satellite becomes the <strong>active tracked object</strong>:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-400 mb-8">
                <li><strong className="text-white">Orbital Path:</strong> A 3D trajectory line instantly renders around the globe, showing exactly where the satellite came from and where it is going.</li>
                <li><strong className="text-white">Live Telemetry:</strong> A dedicated panel opens at the bottom right, streaming live Altitude, Azimuth, and Range data updating every second.</li>
                <li><strong className="text-white">Visibility Constraints:</strong> The system calculates if the satellite is in Earth's shadow (eclipsed) or illuminated by sunlight, which determines if you can actually see it with the naked eye.</li>
              </ul>
            </section>

            {/* 5. Unified Sky Report */}
            <section id="sky-report" className="mb-20 scroll-mt-24">
              <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-4 mb-6">5. Unified Sky Report</h2>
              <DocImage 
                src="/docs/images/unified-sky-report1.png" 
                alt="Unified Sky Report Top"
                desc="The top section of the report showing Observation Score, Best Target, and Observer Guidance." 
              />
              <h3 className="text-lg font-semibold text-white mt-8 mb-2">What is this feature?</h3>
              <p className="mb-4 leading-relaxed text-gray-400">
                The Unified Sky Report is Zenith's core innovation. Instead of giving you raw, disconnected data, it synthesizes weather, astronomy, and telemetry into a single, highly readable report panel.
              </p>
              
              <h3 className="text-lg font-semibold text-white mt-8 mb-2">Understanding the Metrics</h3>
              
              <div className="space-y-6 mt-4">
                <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                  <h4 className="text-white font-bold mb-2">1. Observation Score</h4>
                  <p className="text-sm text-gray-400 mb-2"><strong>What it represents:</strong> A 0-100% grade of current stargazing conditions.</p>
                  <p className="text-sm text-gray-400 mb-2"><strong>How it is calculated:</strong> It factors in cloud cover (weather), moonlight interference (glare), and the number of celestial objects currently above the horizon.</p>
                  <p className="text-sm text-gray-400"><strong>Interpretation:</strong> 80-100% means perfectly clear, dark skies with great targets. Below 40% usually means heavy clouds or daylight.</p>
                </div>

                <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                  <h4 className="text-white font-bold mb-2">2. Best Target</h4>
                  <p className="text-sm text-gray-400 mb-2"><strong>What it represents:</strong> The single most spectacular object visible right now.</p>
                  <p className="text-sm text-gray-400"><strong>Why it was selected:</strong> Zenith ranks objects. The ISS passing overhead always takes priority. If absent, it looks for bright planets (like Jupiter or Venus). If none are visible, it recommends prominent constellations or satellites.</p>
                </div>

                <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                  <h4 className="text-white font-bold mb-2">3. Observer Guidance</h4>
                  <p className="text-sm text-gray-400 mb-2"><strong>What it represents:</strong> Plain-English instructions on where to look.</p>
                  <p className="text-sm text-gray-400"><strong>Interpretation:</strong> <em>"Face South-East and look halfway above the horizon."</em> It translates raw Azimuth (compass direction) and Altitude (degrees up) into physical directions you can follow outdoors.</p>
                </div>
              </div>

              <DocImage 
                src="/docs/images/unified-sky-report2.png" 
                alt="Unified Sky Report Bottom"
                desc="The bottom section detailing Space Environment, Upcoming Events, and the Sky Dome." 
              />

              <div className="space-y-6 mt-4">
                <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                  <h4 className="text-white font-bold mb-2">4. Space Environment</h4>
                  <p className="text-sm text-gray-400"><strong>What it represents:</strong> Current environmental impacts. High cloud cover or a Full Moon will drastically reduce your ability to see dim satellites or stars.</p>
                </div>

                <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                  <h4 className="text-white font-bold mb-2">5. Upcoming Events & Next Best Opportunity</h4>
                  <p className="text-sm text-gray-400 mb-2"><strong>What it represents:</strong> A chronological timeline of what happens next (e.g., ISS passes, Moonrise, Planet visibility).</p>
                  <p className="text-sm text-gray-400"><strong>Interpretation:</strong> The "Next Best Opportunity" highlights the most exciting event in the next 24 hours and counts down to it, helping you plan your evening.</p>
                </div>

                <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                  <h4 className="text-white font-bold mb-2">6. Sky Dome</h4>
                  <p className="text-sm text-gray-400 mb-2"><strong>What it represents:</strong> A top-down radar-like view of your local sky.</p>
                  <p className="text-sm text-gray-400"><strong>Interpretation:</strong> The outer edge is the horizon; the very center is straight up (Zenith). Markers represent targets. The compass letters (N, E, S, W) show you which way to face.</p>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-white mt-8 mb-2">Suggested Workflow</h3>
              <p className="mb-4 leading-relaxed text-gray-400">For the best experience, read the report from top to bottom like a tutorial:</p>
              <ol className="list-decimal pl-6 space-y-2 text-gray-400 mb-4">
                <li>Check the <strong>Observation Score</strong> to see if it's worth going outside.</li>
                <li>Read the <strong>Best Target</strong> to know what you are looking for.</li>
                <li>Follow the <strong>Observer Guidance</strong> to orient yourself physically.</li>
                <li>Check the <strong>Sky Dome</strong> to confirm the target's relative position.</li>
                <li>Review <strong>Upcoming Events</strong> to see if you should stay outside longer.</li>
              </ol>
            </section>

            {/* 6. ISS Module */}
            <section id="iss" className="mb-20 scroll-mt-24">
              <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-4 mb-6">6. ISS Module</h2>
              <DocImage 
                src="/docs/images/ISS-module.png" 
                alt="ISS Tracker Module"
                desc="The ISS Control Center tracking the station's ground speed and upcoming passes." 
              />
              <h3 className="text-lg font-semibold text-white mt-8 mb-2">What is this feature?</h3>
              <p className="mb-4 leading-relaxed text-gray-400">
                Because the International Space Station is the brightest and most popular artificial object in the night sky, it has a dedicated tracking module in the right sidebar.
              </p>
              <h3 className="text-lg font-semibold text-white mt-8 mb-2">Understanding the Information</h3>
              <p className="mb-4 leading-relaxed text-gray-400">
                The ISS module calculates the exact flyover predictions for your selected location. It provides a countdown timer to the next visible pass. When the ISS is actively overhead, the panel updates live with its current Altitude and Ground Speed (often exceeding 27,000 km/h).
              </p>
            </section>

            {/* 7. Planet Observation */}
            <section id="planets" className="mb-20 scroll-mt-24">
              <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-4 mb-6">7. Planet Observation</h2>
              <DocImage 
                src="/docs/images/planets-observation.png" 
                alt="Planet Observation Panel"
                desc="Live ephemeris data for the major planets in our solar system." 
              />
              <h3 className="text-lg font-semibold text-white mt-8 mb-2">What is this feature?</h3>
              <p className="mb-4 leading-relaxed text-gray-400">
                The Planet panel tracks the astronomical coordinates of major solar system bodies (Mars, Jupiter, Saturn, Venus) based on complex ephemeris algorithms.
              </p>
              <h3 className="text-lg font-semibold text-white mt-8 mb-2">How to interpret it</h3>
              <p className="mb-4 leading-relaxed text-gray-400">
                Planets currently "Above Horizon" are brightly lit and clickable. Planets "Below Horizon" are dimmed out, saving you from searching for an object that has already set beneath the Earth's curvature. Clicking a visible planet often triggers the Sky Dome to highlight its exact position.
              </p>
            </section>

            {/* 8. Constellations */}
            <section id="constellations" className="mb-20 scroll-mt-24">
              <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-4 mb-6">8. Constellations & Navigational Stars</h2>
              <h3 className="text-lg font-semibold text-white mt-8 mb-2">What is this feature?</h3>
              <p className="mb-4 leading-relaxed text-gray-400">
                Integrated tightly with the Sky Report, Zenith computes which major constellations (like Orion, Ursa Major, or Cassiopeia) are currently prominent in your local sky. 
              </p>
              <h3 className="text-lg font-semibold text-white mt-8 mb-2">Tips for Beginners</h3>
              <p className="mb-4 leading-relaxed text-gray-400">
                If the Best Target is a satellite, Zenith will often tell you which constellation it is currently flying through. Use this as a reference point! Find the constellation first with your naked eye, and then wait for the satellite to cross through it.
              </p>
            </section>

            {/* 9. Navigation Workflow */}
            <section id="workflow" className="mb-20 scroll-mt-24">
              <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-4 mb-6">9. Navigation Workflow</h2>
              <p className="mb-4 leading-relaxed text-gray-400">
                To maximize your experience with Zenith, follow this simple operational flow:
              </p>
              <div className="flex flex-col items-center justify-center space-y-4 my-10 p-6 md:p-10 border border-white/10 rounded-2xl bg-white/5">
                <div className="px-6 py-3 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-center w-full max-w-sm">1. Set your Location via Search</div>
                <div className="w-px h-6 bg-white/20" />
                <div className="px-6 py-3 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-center w-full max-w-sm">2. Check the Sky Report for viability</div>
                <div className="w-px h-6 bg-white/20" />
                <div className="px-6 py-3 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-center w-full max-w-sm">3. Select a Satellite or ISS to track</div>
                <div className="w-px h-6 bg-white/20" />
                <div className="px-6 py-3 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-center w-full max-w-sm">4. Note the Observer Guidance</div>
                <div className="w-px h-6 bg-white/20" />
                <div className="px-6 py-3 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 text-center w-full max-w-sm">5. Step outside and look up!</div>
              </div>
            </section>

            {/* 10. Responsive Experience */}
            <section id="responsive" className="mb-20 scroll-mt-24">
              <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-4 mb-6">10. Responsive Experience</h2>
              <DocImage 
                src="/docs/images/mobile-view.png" 
                alt="Zenith Mobile Dashboard"
                desc="On mobile devices, the sidebars automatically convert into vertical scrollable layers, preserving globe interactivity." 
              />
              <h3 className="text-lg font-semibold text-white mt-8 mb-2">What is this feature?</h3>
              <p className="mb-4 leading-relaxed text-gray-400">
                Zenith is built as a truly adaptive application. On a desktop, it acts as a wide command center. On mobile phones and tablets, the interface seamlessly reorganizes itself.
              </p>
              <h3 className="text-lg font-semibold text-white mt-8 mb-2">How to Use Mobile</h3>
              <p className="mb-4 leading-relaxed text-gray-400">
                The sidebars collapse into scrollable stacks. You can touch the empty space between the glass panels to pinch-zoom or rotate the 3D globe just like a native maps application. Touching the panels themselves allows you to scroll through the data without accidentally moving the globe.
              </p>
            </section>

            {/* 11. Future Roadmap */}
            <section id="roadmap" className="mb-20 scroll-mt-24">
              <h2 className="text-2xl font-bold text-white border-b border-white/10 pb-4 mb-6">11. Future Roadmap</h2>
              <p className="mb-4 leading-relaxed text-gray-400">
                Zenith is continuously evolving. Here are the features currently prioritized on our engineering roadmap:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-400">
                <li><strong className="text-white">AI Sky Recommendations:</strong> Natural language modeling to suggest personalized targets.</li>
                <li><strong className="text-white">Space Weather Alerts:</strong> Live monitoring of solar flares and geomagnetic storms for Aurora predictions.</li>
                <li><strong className="text-white">Meteor Shower Predictions:</strong> Radiant mapping and peak time calculators for annual showers.</li>
                <li><strong className="text-white">Rocket Launch Tracking:</strong> Live trajectory rendering for global space launches.</li>
                <li><strong className="text-white">Night Mode Automation:</strong> A harsh red-light filter that activates at night to preserve the observer's dark adaptation.</li>
              </ul>
            </section>

          </motion.div>
        </article>
      </div>
    </main>
  );
}
