# PROJECT ZENITH - CURRENT STATE

## Completed Phases
*   **Phase 1: Foundation** (Next.js, Tailwind, Zustand, Cesium Globe setup)
*   **Phase 2A: Location Intelligence Engine** (Geocoding, Day/Night parsing, Location Layers)
*   **Phase 2B: Satellite Infrastructure Layer** (TLE fetching, SGP4 propagation, Satellite Layers)
*   **Phase 3A: Orbit Visualization Engine** (Trajectories, Ground tracks, Orbit UI Panel)
*   **Phase 3B: ISS Specialized Module** (Telemetry, Smooth Propagation, Camera Tracking)
*   **Phase 4: Pass Prediction Engine** (SGP4 Look Angles, Observer Geometry, Visibility Engine)
*   **Phase 5: Celestial Intelligence Report Engine** (Data Synthesis, Observation Scoring, Natural Language Recommendations)

## Current Architecture
The application leverages a highly decoupled, service-oriented architecture:

*   **Application Flow:** The entry point `page.tsx` renders the `CesiumGlobe` host component alongside modular UI overlays. State is persisted globally using Zustand stores (`useAppStore`, `useLocationStore`, `useSatelliteStore`, `useOrbitStore`, `useISSStore`, `usePassStore`, `useReportStore`).
*   **Intelligence Flow:** `ReportService` listens to the Location, Pass, and Satellite stores. It delegates logic to `ScoringService` and `ObservationService` to compile the `CelestialReportObject`, removing the burden of data interpretation from the user.
*   **Location Flow:** `LocationService` reverse-geocodes via `NominatimProvider` and parses day/night states via `DayNightService`. It updates `LocationStore` and dispatches `locationChanged` to the `EventBus`.
*   **Pass Prediction Flow:** `PassPredictionService` listens to location changes and satellite selection. It utilizes `ObserverService` and `satellite.js` look angles to iterate time and predict passes, passing results to `PassStore` without touching the Cesium renderer.
*   **Satellite & ISS Flow:** `SatelliteService` and `ISSService` fetch standard and specialized TLEs. The ISS runs on a 1s loop, standard satellites on 10s.
*   **Orbit Flow:** The `OrbitService` continuously propagates tracking data. The state flows into the `OrbitVisualizationService` and is rendered by the `OrbitLayer` with UI support from `OrbitPanel`, `OrbitLegend`, and `OrbitTimeline`.
*   **Layer Flow:** Layers implement an `ILayer` interface. The `LayerManager` orchestrates layer lifecycles (init, show, hide, destroy), instantiated via a `LayerRegistry`. React UI does not directly manipulate Cesium.

## Current Module Inventory
### Active Modules (Fully Implemented)
*   **`globe/`**: `CesiumGlobe`, `LayerManager`, `GlobeService`, Base Layers.
*   **`location/`**: `LocationSearch`, `LocationService`, `NominatimProvider`, `DayNightService`.
*   **`satellites/`**: `SatellitePanel`, `SatelliteService`, `CelesTrakProvider`, `OrbitService`.
*   **`orbits/`**: `OrbitPanel`, `OrbitTimeline`, `OrbitVisualizationService`, `TrajectoryService`.
*   **`iss/`**: `ISSPanel`, `ISSService`, `ISSTelemetryService`, `ISSLayer`.
*   **`pass-predictions/`**: `PassPredictionService`, `ObserverService`, `VisibilityService`, `PassPanel`.
*   **`reports/`**: `ReportService`, `ScoringService`, `ObservationService`, `CelestialReport`.

### Placeholder Modules (Pending Implementation)
*   `planets/` (Planetary Tracking)
*   `moon/` (Moon Tracking)
*   `weather/` (Weather Module)
*   `news/` (News & Reports)
*   `sharing/`

## Remaining Roadmap
*   **Phase 6: Celestial Tracking:** Implement `MoonLayer` and `PlanetLayer` using Ephemeris data.
*   **Phase 7: Environmental & Situational Awareness:** Build out the `weather/` and `news/` modules, introducing a `HeatmapLayer`.
*   **Phase 8: Social & Export Features:** Implement the `sharing/` module for deep links and data exporting.



## Build Verification
*   **TypeScript Status:** Verified (0 errors via `npx tsc`).
*   **Architecture Status:** Verified (Modular structure fully compliant).
*   **Runtime Status:** Verified (React 19, Next.js 16, Zustand 5, Cesium 1.142 stack sound).

