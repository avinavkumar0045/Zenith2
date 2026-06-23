# PROJECT ZENITH - CURRENT STATE

## Completed Phases
*   **Phase 1: Foundation** (Next.js, Tailwind, Zustand, Cesium Globe setup)
*   **Phase 2A: Location Intelligence Engine** (Geocoding, Day/Night parsing, Location Layers)
*   **Phase 2B: Satellite Infrastructure Layer** (TLE fetching, SGP4 propagation, Satellite Layers)
*   **Phase 3A: Orbit Visualization Engine** (Trajectories, Ground tracks, Orbit UI Panel)

## Current Architecture
The application leverages a highly decoupled, service-oriented architecture:

*   **Application Flow:** The entry point `page.tsx` renders the `CesiumGlobe` host component alongside modular UI overlays. State is persisted globally using Zustand stores (`useAppStore`, `useLocationStore`, `useSatelliteStore`, `useOrbitStore`).
*   **Location Flow:** `LocationService` reverse-geocodes via `NominatimProvider` and parses day/night states via `DayNightService`. It updates `LocationStore` and dispatches `locationChanged` to the `EventBus`.
*   **Satellite Flow:** `SatelliteService` listens to location changes, fetches standard satellite objects from the `CelesTrakProvider`, and stores them in `SatelliteStore`.
*   **Orbit Flow:** The `OrbitService` continuously propagates satellite tracking data. The state flows into the `OrbitVisualizationService` and is rendered by the `OrbitLayer` with UI support from `OrbitPanel`, `OrbitLegend`, and `OrbitTimeline`.
*   **Layer Flow:** Layers implement an `ILayer` interface. The `LayerManager` orchestrates layer lifecycles (init, show, hide, destroy), instantiated via a `LayerRegistry`. React UI does not directly manipulate Cesium; instead, stores trigger the respective active layers (`LocationLayer`, `SatelliteLayer`, `OrbitLayer`).

## Current Module Inventory
### Active Modules (Fully Implemented)
*   **`globe/`**: `CesiumGlobe`, `LayerManager`, `GlobeService`, Base Layers.
*   **`location/`**: `LocationSearch`, `LocationService`, `NominatimProvider`, `DayNightService`.
*   **`satellites/`**: `SatellitePanel`, `SatelliteService`, `CelesTrakProvider`, `OrbitService`.
*   **`orbits/`**: `OrbitPanel`, `OrbitTimeline`, `OrbitVisualizationService`, `TrajectoryService`.

### Placeholder Modules (Pending Implementation)
*   `iss/` (ISS Tracking)
*   `planets/` (Planetary Tracking)
*   `moon/` (Moon Tracking)
*   `weather/` (Weather Module)
*   `news/` (News & Reports)
*   `reports/`
*   `sharing/`

## Remaining Roadmap
*   **Phase 3B: ISS Tracking:** Integrate dedicated live telemetry for the International Space Station, build an `IssLayer`, and provide first-person camera tracking.
*   **Phase 4: Celestial Tracking:** Implement `MoonLayer` and `PlanetLayer` using Ephemeris data.
*   **Phase 5: Environmental & Situational Awareness:** Build out the `weather/`, `news/`, and `reports/` modules, introducing a `HeatmapLayer`.
*   **Phase 6: Social & Export Features:** Implement the `sharing/` module for deep links and data exporting.

## Build Verification
*   **TypeScript Status:** Verified (0 errors via `npx tsc`).
*   **Architecture Status:** Verified (Modular structure fully compliant).
*   **Runtime Status:** Verified (React 19, Next.js 16, Zustand 5, Cesium 1.142 stack sound).

