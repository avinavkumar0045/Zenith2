# Project Zenith Scalability Guidelines

## 1. Feature Modularity

Project Zenith is designed as a platform where features can be plugged in or removed.
- **Loose Coupling**: Ensure that the removal of one module (e.g., `news`) does not break the `globe` or `satellites` modules.
- **Event-Driven Communication**: When modules need to interact (e.g., a satellite is clicked, updating the info panel), use a global event bus or a shared Zustand store, rather than direct component references.

## 2. Layered Architecture Enforcement

The application strictly enforces:
`UI Layer -> Feature Modules -> Service Layer -> API Layer -> External Providers`

- **UI Components** must only handle rendering and user interactions.
- **Feature Modules** compose UI and manage module-specific state.
- **Service Layer** provides data fetching and business logic.
- **API Layer** manages exact network requests (fetch, axios).

Directly fetching data from `https://api.nasa.gov` inside a React component like `SatelliteMarker.tsx` is strictly prohibited.

## 3. Performance Optimization

- **CesiumJS**: Keep the viewer instance outside of React state or use a ref. React state updates should not trigger full re-renders of the 3D canvas.
- **Dynamic Imports**: Use Next.js `next/dynamic` to lazy-load heavy components (like the Cesium globe or complex charts) so the initial payload is small.
- **Memoization**: Liberally use `useMemo` and `useCallback` for complex calculations, especially those related to geospatial coordinates.
