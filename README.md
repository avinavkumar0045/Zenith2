<div align="center">
  <h1>ZENITH</h1>
  <p><strong>"Observe. Understand. Anticipate Space."</strong></p>
  <p>Zenith is an advanced Space Situational Awareness platform built with Next.js and CesiumJS that enables users to explore satellites, planets, celestial bodies, weather conditions, orbital predictions, and observation opportunities from any location on Earth.</p>

  <!-- Badges -->
  <p>
    <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js" />
    <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/CesiumJS-60A5FA?style=for-the-badge&logo=cesium&logoColor=white" alt="CesiumJS" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion" />
    <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white" alt="Vercel" />
    <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="MIT License" />
  </p>
</div>

---

## 📸 Preview

<details open>
<summary><b>View Application Screenshots</b></summary>
<br/>

| Landing Page | Dashboard |
|:---:|:---:|
| ![Landing Page Preview](/docs/images/landing-page.png) | ![Dashboard Preview](/docs/images/dashboard.png) |

| Documentation | Mobile View |
|:---:|:---:|
| ![Documentation Portal](/docs/images/documentation.png) | ![Mobile View](/docs/images/mobile-view.png) |

</details>

---

## ✨ Features

### 🌌 Space Intelligence
* **Satellite Tracking:** Real-time orbital propagation and tracking using SGP4.
* **ISS Monitoring:** High-precision telemetry and orbit visualization for the International Space Station.
* **Planet Observation:** Accurate ephemeris calculations for planetary positions.
* **Moon Position:** Phase, illumination, and altitude/azimuth tracking.
* **Constellation Identification:** Real-time star map correlation for major constellations.
* **Observation Windows:** Predictive analytics for optimal celestial viewing times.
* **Sky Reports:** Comprehensive automated reports on visible phenomena.
* **Orbital Forecasts:** Trajectory and pass predictions for tracked objects.
* **Weather Integration:** Local atmospheric conditions and cloud cover metrics.
* **Celestial Search:** Extensive database search for celestial bodies.
* **Location Intelligence:** Global coordinate reverse-geocoding and timezone mapping.
* **Interactive Globe:** 3D WebGL rendering of Earth, terrain, and orbits.

### 🎨 UI & Experience
* **Responsive Design:** Seamlessly scales from desktop workstations to mobile devices.
* **Landing Page:** Premium introduction with high-fidelity animations.
* **Animated Background:** Dynamic, CSS-optimized cosmic parallax backgrounds.
* **Dark Theme:** Deep-space aesthetic reducing eye strain for nighttime observation.
* **Documentation Portal:** Integrated markdown-based user manuals.
* **About Page:** Project vision, philosophy, and architectural overview.
* **Glassmorphism:** Modern, translucent UI panels overlaying the 3D globe.
* **Professional Dashboard:** Centralized control center for all astronomical data.

---

## 🛠 Technology Stack

### Frontend Architecture
| Technology | Role |
|------------|------|
| **Next.js 16** | React Framework, Server-Side Rendering, App Router |
| **React 19** | UI Library & Component Architecture |
| **TypeScript** | Static Typing & Code Safety |
| **Tailwind CSS** | Utility-first Styling & Responsive Design |
| **Framer Motion** | Micro-interactions & UI Animations |
| **CesiumJS** | WebGL 3D Globe & Spatial Data Visualization |

### Backend & Data Services
| Component | Status | Description |
|-----------|--------|-------------|
| **Local Services** | Active | In-browser calculations via `satellite.js` & Custom Math |
| **Public APIs** | Active | OpenMeteo, OpenStreetMap, CelesTrak Integration |
| **Node / Python** | Future | Dedicated microservices for heavy ephemeris computation |
| **PostgreSQL** | Future | Persistent user accounts and observation logs |
| **Machine Learning** | Future | Predictive modeling for viewing opportunities |

---

## 🏗 Project Architecture

<details>
<summary><b>View Folder Structure</b></summary>

```text
src/
├── app/          # Next.js App Router (Pages, Layouts, API routes)
├── components/   # Shared, reusable UI components (Hero, Navigation, etc.)
├── modules/      # Domain-specific feature modules (Globe, ISS, Weather, etc.)
├── hooks/        # Custom React hooks for global state and logic
├── lib/          # Core utilities, math helpers, and configuration
├── services/     # API clients, data fetching, and calculation engines
└── public/       # Static assets, manifests, and WebGL textures
```
</details>

* **`app/`**: Contains the core routing logic, dashboard, documentation portal, and landing pages.
* **`components/`**: Reusable presentational React components designed with Tailwind CSS and Framer Motion.
* **`modules/`**: The heart of the application. Encapsulates isolated features like celestial tracking, weather integration, and the Cesium globe logic.
* **`hooks/`**: Global state management powered by Zustand and standard React hooks.
* **`lib/`**: Foundational utilities for astronomy math, time parsing, and formatting.
* **`services/`**: Abstracts external API calls and heavy data processing pipelines.
* **`public/`**: Stores required static configurations, Cesium assets, and open-graph imagery.

---

## 🚀 Installation & Setup

Zenith requires **Node.js (v18+)** and **npm (v9+)**.

1. **Clone the repository**
   ```bash
   git clone https://github.com/avinavkumar0045/Zenith2.git
   cd Zenith2
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   *The application will be available at `http://localhost:3000`.*

4. **Production Build**
   ```bash
   npm run build
   npm start
   ```

---

## 🎛 Dashboard Modules

* **Satellite Tracking:** Calculates and propagates orbital elements (TLEs) into precise 3D trajectories using SGP4 math models.
* **ISS:** Real-time telemetry monitoring, 3D orbit visualization, and exact ground-track mapping for the International Space Station.
* **Planets:** Computes right ascension, declination, and visibility constraints for major planetary bodies based on user location.
* **Moon:** Provides high-accuracy lunar phase percentages, illumination metrics, and rise/set times.
* **Constellations:** Correlates the user's local sky with prominent star patterns and celestial navigational markers.
* **Observer Guidance:** Intelligent recommendations on where and when to look for optimal stargazing.
* **Weather:** Integrates local atmospheric data, cloud cover percentages, and seeing conditions to determine observation viability.
* **Sky Report:** Generates a comprehensive, readable summary of the current night sky overhead.
* **Forecast Engine:** Predicts upcoming orbital passes and celestial events over the next 24-48 hours.
* **Opportunity Engine:** Highlights rare viewing opportunities such as ISS transits or meteor showers based on algorithmic scoring.

---

## 📖 Documentation

The project includes a comprehensive, built-in **Documentation Portal** accessible from the landing page. It serves as a user manual containing:

* **Introduction**
* **Dashboard Overview**
* **Location Search**
* **Observer Guidance**
* **Satellites**
* **ISS Tracking**
* **Planets**
* **Constellations**
* **Forecast Engine**
* **Roadmap**
* **Responsive Controls**

---

## ⚡ Current Capabilities

From the live production dashboard, users can currently:
* **Search any location** globally to set their observation point.
* **View satellites** orbiting overhead in real-time.
* **View planets** and their current astronomical coordinates.
* **Track the ISS** dynamically across the 3D globe.
* **Generate observation reports** detailing sky quality.
* **Check local weather** and atmospheric seeing conditions.
* **Track time** precisely in localized formats.
* **Calculate Sunrise & Sunset** exactly for their coordinates.
* **Explore celestial objects** dynamically based on Earth's rotation.
* **Enjoy a responsive UI** that adapts seamlessly from desktop to mobile.
* **Interact with a 3D globe** featuring day/night terminators and orbital paths.

---

## 🗺 Future Roadmap

- [ ] **AI Sky Recommendations:** Natural language models suggesting what to observe.
- [ ] **Space Weather Dashboard:** Solar flare, geomagnetic storm, and aurora probability data.
- [ ] **Rocket Launch Tracking:** Integration with global launch schedules and trajectory mapping.
- [ ] **NEO Tracking:** Near-Earth Object and asteroid proximity alerts.
- [ ] **Meteor Shower Prediction:** Peak time and radiant mapping for annual showers.
- [ ] **Astrophotography Planner:** Exposure calculators and target framing tools.
- [ ] **User Accounts:** Saved locations, custom satellite fleets, and notification preferences.
- [ ] **Cloud Synchronization:** Settings persistence across devices.
- [ ] **Night Mode Automation:** Automatic red-light filtering to preserve dark adaptation.
- [ ] **Offline Mode:** Cached ephemeris data for remote field use.
- [ ] **Machine Learning Prediction:** Advanced algorithms for micro-climate cloud cover forecasting.
- [ ] **Space Debris Analytics:** Tracking conjunctions and orbital clutter.

---

## 📈 Performance Optimizations

Zenith is aggressively optimized for modern web performance:
* **Next.js App Router:** Leverages React Server Components for minimal client payloads.
* **Code Splitting & Lazy Loading:** Heavy components and charts are dynamically imported only when needed.
* **Dynamic Imports:** The entire CesiumJS engine is loaded asynchronously to prevent blocking the initial page render.
* **Cesium Optimization:** Rendering loop adjustments, hidden credits, and lightweight texture fallbacks ensure 60fps on modern hardware.
* **Responsive Layout:** Fluid CSS Flexbox/Grid structures guarantee zero layout shift across devices.
* **Client Components:** Granular `'use client'` boundaries ensure interactivity where needed while maintaining static performance elsewhere.

---

## 🌐 Deployment

Zenith is continuously deployed and optimized for edge delivery.

* **Platform:** [Vercel](https://vercel.com)
* **Pipeline:** Automated CI/CD via GitHub.
* **Production Build:** Fully compliant with Next.js 16 Turbopack optimization.
* **Environment Variables:** Currently **none required**. The application architecture relies entirely on open data and public APIs.

---

## ⚠️ Known Limitations

While highly capable, the current version has some limitations to be aware of:
* **Requires Internet:** Real-time TLE updates and weather fetching require an active connection.
* **Cesium Imagery:** High-resolution 3D terrain and satellite imagery depend on the availability of Cesium Ion and Bing Maps services.
* **Rate Limits:** Embedded public APIs (e.g., OpenMeteo, CelesTrak) are subject to standard public-tier rate limits.
* **Browser Support:** Requires modern WebGL-compatible browsers for the 3D globe. Best experienced on Chrome, Firefox, Safari, or Edge.

---

## 🤝 Contributing

Contributions are welcome! If you'd like to improve Zenith, please follow standard open-source workflow:

1. **Fork** the repository.
2. **Branch** (`git checkout -b feature/AmazingFeature`).
3. **Commit** your changes (`git commit -m 'Add some AmazingFeature'`).
4. **Push** to the branch (`git push origin feature/AmazingFeature`).
5. **Open a Pull Request** against the `main` branch.

*Code Style:* Please run `npm run lint` before committing to ensure adherence to our ESLint and TypeScript standards.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 👨‍💻 Author

**Zenith**  
Created by **Raj Kumar Mehta**  
*Computer Science, SRM Institute of Science and Technology*

[![GitHub](https://img.shields.io/badge/GitHub-Profile-181717?style=for-the-badge&logo=github)](https://github.com/avinavkumar0045)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=for-the-badge&logo=linkedin)](https://linkedin.com/) *(Add your LinkedIn URL here)*

---

## 🙏 Acknowledgements

This platform stands on the shoulders of giants. Special thanks to:

* [**CesiumJS**](https://cesium.com/) for the phenomenal 3D globe rendering engine.
* [**OpenStreetMap**](https://www.openstreetmap.org/) for geospatial mapping.
* [**Open-Meteo**](https://open-meteo.com/) for incredibly fast and open weather APIs.
* [**CelesTrak**](https://celestrak.org/) for maintaining accurate TLE orbital data.
* [**satellite.js**](https://github.com/shashwatak/satellite-js) for the SGP4 propagation math.
* [**Next.js**](https://nextjs.org/) & [**Vercel**](https://vercel.com) for the robust frontend infrastructure.
