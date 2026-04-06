---
applyTo: "frontend/**/*.{ts,tsx}"
---
# React / TypeScript — Frontend Standards

Apply the [general architecture rules](../copilot-instructions.md) alongside these React-specific rules.

## Stack (Non-Negotiable)
- **Framework**: React 18+ with TypeScript — no Vue, Angular, or plain JS
- **State**: Zustand ONLY — no Redux, MobX, Context API for global state
- **Routing**: React Router — already configured, do not replace
- **Maps**: React Map GL (Mapbox GL JS wrapper) — no Leaflet or Google Maps
- **Build**: Vite — no Webpack or CRA
- **Styling**: Tailwind CSS — no Bootstrap, Material-UI, or CSS Modules
- **HTTP**: `axiosInstance` from `src/api/axiosInstance.ts` — never raw `fetch` or raw `axios`

## Component Rules
- Functional components only — no class components
- Define `interface {Name}Props` above every component
- Named exports only — no default exports for components
- Keep components small; extract sub-components when JSX exceeds ~80 lines
- Co-locate component-specific types at the top of the file; shared types go in `src/types/`

## Zustand State Rules
```typescript
// ❌ WRONG — mutates state
useTripStore.getState().stops.push(newStop);

// ✅ CORRECT — immutable update
addStop: (stop) => set((state) => ({ stops: [...state.stops, stop] }))
```
- **Global state** (Zustand): trip data, route GeoJSON, vehicle specs, user session
- **Local state** (useState): form inputs before save, UI toggles (modals, sidebars)
- Never store raw API responses in local state — always go through Zustand
- Use selectors to prevent over-rendering:
  ```typescript
  // ❌ Over-subscribes to entire store
  const { stops, routeGeoJSON } = useTripStore();
  // ✅ Select only what is needed
  const stops = useTripStore((state) => state.stops);
  ```

## No Hardcoded Strings
```typescript
// ❌ WRONG
if (stop.type === 'start') { }
fetch('https://api.mapbox.com/directions/v5/...');

// ✅ CORRECT — use constants files
import { STOP_TYPES } from '@/constants';
import { API_ENDPOINTS } from '@/constants/api';
if (stop.type === STOP_TYPES.START) { }
```
- `src/constants/index.ts` — stop types, status codes
- `src/constants/errors.ts` — error messages
- `src/constants/routes.ts` — route paths (`/itinerary`, `/explore`)
- `src/constants/api.ts` — API endpoint paths

## Map Integration (React Map GL)
```tsx
// Always source map data from Zustand — never from local state
const stops = useTripStore((state) => state.stops);
const routeGeoJSON = useTripStore((state) => state.routeGeoJSON);

// Auto-fit bounds pattern
useEffect(() => {
  if (!mapRef.current || !routeGeoJSON?.coordinates?.length) return;
  const bounds = new mapboxgl.LngLatBounds();
  routeGeoJSON.coordinates.forEach((coord) => bounds.extend(coord as [number, number]));
  mapRef.current.fitBounds(bounds, { padding: 50 });
}, [routeGeoJSON]);
```
- Coordinates format: `[longitude, latitude]` (GeoJSON spec) — never `[lat, lng]`
- Never call Mapbox API directly from components — proxy through BFF → Java backend

## File Organisation
```
frontend/src/
  components/   # Reusable UI components
  views/        # Page-level route components
  store/        # Zustand stores (useTripStore, useAuthStore)
  types/        # Shared TypeScript interfaces
  constants/    # index.ts | errors.ts | routes.ts | api.ts
  api/          # axiosInstance + typed API wrappers
```
