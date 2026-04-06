# Workshop 3: Advanced React Development with GitHub Copilot

**Duration**: 90 minutes  
**Format**: Live coding demonstrations  
**Audience**: React developers proficient with Copilot prompting (completed Workshops 1-2)  
**Prerequisites**: Experience with explicit prompting, few-shot learning, Zustand/React Router patterns

> **Codebase Reference**: All demos use real React files from the Road Trip Planner polyglot microservices app.  
> Architecture: Frontend (React+Vite :5173) → BFF (Node :3000) → Python (:8000) / C# (:8081) / Java (:8082) → PostgreSQL  
> React Stack: React 18 · TypeScript 5 · Zustand 4 · React Router 7 · react-map-gl · @dnd-kit · Vite 5 · Tailwind CSS 3 · Vitest · Playwright

---

## Learning Objectives

By the end of this workshop, you will master these **8 advanced Copilot techniques** — applied exclusively to React and TypeScript patterns:

1. **Chain-of-Thought Prompting** — Decompose an 880-line god component into focused sub-components
2. **Instruction Files** — Customize `.github/copilot-instructions.md` with React-specific rules
3. **Prompt Files** — Create reusable `.prompt.md` files for React component and hook generation
4. **Copilot Code Review** — Review React code for anti-patterns, `any` types, and architecture violations
5. **Copilot Plan Mode** — Plan React component test infrastructure using Vitest + Testing Library
6. **Copilot Coding Agent** — Delegate `any` type elimination and `axiosInstance` migration across the frontend
7. **Copilot Agent HQ** — Build and orchestrate React-focused custom agents
8. **Architecture & Tech Stack Generation** — Generate ADRs and component architecture diagrams

---

## Workshop Agenda

| Time | Demo | Topic | Focus Files |
|------|------|-------|-------------|
| 0-10 min | Demo 1 | Chain-of-Thought Prompting | `frontend/src/components/FloatingPanel.tsx` (880 lines) |
| 10-20 min | Demo 2 | Instruction Files | `.github/copilot-instructions.md` (471 lines) |
| 20-30 min | Demo 3 | Prompt Files | `.github/prompts/*.prompt.md` |
| 30-40 min | Demo 4 | Copilot Code Review | `FloatingPanel.tsx`, `useTripStore.ts`, `axios.ts` |
| 40-55 min | Demo 5 | Copilot Plan Mode | `frontend/src/store/useTripStore.test.ts`, `frontend/vitest.config.ts` |
| 55-70 min | Demo 6 | Copilot Coding Agent | `useTripStore.ts`, `axios.ts`, `ExploreView.tsx` |
| 70-80 min | Demo 7 | Copilot Agent HQ | `.github/copilot-agents/` (17 agents) |
| 80-90 min | Demo 8 | Architecture & Tech Stack Generation | `offlineStorage.ts`, `syncManager.ts`, `useOnlineStatus.ts` |

---

## Demo 1: Chain-of-Thought Prompting (10 min)

### Objective
Learn to decompose complex React refactoring tasks into step-by-step reasoning chains that guide Copilot toward correct, type-safe solutions.

### Scenario
Decompose the **880-line god component** `FloatingPanel.tsx` into focused sub-components. This file handles itinerary management, vehicle configuration, directions display, trip saving, Google OAuth login, POI search, and drag-and-drop — all in a single `React.FC`.

> **Why This File?** `FloatingPanel.tsx` is the largest component in the codebase with ~15 `useState` calls (lines 86–103), mixed concerns, and both `axios` and `axiosInstance` imports (violating the instruction file). It's a realistic refactoring target that mirrors real-world React tech debt.

### Live Coding Steps

**Step 1: Write a chain-of-thought prompt**
```tsx
// In a new file: frontend/src/components/itinerary/StopList.tsx

/**
 * CHAIN OF THOUGHT: Extract StopList from FloatingPanel.tsx (880 lines → focused components)
 *
 * Step 1: Inventory FloatingPanel's responsibilities
 * - Lines 86–103: ~15 useState calls for search, vehicle, trips, auth, loading states
 * - Lines 34–87: SortableStopItem sub-component (already partially extracted)
 * - Lines 190–232: handleAddStop + handleCalculateRoute (geocoding + routing)
 * - Lines 233–300: handleSearchAlongRoute (POI search along route with @turf/turf)
 * - Lines 300–400: Vehicle configuration tab (height, weight, width, fuel type)
 * - Lines 400–500: Trip save/load with Google OAuth integration
 * - Lines 500–880: Tab-based UI rendering (itinerary, vehicle, directions, trips)
 *
 * Step 2: Identify extraction boundaries using existing types
 * - Stop type from `types/Stop.ts`: { id, name, coordinates, type }
 * - Vehicle type from `types/Vehicle.ts`: { height, weight, width, length, fuelType, range, mpg }
 * - Zustand actions from `TripState` (useTripStore.ts lines 24–56):
 *   addStop, removeStop, reorderStops, setStops, setRouteData, setPOIs
 *
 * Step 3: Define the StopList component contract
 * - Props: stops (Stop[]), onAddStop, onRemoveStop, onReorderStops, onCalculateRoute
 * - Local state: searchQuery (string), isLoadingRoute (boolean)
 * - Uses: @dnd-kit/core, @dnd-kit/sortable (already imported in FloatingPanel)
 * - Does NOT own: vehicle config, trip save, auth — those become separate components
 *
 * Step 4: Wire Zustand selectively
 * - Use selective subscription: useTripStore(state => state.stops) — not full destructure
 * - This prevents re-renders when unrelated state (vehicleSpecs, pois) changes
 * - Pattern from MainLayout.tsx line 11: useTripStore(state => state.initializeOfflineMode)
 *
 * Step 5: Preserve drag-and-drop behavior
 * - SortableStopItem (FloatingPanel lines 42–87) already has proper useSortable() hook
 * - Move it alongside StopList as a sibling export
 * - Keep DndContext + SortableContext wrapper inside StopList
 *
 * Now implement:
 */
```

**Step 2: Accept Copilot suggestions following the chain**
```tsx
// Copilot should generate based on each step:

import React, { useState } from 'react';
import { Stop } from '../../types/Stop';
import { Search, Plus, Loader2, GripVertical, X } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../../utils/axios';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor,
  useSensor, useSensors, type DragEndEvent
} from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Step 3: Typed props interface — NOT inline `any`
interface StopListProps {
  stops: Stop[];
  onAddStop: (stop: Stop) => void;
  onRemoveStop: (id: string) => void;
  onReorderStops: (startIndex: number, endIndex: number) => void;
  onCalculateRoute: () => void;
  isLoadingRoute: boolean;
}

// Step 5: SortableStopItem extracted alongside StopList
interface SortableStopItemProps {
  stop: Stop;
  index: number;
  stopsLength: number;
  removeStop: (id: string) => void;
}

const SortableStopItem: React.FC<SortableStopItemProps> = ({ stop, index, stopsLength, removeStop }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: stop.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}
      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 group relative">
      <div {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600">
        <GripVertical size={16} />
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className={`w-2 h-2 rounded-full ${
          index === 0 ? 'bg-green-500' : index === stopsLength - 1 ? 'bg-red-500' : 'bg-blue-500'
        }`} />
        {index < stopsLength - 1 && <div className="w-0.5 h-6 bg-gray-300" />}
      </div>
      <div className="flex-1">
        <p className="font-medium text-gray-800">{stop.name}</p>
        <p className="text-xs text-gray-500">
          {stop.coordinates[1].toFixed(4)}, {stop.coordinates[0].toFixed(4)}
        </p>
      </div>
      <button onClick={() => removeStop(stop.id)}
        className="text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
        <X size={16} />
      </button>
    </div>
  );
};

// Step 3 & 4: Main StopList component with selective Zustand wiring
const StopList: React.FC<StopListProps> = ({
  stops, onAddStop, onRemoveStop, onReorderStops, onCalculateRoute, isLoadingRoute
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = stops.findIndex((s) => s.id === active.id);
      const newIndex = stops.findIndex((s) => s.id === over?.id);
      onReorderStops(oldIndex, newIndex);
    }
  };

  const handleAddStop = async () => {
    if (!searchQuery) return;
    const promise = axiosInstance.get(`/api/geocode?q=${encodeURIComponent(searchQuery)}`);
    toast.promise(promise, {
      loading: 'Searching...',
      success: (res) => {
        onAddStop({
          id: crypto.randomUUID(),
          name: res.data.place_name,
          coordinates: res.data.coordinates,
          type: stops.length === 0 ? 'start' : 'stop'
        });
        setSearchQuery('');
        return 'Location added!';
      },
      error: 'Could not find that address.'
    });
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="flex gap-2">
        <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for a location..."
          className="flex-1 px-3 py-2 border rounded-lg text-sm"
          onKeyDown={(e) => e.key === 'Enter' && handleAddStop()} />
        <button onClick={handleAddStop} className="px-3 py-2 bg-blue-500 text-white rounded-lg">
          <Plus size={16} />
        </button>
      </div>

      {/* Sortable Stop List */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={stops.map(s => s.id)} strategy={verticalListSortingStrategy}>
          {stops.map((stop, index) => (
            <SortableStopItem key={stop.id} stop={stop} index={index}
              stopsLength={stops.length} removeStop={onRemoveStop} />
          ))}
        </SortableContext>
      </DndContext>

      {/* Calculate Route Button */}
      {stops.length >= 2 && (
        <button onClick={onCalculateRoute} disabled={isLoadingRoute}
          className="w-full py-2 bg-green-500 text-white rounded-lg flex items-center justify-center gap-2">
          {isLoadingRoute ? <Loader2 size={16} className="animate-spin" /> : null}
          {isLoadingRoute ? 'Calculating...' : 'Calculate Route'}
        </button>
      )}
    </div>
  );
};

export default StopList;
```

**Step 3: Show why the chain matters — compare with a weak prompt**
```tsx
// ❌ WITHOUT chain-of-thought (vague, Copilot may hallucinate):
// "Split FloatingPanel into smaller components"
// → Copilot might create components that don't match the existing Stop/Vehicle types
// → Copilot might use Context API for state (violating the Zustand mandate)
// → Copilot might break @dnd-kit integration by incorrectly splitting DndContext
// → Copilot might use raw fetch() instead of axiosInstance

// ✅ WITH chain-of-thought (grounded in real code):
// Each step references actual types: Stop from types/Stop.ts, Vehicle from types/Vehicle.ts
// State wiring is explicit: useTripStore selective subscriptions (not full destructure)
// DnD boundary is preserved: DndContext stays inside StopList (not split across parents)
// HTTP client is correct: axiosInstance (not raw axios, not fetch)
```

### Additional Example: Extracting a Custom Hook with Chain-of-Thought

```tsx
/**
 * CHAIN OF THOUGHT: Extract useRouteCalculation hook from FloatingPanel.tsx
 *
 * Step 1: Identify the route calculation logic in FloatingPanel (lines 222–250)
 * - handleCalculateRoute uses stops from Zustand
 * - Calls /api/directions via axios (should be axiosInstance)
 * - Updates store via setRouteData(geometry, distance, duration, legs)
 * - Manages isLoadingRoute local state
 *
 * Step 2: Review the Zustand action signature (useTripStore.ts line 45)
 * - setRouteData: (geoJSON: GeoJSON.Feature, distance: number, duration: number, legs: Leg[]) => void
 * - Leg type from types/Route.ts: { distance, duration, geometry, steps? }
 *
 * Step 3: Follow useOnlineStatus.ts pattern (hooks/useOnlineStatus.ts)
 * - Return a typed interface (not just values)
 * - Include JSDoc with @example
 * - SSR-safe initialization for isLoading state
 * - Cleanup any side effects in useEffect return
 *
 * Step 4: Use Context7 to verify react-map-gl bounds fitting pattern
 * - @context7 resolve-library-id "react-map-gl"
 * - @context7 get-library-docs to confirm fitBounds API
 *
 * Now implement:
 */

interface UseRouteCalculationReturn {
  calculateRoute: (stops: Stop[]) => Promise<void>;
  isCalculating: boolean;
  error: string | null;
}

export const useRouteCalculation = (): UseRouteCalculationReturn => {
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setRouteData = useTripStore(state => state.setRouteData);

  const calculateRoute = async (stops: Stop[]) => {
    if (stops.length < 2) return;
    const coords = stops.map((s) => s.coordinates.join(',')).join(';');
    setIsCalculating(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`/api/directions?coords=${coords}`);
      if (response.data) {
        setRouteData(response.data.geometry, response.data.distance, response.data.duration, response.data.legs);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to calculate route';
      setError(message);
    } finally {
      setIsCalculating(false);
    }
  };

  return { calculateRoute, isCalculating, error };
};
```

### Teaching Points

| Chain-of-Thought Formula | React Example |
|-------------------------|---------------|
| Step 1: Inventory responsibilities | 880 lines, ~15 `useState`, 6 concerns identified |
| Step 2: Reference existing types | `Stop`, `Vehicle`, `TripState` from project `types/` |
| Step 3: Define component contract | `StopListProps` interface with typed callbacks |
| Step 4: Wire state selectively | `useTripStore(state => state.stops)` (not full destructure) |
| Step 5: Preserve integration | @dnd-kit `DndContext` stays within `StopList` boundary |

**When to Use**: Multi-file component extraction, hook creation, cross-concern refactoring  
**Avoid**: Simple one-file changes, straightforward implementations  
**Pro Tip**: Use `@context7` to validate library APIs (e.g., @dnd-kit sensor patterns, react-map-gl fitBounds) before writing the chain — this prevents Copilot from inventing APIs that don't exist

---

## Demo 2: Instruction Files (10 min)

### Objective
Understand how `.github/copilot-instructions.md` encodes React-specific rules that Copilot automatically follows — and how to extend it with new React conventions.

> **Key Insight**: This project already has a **471-line instruction file** with 12 technology mandates, a BFF route table, and coding standards. This demo focuses exclusively on the React-relevant sections.

### Scenario
Walk through the existing instruction file's React rules, then add a new rule targeting a real gap in the codebase.

### Live Coding Steps

**Step 1: Explore the React-specific rules already in the file**

Open `.github/copilot-instructions.md` and highlight these 5 React-critical sections:

1. **Architecture Adherence — React Mandates** (12 technology choices)
```markdown
# Already present in .github/copilot-instructions.md:

### Architecture Adherence (CRITICAL)
**DO NOT override or replace existing technology choices:**
- **Frontend Framework**: React 18+ with TypeScript (NOT Vue, Angular, or plain JS)
- **State Management**: Zustand ONLY (NOT Redux, MobX, or Context API for global state)
- **Routing**: React Router ONLY (already configured - do not replace)
- **Map Library**: React Map GL (Mapbox GL JS wrapper) ONLY (NOT Leaflet, Google Maps)
- **Build Tool**: Vite ONLY (NOT Webpack, Parcel, or Create React App)
- **Styling**: Tailwind CSS ONLY (NOT Bootstrap, Material-UI, or CSS Modules)
- **HTTP Client**: Axios via `axiosInstance` (with auth interceptors)
```

2. **TypeScript Strictness** (no `any`, typed props)
```markdown
# Already present:

### TypeScript
- **No `any` types allowed** — all props/state must have interfaces
- Component props: Define `interface ComponentProps` above component
- API responses: Use typed interfaces in `src/types/`
- State: All Zustand store slices must be typed (see `TripState` in `useTripStore.ts`)
- **Component Structure**: Follow existing functional component patterns (no class components)
```

3. **State Management Rules** (Zustand patterns)
```markdown
# Already present:

### State Management Pattern
- **Global state (Zustand)**: Trip data, route, vehicle specs, user session
- **Local state (useState)**: Form inputs before save, UI toggles (modals, sidebars)
- **Never** store API responses in local state — always go through Zustand
- **Do NOT** introduce Redux, MobX, Recoil, or Jotai — Zustand is the chosen solution
```

4. **No Hardcoded Strings** (with React examples)
```markdown
# Already present with ❌/✅ examples:

### No Hardcoded Strings (STRICTLY ENFORCED)
```typescript
// ❌ WRONG - hardcoded URL
fetch('https://api.mapbox.com/directions/v5/mapbox/driving');

// ✅ CORRECT - use environment variable
fetch(`${import.meta.env.VITE_API_URL}/api/directions`);
```

5. **BFF Route Table** (which backend handles which endpoint)
```markdown
# Already present — critical for knowing where API calls go:

### BFF Route Table
| Frontend Path | Backend | Service |
|---|---|---|
| `/api/auth/*` | backend-python:8000 | Python |
| `/api/trips*` | backend-python:8000 | Python |
| `/api/v1/parse-vehicle` | backend-csharp:8081 | C# |
| `/api/directions*` | backend-java:8082 | Java |
| `/api/geocode*` | backend-java:8082 | Java |
| `/api/search*` | backend-java:8082 | Java |
| `/health` | BFF (aggregated) | All |
```

**Step 2: Add a NEW React Component Convention rule**

```markdown
<!-- Add to .github/copilot-instructions.md under Code Standards -->

### React Component Conventions (CRITICAL)

**File Naming**: PascalCase for components (`StopList.tsx`), camelCase for hooks (`useOnlineStatus.ts`).

**Component Typing**: Always use `React.FC<Props>` with a separate `interface` — matching the pattern in `MapComponent.tsx`, `FloatingPanel.tsx`, `OfflineIndicator.tsx`:

```tsx
// ❌ WRONG — inline types, no interface
const StopList = ({ stops, onRemove }: { stops: any[], onRemove: (id: string) => void }) => { ... }

// ✅ CORRECT — interface above component, React.FC typing
interface StopListProps {
  stops: Stop[];                    // Use types from src/types/
  onRemove: (id: string) => void;
}
const StopList: React.FC<StopListProps> = ({ stops, onRemove }) => { ... }
```

**Zustand Subscriptions**: Use **selective subscriptions** to prevent unnecessary re-renders:

```tsx
// ❌ WRONG — subscribes to ALL state changes (causes re-renders on unrelated updates)
const { stops, vehicleSpecs, pois, routeGeoJSON, isOnline, ... } = useTripStore();

// ✅ CORRECT — subscribes only to needed state (re-renders only when stops change)
const stops = useTripStore(state => state.stops);
const addStop = useTripStore(state => state.addStop);

// ✅ ALSO CORRECT — for multiple related fields, use shallow comparison
import { shallow } from 'zustand/shallow';
const { stops, routeGeoJSON } = useTripStore(
  (state) => ({ stops: state.stops, routeGeoJSON: state.routeGeoJSON }),
  shallow
);
```

**Barrel Exports**: Register new components in the nearest `index.ts`:
- `src/views/index.ts` — all view components
- `src/components/navigation/index.ts` — navigation components
- Create `src/components/itinerary/index.ts` when extracting from FloatingPanel

**HTTP Client**: ALWAYS use `axiosInstance` from `utils/axios.ts` — NEVER import raw `axios`:
```tsx
// ❌ WRONG — raw axios bypasses auth interceptors (found in FloatingPanel.tsx line 10!)
import axios from 'axios';
const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/geocode?q=${query}`);

// ✅ CORRECT — axiosInstance has JWT auth + token refresh + base URL
import axiosInstance from '../utils/axios';
const res = await axiosInstance.get(`/api/geocode?q=${query}`);
```
```

**Step 3: Verify the instruction file takes effect**
```
# Open a new TypeScript file in frontend/src/components/ and type:
# "Create a favorites list component"
# Expected: Copilot uses React.FC, typed interface, Zustand selective subscription, Tailwind
# NOT: Redux, CSS modules, inline any types, raw fetch

# Type: "Create a custom hook for trip sharing"
# Expected: Copilot follows useOnlineStatus.ts pattern — JSDoc, typed return, cleanup
# NOT: Class component lifecycle, Context API, untyped return
```

### Additional Example: Using Context7 to Add React 18+ Hook Rules

```
# In Copilot Chat:
@context7 What hooks are new in React 18 and React 19?

# Based on Context7 response, add to .github/copilot-instructions.md:
```

```markdown
### React 18+ Hook Usage Guidelines (Reference: Context7 docs)

- **`useId()`** — Use for generating unique IDs for accessibility attributes (aria-describedby).
  Do NOT use for list keys (use data IDs like `stop.id` or `crypto.randomUUID()`).

- **`useSyncExternalStore()`** — Use when subscribing to external browser APIs
  (e.g., `navigator.onLine` in `useOnlineStatus.ts`). Preferred over `useState` + `useEffect`
  for external subscriptions.

- **`useTransition()`** — Use for non-urgent state updates (e.g., filtering large trip lists
  in `TripsView.tsx`). Do NOT use for data fetching (use Zustand async actions instead).

- **`useDeferredValue()`** — Use for deferring expensive re-renders (e.g., large map marker
  lists in `MapComponent.tsx`).
```

### Teaching Points

| Instruction File Pattern | React Example from This Project |
|-------------------------|-------------------------------|
| Technology mandates | Zustand, axiosInstance, Tailwind, React Router, Vite |
| ❌/✅ contrast examples | Raw `axios` vs. `axiosInstance`, full destructure vs. selective subscription |
| Real violation callouts | "Found in FloatingPanel.tsx line 10!" — shows rules catch real bugs |
| Performance patterns | Selective Zustand subscriptions to prevent re-renders |
| Cross-references | Links to `types/Stop.ts`, `useTripStore.ts`, `utils/axios.ts` |

**Rule Writing Principles for React**:
- Use **🚨 CRITICAL** or **STRICTLY ENFORCED** for rules that affect runtime behavior (re-renders, auth bypasses)
- Always provide ❌ WRONG and ✅ CORRECT code-fenced TSX examples
- Reference exact file paths where patterns exist (e.g., `hooks/useOnlineStatus.ts` for hook convention)
- Include **performance rationale** — React developers care about re-render optimization

---

## Demo 3: Prompt Files (10 min)

### Objective
Create reusable `.prompt.md` files for consistent React code generation. This project already has 3 prompt files — we'll examine one and create two new React-focused ones.

> **Existing Prompt Files** (in `.github/prompts/`):
> 1. `version-update.prompt.md` — Updates `frontend/package.json` and `frontend/src/utils/version.ts`
> 2. `plan-azureIacRoadmapUpdate.prompt.md` — Azure infrastructure planning
> 3. `plan-mockExternalApisBackendTests.prompt.md` — Test mocking strategy

### Scenario
Examine the existing version-update prompt (it touches React files), then create two new prompt files: one for React components and one for custom hooks.

### Live Coding Steps

**Step 1: Show how an existing prompt file references React files**

The `version-update.prompt.md` already knows about the React-specific version system:
```markdown
<!-- Excerpt from .github/prompts/version-update.prompt.md -->
<!-- This prompt updates frontend/package.json version AND frontend/src/utils/version.ts -->

## Files to Update
1. `frontend/package.json` — bump version field
2. `frontend/src/utils/version.ts` — update APP_VERSION constant
3. Root `package.json` — keep in sync

## Rules
- Follow semantic versioning (major.minor.patch)
- Update BUILD_TIMESTAMP to current ISO date
```

> **Key Insight**: The version prompt encodes knowledge of two React files (`package.json`, `version.ts`) that define the app's version. Prompt files should always reference the **real project files** they modify.

**Step 2: Create a new prompt file for React components**

```markdown
<!-- .github/prompts/react-component.prompt.md -->

# React Component Generator

Generate a React component following Road Trip Planner conventions established
in `frontend/src/components/` and `.github/copilot-instructions.md`.

## Architecture Context
- All API calls go through BFF via `axiosInstance` (from `utils/axios.ts`)
- Global state is in Zustand (`store/useTripStore.ts`) — not Context API or Redux
- Styling uses Tailwind CSS utility classes only — no CSS modules
- Icons come from `lucide-react` (already installed)
- Types are defined in `frontend/src/types/` — use existing types before creating new ones

## Component Conventions
- Use `React.FC<Props>` typing with separate `interface` above component
- Use selective Zustand subscriptions: `useTripStore(state => state.field)`
- Use `axiosInstance` for HTTP calls (NEVER raw `axios` or `fetch`)
- Include JSDoc describing the component's purpose
- Follow existing pattern from `MapComponent.tsx` and `OfflineIndicator.tsx`

## Template

```tsx
/**
 * {{ComponentName}} Component
 *
 * {{Description of what this component does}}.
 */

import React from 'react';
// Import types from src/types/ — check existing types first
import { {{Types}} } from '../../types/{{TypeFile}}';
// Icons from lucide-react
import { {{Icons}} } from 'lucide-react';
// Zustand store — selective subscription
import { useTripStore } from '../../store/useTripStore';
// HTTP client — always axiosInstance, never raw axios
import axiosInstance from '../../utils/axios';

interface {{ComponentName}}Props {
  // Define all props with explicit types — no `any`
  {{propName}}: {{PropType}};
}

const {{ComponentName}}: React.FC<{{ComponentName}}Props> = ({ {{props}} }) => {
  // Local state for UI-only concerns (forms, toggles)
  // Global state via selective Zustand subscription
  const {{storeField}} = useTripStore(state => state.{{storeField}});

  return (
    <div className="{{tailwind classes}}">
      {/* Component JSX */}
    </div>
  );
};

export default {{ComponentName}};
```

## Checklist
- [ ] Props interface defined above component (not inline)
- [ ] Types imported from `src/types/` (not defined inline)
- [ ] Zustand subscription is selective (not full destructure)
- [ ] Uses `axiosInstance` (not raw `axios` or `fetch`)
- [ ] Tailwind CSS only (no CSS modules or inline styles)
- [ ] Icons from `lucide-react` (not heroicons, fontawesome, or SVG)
- [ ] Registered in nearest barrel `index.ts` export
- [ ] No `any` types anywhere
```

**Step 3: Create a prompt file for custom hooks**

```markdown
<!-- .github/prompts/react-custom-hook.prompt.md -->

# React Custom Hook Generator

Generate a custom hook following the pattern established in
`frontend/src/hooks/useOnlineStatus.ts`.

## Conventions (from useOnlineStatus.ts)
- JSDoc with `@example` showing usage
- Typed return interface (exported for consumers)
- SSR-safe initialization: `typeof navigator !== 'undefined'`
- Proper `useEffect` cleanup (remove event listeners, clear intervals)
- No direct DOM manipulation — return data for components to render

## Template

```tsx
/**
 * {{HookName}} Hook
 *
 * {{Description of what this hook monitors or provides}}.
 * Follows React hooks best practices with proper cleanup.
 */

import { useState, useEffect } from 'react';

export interface {{ReturnType}} {
  {{field}}: {{Type}};
}

/**
 * {{Description}}
 *
 * @returns {{{ReturnType}}} {{Description of return value}}
 *
 * @example
 * const { {{field}} } = {{hookName}}();
 *
 * if ({{condition}}) {
 *   return <div>{{fallback UI}}</div>;
 * }
 */
export const {{hookName}} = (): {{ReturnType}} => {
  const [{{state}}, set{{State}}] = useState<{{Type}}>(() => {
    // SSR-safe initialization
    return typeof window !== 'undefined' ? {{initialValue}} : {{fallback}};
  });

  useEffect(() => {
    const handle{{Event}} = () => {
      set{{State}}({{newValue}});
    };

    window.addEventListener('{{event}}', handle{{Event}});

    // Cleanup: remove listener to prevent memory leaks
    return () => {
      window.removeEventListener('{{event}}', handle{{Event}});
    };
  }, []);

  return { {{field}} };
};
```

## Checklist
- [ ] JSDoc with `@example` block
- [ ] Exported return interface (not inline type)
- [ ] SSR-safe state initialization
- [ ] `useEffect` cleanup function removes all listeners/intervals
- [ ] No `any` types — all parameters and returns typed
- [ ] File named `use{{Feature}}.ts` in `src/hooks/`
- [ ] Unit test created in `src/hooks/use{{Feature}}.test.ts`
```

**Step 4: Use the prompt file in Copilot Chat**

```
# In Copilot Chat:
@workspace #file:.github/prompts/react-custom-hook.prompt.md

Create a useTripSharing hook:
- Manages share URL generation for a trip
- Calls POST /api/trips/:id/share via axiosInstance
- Returns { shareUrl, isSharing, error, generateShareLink }
- Cleanup: abort pending fetch on unmount
```

### Teaching Points

| Prompt File Element | Purpose | React Example |
|--------------------|---------|---------------|
| Architecture Context | Ground in real stack | "axiosInstance via `utils/axios.ts`" |
| Conventions | Enforce project patterns | `React.FC<Props>`, selective Zustand subscriptions |
| Template | Structural consistency | Props interface → imports → component → export |
| Placeholders `{{}}` | Dynamic substitution | `{{ComponentName}}`, `{{storeField}}` |
| Checklist | Verification gates | No `any`, barrel export, axiosInstance (not raw axios) |
| Real file references | Point to patterns | "Follow `useOnlineStatus.ts`", "See `MapComponent.tsx`" |

**Benefits for React Teams**:
- **Consistency**: Every component follows `React.FC<Props>` + selective Zustand subscription
- **Onboarding**: New React developers generate correct code on day 1
- **Anti-patterns blocked**: Prompt explicitly says "NOT raw axios, fetch, Context API, Redux"
- **Discoverable**: VS Code shows `.prompt.md` files in Copilot Chat `#file:` autocomplete

---

## Demo 4: Copilot Code Review (10 min)

### Objective
Use Copilot to review real React production code for anti-patterns, type safety violations, architecture rule violations, and performance issues.

### Scenario
Review 4 frontend files with **real deficiencies** — these are actual issues in the codebase, not fabricated examples.

> **Real Violation Inventory** (verified by grep):
> | File | Lines | Violation |
> |------|-------|-----------|
> | `FloatingPanel.tsx` | 1–880 | God component: 880 lines, ~15 useState, SRP violation |
> | `FloatingPanel.tsx` | 10 | Imports raw `axios` alongside `axiosInstance` |
> | `ExploreView.tsx` | 8 | Imports raw `axios` (not `axiosInstance`) |
> | `useTripStore.ts` | 140, 198, 246 | `catch (error: any)` — 3 violations |
> | `axios.ts` | 12, 13 | `resolve: (value?: any)`, `reject: (reason?: any)` |

### Live Coding Steps

**Step 1: Invoke a React-focused code review**
```
# In Copilot Chat:
@workspace Review the React frontend for:
1. `any` type violations (per .github/copilot-instructions.md: "No `any` types allowed")
2. Raw `axios` imports that bypass `axiosInstance` auth interceptors
3. God components exceeding 300 lines (SRP violations)
4. Missing `useCallback`/`useMemo` for expensive operations
5. Full Zustand destructures that cause unnecessary re-renders
6. Missing constants files (copilot-instructions mandates src/constants/ — does it exist?)

Focus files:
- frontend/src/components/FloatingPanel.tsx (880 lines — largest component)
- frontend/src/store/useTripStore.ts (3 catch(error: any) blocks)
- frontend/src/utils/axios.ts (any in failed queue typing)
- frontend/src/views/ExploreView.tsx (raw axios import)
```

**Step 2: Expected Copilot review output**

```markdown
## React Frontend Code Review

### 🔴 Critical Issues

**1. God Component: FloatingPanel.tsx (880 lines, 6 concerns)**
```tsx
// FloatingPanel.tsx handles ALL of these in one file:
// 1. Stop search + geocoding (lines 190–215)
// 2. Drag-and-drop reordering (lines 183–195)
// 3. Route calculation (lines 222–250)
// 4. POI search along route (lines 251–300)
// 5. Vehicle configuration (lines 300–400)
// 6. Trip save/load + Google OAuth (lines 400–500)
// 7. Tab-based UI rendering (lines 500–880)

// ❌ Also: ~15 useState calls at lines 86–103
const [activeTab, setActiveTab] = useState<...>('itinerary');
const [searchQuery, setSearchQuery] = useState('');
const [fuelPrice, setFuelPrice] = useState(3.50);
const [isSearchingPOIs, setIsSearchingPOIs] = useState(false);
const [activeCategories, setActiveCategories] = useState<Set<string>>(new Set());
const [tripName, setTripName] = useState('');
const [tripDescription, setTripDescription] = useState('');
const [isPublic, setIsPublic] = useState(false);
const [savedTrips, setSavedTrips] = useState<Trip[]>([]);
const [user, setUser] = useState<...>(null);
const [isLoadingRoute, setIsLoadingRoute] = useState(false);
const [isSaving, setIsSaving] = useState(false);
const [isLoadingTrips, setIsLoadingTrips] = useState(false);
const [customVehicleDescription, setCustomVehicleDescription] = useState('');
const [isAnalyzingVehicle, setIsAnalyzingVehicle] = useState(false);

// ✅ Fix: Extract into focused components (see Demo 1 for chain-of-thought approach)
// - StopList.tsx (stops, search, drag-and-drop)
// - VehicleConfig.tsx (vehicle specs, AI analysis)
// - DirectionsPanel.tsx (route display, legs)
// - TripManager.tsx (save, load, auth gates)
// - POISearch.tsx (search along route, category filters)
```

**2. Raw `axios` Bypasses Auth Interceptors (2 files)**
```tsx
// ❌ FloatingPanel.tsx line 10: imports BOTH
import axios from 'axios';           // ← Bypasses JWT auth!
import axiosInstance from '../utils/axios';  // ← Has auth interceptors

// Used at lines 126, 162, 190, 228, 251 — raw axios calls that skip:
// - JWT Bearer token injection (axiosInstance interceptor line 34)
// - 401 → token refresh flow (axiosInstance interceptor line 60)
// - Base URL configuration (axiosInstance.baseURL from VITE_API_URL)

// ❌ ExploreView.tsx line 8
import axios from 'axios';
// Used at lines 66, 92 — all API calls bypass auth

// ✅ Fix: Replace all raw axios with axiosInstance
import axiosInstance from '../utils/axios';
const res = await axiosInstance.get('/api/geocode?q=...');  // Auth + baseURL handled
```

**3. `catch (error: any)` — 5 TypeScript Violations**
```tsx
// ❌ useTripStore.ts lines 140, 198, 246
catch (error: any) {
  if (error?.response?.status === 401) { ... }
}

// ❌ axios.ts lines 12–13
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

// ✅ Fix: Use `unknown` + type narrowing
catch (error: unknown) {
  if (error instanceof Error) {
    set({ error: error.message });
  } else if (typeof error === 'object' && error !== null && 'response' in error) {
    const axiosError = error as AxiosError;
    if (axiosError.response?.status === 401) { ... }
  }
}

// ✅ Fix: Type the queue properly
interface QueueItem {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}
let failedQueue: QueueItem[] = [];
```

### 🟡 Warnings

**4. Missing Constants Files**
```tsx
// copilot-instructions.md mandates these files:
// - frontend/src/constants/index.ts
// - frontend/src/constants/errors.ts
// - frontend/src/constants/routes.ts
// - frontend/src/constants/api.ts
//
// ❌ NONE of these exist! Hardcoded strings throughout:
// FloatingPanel.tsx: 'start', 'end', 'stop' (magic strings for stop types)
// ExploreView.tsx: '/api/public-trips', '/api/search' (hardcoded API paths)
// App.tsx: '/explore', '/itinerary', '/trips' (hardcoded route paths)

// ✅ Fix: Create constants files
// frontend/src/constants/routes.ts
export const ROUTES = {
  EXPLORE: '/explore',
  ITINERARY: '/itinerary',
  TRIPS: '/trips',
  START: '/start',
  ALL_TRIPS: '/all-trips',
} as const;

// frontend/src/constants/api.ts
export const API_ENDPOINTS = {
  GEOCODE: '/api/geocode',
  DIRECTIONS: '/api/directions',
  TRIPS: '/api/trips',
  PUBLIC_TRIPS: '/api/public-trips',
  SEARCH: '/api/search',
} as const;
```

**5. Full Zustand Destructure Causes Unnecessary Re-renders**
```tsx
// ❌ FloatingPanel.tsx line 86 — subscribes to EVERYTHING
const { vehicleSpecs, setVehicleSpecs, stops, addStop, removeStop,
  setRouteData, reorderStops, routeDistance, routeGeoJSON,
  setPOIs, routeLegs, setStops, saveTrip, loadTrips, loadTrip } = useTripStore();
// Any state change (even pois, isOnline, etc.) forces this component to re-render!

// ✅ Fix: Selective subscriptions
const stops = useTripStore(state => state.stops);
const addStop = useTripStore(state => state.addStop);
// Only re-renders when `stops` actually changes
```

**6. Duplicate Type Definitions**
```tsx
// frontend/src/types/Stop.ts defines:
export interface Stop { id: string; name: string; coordinates: [number, number]; type: StopType; }

// frontend/src/types/index.ts ALSO defines:
export interface Stop { id: string; name: string; coordinates: Coordinates; address?: string;
  type: StopType; order: number; }

// Different shapes! index.ts has `address` and `order`; Stop.ts doesn't.
// The Zustand store imports from types/Stop.ts — missing fields from types/index.ts.
```

### Summary
| Severity | Count | Category |
|----------|-------|----------|
| 🔴 Critical | 3 | God component, raw axios, `any` types |
| 🟡 Warning | 3 | Missing constants, full destructure, duplicate types |

**Cross-reference**: All issues violate rules defined in `.github/copilot-instructions.md`.
```

**Step 3: Apply a targeted fix using Copilot**
```
# In Copilot Chat:
@workspace Fix the raw axios imports in ExploreView.tsx.
Replace `import axios from 'axios'` with `import axiosInstance from '../utils/axios'`.
Update all axios.get/post calls to use axiosInstance (which already has the base URL
configured, so remove the ${import.meta.env.VITE_API_URL} prefix from URLs).
```

### Additional Example: Using Microsoft Learn for React Review Patterns

> **Reference**: [GitHub Copilot Code Review Documentation](https://docs.github.com/en/copilot/using-github-copilot/code-review/using-copilot-code-review) — shows how to use Copilot for PR reviews with inline suggestions.

```
# Copilot Code Review in Pull Requests:
# 1. Open a PR on GitHub
# 2. Click "Copilot" → "Review changes"
# 3. Copilot reviews React files for:
#    - Type safety (any violations)
#    - Import consistency (axiosInstance vs raw axios)
#    - Component size (SRP violations)
#    - Performance (missing memoization)

# For local review before PR:
@workspace Review this diff for React anti-patterns:
- Are all new components using React.FC<Props>?
- Do any imports use raw axios instead of axiosInstance?
- Are Zustand subscriptions selective?
- Are new types added to src/types/ (not inline)?
```

### Teaching Points

| Review Category | What Copilot Found | Real File Location |
|----------------|--------------------|--------------------|
| 🔴 SRP Violation | 880-line god component, 15 useState | `FloatingPanel.tsx` (entire file) |
| 🔴 Auth Bypass | Raw `axios` skips JWT interceptors | `FloatingPanel.tsx:10`, `ExploreView.tsx:8` |
| 🔴 Type Safety | 5 `any` violations across 2 files | `useTripStore.ts:140,198,246`, `axios.ts:12-13` |
| 🟡 Missing Files | Constants files mandated but absent | `src/constants/` (doesn't exist) |
| 🟡 Performance | Full Zustand destructure re-renders | `FloatingPanel.tsx:86` |
| 🟡 Architecture | Duplicate type definitions | `types/Stop.ts` vs `types/index.ts` |

**React-Specific Review Prompts**:
```
# Performance review
@workspace Review [component] for missing useCallback, useMemo, and React.memo

# Zustand anti-patterns
@workspace Find all useTripStore() calls that destructure more than 3 fields

# Import consistency
grep -rn "from 'axios'" frontend/src/ --include="*.tsx" --include="*.ts"

# Type coverage
@workspace Find all inline type annotations that should use types from src/types/
```

---

## Demo 5: Copilot Plan Mode (15 min)

### Objective
Use Plan Mode to architect a React component test infrastructure before writing any code. This demo uses the **existing test setup** in the project.

### Scenario
Plan adding component tests for `MapComponent`, `OfflineIndicator`, and `AuthStatus` using the existing Vitest + React Testing Library setup.

> **Existing Test Infrastructure** (already in the project):
> - `frontend/vitest.config.ts` — jsdom environment, V8 coverage, globals: true
> - `frontend/src/test/setup.ts` — imports `@testing-library/jest-dom`, mocks `mapbox-gl`, stubs env vars
> - `frontend/src/store/useTripStore.test.ts` — 6 tests using `vi.mock('axios')`, `useTripStore.setState()`
> - Dependencies installed: `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`

### Live Coding Steps

**Step 1: Invoke Plan Mode with existing context**
```
# In Copilot Chat, click "Plan" button or type:
@workspace Create a plan to add React component tests for:
1. MapComponent (react-map-gl with markers and route layer)
2. OfflineIndicator (online/offline states with Zustand)
3. AuthStatus (Google OAuth status badge)

Context:
- Existing Vitest setup in frontend/vitest.config.ts (jsdom, globals: true)
- Test setup at frontend/src/test/setup.ts already mocks mapbox-gl
- Store test pattern in frontend/src/store/useTripStore.test.ts uses vi.mock + setState
- React Testing Library is installed (@testing-library/react v14)
- Use Context7 to verify latest react-map-gl testing patterns
```

**Step 2: Review generated plan**
```markdown
## Plan: React Component Test Infrastructure

### Phase 1: Verify Existing Setup (3 min)
☐ 1.1 Confirm test/setup.ts mocks mapbox-gl correctly for react-map-gl
☐ 1.2 Verify @testing-library/react is properly configured in vitest.config.ts
☐ 1.3 Run existing tests to confirm green baseline: `npm test`

### Phase 2: Create Shared Test Utilities (5 min)
☐ 2.1 Create `frontend/src/test/test-utils.tsx` with custom render wrapper
```tsx
// Wraps components with required providers for testing
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';

// Custom render that includes providers needed by most components
const AllTheProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <BrowserRouter>
    {children}
  </BrowserRouter>
);

const customRender = (ui: React.ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
  render(ui, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { customRender as render };
```

☐ 2.2 Create helper for Zustand state injection
```tsx
// frontend/src/test/store-helpers.ts
import { useTripStore } from '../store/useTripStore';
import type { Stop } from '../types/Stop';
import type { Vehicle } from '../types/Vehicle';

export const mockStops: Stop[] = [
  { id: '1', name: 'San Francisco', coordinates: [-122.4194, 37.7749], type: 'start' },
  { id: '2', name: 'Los Angeles', coordinates: [-118.2437, 34.0522], type: 'end' },
];

export const mockVehicle: Vehicle = {
  height: 3.5, weight: 10, width: 2.5, length: 12,
  fuelType: 'diesel', range: 500, mpg: 10,
};

export const resetStore = () => useTripStore.setState({
  stops: [], pois: [], routeGeoJSON: null,
  routeDistance: 0, routeDuration: 0, routeLegs: [],
  isOnline: true, pendingOperationsCount: 0,
  isSyncing: false, lastSyncTimestamp: 0,
  vehicleSpecs: mockVehicle,
});
```

### Phase 3: Write Component Tests (15 min)

☐ 3.1 **MapComponent.test.tsx** — Map rendering with stops and route
```tsx
// frontend/src/components/MapComponent.test.tsx
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '../test/test-utils';
import MapComponent from './MapComponent';
import { useTripStore } from '../store/useTripStore';
import { mockStops, resetStore } from '../test/store-helpers';

// react-map-gl is already mocked via mapbox-gl mock in test/setup.ts
vi.mock('react-map-gl', () => ({
  default: ({ children }: { children: React.ReactNode }) =>
    <div data-testid="map-container">{children}</div>,
  Source: ({ children }: { children: React.ReactNode }) =>
    <div data-testid="map-source">{children}</div>,
  Layer: () => <div data-testid="map-layer" />,
  Marker: ({ children }: { children: React.ReactNode; longitude: number; latitude: number }) =>
    <div data-testid="map-marker">{children}</div>,
  NavigationControl: () => <div data-testid="nav-control" />,
}));

describe('MapComponent', () => {
  beforeEach(() => resetStore());

  it('renders the map container', () => {
    render(<MapComponent />);
    expect(screen.getByTestId('map-container')).toBeInTheDocument();
  });

  it('renders markers for each stop', () => {
    useTripStore.setState({ stops: mockStops });
    render(<MapComponent />);
    const markers = screen.getAllByTestId('map-marker');
    expect(markers).toHaveLength(2);
  });

  it('renders route layer when routeGeoJSON exists', () => {
    useTripStore.setState({
      routeGeoJSON: {
        type: 'Feature',
        geometry: { type: 'LineString', coordinates: [[-122.4, 37.8], [-118.2, 34.1]] },
        properties: {}
      }
    });
    render(<MapComponent />);
    expect(screen.getByTestId('map-source')).toBeInTheDocument();
  });

  it('does not render route layer when routeGeoJSON is null', () => {
    render(<MapComponent />);
    expect(screen.queryByTestId('map-source')).not.toBeInTheDocument();
  });
});
```

☐ 3.2 **OfflineIndicator.test.tsx** — Online/offline states
```tsx
// frontend/src/components/OfflineIndicator.test.tsx
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '../test/test-utils';
import { OfflineIndicator } from './OfflineIndicator';
import { useTripStore } from '../store/useTripStore';

// Mock the useOnlineStatus hook
vi.mock('../hooks/useOnlineStatus', () => ({
  useOnlineStatus: vi.fn(() => ({ isOnline: true, wasOffline: false })),
}));

import { useOnlineStatus } from '../hooks/useOnlineStatus';
const mockUseOnlineStatus = vi.mocked(useOnlineStatus);

describe('OfflineIndicator', () => {
  beforeEach(() => {
    useTripStore.setState({
      isOnline: true, pendingOperationsCount: 0,
      isSyncing: false, lastSyncTimestamp: 0,
    });
    mockUseOnlineStatus.mockReturnValue({ isOnline: true, wasOffline: false });
  });

  it('renders nothing when online with no pending operations', () => {
    const { container } = render(<OfflineIndicator />);
    expect(container.firstChild).toBeNull();
  });

  it('shows offline indicator when disconnected', () => {
    mockUseOnlineStatus.mockReturnValue({ isOnline: false, wasOffline: true });
    useTripStore.setState({ isOnline: false });
    render(<OfflineIndicator />);
    expect(screen.getByText("You're Offline")).toBeInTheDocument();
  });

  it('shows pending operations count when offline', () => {
    mockUseOnlineStatus.mockReturnValue({ isOnline: false, wasOffline: true });
    useTripStore.setState({ isOnline: false, pendingOperationsCount: 3 });
    render(<OfflineIndicator />);
    expect(screen.getByText(/3 pending changes/)).toBeInTheDocument();
  });

  it('shows syncing indicator during sync', () => {
    useTripStore.setState({ isSyncing: true, pendingOperationsCount: 2 });
    render(<OfflineIndicator />);
    expect(screen.getByText('Syncing...')).toBeInTheDocument();
  });

  it('shows "Back Online" notification after reconnection', () => {
    mockUseOnlineStatus.mockReturnValue({ isOnline: true, wasOffline: true });
    render(<OfflineIndicator />);
    expect(screen.getByText('Back Online')).toBeInTheDocument();
  });
});
```

☐ 3.3 **AuthStatus.test.tsx** — Auth badge states
```tsx
// frontend/src/components/AuthStatus.test.tsx
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '../test/test-utils';
import AuthStatus from './AuthStatus';

describe('AuthStatus', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: vi.fn(),
      setItem: vi.fn(),
      removeItem: vi.fn(),
      clear: vi.fn(),
    });
  });

  it('shows login prompt when no token exists', () => {
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockReturnValue(null);
    render(<AuthStatus />);
    // Component should show unauthenticated state
    expect(screen.queryByText(/log out/i)).not.toBeInTheDocument();
  });

  it('shows user badge when token exists', () => {
    (localStorage.getItem as ReturnType<typeof vi.fn>).mockImplementation((key: string) => {
      if (key === 'token') return 'mock-jwt-token';
      if (key === 'user_email') return 'user@example.com';
      return null;
    });
    render(<AuthStatus />);
    // Component should show authenticated state
    expect(screen.getByText(/user@example.com/i)).toBeInTheDocument();
  });
});
```

### Phase 4: Verify & Coverage (3 min)
☐ 4.1 Run all tests: `cd frontend && npm test`
☐ 4.2 Check coverage: `npm test -- --coverage`
☐ 4.3 Verify new test count: should go from 6 → ~17 tests

**Success Criteria**:
✅ All tests pass with `npm test`
✅ Components render in jsdom without mapbox-gl errors
✅ Zustand state injection works via `useTripStore.setState()`
✅ Mocking pattern consistent with existing `useTripStore.test.ts`
✅ Test runtime < 5 seconds total
```

**Step 3: Execute plan step-by-step**
```
# In Copilot Chat:
@workspace Execute Phase 2.1 of the plan.
Create the custom render wrapper at frontend/src/test/test-utils.tsx.
Follow the existing test/setup.ts pattern and use BrowserRouter as the provider wrapper.
```

### Additional Example: Using Context7 for React Testing Library Patterns

```
# In Copilot Chat:
@context7 resolve-library-id "@testing-library/react"
@context7 get-library-docs for latest patterns on testing custom hooks with renderHook

# Use the Context7 response to write a hook test:
# frontend/src/hooks/useOnlineStatus.test.ts

import { renderHook, act } from '@testing-library/react';
import { useOnlineStatus } from './useOnlineStatus';

describe('useOnlineStatus', () => {
  it('returns online by default', () => {
    const { result } = renderHook(() => useOnlineStatus());
    expect(result.current.isOnline).toBe(true);
    expect(result.current.wasOffline).toBe(false);
  });

  it('detects offline status from window events', () => {
    const { result } = renderHook(() => useOnlineStatus());

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    expect(result.current.isOnline).toBe(false);
    expect(result.current.wasOffline).toBe(true);
  });
});
```

### Teaching Points

| Plan Mode Element | Purpose | React Example |
|------------------|---------|---------------|
| Phase grouping | Logical progression | Verify → Utilities → Tests → Coverage |
| Shared utilities | DRY test infrastructure | `test-utils.tsx` (custom render), `store-helpers.ts` |
| Zustand testing | State injection pattern | `useTripStore.setState()` — no provider needed |
| Mock strategies | Library-appropriate mocking | `vi.mock('react-map-gl')`, `vi.mock('../hooks/useOnlineStatus')` |
| Component mocks | Replace complex dependencies | react-map-gl → div with data-testid |
| Success criteria | Definition of done | 6 → ~17 tests, < 5s runtime, zero mapbox errors |

**When to Use Plan Mode**:
- Component test infrastructure spanning multiple files (test-utils, helpers, mocks)
- Refactoring large components (e.g., FloatingPanel → 5 sub-components)
- Adding new cross-cutting features (e.g., error boundaries, suspense boundaries)

---

## Demo 6: Copilot Coding Agent (15 min)

### Objective
Delegate autonomous multi-file refactoring tasks to Copilot's coding agent for systematic improvements across the React codebase.

### Scenario
Use the coding agent to fix **all `any` type violations** and **all raw `axios` import violations** in the frontend. There are **7 total violations** across 4 files — accuracy matters when scoping agent work.

> **Real Violation Inventory** (verified by grep):
> | File | Line(s) | Violation |
> |------|---------|-----------|
> | `frontend/src/store/useTripStore.ts` | 140, 198, 246 | `catch (error: any)` — 3 instances |
> | `frontend/src/utils/axios.ts` | 12, 13 | `resolve: (value?: any)`, `reject: (reason?: any)` |
> | `frontend/src/components/FloatingPanel.tsx` | 10 | `import axios from 'axios'` (raw, bypasses auth) |
> | `frontend/src/views/ExploreView.tsx` | 8 | `import axios from 'axios'` (raw, bypasses auth) |

### Live Coding Steps

**Step 1: Invoke Copilot Coding Agent with precise scope**
```
# In Copilot Chat (Coding Agent mode):
Fix all TypeScript `any` type violations and raw `axios` import violations in
the React frontend. There are exactly 7 violations across 4 files.

## `any` Type Violations (5 total)

### useTripStore.ts — 3 catch(error: any) blocks
1. frontend/src/store/useTripStore.ts:140 — `catch (error: any)` in saveTrip
2. frontend/src/store/useTripStore.ts:198 — `catch (error: any)` in loadTrips
3. frontend/src/store/useTripStore.ts:246 — `catch (error: any)` in loadTrip

Fix: Replace `any` with `unknown`, then narrow using:
- `error instanceof Error` → access `.message`
- Check for AxiosError using `import { AxiosError } from 'axios'`
- For 401 checks: `(error as AxiosError).response?.status === 401`
- Use `APIError` type from `frontend/src/types/index.ts` if applicable

### axios.ts — 2 any types in failed queue
4. frontend/src/utils/axios.ts:12 — `resolve: (value?: any) => void`
5. frontend/src/utils/axios.ts:13 — `reject: (reason?: any) => void`

Fix: Create a `QueueItem` interface:
```typescript
interface QueueItem {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}
let failedQueue: QueueItem[] = [];
```

## Raw `axios` Import Violations (2 total)

### FloatingPanel.tsx — imports raw axios alongside axiosInstance
6. frontend/src/components/FloatingPanel.tsx:10 — `import axios from 'axios'`

Fix: Remove the raw axios import. Replace ALL `axios.get(...)` and `axios.post(...)`
calls in this file with `axiosInstance.get(...)` and `axiosInstance.post(...)`.
The axiosInstance already has `baseURL` configured from `VITE_API_URL`, so also
remove the `${import.meta.env.VITE_API_URL}` prefix from all URLs.

Example transformation:
```tsx
// ❌ Before
import axios from 'axios';
const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/geocode?q=${query}`);

// ✅ After (axiosInstance already imported on line 11)
const res = await axiosInstance.get(`/api/geocode?q=${query}`);
```

### ExploreView.tsx — imports raw axios
7. frontend/src/views/ExploreView.tsx:8 — `import axios from 'axios'`

Fix: Replace `import axios from 'axios'` with
`import axiosInstance from '../utils/axios'`. Replace all `axios.get(...)` calls
with `axiosInstance.get(...)`. Remove `${import.meta.env.VITE_API_URL}` prefix.

## Verification
After all fixes:
1. Run `cd frontend && npx tsc --noEmit` — should show 0 errors
2. Run `grep -rn "any" src/store/useTripStore.ts src/utils/axios.ts` — 0 matches
3. Run `grep -rn "from 'axios'" src/components/ src/views/` — 0 matches
   (only src/utils/axios.ts and src/store/ should import from 'axios')
```

**Step 2: Agent executes autonomously**

```markdown
## Agent Progress Report

### File 1: useTripStore.ts (3 violations → 3 fixed)
**Found**: Lines 140, 198, 246 — `catch (error: any)`
**Fix**: Replace with `unknown` + AxiosError type narrowing

```typescript
// ❌ Before (all 3 locations)
catch (error: any) {
  if (error?.response?.status === 401) {
    console.error('Authentication failed...');
    localStorage.removeItem('token');
    throw new Error('Session expired...');
  }
}

// ✅ After (all 3 locations)
catch (error: unknown) {
  const axiosError = error instanceof Object && 'response' in error
    ? error as AxiosError
    : null;

  if (axiosError?.response?.status === 401) {
    console.error('Authentication failed: Token expired or invalid.');
    localStorage.removeItem('token');
    throw new Error('Session expired. Please log in again.');
  }

  // For generic error logging
  const message = error instanceof Error ? error.message : 'Unknown error occurred';
  console.warn('Operation failed:', message);
}
```
**Status**: ✅ 3/3 fixed

### File 2: axios.ts (2 violations → 2 fixed)
**Found**: Lines 12–13 — `any` in queue item types
**Fix**: Created `QueueItem` interface

```typescript
// ❌ Before
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

// ✅ After
interface QueueItem {
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}
let failedQueue: QueueItem[] = [];
```
**Status**: ✅ 2/2 fixed

### File 3: FloatingPanel.tsx (1 violation → 1 fixed)
**Found**: Line 10 — `import axios from 'axios'`
**Fix**: Removed raw import, replaced all `axios.get/post` → `axiosInstance.get/post`

```tsx
// ❌ Before (line 10)
import axios from 'axios';

// Multiple raw axios calls:
await axios.get(`${import.meta.env.VITE_API_URL}/api/geocode?q=${query}`);
await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/google`, { ... });

// ✅ After (line 10 removed, axiosInstance already imported on line 11)
// All calls updated:
await axiosInstance.get(`/api/geocode?q=${query}`);
await axiosInstance.post(`/api/auth/google`, { ... });
```
**Status**: ✅ 1/1 fixed (12 axios.get/post calls migrated)

### File 4: ExploreView.tsx (1 violation → 1 fixed)
**Found**: Line 8 — `import axios from 'axios'`
**Fix**: Replaced with axiosInstance import, updated all calls

```tsx
// ❌ Before
import axios from 'axios';
const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/public-trips?...`);

// ✅ After
import axiosInstance from '../utils/axios';
const res = await axiosInstance.get(`/api/public-trips?...`);
```
**Status**: ✅ 1/1 fixed (3 axios.get calls migrated)

### Summary
- Files processed: 4
- Violations fixed: 7/7
- New types created: `QueueItem` (TS interface)
- Import added: `AxiosError` from 'axios' in useTripStore.ts
- Compile errors: 0
```

**Step 3: Verify agent work**
```bash
# TypeScript verification
cd frontend && npx tsc --noEmit
# Expected: 0 errors

# Verify no remaining `any` violations
grep -rn "any" src/store/useTripStore.ts src/utils/axios.ts
# Expected: 0 matches for `: any`

# Verify no remaining raw axios imports in components/views
grep -rn "from 'axios'" src/components/ src/views/
# Expected: 0 matches (only store/ and utils/ should import axios)

# Run existing tests to confirm nothing broke
npm test
# Expected: All 6 tests pass
```

### Teaching Points

| Agent Best Practice | Example from This Demo |
|--------------------|----------------------|
| **Precise scope** | 7 violations enumerated with exact file:line |
| **Real inventory** | Verified by `grep`, not estimated |
| **Transformation examples** | Show ❌ before and ✅ after for each pattern |
| **Type references** | Points to `AxiosError`, `QueueItem`, `APIError` |
| **Verification commands** | `tsc --noEmit`, `grep`, `npm test` |

**Agent Prompt Formula for React**:
```
1. Inventory: grep -rn "pattern" src/ — list every file:line
2. Rules: Reference .github/copilot-instructions.md mandates
3. Existing types: Point to src/types/ definitions to reuse
4. Per-file instructions: What to change and how
5. Verification: tsc, grep for zero remaining, run tests
```

**Common Pitfall**: Saying "fix all TypeScript issues" when you mean "fix 5 specific `any` types." The more precise the scope, the more accurate the agent. **Always grep first, then enumerate.**

---

## Demo 7: Copilot Agent HQ (10 min)

### Objective
Understand how to create, manage, and orchestrate custom agents using the `.chatagent` frontmatter format in `.github/copilot-agents/`.

> **This project has 17 custom agents** — including TDD trio, Playwright tester, accessibility auditor, and Context7 expert. This demo focuses on building React-specific agents.

### Scenario
Explore the existing agent ecosystem, then create a new React component extraction agent.

### Live Coding Steps

**Step 1: Examine the .chatagent frontmatter format — Context7 agent**

```markdown
<!-- .github/copilot-agents/context7.agent.md -->
<!-- Uses .chatagent frontmatter format -->

---
name: Context7-Expert
description: Expert in latest library versions, best practices, and correct syntax
argument-hint: 'Ask about specific libraries/frameworks (e.g., "React hooks")'
tools: ['read', 'search', 'web', 'context7/*']
mcp-servers:
  context7:
handoffs:
  - label: Implement with Context7
---

# Context7 Documentation Expert

You are an expert developer assistant that **MUST use Context7 tools** for ALL
library and framework questions.

## 🚨 CRITICAL RULE
BEFORE answering ANY question about a library, you MUST:
1. STOP — Do NOT answer from memory
2. IDENTIFY — Extract the library name
3. CALL `mcp_context7_resolve-library-id`
4. SELECT — Choose best matching library ID
5. CALL `mcp_context7_get-library-docs` with that ID
```

**Step 2: Show the TDD agent trio — Red/Green/Refactor**

```markdown
<!-- .github/copilot-agents/tdd-red.agent.md — writes FAILING tests first -->
---
name: "TDD Red Phase - Write Failing Tests First"
description: "Write failing tests from GitHub issue context before implementation exists."
tools: ["github", "findTestFiles", "edit/editFiles", "runTests", "runCommands",
  "codebase", "filesystem", "search", "problems", "testFailure"]
---

<!-- .github/copilot-agents/tdd-green.agent.md — makes tests pass -->
---
name: "TDD Green Phase - Make Tests Pass"
description: "Implement minimum code to make failing tests pass."
tools: ["edit/editFiles", "runTests", "codebase", "problems"]
---

<!-- .github/copilot-agents/tdd-refactor.agent.md — improves the code -->
---
name: "TDD Refactor Phase - Improve Without Breaking"
description: "Refactor implementation while keeping all tests green."
tools: ["edit/editFiles", "runTests", "codebase", "search", "problems"]
---
```

> **React Application**: Use `@tdd-red` to write Vitest component tests → `@tdd-green` to implement the component → `@tdd-refactor` to extract hooks and optimize re-renders.

**Step 3: Create a React Component Extraction agent**

```markdown
<!-- .github/copilot-agents/react-component-splitter.agent.md -->

---
name: React-Component-Splitter
description: "Extract sub-components from god components while preserving Zustand wiring, types, and @dnd-kit integration."
argument-hint: 'Specify the file to split (e.g., "FloatingPanel.tsx into StopList, VehicleConfig, DirectionsPanel")'
tools: ['read', 'edit/editFiles', 'search', 'codebase', 'filesystem', 'runCommands', 'problems']
---

# React Component Extraction Agent

You are a senior React architect specializing in component decomposition.
Your job is to extract sub-components from large files while preserving
type safety, Zustand store wiring, and third-party integrations.

## 🚨 CRITICAL RULES

1. **ALWAYS** read the full source file before proposing extractions
2. **ALWAYS** use types from `frontend/src/types/` — never create duplicate type definitions
3. **ALWAYS** use `React.FC<Props>` with a separate `interface` above the component
4. **ALWAYS** use selective Zustand subscriptions (`state => state.field`) — not full destructure
5. **ALWAYS** use `axiosInstance` from `utils/axios.ts` — never raw `axios` or `fetch`
6. **NEVER** break @dnd-kit integration — `DndContext` must wrap all `useSortable` consumers
7. **NEVER** move global state to local state or Context API — Zustand is the mandate

## Extraction Process

### Step 1: Analyze
- Count `useState` calls — each cluster of related states suggests a sub-component
- Identify handler functions — group by concern (routing, search, save, auth)
- Map Zustand fields to consumers — which sub-component needs which store fields?

### Step 2: Define Interfaces
- Create a `Props` interface for each extracted component
- Callbacks use typed function signatures: `onAddStop: (stop: Stop) => void`
- Avoid prop drilling more than 2 levels — pass Zustand selectors instead

### Step 3: Extract
- Create new files in `src/components/{{feature}}/` directory
- Move related `useState` + handlers + JSX together
- Wire Zustand selectively in the new component (not via props from parent)

### Step 4: Create Barrel Export
- Add `src/components/{{feature}}/index.ts`
- Export all sub-components for clean imports

### Step 5: Write Tests
- Create test file alongside component: `{{ComponentName}}.test.tsx`
- Test data rendering, user interactions, and Zustand state integration
- Mock external services (`react-map-gl`, `@dnd-kit`, `axiosInstance`)

## Example: FloatingPanel.tsx (880 lines) → 5 Components

| New Component | Responsibility | useState Calls Moved | Zustand Fields |
|--------------|---------------|---------------------|----------------|
| `StopList` | Search, add, remove, reorder stops | searchQuery | stops, addStop, removeStop, reorderStops |
| `VehicleConfig` | Vehicle spec form, AI analysis | customVehicleDescription, isAnalyzing | vehicleSpecs, setVehicleSpecs |
| `DirectionsPanel` | Route display, leg-by-leg directions | (none — read-only) | routeDistance, routeDuration, routeLegs |
| `TripManager` | Save/load trips, auth gates | tripName, tripDescription, isPublic, savedTrips | saveTrip, loadTrips, loadTrip |
| `POISearch` | Category search along route | activeCategories, isSearchingPOIs | routeGeoJSON, setPOIs |
```

**Step 4: Use the agent**

```
# In Copilot Chat:
@React-Component-Splitter Extract StopList and VehicleConfig from
frontend/src/components/FloatingPanel.tsx.
Both components should use selective Zustand subscriptions and axiosInstance.
Create them in frontend/src/components/itinerary/ with barrel exports.
```

### Additional Example: Orchestrating Agents for a Complete React Feature

```
# Agent orchestration flow for adding a new "Trip Favorites" feature:

# Step 1: Use TDD Red agent to write failing tests
@tdd-red Write failing Vitest tests for a TripFavorites component that:
- Shows a heart icon (lucide-react) for each trip
- Toggles favorite status via POST /api/trips/:id/favorite
- Persists favorites in Zustand store (new `favorites: number[]` field)
- Shows optimistic update (immediately toggle, rollback on error)

# Step 2: Use TDD Green agent to implement
@tdd-green Make the TripFavorites tests pass. Follow conventions in
.github/copilot-instructions.md — Zustand for state, axiosInstance for HTTP,
React.FC<Props> typing, Tailwind CSS styling.

# Step 3: Use Context7 agent for latest API verification
@Context7-Expert What is the latest API for Zustand v4 persist middleware?
I want to persist the favorites array to localStorage.

# Step 4: Use TDD Refactor agent to optimize
@tdd-refactor Refactor TripFavorites to:
- Extract a useFavorites() custom hook (following useOnlineStatus.ts pattern)
- Add React.memo to prevent re-renders when other state changes
- Use zustand/shallow for multi-field subscription
```

> **Reference**: [GitHub Copilot Extensions documentation](https://docs.github.com/en/copilot/building-copilot-extensions) for building and managing custom agents in VS Code.

### Teaching Points

| Agent Pattern | Purpose | React Example |
|--------------|---------|---------------|
| **Specialist agent** | Deep expertise in one area | `React-Component-Splitter` — knows @dnd-kit, Zustand wiring |
| **TDD trio** | Red → Green → Refactor workflow | Write Vitest tests → Implement → Extract hooks |
| **Context7 integration** | Up-to-date library docs | Verify Zustand v4/v5 API, react-map-gl patterns |
| **Orchestration** | Chain agents for complex features | TDD Red → Green → Context7 → Refactor |
| **Rules encoding** | Agent-specific instruction set | "NEVER break @dnd-kit DndContext boundary" |

**Agent Creation Checklist**:
- [ ] `.chatagent` frontmatter with `name`, `description`, `tools`
- [ ] Critical rules section (project-specific constraints)
- [ ] Step-by-step process the agent follows
- [ ] Example input/output to calibrate behavior
- [ ] File at `.github/copilot-agents/{{name}}.agent.md`

---

## Demo 8: Architecture & Tech Stack Generation (10 min)

### Objective
Use Copilot to generate Architecture Decision Records (ADRs), component diagrams, and tech stack recommendations grounded in the actual React codebase.

### Scenario
Generate an ADR for the offline-first architecture based on real code: `offlineStorage.ts` (IndexedDB), `syncManager.ts` (bidirectional sync), `useOnlineStatus.ts` (connectivity detection), and the Zustand store's offline-aware CRUD.

### Live Coding Steps

**Step 1: Generate an ADR for the offline-first architecture**
```
# In Copilot Chat:
@workspace Generate an Architecture Decision Record (ADR) for the offline-first
architecture in the React frontend.

Analyze these real files:
- frontend/src/utils/offlineStorage.ts — IndexedDB with 3 object stores
- frontend/src/utils/syncManager.ts — bidirectional sync with retry
- frontend/src/hooks/useOnlineStatus.ts — connectivity detection (navigator.onLine + polling)
- frontend/src/store/useTripStore.ts — offline-aware CRUD (saveTrip, loadTrips, syncWithBackend)
- frontend/src/components/OfflineIndicator.tsx — UI states (online, offline, syncing, back-online)

Format as ADR with: Title, Status, Context, Decision, Consequences.
Include a data flow diagram showing the offline-first save path.
```

**Step 2: Expected ADR output**

```markdown
# ADR-007: Offline-First Architecture for Trip Management

## Status
Accepted

## Context
The Road Trip Planner app is used in areas with unreliable connectivity (rural roads,
national parks, mountain passes). Users need to create, edit, and view trips even
when offline. Changes must sync automatically when connectivity returns.

## Decision
Implement an offline-first architecture using:

1. **IndexedDB** (via `offlineStorage.ts`) as the local persistence layer
   - 3 object stores: `trips`, `pendingOperations`, `syncState`
   - Generic `dbOperation<T>()` wrapper for type-safe transactions
   - Used by Zustand store as primary write target

2. **Zustand** (via `useTripStore.ts`) as the state management layer
   - All CRUD actions follow: local save → backend attempt → queue if offline
   - `isOnline`, `isSyncing`, `pendingOperationsCount` state fields
   - `syncWithBackend()` action triggered on reconnection

3. **Bidirectional Sync** (via `syncManager.ts`)
   - Push: Process pending operations queue (CREATE, UPDATE, DELETE)
   - Pull: Fetch latest trips from backend, update local cache
   - Retry with exponential backoff on failure

4. **Connectivity Detection** (via `useOnlineStatus.ts`)
   - Primary: `navigator.onLine` + `online`/`offline` window events
   - Secondary: Polling `/health` endpoint every 30 seconds
   - SSR-safe: `typeof navigator !== 'undefined'` guard

### Data Flow: Offline-First Save Path

```
User clicks "Save Trip"
        │
        ▼
┌─────────────────────┐
│  useTripStore.       │
│  saveTrip(name)      │
│  (Zustand action)    │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│  saveTripLocally()   │ ← Always succeeds (IndexedDB)
│  (offlineStorage.ts) │
└─────────┬───────────┘
          │
          ▼
    ┌─────────────┐
    │  isOnline?   │
    └──┬───────┬──┘
       │       │
    Yes│       │No
       │       │
       ▼       ▼
┌──────────┐ ┌──────────────┐
│ POST     │ │ addPending   │
│ /api/    │ │ Operation()  │
│ trips    │ │ (IndexedDB)  │
└────┬─────┘ └──────┬───────┘
     │              │
     ▼              ▼
┌──────────┐ ┌──────────────┐
│ Update   │ │ Update       │
│ local ID │ │ pending      │
│ with     │ │ count in     │
│ server   │ │ Zustand      │
│ response │ └──────────────┘
└──────────┘
```

## Consequences

### Positive
- Users can save trips without connectivity
- Optimistic UI — no loading spinners for saves
- Resilient to network interruptions mid-operation
- Sync is transparent (OfflineIndicator shows status)

### Negative
- Conflict resolution is last-write-wins (no merge strategy)
- IndexedDB storage limit (~50MB in most browsers)
- Pending operations queue can grow unbounded if offline for extended periods
- No server-sent events — sync requires user-initiated or interval-based polling

### Risks
- Duplicate trips if offline CREATE reaches server after manual re-creation
- Token expiry during offline period → 401 on sync (handled by catch blocks)
```

**Step 3: Generate the React component architecture diagram**

```
# In Copilot Chat:
@workspace Generate a React component tree diagram for the Road Trip Planner
frontend. Show the hierarchy from App.tsx through all routes and components.
Include the Zustand store connections and which components use which store fields.

Reference:
- App.tsx — BrowserRouter, GoogleOAuthProvider, Routes
- MainLayout.tsx — Outlet, MapComponent, AuthStatus, OfflineIndicator
- Views: ExploreView, ItineraryView, TripsView, StartTripView, AllTripsView
- ItineraryView wraps FloatingPanel
```

Expected output:
```
App.tsx
├── GoogleOAuthProvider (clientId from VITE_GOOGLE_CLIENT_ID)
│   └── BrowserRouter
│       └── Toaster (react-hot-toast)
│       └── Routes
│           └── Route path="/" element={<MainLayout />}
│               │
│               │ ┌────────────────────────────────────────────┐
│               │ │ MainLayout.tsx                              │
│               │ │ Store: initializeOfflineMode               │
│               │ ├─ <DesktopSidebar />                        │
│               │ │   └─ NavLink (explore, itinerary, trips)   │
│               │ │   └─ <VersionDisplay />                    │
│               │ ├─ <MapComponent />                           │
│               │ │   Store: stops, routeGeoJSON, pois         │
│               │ │   └─ <Map> (react-map-gl)                  │
│               │ │       ├─ <Marker /> per stop               │
│               │ │       ├─ <Marker /> per POI                │
│               │ │       └─ <Source> + <Layer> (route line)   │
│               │ ├─ <AuthStatus />                            │
│               │ ├─ <OfflineIndicator />                      │
│               │ │   Store: isOnline, pendingOpsCount,        │
│               │ │          isSyncing, lastSyncTimestamp      │
│               │ │   Hook: useOnlineStatus()                  │
│               │ └─ <Outlet /> ← child routes render here    │
│               │
│               ├── Route path="explore"
│               │   └── <ExploreView />
│               │       Store: addStop, stops
│               │       └── Category grid, search, featured trips
│               │
│               ├── Route path="itinerary"
│               │   └── <ItineraryView />
│               │       └── <FloatingPanel /> (880 lines — NEEDS EXTRACTION)
│               │           Store: vehicleSpecs, stops, routeGeoJSON, pois,
│               │                  saveTrip, loadTrips, + 10 more actions
│               │           Libs: @dnd-kit, @turf/turf, @react-oauth/google
│               │           └── <SortableStopItem /> (sub-component)
│               │
│               ├── Route path="trips"
│               │   └── <TripsView />
│               │       Auth-gated, loads user's saved trips
│               │
│               ├── Route path="start"
│               │   └── <StartTripView />
│               │       Trip creation options (blank, AI, templates)
│               │
│               └── Route path="all-trips"
│                   └── <AllTripsView />
│                       Public/community trips feed
│
│               └── <MobileBottomNav /> (visible on mobile only)
└────────────────────────────────────────────────────────────┘
```

### Additional Example: Using Context7 for Zustand Middleware Recommendation

```
# In Copilot Chat:
@context7 resolve-library-id "zustand"
@context7 get-library-docs for persist middleware and devtools middleware

# Based on Context7's response, generate a recommendation:
```

```markdown
## Tech Recommendation: Add Zustand Middleware

### Current State
- `useTripStore.ts` uses `create<TripState>()` with no middleware
- Offline state is manually persisted via IndexedDB (`offlineStorage.ts`)
- No devtools integration for debugging state changes

### Recommendation (from Context7 Zustand v4 docs)

1. **`persist` middleware** — Replace manual IndexedDB sync for trip data:
```tsx
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useTripStore = create<TripState>()(
  persist(
    (set, get) => ({
      // ... existing state and actions
    }),
    {
      name: 'road-trip-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist these fields (not isOnline, isSyncing, etc.)
        vehicleSpecs: state.vehicleSpecs,
        stops: state.stops,
      }),
    }
  )
);
```

2. **`devtools` middleware** — Debug state changes in React DevTools:
```tsx
import { devtools, persist } from 'zustand/middleware';

export const useTripStore = create<TripState>()(
  devtools(
    persist(
      (set, get) => ({ ... }),
      { name: 'road-trip-storage' }
    ),
    { name: 'TripStore' }
  )
);
```

### Trade-offs
| Approach | Pros | Cons |
|----------|------|------|
| Current (manual IndexedDB) | Fine-grained control, large data support | Verbose, no devtools, manual sync |
| `persist` middleware | Automatic, less code, devtools | localStorage 5MB limit, no IndexedDB |
| Hybrid (persist + IndexedDB) | Best of both | More complexity |

### Verdict
Keep IndexedDB for trip data (can exceed localStorage limits) but add `devtools`
middleware for development debugging. Consider `persist` for small state like
`vehicleSpecs` defaults.
```

> **Reference**: [Microsoft Copilot documentation on architecture generation](https://docs.github.com/en/copilot/using-github-copilot/using-github-copilot-in-the-command-line) for using Copilot to scaffold ADRs and architecture diagrams.

### Teaching Points

| Architecture Artifact | How Copilot Helps | React Example |
|----------------------|-------------------|---------------|
| ADR | Analyzes real code → structured decision record | Offline-first architecture from 5 source files |
| Component diagram | Maps component tree + store connections | App → MainLayout → Views → Components |
| Tech recommendation | Context7 docs → informed middleware choice | Zustand persist vs. manual IndexedDB |
| Data flow diagram | Traces user action through layers | Save trip → local → backend (or queue) |

**Architecture Prompting Formula**:
```
1. Name the real files (not abstract concepts)
2. Specify the output format (ADR, diagram, recommendation)
3. Ask for trade-offs and consequences (not just "the best way")
4. Use Context7 for up-to-date library capabilities
5. Cross-reference with .github/copilot-instructions.md mandates
```

---

## Workshop Summary

### 8 Techniques Applied to React

| # | Technique | React Application | Key Takeaway |
|---|-----------|-------------------|--------------|
| 1 | Chain-of-Thought | Decompose FloatingPanel.tsx (880 lines) | Reference real types and Zustand actions in each step |
| 2 | Instruction Files | Enforce Zustand, axiosInstance, React.FC conventions | More specific = better Copilot compliance |
| 3 | Prompt Files | React component + custom hook generators | Template + checklist = consistent generation |
| 4 | Code Review | Find `any` types, raw axios, god components | Review real violations, not fabricated issues |
| 5 | Plan Mode | Component test infrastructure with Vitest | Phase-based plans with shared test utilities |
| 6 | Coding Agent | Eliminate `any` + migrate to axiosInstance | Precise grep-verified scope = agent accuracy |
| 7 | Agent HQ | React-Component-Splitter + TDD trio orchestration | Specialist agents with domain constraints |
| 8 | Architecture | ADR for offline-first + Zustand middleware | Context7 for current library APIs |

### Files Referenced in This Workshop

| Category | Files | Purpose |
|----------|-------|---------|
| **Components** | `FloatingPanel.tsx`, `MapComponent.tsx`, `OfflineIndicator.tsx`, `AuthStatus.tsx`, `MainLayout.tsx` | React component patterns |
| **Store** | `useTripStore.ts`, `useTripStore.test.ts` | Zustand state management + testing |
| **Hooks** | `useOnlineStatus.ts` | Custom hook pattern |
| **Utils** | `axios.ts`, `offlineStorage.ts`, `syncManager.ts`, `version.ts` | Infrastructure utilities |
| **Types** | `types/index.ts`, `types/Stop.ts`, `types/Vehicle.ts`, `types/Route.ts`, `types/POI.ts` | TypeScript type definitions |
| **Views** | `ExploreView.tsx`, `ItineraryView.tsx`, `TripsView.tsx`, `StartTripView.tsx`, `AllTripsView.tsx` | Page-level components |
| **Config** | `vite.config.ts`, `vitest.config.ts`, `tailwind.config.js`, `tsconfig.app.json` | Build + test configuration |
| **Copilot** | `.github/copilot-instructions.md`, `.github/prompts/`, `.github/copilot-agents/` | Copilot customization |

### What's Next?
- **Workshop 4 (Expert)**: MCP servers, Context7 deep dive, multi-agent orchestration, custom Copilot extensions
- **Hands-on Lab**: Apply these 8 techniques to extract FloatingPanel.tsx into 5 sub-components with full test coverage
- **Team Exercise**: Create your team's prompt files and instruction file rules for your React project
