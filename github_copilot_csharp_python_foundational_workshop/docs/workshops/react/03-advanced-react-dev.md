# Workshop 3: Advanced React Development with GitHub Copilot

**Duration**: 90 minutes  
**Format**: Live coding demonstrations  
**Audience**: React developers proficient with Copilot prompting (completed Workshops 1-2)  
**Prerequisites**: Experience with explicit prompting, few-shot learning, Zustand/TypeScript patterns  
**Project**: Road Trip Planner — React 18 + TypeScript + Zustand + React-Map-GL + Tailwind CSS

---

## Learning Objectives

By the end of this workshop, you will master these **8 advanced Copilot techniques**:

1. **Chain-of-Thought Prompting** — Break complex React features into logical reasoning steps
2. **Instruction Files** — Customize instruction files with React/TypeScript-specific rules
3. **Prompt Files** — Create reusable `.prompt.md` files for components, stores, and hooks
4. **Copilot Code Review** — Use Copilot to review React PRs and identify pattern violations
5. **Copilot Plan Mode** — Architect component decomposition before implementation
6. **Copilot Coding Agent** — Delegate autonomous multi-file React tasks
7. **Custom Agents** — Create and orchestrate React-specialized agents via `AGENTS.md`
8. **Architecture & Test Generation** — Generate test infrastructure and ADRs

### CORE Prompt Framework

All prompts in this workshop follow the **CORE** framework:

| Element | Meaning | Example |
|---------|---------|---------|
| **C** – Context | Background, tech stack, relevant files | "In the React frontend (`frontend/src/`)..." |
| **O** – Objective | What you want Copilot to produce | "Create a custom hook for trip persistence" |
| **R** – Requirements | Constraints, rules, patterns to follow | "Use Zustand for state, `axiosInstance` for API calls" |
| **E** – Examples | Expected inputs/outputs, code patterns | "Input: `tripId` → Output: `{ trip, isLoading, error }`" |

---

## Copilot Chat Modes (2025/2026)

GitHub Copilot in VS Code uses three built-in agents:

| Agent | Purpose | When to Use |
|-------|---------|-------------|
| **Ask** | Read-only Q&A, explanations | Understanding hooks, store logic, complex JSX |
| **Agent** | Autonomous multi-step edits | Refactoring components, creating files, extracting constants |
| **Plan** | Generate a plan before editing | Complex decompositions requiring review before execution |

> ⚠️ **Note**: Slash commands have been replaced by natural language prompts. Use context mentions to provide file references.

### React-Specific Context Mentions

| Context | Usage | Example |
|---------|-------|---------|
| `#selection` | Reference highlighted JSX, hooks, or interfaces | "Explain the map bounds logic in `#selection`" |
| `#file:useTripStore.ts` | Reference entire store file | "Generate tests for the actions in `#file:useTripStore.ts`" |
| `#codebase` | Search across all frontend files | "Find all components that call raw `axios` instead of `axiosInstance`" |
| `@workspace` | Workspace-aware suggestions | "What custom hooks exist in this project?" |

### New 2025/2026 Features

| Feature | Description | Demo |
|---------|-------------|------|
| **`/init` command** | Bootstrap workspace instructions from existing code | Demo 2 |
| **Path-specific instructions** | Apply rules to specific file patterns via `applyTo` | Demo 2 |
| **`AGENTS.md`** | Define custom AI agents with specialized behaviors | Demo 7 |
| **Agent sessions** | Persistent context across multi-step agent tasks | Demo 5, 6 |
| **Context handoff** | Pass context between Ask → Plan → Agent modes | Demo 5 |

---

## Workshop Agenda

| Time | Demo | Topic | Focus Files |
|------|------|-------|-------------|
| 0–12 min | Demo 1 | **Chain-of-Thought Prompting** | `useOnlineStatus.ts`, `useTripStore.ts` |
| 12–22 min | Demo 2 | **Instruction Files** | `.github/copilot-instructions.md`, `/init` command |
| 22–32 min | Demo 3 | **Prompt Files** | `.github/prompts/*.prompt.md` |
| 32–42 min | Demo 4 | **Copilot Code Review** | React PR review patterns |
| 42–57 min | Demo 5 | **Plan Mode** | `FloatingPanel.tsx` (879 lines) decomposition |
| 57–72 min | Demo 6 | **Coding Agent** | Constants extraction (4 files) |
| 72–82 min | Demo 7 | **Custom Agents** | `@react-pattern-validator` agent |
| 82–90 min | Demo 8 | **Architecture & Test Generation** | Test infrastructure + ADR |

---

## Real Codebase Issues Addressed

> 💡 **Every demo addresses a real issue** from the project codebase. Attendees leave with both Copilot skills AND working contributions.

| Demo | Issue | Severity |
|------|-------|----------|
| Demo 1 | Complex hook logic needs documentation patterns | Best Practice |
| Demo 2 | No path-specific instruction files for React patterns | P2 DevEx |
| Demo 3 | No reusable prompt templates for components/hooks | P2 DevEx |
| Demo 4 | PR reviews miss React anti-patterns | Best Practice |
| Demo 5 | 879-line god component (`FloatingPanel.tsx`) needs decomposition | P1 Architecture |
| Demo 6 | `frontend/src/constants/` folder is empty (4 required files) | P1 Architecture |
| Demo 7 | Raw `axios` calls bypass `axiosInstance` in some views | P0 Security |
| Demo 8 | Only 6 tests exist, zero component tests | P2 Quality |

---

## Demo 1: Chain-of-Thought Prompting (12 min)

### Objective
Learn to decompose complex React features into step-by-step reasoning chains that guide Copilot toward correct solutions.

### Scenario
Create a custom hook for trip persistence with offline support, using the existing `useOnlineStatus` and `useTripStore` patterns as references.

---

### Example 1A: Custom Hook — Offline Trip Sync

**CORE Prompt:**
```
Context: In the React frontend (frontend/src/hooks/), we have:
- useOnlineStatus.ts: custom hook that monitors network state with event listeners
  and periodic health checks, returns { isOnline, lastOnlineTime }
- useTripStore.ts: Zustand store with trip data, offline sync fields
  (pendingSync, lastSyncTimestamp), and actions (setTrip, markPendingSync)

Objective: Create a useTripSync hook that automatically syncs pending trips
when the device comes back online.

Requirements:
- Import useOnlineStatus for network state
- Import useTripStore for pending trips
- Use axiosInstance (from utils/axios.ts) for API calls — NOT raw axios
- Handle race conditions if multiple syncs trigger
- Include cleanup in useEffect
- Follow the useOnlineStatus pattern for event handling
- Return { isSyncing, lastSyncError, forceSync }

Examples:
- When isOnline transitions false → true AND pendingSync is true:
  1. Set isSyncing = true
  2. Call POST /api/trips with current trip data
  3. On success: clear pendingSync, update lastSyncTimestamp
  4. On failure: set lastSyncError, keep pendingSync = true
- forceSync(): manually trigger sync regardless of pendingSync flag

Chain of thought:
Step 1: Import dependencies (useEffect, useState, useOnlineStatus, useTripStore, axiosInstance)
Step 2: Track local state: isSyncing, lastSyncError
Step 3: Create syncTrip async function with error handling
Step 4: useEffect that watches isOnline transitions
Step 5: Use useRef to track previous isOnline state for edge detection
Step 6: Add abort controller for cleanup on unmount
Step 7: Return hook interface { isSyncing, lastSyncError, forceSync }

Now implement:
```

**Expected Copilot Output:**
```typescript
// frontend/src/hooks/useTripSync.ts

import { useEffect, useState, useRef, useCallback } from 'react';
import { useOnlineStatus } from './useOnlineStatus';
import { useTripStore } from '../store/useTripStore';
import axiosInstance from '../utils/axios';

interface UseTripSyncReturn {
  isSyncing: boolean;
  lastSyncError: string | null;
  forceSync: () => Promise<void>;
}

export function useTripSync(): UseTripSyncReturn {
  // Step 2: Local state
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncError, setLastSyncError] = useState<string | null>(null);
  
  // Step 5: Track previous online state
  const wasOnlineRef = useRef<boolean | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  const { isOnline } = useOnlineStatus();
  const { pendingSync, currentTrip, clearPendingSync, updateLastSync } = useTripStore();

  // Step 3: Sync function
  const syncTrip = useCallback(async () => {
    if (!currentTrip || isSyncing) return;
    
    // Cancel any in-flight request
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();
    
    setIsSyncing(true);
    setLastSyncError(null);
    
    try {
      await axiosInstance.post('/api/trips', currentTrip, {
        signal: abortControllerRef.current.signal,
      });
      clearPendingSync();
      updateLastSync(new Date().toISOString());
    } catch (error) {
      if (error instanceof Error && error.name !== 'AbortError') {
        setLastSyncError(error.message || 'Sync failed');
      }
    } finally {
      setIsSyncing(false);
    }
  }, [currentTrip, isSyncing, clearPendingSync, updateLastSync]);

  // Step 4: Watch online transitions
  useEffect(() => {
    // Step 5: Edge detection — only sync on false → true transition
    if (wasOnlineRef.current === false && isOnline && pendingSync) {
      syncTrip();
    }
    wasOnlineRef.current = isOnline;
  }, [isOnline, pendingSync, syncTrip]);

  // Step 6: Cleanup
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  // Step 7: Return interface
  return {
    isSyncing,
    lastSyncError,
    forceSync: syncTrip,
  };
}
```

---

### Example 1B: Chain-of-Thought for Map Bounds Calculation

**CORE Prompt:**
```
Context: In MapComponent.tsx, we need to auto-fit the map bounds whenever
the route changes. The component uses react-map-gl (Mapbox GL JS wrapper),
and route data comes from useTripStore's routeGeoJSON field which is a
GeoJSON LineString with coordinates in [lng, lat] format.

Objective: Add a useEffect that calculates and applies optimal map bounds
when routeGeoJSON changes.

Requirements:
- Use mapboxgl.LngLatBounds for bounds calculation
- Access map instance via mapRef.current
- Apply padding of 50px on all sides
- Handle empty coordinates gracefully
- Include stops array in bounds calculation (not just route)
- Coordinates are always [lng, lat] per GeoJSON spec

Chain of thought:
Step 1: Check if mapRef.current exists (guard clause)
Step 2: Check if routeGeoJSON has coordinates (guard clause)
Step 3: Create new LngLatBounds instance
Step 4: Extend bounds with each route coordinate
Step 5: Also extend with each stop's coordinates
Step 6: Call fitBounds with padding: 50
Step 7: Wrap in try-catch for malformed data

Now implement:
```

**Expected Copilot Output:**
```typescript
// In frontend/src/components/MapComponent.tsx

useEffect(() => {
  // Step 1: Guard — map instance required
  if (!mapRef.current) return;
  
  // Step 2: Guard — need coordinates
  const coords = routeGeoJSON?.coordinates;
  if (!coords || coords.length === 0) return;
  
  try {
    // Step 3: Create bounds
    const bounds = new mapboxgl.LngLatBounds();
    
    // Step 4: Extend with route coordinates
    coords.forEach((coord: [number, number]) => {
      bounds.extend(coord); // [lng, lat]
    });
    
    // Step 5: Include stops in bounds
    stops.forEach((stop) => {
      if (stop.coordinates) {
        bounds.extend(stop.coordinates as [number, number]);
      }
    });
    
    // Step 6: Fit bounds with padding
    mapRef.current.fitBounds(bounds, { padding: 50 });
  } catch (error) {
    // Step 7: Handle malformed data
    console.error('Failed to fit map bounds:', error);
  }
}, [routeGeoJSON, stops]);
```

---

### Teaching Points

| Chain-of-Thought Pattern | Hook Example | Map Example |
|-------------------------|--------------|-------------|
| Step 1: Guards | Check dependencies | Check mapRef |
| Step 2: State setup | useState, useRef | LngLatBounds |
| Step 3: Core logic | Async sync function | Extend bounds |
| Step 4: Side effects | useEffect for transitions | fitBounds call |
| Step 5: Edge cases | Previous state tracking | Include stops |
| Step 6: Cleanup | AbortController | try-catch |
| Step 7: Return/Output | Hook interface | Padding config |

**When to Use**: Complex hooks, map integrations, state machines, async flows  
**Avoid**: Simple useState, trivial event handlers

---

## Demo 2: Instruction Files (10 min)

### Objective
Customize instruction files with React/TypeScript-specific rules that Copilot automatically applies.

### Scenario
Use the `/init` command to bootstrap workspace instructions, then create path-specific instruction files for React patterns.

---

### Step 1: Bootstrap with `/init` Command

```
/init

Analyze this React project and suggest initial copilot-instructions.md content
focusing on:
- State management patterns (Zustand store structure)
- Component conventions (functional only, no class components)
- TypeScript requirements (no 'any', interface-first)
- Import patterns (axiosInstance, not raw axios)
- Coordinate format ([lng, lat] for Mapbox)
```

**Expected Copilot Output:**
```markdown
## Suggested .github/copilot-instructions.md

Based on analysis of your React frontend, here are recommended rules:

### TypeScript Requirements
- No `any` types — use `unknown` for truly dynamic data
- Define `interface ComponentProps` above each component
- All Zustand store slices must be typed

### State Management (Zustand)
- Global state: useTripStore, useAuthStore
- Local state (useState): Form inputs before save, UI toggles only
- Never store API responses in local state — always go through Zustand

### Component Conventions
- Functional components only — no class components
- Props interface named `{ComponentName}Props`
- Use Tailwind CSS for styling — no CSS modules

### Import Patterns
- API calls: `import axiosInstance from '@/utils/axios'`
- Never use raw `axios` or `fetch`
- Never call external APIs (Mapbox, Azure) directly from components

### Coordinate Format (Critical)
- Always `[longitude, latitude]` — GeoJSON format
- Never `[lat, lng]` — this breaks Mapbox
```

---

### Step 2: Create Path-Specific Instruction File

```markdown
<!-- frontend/.instructions.md -->
---
applyTo: "**/*.tsx,**/*.ts"
---

# React Frontend Rules

## Component Structure
Every React component file must follow this structure:
1. Imports (external, then internal, then types)
2. Interface definitions (Props, State types)
3. Constants (if local to component)
4. Component function
5. Export (prefer named exports)

```typescript
// ✅ CORRECT structure
import { useState } from 'react';
import { useTripStore } from '@/store/useTripStore';
import type { Stop } from '@/types';

interface StopCardProps {
  stop: Stop;
  onDelete: (id: string) => void;
}

export function StopCard({ stop, onDelete }: StopCardProps) {
  // ...
}
```

## Zustand Store Access
```typescript
// ❌ WRONG — destructuring entire store causes unnecessary re-renders
const store = useTripStore();
const stops = store.stops;

// ✅ CORRECT — select only needed values
const stops = useTripStore((state) => state.stops);
const addStop = useTripStore((state) => state.addStop);
```

## API Calls
```typescript
// ❌ WRONG — raw axios
import axios from 'axios';
const response = await axios.get('/api/trips');

// ✅ CORRECT — axiosInstance with interceptors
import axiosInstance from '@/utils/axios';
const response = await axiosInstance.get('/api/trips');
```

## Error Boundaries
All view-level components should be wrapped in ErrorBoundary.
```typescript
// In App.tsx or view component
<ErrorBoundary fallback={<TripErrorFallback />}>
  <FloatingPanel />
</ErrorBoundary>
```
```

---

### Step 3: Create Hook-Specific Instructions

```markdown
<!-- frontend/src/hooks/.instructions.md -->
---
applyTo: "**/*.ts"
---

# Custom Hook Rules

## Naming Convention
- Prefix with `use`: `useOnlineStatus`, `useTripSync`
- Return type must be explicitly defined

## Structure Pattern
```typescript
// Follow this pattern for all hooks:

interface UseHookNameReturn {
  // Always define return type interface
}

export function useHookName(params?: Params): UseHookNameReturn {
  // 1. State declarations (useState, useRef)
  // 2. Store access (Zustand selectors)
  // 3. Derived state (useMemo)
  // 4. Callbacks (useCallback)
  // 5. Effects (useEffect)
  // 6. Return statement
}
```

## Cleanup Requirements
- Always clean up event listeners
- Always abort in-flight requests on unmount
- Use AbortController for async operations

## Reference Implementation
See `useOnlineStatus.ts` for the canonical hook pattern with:
- Event listener cleanup
- Periodic health checks
- SSR guards (`typeof window !== 'undefined'`)
```

---

### Teaching Points

| Instruction Feature | Purpose | File |
|--------------------|---------|------|
| `/init` command | Bootstrap from existing code | Initial setup |
| `applyTo` pattern | Scope rules to file types | `**/*.tsx,**/*.ts` |
| ❌/✅ examples | Clear anti-patterns | Per section |
| Reference files | Point to canonical implementations | `useOnlineStatus.ts` |

---

## Demo 3: Prompt Files (10 min)

### Objective
Create reusable `.prompt.md` files with CORE framework for consistent React code generation.

### Scenario
Create prompt files for React components, Zustand stores, and custom hooks.

---

### Step 1: Create React Component Prompt

```markdown
<!-- .github/prompts/react-component.prompt.md -->

# React Component Generator (CORE Framework)

## Context
You are generating a React 18 functional component for the Road Trip Planner
frontend (`frontend/src/`). The project uses TypeScript, Zustand for state,
Tailwind CSS for styling, and follows the patterns in existing components
like `StopCard.tsx` and `VehicleSpecsForm.tsx`.

## Objective
Generate a new React component following project conventions.

## Requirements
- TypeScript with explicit prop interface (`{Name}Props`)
- Functional component (no class components)
- Tailwind CSS for all styling (no CSS modules or styled-components)
- Access Zustand store with selectors (not full store destructuring)
- Use `axiosInstance` for any API calls (never raw axios/fetch)
- Include JSDoc comment describing the component
- Export as named export (not default)

## Examples

### Input
"Create a TripSummaryCard component that displays trip name, distance,
duration, and a 'View Details' button."

### Expected Output
```tsx
import { useTripStore } from '@/store/useTripStore';

/**
 * Displays a summary card for a trip with key stats.
 * Used in trip list views and dashboard.
 */
interface TripSummaryCardProps {
  tripId: number;
  onViewDetails: (id: number) => void;
}

export function TripSummaryCard({ tripId, onViewDetails }: TripSummaryCardProps) {
  const trip = useTripStore((state) => 
    state.trips.find((t) => t.id === tripId)
  );

  if (!trip) return null;

  return (
    <div className="rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-lg font-semibold text-gray-900">{trip.name}</h3>
      <div className="mt-2 flex gap-4 text-sm text-gray-600">
        <span>{trip.distance_miles?.toFixed(1)} mi</span>
        <span>{Math.round((trip.duration_seconds || 0) / 60)} min</span>
      </div>
      <button
        onClick={() => onViewDetails(tripId)}
        className="mt-4 w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
      >
        View Details
      </button>
    </div>
  );
}
```

## Checklist
- [ ] Props interface with `{ComponentName}Props` naming
- [ ] JSDoc comment describing purpose
- [ ] Zustand selector pattern (not full store)
- [ ] Tailwind classes only
- [ ] Named export
- [ ] No raw axios/fetch calls
```

---

### Step 2: Create Zustand Store Prompt

```markdown
<!-- .github/prompts/zustand-store.prompt.md -->

# Zustand Store Generator (CORE Framework)

## Context
You are generating a Zustand store for the Road Trip Planner React frontend.
Existing stores follow the pattern in `useTripStore.ts` with typed state,
actions, and optional persistence via `zustand/middleware`.

## Objective
Generate a new Zustand store with proper TypeScript typing.

## Requirements
- Use `create<StateType>()` with explicit state interface
- Separate state properties from actions in the interface
- Use immer pattern for nested state updates (if complex)
- Include selectors as separate exports for performance
- Use persist middleware only if data should survive refresh
- Follow naming: `use{Domain}Store`, `{Domain}State` interface

## Examples

### Input
"Create a useNotificationStore for managing toast notifications with
add, remove, and clearAll actions."

### Expected Output
```typescript
// frontend/src/store/useNotificationStore.ts

import { create } from 'zustand';

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

interface NotificationState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id'>) => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],

  addNotification: (notification) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        { ...notification, id: crypto.randomUUID() },
      ],
    })),

  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    })),

  clearAll: () => set({ notifications: [] }),
}));

// Selectors for performance
export const selectNotifications = (state: NotificationState) => state.notifications;
export const selectHasNotifications = (state: NotificationState) => 
  state.notifications.length > 0;
```

## Checklist
- [ ] Explicit state interface with `{Domain}State` naming
- [ ] Actions defined within interface
- [ ] Immutable updates via spread or immer
- [ ] Exported selectors for common queries
- [ ] `use{Domain}Store` naming convention
```

---

### Step 3: Create Custom Hook Prompt

```markdown
<!-- .github/prompts/custom-hook.prompt.md -->

# Custom Hook Generator (CORE Framework)

## Context
You are generating a custom React hook for the Road Trip Planner frontend.
Follow the patterns established in `useOnlineStatus.ts` and `useAuth.ts`:
explicit return type interface, proper cleanup, and SSR guards.

## Objective
Generate a new custom hook following project conventions.

## Requirements
- Return type interface: `Use{HookName}Return`
- SSR guard: `typeof window !== 'undefined'`
- Cleanup all effects (event listeners, abort controllers, intervals)
- Use `useCallback` for returned functions to maintain referential stability
- Use `axiosInstance` for any API calls
- Document with JSDoc including @returns

## Examples

### Input
"Create a useDebounce hook that debounces a value by a configurable delay."

### Expected Output
```typescript
// frontend/src/hooks/useDebounce.ts

import { useState, useEffect } from 'react';

/**
 * Debounces a value by the specified delay.
 * Useful for search inputs, resize handlers, etc.
 * 
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (default: 300)
 * @returns The debounced value
 * 
 * @example
 * const debouncedSearch = useDebounce(searchQuery, 500);
 * useEffect(() => {
 *   if (debouncedSearch) fetchResults(debouncedSearch);
 * }, [debouncedSearch]);
 */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // SSR guard
    if (typeof window === 'undefined') return;

    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup on value change or unmount
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}
```

## Checklist
- [ ] Return type documented (interface or inline)
- [ ] JSDoc with @returns and @example
- [ ] SSR guard if using browser APIs
- [ ] Cleanup in useEffect return
- [ ] Generic types where appropriate (`<T>`)
```

---

### Step 4: Use a Prompt File in Chat

```
# In Copilot Chat:
#file:.github/prompts/react-component.prompt.md

Create a RouteLegCard component that displays a single route leg with:
- Origin and destination names
- Distance in miles
- Duration formatted as "Xh Ym"
- Estimated fuel cost based on vehicle MPG from useTripStore
```

### Teaching Points

| Prompt File Element | Component | Store | Hook |
|--------------------|-----------|-------|------|
| **C**ontext | Existing component patterns | `useTripStore.ts` | `useOnlineStatus.ts` |
| **O**bjective | New component with props | New store with actions | New hook with return type |
| **R**equirements | Tailwind, selectors | Immer, selectors | Cleanup, SSR guard |
| **E**xamples | Full TSX snippet | Full store file | Full hook file |

---

## Demo 4: Copilot Code Review (10 min)

### Objective
Use Copilot to review React pull requests, identifying pattern violations and anti-patterns.

### Scenario
Review a PR that adds trip filtering functionality across multiple components.

### Live Coding Steps

**Step 1: Invoke Copilot Code Review with CORE Prompt**
```
Context: A PR adds trip filtering to the Road Trip Planner frontend:
- frontend/src/views/TripsView.tsx — adds filter state and UI
- frontend/src/components/TripFilterBar.tsx — new filter component
- frontend/src/store/useTripStore.ts — adds filteredTrips selector

The project uses:
- React 18 + TypeScript (strict mode)
- Zustand for state (not Redux/Context)
- axiosInstance for all API calls
- Tailwind CSS (no CSS modules)
- Coordinates in [lng, lat] format

Objective: Review all changes for React best practices and project conventions.

Requirements: Check for
1. TypeScript violations (any, missing types)
2. Zustand anti-patterns (full store destructuring)
3. Raw axios/fetch usage (security violation)
4. Inline styles or CSS modules (should use Tailwind)
5. Coordinate format issues ([lat, lng] instead of [lng, lat])
6. Missing memoization for expensive computations
7. useEffect dependency array issues

Examples of issues to flag:
- const store = useTripStore(); // Full store = unnecessary re-renders
- const response = await fetch('/api/trips'); // Should use axiosInstance
- style={{ marginTop: 10 }} // Should use Tailwind
```

**Step 2: Expected Copilot Review Output**
```markdown
## Code Review: Trip Filtering Feature

### 🔴 Critical Issues

**1. Raw fetch in TripFilterBar.tsx:42**
```tsx
// ❌ Current — bypasses auth interceptor
const tags = await fetch('/api/tags').then(r => r.json());

// ✅ Fix — use axiosInstance
import axiosInstance from '@/utils/axios';
const { data: tags } = await axiosInstance.get('/api/tags');
```

**2. Full store destructuring in TripsView.tsx:15**
```tsx
// ❌ Current — re-renders on ANY store change
const { trips, setFilter, clearFilter, loading } = useTripStore();

// ✅ Fix — select specific values
const trips = useTripStore((s) => s.trips);
const setFilter = useTripStore((s) => s.setFilter);
const loading = useTripStore((s) => s.loading);
```

### 🟡 Warnings

**3. Missing useMemo for filtered trips (TripsView.tsx:28)**
```tsx
// ❌ Current — recalculates on every render
const filteredTrips = trips.filter(t => 
  t.name.toLowerCase().includes(searchQuery.toLowerCase())
);

// ✅ Fix — memoize computation
const filteredTrips = useMemo(
  () => trips.filter(t => 
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  ),
  [trips, searchQuery]
);
```

**4. Inline styles in TripFilterBar.tsx:67**
```tsx
// ❌ Current — inline styles
<div style={{ display: 'flex', gap: '8px' }}>

// ✅ Fix — Tailwind classes
<div className="flex gap-2">
```

**5. Missing TypeScript interface (TripFilterBar.tsx)**
```tsx
// ❌ Current — props inferred
export function TripFilterBar({ onFilterChange, initialFilters }) {

// ✅ Fix — explicit interface
interface TripFilterBarProps {
  onFilterChange: (filters: TripFilters) => void;
  initialFilters?: TripFilters;
}

export function TripFilterBar({ onFilterChange, initialFilters }: TripFilterBarProps) {
```

### 🟢 Suggestions

**6. Consider useTransition for filter updates**
```tsx
const [isPending, startTransition] = useTransition();

const handleFilterChange = (filters: TripFilters) => {
  startTransition(() => {
    setFilter(filters); // Lower priority, won't block input
  });
};
```

### Summary
- 2 critical issues (must fix before merge)
- 3 warnings (should fix)
- 1 suggestion (nice to have)
```

### Teaching Points

| Review Focus | What to Check | Project Rule |
|-------------|---------------|--------------|
| TypeScript | `any`, missing interfaces | Strict mode enabled |
| State | Full store destructuring | Use selectors |
| API calls | raw fetch/axios | `axiosInstance` only |
| Styling | inline styles, CSS modules | Tailwind only |
| Performance | missing memo, expensive computations | useMemo, useCallback |

---

## Demo 5: Copilot Plan Mode (15 min)

### Objective
Use Plan Mode to architect component decomposition before implementation.

### Scenario
Create a comprehensive plan to decompose the 879-line `FloatingPanel.tsx` god component into smaller, focused components.

### Live Coding Steps

**Step 1: Invoke Plan Mode with CORE prompt**
```
Context: FloatingPanel.tsx in frontend/src/components/ is 879 lines — a god component
that handles:
- Vehicle specification form (lines 150-250)
- Stop list with drag-and-drop via @dnd-kit (lines 270-400)
- POI search panel (lines 420-520)
- AI trip generation form (lines 540-620)
- Trip save/load logic (lines 640-750)
- Panel collapse/expand UI (lines 50-100)

The component imports:
- @dnd-kit/core, @dnd-kit/sortable for drag-drop
- useTripStore for all state
- axiosInstance for API calls
- Multiple child components (StopCard, VehicleSpecsForm)

Objective: Create a phased plan to decompose FloatingPanel into 5 focused components
while maintaining all functionality.

Requirements:
- Each new component should be under 200 lines
- Maintain existing drag-drop functionality
- Keep state in Zustand (don't introduce prop drilling)
- Each component should have a single responsibility
- Create TypeScript interfaces for all props
- Test each component before moving to next phase

Examples of target architecture:
- FloatingPanel.tsx (container, ~100 lines) — layout + panel state
- VehicleSpecsPanel.tsx — vehicle form (extracted existing VehicleSpecsForm)
- StopListPanel.tsx — drag-drop stops with @dnd-kit
- POISearchPanel.tsx — search UI + results
- TripActionsPanel.tsx — save/load/AI generation
- PanelHeader.tsx — collapse/expand controls

Plan should include specific line ranges to extract from current file.
```

**Step 2: Review generated plan**
```markdown
## Plan: Decompose FloatingPanel.tsx (879 lines → 5 components)

### Phase 1: Extract PanelHeader (15 min)
☐ 1.1 Create `components/panels/PanelHeader.tsx`
☐ 1.2 Extract lines 50-100 (collapse/expand logic)
☐ 1.3 Define interface:
```typescript
interface PanelHeaderProps {
  isCollapsed: boolean;
  onToggle: () => void;
  title: string;
}
```
☐ 1.4 Move collapse state to parent or Zustand
☐ 1.5 Verify: Panel still collapses/expands correctly

### Phase 2: Extract VehicleSpecsPanel (20 min)
☐ 2.1 Create `components/panels/VehicleSpecsPanel.tsx`
☐ 2.2 Extract lines 150-250 (vehicle form)
☐ 2.3 Reuse existing `VehicleSpecsForm.tsx` as child
☐ 2.4 Interface:
```typescript
interface VehicleSpecsPanelProps {
  // No props needed — reads from useTripStore
}
```
☐ 2.5 Connect to useTripStore selectors:
```typescript
const vehicleSpecs = useTripStore((s) => s.vehicleSpecs);
const setVehicleSpecs = useTripStore((s) => s.setVehicleSpecs);
```
☐ 2.6 Verify: Vehicle specs update correctly

### Phase 3: Extract StopListPanel (25 min) — Most Complex
☐ 3.1 Create `components/panels/StopListPanel.tsx`
☐ 3.2 Extract lines 270-400 (drag-drop stops)
☐ 3.3 Move @dnd-kit imports to new file:
```typescript
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
```
☐ 3.4 Keep DndContext inside this component
☐ 3.5 Interface:
```typescript
interface StopListPanelProps {
  onStopClick: (stop: Stop) => void;
}
```
☐ 3.6 Connect to useTripStore:
```typescript
const stops = useTripStore((s) => s.stops);
const reorderStops = useTripStore((s) => s.reorderStops);
```
☐ 3.7 Verify: Drag-drop reordering still works

### Phase 4: Extract POISearchPanel (20 min)
☐ 4.1 Create `components/panels/POISearchPanel.tsx`
☐ 4.2 Extract lines 420-520 (search form + results)
☐ 4.3 Interface:
```typescript
interface POISearchPanelProps {
  onPOISelect: (poi: POI) => void;
  proximity?: [number, number]; // [lng, lat]
}
```
☐ 4.4 Move API call logic:
```typescript
const searchPOIs = async (query: string) => {
  const { data } = await axiosInstance.get('/api/search', { 
    params: { query, proximity } 
  });
  return data;
};
```
☐ 4.5 Verify: POI search returns results, selection adds stop

### Phase 5: Extract TripActionsPanel (20 min)
☐ 5.1 Create `components/panels/TripActionsPanel.tsx`
☐ 5.2 Extract lines 540-750 (save/load/AI)
☐ 5.3 Interface:
```typescript
interface TripActionsPanelProps {
  onTripSaved: () => void;
  onTripLoaded: (tripId: number) => void;
}
```
☐ 5.4 Includes AI generation form + handlers
☐ 5.5 Verify: Save/load/generate still work

### Phase 6: Refactor FloatingPanel Container (15 min)
☐ 6.1 Remove extracted code from FloatingPanel.tsx
☐ 6.2 Import and compose child components:
```tsx
export function FloatingPanel() {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside className="fixed left-4 top-4 w-80 bg-white rounded-lg shadow-lg">
      <PanelHeader 
        isCollapsed={isCollapsed} 
        onToggle={() => setIsCollapsed(!isCollapsed)}
        title="Trip Planner"
      />
      {!isCollapsed && (
        <>
          <VehicleSpecsPanel />
          <StopListPanel onStopClick={handleStopClick} />
          <POISearchPanel onPOISelect={handleAddPOI} />
          <TripActionsPanel 
            onTripSaved={handleSaved}
            onTripLoaded={handleLoaded}
          />
        </>
      )}
    </aside>
  );
}
```
☐ 6.3 Final line count < 100 lines
☐ 6.4 Run full E2E test suite

### Success Criteria
| Component | Max Lines | Responsibility |
|-----------|-----------|---------------|
| FloatingPanel.tsx | 100 | Layout + composition |
| PanelHeader.tsx | 50 | Collapse/expand UI |
| VehicleSpecsPanel.tsx | 150 | Vehicle form |
| StopListPanel.tsx | 200 | Drag-drop stops |
| POISearchPanel.tsx | 150 | Search + results |
| TripActionsPanel.tsx | 200 | Save/load/AI |

**Total before**: 879 lines (1 file)
**Total after**: ~850 lines (6 files, each < 200)
```

### Step 3: Execute Plan with Agent Mode

```
Execute Phase 1 of the FloatingPanel decomposition plan.

Create PanelHeader.tsx by extracting lines 50-100 from FloatingPanel.tsx.
Use the interface from the plan. Maintain existing styling and functionality.
```

### Teaching Points

| Plan Mode Element | Purpose |
|------------------|---------|
| Phased by component | Clear incremental progress |
| Line ranges | Precise extraction guidance |
| Interface definitions | Type contracts upfront |
| Verification steps | Test after each phase |
| Success criteria | Measurable definition of done |

---

## Demo 6: Copilot Coding Agent (15 min)

### Objective
Delegate autonomous multi-file tasks to Copilot's coding agent.

### Scenario
Use the coding agent to create the 4 required constants files that are currently missing from `frontend/src/constants/`.

### Live Coding Steps

**Step 1: Invoke Copilot Agent with CORE prompt**
```
Context: The Road Trip Planner frontend has a constants/ folder that should contain
4 files (per copilot-instructions.md):
- index.ts — App-wide constants (stop types, status codes, map config)
- errors.ts — Error messages (TRIP_NOT_FOUND, UNAUTHORIZED, etc.)
- routes.ts — Route paths (/itinerary, /explore, /trips, /auth)
- api.ts — API endpoint paths (/api/trips, /api/geocode, etc.)

Currently frontend/src/constants/ folder is EMPTY.

The codebase has these hardcoded strings that should be extracted:
- Stop types: 'start', 'end', 'stop' (in useTripStore.ts, FloatingPanel.tsx)
- Route paths: '/itinerary', '/explore', '/trips' (in App.tsx, NavBar.tsx)
- API paths: '/api/trips', '/api/geocode', '/api/directions' (in multiple views)
- Error messages: 'Trip not found', 'Please sign in' (in various components)

Objective: Create all 4 constants files with values extracted from existing code.

Requirements:
1. Use TypeScript with const assertions (`as const`)
2. Export typed constants (not plain strings)
3. Include JSDoc comments for each constant group
4. Match the existing coding patterns
5. After creating files, identify (but don't modify) usage sites

Examples of expected output:

// constants/index.ts
export const STOP_TYPES = {
  START: 'start',
  END: 'end',
  WAYPOINT: 'stop',
} as const;

// constants/routes.ts
export const ROUTES = {
  HOME: '/',
  ITINERARY: '/itinerary',
  EXPLORE: '/explore',
  TRIPS: '/trips',
} as const;

Create all 4 files, then report the usage sites that should be updated.
```

**Step 2: Agent executes autonomously**
```markdown
## Agent Progress Report

### File 1: frontend/src/constants/index.ts ✅

```typescript
/**
 * Application-wide constants.
 * Import specific constants: import { STOP_TYPES, MAP_CONFIG } from '@/constants';
 */

/** Stop type identifiers for trip waypoints */
export const STOP_TYPES = {
  START: 'start',
  END: 'end',
  WAYPOINT: 'stop',
} as const;

export type StopType = typeof STOP_TYPES[keyof typeof STOP_TYPES];

/** Default map configuration for Mapbox GL */
export const MAP_CONFIG = {
  DEFAULT_CENTER: [-98.5795, 39.8283] as [number, number], // Geographic center of US
  DEFAULT_ZOOM: 4,
  FIT_BOUNDS_PADDING: 50,
  MAPBOX_STYLE: 'mapbox://styles/mapbox/streets-v12',
} as const;

/** HTTP status codes */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
} as const;

/** Vehicle fuel types */
export const FUEL_TYPES = {
  GAS: 'gas',
  DIESEL: 'diesel',
  ELECTRIC: 'electric',
} as const;

export type FuelType = typeof FUEL_TYPES[keyof typeof FUEL_TYPES];
```

### File 2: frontend/src/constants/errors.ts ✅

```typescript
/**
 * User-facing error messages.
 * Use these constants instead of inline strings.
 */

export const ERROR_MESSAGES = {
  // Authentication
  UNAUTHORIZED: 'Please sign in to continue',
  SESSION_EXPIRED: 'Your session has expired. Please sign in again.',
  
  // Trips
  TRIP_NOT_FOUND: 'Trip not found',
  TRIP_SAVE_FAILED: 'Failed to save trip. Please try again.',
  TRIP_LOAD_FAILED: 'Failed to load trip data.',
  
  // Geocoding
  GEOCODE_FAILED: 'Unable to find location. Please try a different search.',
  DIRECTIONS_FAILED: 'Unable to calculate route. Please check your stops.',
  
  // Vehicle
  VEHICLE_PARSE_FAILED: 'Unable to parse vehicle specifications.',
  
  // Network
  NETWORK_OFFLINE: 'You are offline. Changes will sync when connected.',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  
  // Generic
  UNKNOWN_ERROR: 'An unexpected error occurred.',
} as const;

export type ErrorMessageKey = keyof typeof ERROR_MESSAGES;
```

### File 3: frontend/src/constants/routes.ts ✅

```typescript
/**
 * Application route paths.
 * Use these constants in React Router navigation.
 */

export const ROUTES = {
  HOME: '/',
  ITINERARY: '/itinerary',
  EXPLORE: '/explore',
  TRIPS: '/trips',
  ALL_TRIPS: '/all-trips',
  AUTH: {
    LOGIN: '/login',
    CALLBACK: '/auth/callback',
  },
} as const;

/** Route titles for document.title and breadcrumbs */
export const ROUTE_TITLES: Record<string, string> = {
  [ROUTES.HOME]: 'Home',
  [ROUTES.ITINERARY]: 'Plan Your Trip',
  [ROUTES.EXPLORE]: 'Explore',
  [ROUTES.TRIPS]: 'My Trips',
  [ROUTES.ALL_TRIPS]: 'All Trips',
  [ROUTES.AUTH.LOGIN]: 'Sign In',
};
```

### File 4: frontend/src/constants/api.ts ✅

```typescript
/**
 * API endpoint paths.
 * All calls go through BFF (localhost:3000), which routes to backends.
 */

export const API_ENDPOINTS = {
  // Trip CRUD (→ Python backend)
  TRIPS: '/api/trips',
  TRIP_BY_ID: (id: number) => `/api/trips/${id}`,
  PUBLIC_TRIPS: '/api/public-trips',
  
  // Authentication (→ Python backend)
  AUTH: {
    GOOGLE: '/api/auth/google',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me',
  },
  
  // Vehicle (→ Python backend, falls back to C# for AI parsing)
  VEHICLE_SPECS: '/api/vehicle-specs',
  PARSE_VEHICLE: '/api/v1/parse-vehicle',
  
  // Geospatial (→ Java backend)
  GEOCODE: '/api/geocode',
  DIRECTIONS: '/api/directions',
  SEARCH: '/api/search',
  OPTIMIZE: '/api/optimize',
  
  // AI Generation (→ C# backend)
  GENERATE_TRIP: '/api/v1/generate-trip',
  
  // Health check
  HEALTH: '/health',
} as const;
```

---

### Usage Sites to Update (not modified, for reference)

| File | Line | Current | Replace With |
|------|------|---------|--------------|
| `useTripStore.ts` | 45 | `type: 'start'` | `STOP_TYPES.START` |
| `useTripStore.ts` | 82 | `type: 'end'` | `STOP_TYPES.END` |
| `FloatingPanel.tsx` | 312 | `'stop'` | `STOP_TYPES.WAYPOINT` |
| `App.tsx` | 28 | `'/itinerary'` | `ROUTES.ITINERARY` |
| `NavBar.tsx` | 45 | `'/explore'` | `ROUTES.EXPLORE` |
| `TripsView.tsx` | 52 | `'/api/trips'` | `API_ENDPOINTS.TRIPS` |
| `ExploreView.tsx` | 68 | `'/api/search'` | `API_ENDPOINTS.SEARCH` |

**Total**: 4 files created, 7+ usage sites identified for future refactoring.
```

### Teaching Points

| Agent Capability | Use Case |
|-----------------|----------|
| Multi-file creation | 4 related constants files |
| Code analysis | Extract values from existing code |
| Type generation | `as const` + type exports |
| Documentation | JSDoc comments per section |
| Impact analysis | Identify usage sites for follow-up |

---

## Demo 7: Custom Agents via AGENTS.md (10 min)

### Objective
Create and orchestrate React-specialized agents using the `AGENTS.md` file.

### Scenario
Create a `@react-pattern-validator` agent that validates React patterns and coding standards.

### Live Coding Steps

**Step 1: Create AGENTS.md with custom agent**

```markdown
<!-- .github/AGENTS.md -->

# Custom Agents for Road Trip Planner

## @react-pattern-validator

### Identity
You are a React pattern validator specialized in enforcing the Road Trip Planner
frontend coding standards. You analyze React/TypeScript code for anti-patterns
and convention violations.

### Expertise
- React 18 hooks patterns (useEffect, useMemo, useCallback)
- Zustand state management (selectors, actions)
- TypeScript strict mode requirements
- axiosInstance authentication interceptor usage
- GeoJSON coordinate format [lng, lat]
- Tailwind CSS utility classes

### Rules You Enforce
1. **No `any` types** — Use `unknown` or explicit interfaces
2. **No full store destructuring** — Use selectors: `useTripStore((s) => s.field)`
3. **No raw axios/fetch** — Use `axiosInstance` from `@/utils/axios`
4. **No inline styles** — Use Tailwind CSS classes
5. **No class components** — Functional components only
6. **Coordinates must be [lng, lat]** — Never [lat, lng]
7. **Props interfaces required** — Named `{ComponentName}Props`
8. **useEffect cleanup** — Always clean up listeners/timers/requests

### Behaviors
When asked to validate code:
1. Scan the provided file(s) for violations of the 8 rules
2. Categorize issues as 🔴 Critical, 🟡 Warning, or ℹ️ Info
3. Provide specific line numbers and fix suggestions
4. Show before/after code snippets
5. Summarize total issues found

### Example Invocation
```
@react-pattern-validator Validate frontend/src/views/ExploreView.tsx
```

### Output Format
```markdown
## React Pattern Validation: {filename}

### 🔴 Critical Issues
(Rule violations that must be fixed)

### 🟡 Warnings  
(Patterns that should be improved)

### ℹ️ Suggestions
(Nice-to-have improvements)

### Summary
- X critical, Y warnings, Z suggestions
```

---

## @component-decomposer

### Identity
You are a React component architecture specialist. You analyze large components
and create decomposition plans following single-responsibility principle.

### Rules
- Target component size: < 200 lines
- One responsibility per component
- Props over prop drilling (use Zustand for shared state)
- Collocate related components in feature folders

### Example Invocation
```
@component-decomposer Analyze FloatingPanel.tsx and create decomposition plan
```
```

**Step 2: Invoke custom agent**

```
@react-pattern-validator Validate the following files for React pattern violations:
- frontend/src/views/ExploreView.tsx
- frontend/src/views/AllTripsView.tsx

Focus on:
1. Raw axios/fetch usage (should use axiosInstance)
2. Zustand store access patterns
3. Missing TypeScript interfaces
```

**Step 3: Agent response**

```markdown
## React Pattern Validation: ExploreView.tsx, AllTripsView.tsx

### 🔴 Critical Issues

**1. Raw axios import (ExploreView.tsx:5)**
```typescript
// ❌ Current
import axios from 'axios';

// ✅ Fix
import axiosInstance from '@/utils/axios';
```

**2. Raw fetch call (AllTripsView.tsx:42)**
```typescript
// ❌ Current — bypasses auth interceptor
const trips = await fetch('/api/public-trips').then(r => r.json());

// ✅ Fix
const { data: trips } = await axiosInstance.get('/api/public-trips');
```

**3. Full store destructuring (ExploreView.tsx:28)**
```typescript
// ❌ Current — re-renders on any store change
const { setDestination, vehicleSpecs, searchResults, setSearchResults } = useTripStore();

// ✅ Fix — individual selectors
const setDestination = useTripStore((s) => s.setDestination);
const vehicleSpecs = useTripStore((s) => s.vehicleSpecs);
const searchResults = useTripStore((s) => s.searchResults);
const setSearchResults = useTripStore((s) => s.setSearchResults);
```

### 🟡 Warnings

**4. Missing interface for component (AllTripsView.tsx)**
```typescript
// ❌ Current — inline type
interface PublicTrip {
  id: number;
  name: string;
  // ... defined inside component file
}

// ✅ Fix — move to types/index.ts
// In frontend/src/types/index.ts:
export interface PublicTrip { ... }

// In AllTripsView.tsx:
import type { PublicTrip } from '@/types';
```

**5. Coordinate variable naming (ExploreView.tsx:85)**
```typescript
// ⚠️ Current — ambiguous naming
const coords = [lat, lng]; 

// ✅ Fix — clarify order
const coordinates: [number, number] = [lng, lat]; // GeoJSON format
```

### ℹ️ Suggestions

**6. Consider useMemo for filtered results (AllTripsView.tsx:68)**
```typescript
// Current — recalculates on every render
const filteredTrips = trips.filter(t => t.is_featured);

// Suggestion — memoize if trips array is large
const filteredTrips = useMemo(
  () => trips.filter(t => t.is_featured),
  [trips]
);
```

### Summary
| File | 🔴 Critical | 🟡 Warning | ℹ️ Info |
|------|------------|-----------|---------|
| ExploreView.tsx | 2 | 1 | 0 |
| AllTripsView.tsx | 1 | 1 | 1 |
| **Total** | **3** | **2** | **1** |

**Priority Action**: Fix the 3 critical issues (raw axios/fetch, store destructuring)
before next PR. These affect security (auth bypass) and performance.
```

### Teaching Points

| AGENTS.md Element | Purpose |
|------------------|---------|
| Identity | Who the agent is (validator, architect, etc.) |
| Expertise | Domain knowledge the agent has |
| Rules | Specific patterns it enforces |
| Behaviors | Step-by-step actions when invoked |
| Example invocation | How to call the agent |
| Output format | Structured response template |

---

## Demo 8: Architecture & Test Generation (8 min)

### Objective
Use Copilot to generate test infrastructure and architecture decision records (ADRs).

### Scenario
Generate a component testing setup for the frontend and an ADR for adding offline-first support.

---

### Step 1: Generate Test Infrastructure with CORE Prompt

```
Context: The Road Trip Planner frontend (frontend/src/) uses:
- React 18 + TypeScript
- Vitest for testing (vitest.config.ts exists)
- @testing-library/react (installed)
- Zustand stores (useTripStore, useAuthStore)
- Currently only 6 tests exist in frontend/src/test/ — all store tests
- Zero component tests exist

Objective: Generate the complete component testing infrastructure.

Requirements:
- Use Vitest + React Testing Library (already installed)
- Create test utilities for Zustand store mocking
- Create common test setup (render with providers)
- Generate example component test for StopCard
- Follow the existing store test pattern from useTripStore.test.ts

Examples:
- Store test pattern (existing):
  ```typescript
  import { act } from '@testing-library/react';
  import { useTripStore } from '../store/useTripStore';
  
  describe('useTripStore', () => {
    beforeEach(() => {
      useTripStore.setState({ stops: [] });
    });
  });
  ```
- Component test pattern (to create):
  ```typescript
  import { render, screen } from '@testing-library/react';
  import { StopCard } from '../components/StopCard';
  
  test('renders stop name', () => {
    render(<StopCard stop={mockStop} />);
    expect(screen.getByText('San Francisco')).toBeInTheDocument();
  });
  ```
```

**Expected Copilot Output:**

```typescript
// frontend/src/test/utils/testUtils.tsx

import { render, RenderOptions } from '@testing-library/react';
import { ReactElement, ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';

/**
 * Custom render function that wraps components with required providers.
 * Use this instead of @testing-library/react render.
 */
interface WrapperProps {
  children: ReactNode;
}

function AllProviders({ children }: WrapperProps) {
  return (
    <BrowserRouter>
      {children}
    </BrowserRouter>
  );
}

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllProviders, ...options });
}

// Re-export everything from testing-library
export * from '@testing-library/react';
export { renderWithProviders as render };
```

```typescript
// frontend/src/test/utils/storeMocks.ts

import { useTripStore } from '../../store/useTripStore';
import type { Stop, VehicleSpecs } from '../../types';

/**
 * Reset store to initial state before each test.
 */
export function resetStores() {
  useTripStore.setState({
    stops: [],
    routeGeoJSON: null,
    vehicleSpecs: null,
    pendingSync: false,
    lastSyncTimestamp: null,
  });
}

/**
 * Mock data factories for tests.
 */
export const mockStop = (overrides?: Partial<Stop>): Stop => ({
  id: 'stop-1',
  name: 'San Francisco',
  coordinates: [-122.4194, 37.7749],
  type: 'start',
  ...overrides,
});

export const mockVehicleSpecs = (overrides?: Partial<VehicleSpecs>): VehicleSpecs => ({
  type: 'car',
  height: 1.5,
  width: 1.8,
  length: 4.5,
  weight: 1500,
  fuelType: 'gas',
  range: 400,
  mpg: 30,
  ...overrides,
});
```

```typescript
// frontend/src/test/components/StopCard.test.tsx

import { screen, fireEvent } from '@testing-library/react';
import { render } from '../utils/testUtils';
import { resetStores, mockStop } from '../utils/storeMocks';
import { StopCard } from '../../components/StopCard';

describe('StopCard', () => {
  beforeEach(() => {
    resetStores();
  });

  test('renders stop name and type', () => {
    const stop = mockStop({ name: 'Los Angeles', type: 'end' });
    
    render(<StopCard stop={stop} onDelete={vi.fn()} />);
    
    expect(screen.getByText('Los Angeles')).toBeInTheDocument();
    expect(screen.getByText(/end/i)).toBeInTheDocument();
  });

  test('calls onDelete when delete button clicked', () => {
    const onDelete = vi.fn();
    const stop = mockStop({ id: 'stop-123' });
    
    render(<StopCard stop={stop} onDelete={onDelete} />);
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    
    expect(onDelete).toHaveBeenCalledWith('stop-123');
  });

  test('displays coordinates in correct format', () => {
    const stop = mockStop({ coordinates: [-122.4194, 37.7749] });
    
    render(<StopCard stop={stop} onDelete={vi.fn()} />);
    
    // Coordinates should display as "lng, lat" or formatted address
    expect(screen.getByText(/-122\.42.*37\.77/)).toBeInTheDocument();
  });
});
```

---

### Step 2: Generate ADR for Offline-First

```
Context: The Road Trip Planner frontend currently requires network connectivity:
- All API calls use axiosInstance which fails when offline
- useTripStore has pendingSync and lastSyncTimestamp fields (unused)
- useOnlineStatus hook exists for network detection
- Service Worker support not yet implemented

Frontend architecture:
- React 18 + Vite (supports service workers via vite-plugin-pwa)
- Zustand stores for all state
- LocalStorage already used for auth token persistence

Objective: Generate an ADR for adding offline-first capability to the frontend.

Requirements:
- Consider IndexedDB vs localStorage for trip data persistence
- Evaluate service worker strategies (stale-while-revalidate, cache-first)
- Must work with existing Zustand stores
- Include sync conflict resolution strategy
- Consider mobile PWA installation
```

**Expected Copilot Output:**

```markdown
<!-- docs/adr/004-offline-first-frontend.md -->

# ADR 004: Offline-First Architecture for React Frontend

## Status
Proposed

## Context
The Road Trip Planner frontend currently requires network connectivity for all
operations. Users planning trips in areas with poor connectivity (national parks,
rural highways) cannot access or modify their trips.

Current state:
- `useOnlineStatus` hook detects connectivity (implemented)
- `useTripStore` has `pendingSync` field (unused)
- No local persistence of trip data beyond React state
- Auth token persisted in localStorage

User scenarios requiring offline support:
1. Viewing previously loaded trips without connection
2. Adding/editing stops while offline, syncing when reconnected
3. Accessing cached map tiles for route visualization

## Decision
Implement **offline-first with background sync** using:

1. **Zustand persist middleware + IndexedDB** for trip data
2. **vite-plugin-pwa** for service worker generation
3. **Stale-while-revalidate** strategy for API responses
4. **Optimistic UI updates** with conflict resolution on sync

### Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     React Components                     │
├─────────────────────────────────────────────────────────┤
│                  Zustand Stores                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │ useTripStore│  │useAuthStore │  │ useSyncStore    │  │
│  │ + persist() │  │             │  │ (queue, status) │  │
│  └──────┬──────┘  └─────────────┘  └────────┬────────┘  │
├─────────┼──────────────────────────────────-┼───────────┤
│         │          Persistence Layer         │           │
│  ┌──────▼─────────────────────────┐  ┌──────▼────────┐  │
│  │        IndexedDB               │  │ Sync Queue    │  │
│  │  (trips, stops, vehicle specs) │  │ (pending ops) │  │
│  └────────────────────────────────┘  └───────────────┘  │
├─────────────────────────────────────────────────────────┤
│                    Service Worker                        │
│  ┌─────────────────┐  ┌─────────────────┐               │
│  │ API Cache       │  │ Asset Cache     │               │
│  │ (stale-while-   │  │ (cache-first)   │               │
│  │  revalidate)    │  │                 │               │
│  └─────────────────┘  └─────────────────┘               │
└─────────────────────────────────────────────────────────┘
```

### Implementation Steps

1. **Add Zustand persist middleware**
```typescript
import { persist, createJSONStorage } from 'zustand/middleware';
import { get, set, del } from 'idb-keyval';

export const useTripStore = create<TripState>()(
  persist(
    (set) => ({ /* existing store */ }),
    {
      name: 'trip-storage',
      storage: createJSONStorage(() => ({
        getItem: async (name) => await get(name),
        setItem: async (name, value) => await set(name, value),
        removeItem: async (name) => await del(name),
      })),
    }
  )
);
```

2. **Add vite-plugin-pwa**
```typescript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\.mapbox\.com/,
            handler: 'CacheFirst',
            options: { cacheName: 'mapbox-tiles' },
          },
          {
            urlPattern: /\/api\//,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'api-cache' },
          },
        ],
      },
    }),
  ],
});
```

3. **Conflict resolution strategy**
```typescript
// Last-write-wins with user notification
interface SyncConflict {
  localVersion: Trip;
  serverVersion: Trip;
  resolvedAt: string;
}

// On reconnect, compare timestamps
if (serverTrip.updated_at > localTrip.updated_at) {
  // Server wins — notify user of overwrite
  showNotification('Trip updated from another device');
  setTrip(serverTrip);
} else {
  // Local wins — push to server
  await syncToServer(localTrip);
}
```

## Alternatives Considered

| Option | Pros | Cons |
|--------|------|------|
| **IndexedDB + Service Worker** ✅ | Full offline, large storage | Complexity |
| localStorage only | Simple | 5MB limit, sync issues |
| No offline support | No changes needed | Poor UX in low-connectivity |
| Firebase offline | Built-in sync | Vendor lock-in, cost |

## Consequences

### Positive
- Users can plan trips without connectivity
- PWA installable on mobile devices
- Faster perceived performance (optimistic updates)

### Negative
- Increased bundle size (~20KB for idb-keyval + workbox)
- Conflict resolution edge cases
- Testing complexity (mock service workers)

### Implementation Effort
- Phase 1 (Zustand persist): 2 days
- Phase 2 (Service Worker): 3 days
- Phase 3 (Sync queue): 3 days
- Phase 4 (Conflict UI): 2 days
- **Total: ~10 days**
```

---

### Teaching Points

| Generation Type | CORE Element | Example |
|----------------|-------------|---------|
| Test utilities | **C**: Existing test patterns | Zustand mock helpers |
| Component tests | **E**: Before/after examples | StopCard.test.tsx |
| ADR generation | **C**: Current architecture | Offline-first decision |
| Implementation plan | **R**: Phased requirements | 4-phase timeline |

---

## Workshop Summary

### 8 Advanced Techniques Mastered (with CORE Framework)

| # | Technique | CORE Focus | Key Files |
|---|-----------|-----------|-----------|
| 1 | **Chain-of-Thought** | Numbered steps as **R**equirements | `useTripSync.ts`, `MapComponent.tsx` |
| 2 | **Instruction Files** | **R**ules with ❌/✅ patterns | `.instructions.md`, `/init` |
| 3 | **Prompt Files** | Full **CORE** templates | Component/Store/Hook prompts |
| 4 | **Code Review** | **C**ontext of PR, **R**eview criteria | React anti-pattern detection |
| 5 | **Plan Mode** | Phased **O**bjectives with verification | `FloatingPanel.tsx` decomposition |
| 6 | **Coding Agent** | **E**xamples showing expected output | Constants file creation |
| 7 | **Custom Agents** | **R**ules for pattern validation | `AGENTS.md`, `@react-pattern-validator` |
| 8 | **Architecture Gen** | **C**ontext of stack, **E**xample ADR | Test setup, offline-first ADR |

### CORE Quick Reference

| Element | Question to Ask | React Example |
|---------|-----------------|---------------|
| **C**ontext | What files, stack, existing patterns? | "In useTripStore.ts, using Zustand..." |
| **O**bjective | What should Copilot produce? | "Create a custom hook for..." |
| **R**equirements | What rules must be followed? | "Use selectors, cleanup effects..." |
| **E**xamples | What does input → output look like? | "When isOnline changes, sync..." |

### New 2025/2026 Features Covered

| Feature | Demo | Usage |
|---------|------|-------|
| `/init` command | Demo 2 | Bootstrap instructions from existing code |
| Path-specific instructions | Demo 2 | `applyTo: "**/*.tsx"` scoping |
| `AGENTS.md` | Demo 7 | Define custom specialized agents |
| Agent sessions | Demo 5, 6 | Persistent context across steps |
| Context handoff | Demo 5 | Ask → Plan → Agent mode transitions |

---

## Next Steps

After completing this workshop:

1. **Create your own prompt files** for components you frequently build
2. **Add path-specific instructions** for your team's conventions
3. **Use Plan Mode** for your next refactoring task
4. **Define custom agents** in `AGENTS.md` for your project patterns
5. **Generate test infrastructure** following the patterns shown

---

## Resources

- [GitHub Copilot Documentation](https://docs.github.com/en/copilot)
- [VS Code Copilot Chat](https://code.visualstudio.com/docs/copilot/copilot-chat)
- [Custom Instructions Guide](https://code.visualstudio.com/docs/copilot/copilot-customization)
- [AGENTS.md Specification](https://code.visualstudio.com/docs/copilot/chat-agents)
- [Road Trip Planner Architecture](../ARCHITECTURE.md)
