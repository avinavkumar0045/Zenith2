# Project Zenith Conventions

## 1. Directory Structure

- `src/components/`: Reusable, generic UI components (buttons, inputs, modals).
- `src/modules/`: Domain-specific feature modules (globe, satellites, iss). Each module is self-contained.
- `src/services/`: API clients, external providers, data fetching logic.
- `src/hooks/`: Custom React hooks, strictly separated from UI components.
- `src/store/`: Zustand state management stores.
- `src/types/`: Global TypeScript interfaces and types.
- `src/utils/`: Pure helper functions and formatting utilities.

## 2. Naming Conventions

- **Components**: PascalCase (e.g., `HeroSection.tsx`, `CesiumGlobe.tsx`).
- **Hooks**: camelCase, prefixed with `use` (e.g., `useGlobeState.ts`).
- **Files (Utils/Services)**: camelCase (e.g., `apiClient.ts`, `formatDate.ts`).
- **Types/Interfaces**: PascalCase. Prefix interfaces with `I` only if necessary, otherwise use descriptive names (e.g., `SatelliteData`).
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_ZOOM_LEVEL`).

## 3. Module Boundaries

- A module (e.g., `src/modules/satellites`) must encapsulate its own components, specific hooks, and sub-types.
- Modules should expose a single `index.ts` file (barrel file) exporting the public API of that module.
- Modules MUST NOT depend on other modules directly unless explicitly allowed (e.g., `satellites` depending on `globe`). Dependency direction should be strictly one-way.
