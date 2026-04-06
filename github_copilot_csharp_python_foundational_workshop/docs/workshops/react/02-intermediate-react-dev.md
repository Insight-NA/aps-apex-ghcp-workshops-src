# Workshop 2: Intermediate React Development with GitHub Copilot

**Duration**: 90 minutes  
**Format**: Live coding demonstrations  
**Audience**: React developers with Copilot foundational knowledge (completed Workshop 1: Foundational React Dev)  
**Prerequisites**: VS Code with GitHub Copilot extension, project running via `docker-compose up`, completed `setup/00-setup-instructions.md`  
**Project**: Road Trip Planner — React 18 + TypeScript + Zustand + Mapbox GL + Tailwind CSS  

---

## Learning Objectives

By the end of this workshop, you will be able to:

1. [**Inline Suggestions & NES for React** — Accept ghost text for TypeScript interfaces and use Next Edit Suggestions to propagate changes across components and stores](#demo-1-inline-suggestions--nes-for-react-typescript-10-min)
2. [**Explicit Prompting for TypeScript** — Write detailed prompts that generate accurate interfaces with discriminated unions and proper typing](#demo-2-explicit-prompting-for-typescript-interfaces-10-min)
3. [**Comment-Based Component Generation** — Generate complete React components from descriptive comments, including props, JSX, and Tailwind styling](#demo-3-comment-based-react-component-generation-15-min)
4. [**Code Explanations with Ask Mode** — Use Ask mode with `#selection` and `#file:` context to understand complex React patterns (interceptors, token refresh queues)](#demo-4-code-explanations-with-ask-mode-10-min)
5. [**Multi-File Refactoring with Agent Mode** — Use Agent mode to decompose god components and extract shared utilities across views](#demo-5-multi-file-refactoring-with-agent-mode-15-min)
6. [**Few-Shot Prompting for Custom Hooks** — Teach Copilot project-specific hook patterns by showing examples, then generate new hooks](#demo-6-few-shot-prompting-for-custom-hooks-10-min)
7. [**Component Testing with Vitest** — Generate Zustand store tests and React Testing Library component tests, then debug failures with inline chat](#demo-7-component-testing-with-vitest--testing-library-10-min)
8. [**Constants Extraction & API Standardization** — Use Agent mode to eliminate hardcoded strings and migrate raw `axios` calls to `axiosInstance`](#demo-8-constants-extraction--api-standardization-10-min)

---

## Copilot Chat Modes (2025+)

GitHub Copilot in VS Code now uses three built-in agents instead of slash commands:

| Agent | Purpose | When to Use |
|-------|---------|-------------|
| **Ask** | Read-only Q&A, explanations | Understanding hooks, store logic, complex JSX |
| **Agent** | Autonomous multi-step edits | Refactoring components, creating files, running commands |
| **Plan** | Generate a plan before editing | Complex decompositions requiring review before execution |

> ⚠️ **Note**: The old slash commands (`/explain`, `/fix`, `/tests`, `/refactor`) have been replaced by natural language prompts. Use `#selection`, `#file:`, and `#codebase` to provide context and `@workspace` for broader codebase awareness.

### React-Specific Context Mentions

| Context | Usage | Example |
|---------|-------|---------|
| `#selection` | Reference highlighted JSX, hooks, or interfaces | "Explain the token refresh logic in `#selection`" |
| `#file:useTripStore.ts` | Reference entire store file | "Generate tests for the actions in `#file:useTripStore.ts`" |
| `#codebase` | Search across all frontend files | "Find all places that use raw `axios` instead of `axiosInstance`" |
| `@workspace` | Workspace-aware suggestions | "What custom hooks exist in this project?" |

---

## Workshop Agenda

| Time | Demo | Learning Objective | File(s) |
|------|------|-------------------|---------|
| 0–10 min | Demo 1 | **Inline Suggestions & NES** | `types/Vehicle.ts` → `useTripStore.ts` |
| 10–20 min | Demo 2 | **Explicit Prompting** (TypeScript Interfaces) | `types/index.ts` |
| 20–35 min | Demo 3 | **Comment-Based Component Generation** | New `components/ErrorBoundary.tsx` |
| 35–45 min | Demo 4 | **Code Explanations** (Ask Mode) | `utils/axios.ts` |
| 45–60 min | Demo 5 | **Multi-File Refactoring** (Agent Mode) | `FloatingPanel.tsx` (880 lines) |
| 60–70 min | Demo 6 | **Few-Shot Prompting** (Custom Hooks) | `hooks/useOnlineStatus.ts` → new `hooks/useTrips.ts` |
| 70–80 min | Demo 7 | **Component Testing** (Vitest + RTL) | `useTripStore.test.ts` + new component test |
| 80–90 min | Demo 8 | **Constants & API Standardization** (Agent Mode) | `AllTripsView.tsx`, `TripsView.tsx`, `ExploreView.tsx` |

---

## Real Codebase Issues Addressed

> 💡 **Every demo in this workshop addresses a real issue** from the project Roadmap Phase 5 (Frontend Standardization). Attendees leave with both Copilot skills AND working contributions to the codebase.

| Demo | Roadmap Issue | Severity |
|------|---------------|----------|
| Demo 1 | Conflicting `Vehicle` type definitions (`types/Vehicle.ts` vs `types/index.ts`) | P1 Architecture |
| Demo 2 | Ad-hoc inline interfaces in view files (`PublicTrip`, `SavedTrip`, `FeaturedTrip`) | P1 Architecture |
| Demo 3 | No error boundaries — any render error crashes the entire app | P2 Reliability |
| Demo 4 | Understanding security patterns before modifying auth code | Best Practice |
| Demo 5 | 880-line god component (`FloatingPanel.tsx`) needs decomposition | P1 Architecture |
| Demo 6 | API call logic duplicated across 4+ view files | P1 Architecture |
| Demo 7 | Only 6 tests exist, zero component tests | P2 Quality |
| Demo 8 | 16+ raw `axios` calls bypass `axiosInstance`; 0 constants files | P0 Security / P1 Architecture |

---

## Demo 1: Inline Suggestions & NES for React TypeScript (10 min)

### Learning Objective
Accept ghost text completions for TypeScript interface fields and use Next Edit Suggestions (NES) to propagate type changes across the store and components.

### Scenario
The `Vehicle` interface in `types/Vehicle.ts` is missing `fuelType`, `range`, and `mpg` fields that the Zustand store already uses in its default values. We'll add the missing fields and watch NES guide us to update related files.

> 🔍 **The Real Problem**: The store at `useTripStore.ts` line 64 sets `fuelType: 'diesel'`, `range: 500`, `mpg: 10` — but these fields don't exist on the `Vehicle` interface. This is a type safety violation.

### Before Demo: Setup
```bash
# Open the Vehicle interface
code frontend/src/types/Vehicle.ts

# Side-by-side: open the store to see the mismatch
code frontend/src/store/useTripStore.ts  # See line 64-70 — uses fuelType, range, mpg
```

### The Current Code (The Problem)

**`types/Vehicle.ts`** — Missing fields:
```typescript
export interface Vehicle {
  type: string;
  height: number;
  width: number;
  length: number;
  weight: number;
  hazmat?: boolean;
}
```

**`useTripStore.ts` line 63–70** — Uses fields that don't exist on `Vehicle`:
```typescript
vehicleSpecs: {
    height: 3.5,
    weight: 10,
    width: 2.5,
    length: 12,
    fuelType: 'diesel',   // ← Not on Vehicle interface!
    range: 500,            // ← Not on Vehicle interface!
    mpg: 10,               // ← Not on Vehicle interface!
},
```

### Live Coding Steps

**Step 1: Position cursor after `weight` field in `Vehicle.ts`**
```typescript
export interface Vehicle {
  type: string;
  height: number;
  width: number;
  length: number;
  weight: number;
  // ← Position cursor here, press Enter
```

**Step 2: Type the beginning of a new field**
```typescript
  fuelType:
```

**Expected Copilot Inline Suggestion** (ghost text):
```typescript
  fuelType: 'gas' | 'diesel' | 'electric';
```

> 💡 Copilot infers the union type from project context — it sees the `VehicleSpecs` interface in `types/index.ts` that already has this pattern.

**Step 3: Accept with `Tab`, then type the next field**
```typescript
  range:
```

**Expected Copilot Suggestion**:
```typescript
  range: number;    // miles
```

**Step 4: Accept and add MPG**
```typescript
  mpg:
```

**Expected Copilot Suggestion**:
```typescript
  mpg: number;      // miles per gallon (or MPGe for electric)
```

### Next Edit Suggestions (NES) in Action

> 🆕 **After saving `Vehicle.ts`**, watch for gutter arrows in open files. NES detects that you added fields to `Vehicle` and suggests related edits.

**Expected NES flow:**
1. **Arrow in `useTripStore.ts`** → NES may suggest adding the `type` field to the default vehicle specs (since `Vehicle` now requires `type: string`)
2. **Arrow in `FloatingPanel.tsx`** → NES may suggest updating the vehicle spec input grid to include a fuel type selector
3. Press `Tab` on each gutter arrow to jump to the suggested edit location

### Final Result

**Updated `types/Vehicle.ts`:**
```typescript
export interface Vehicle {
  type: string;
  height: number;
  width: number;
  length: number;
  weight: number;
  fuelType: 'gas' | 'diesel' | 'electric';
  range: number;
  mpg: number;
  hazmat?: boolean;
}
```

### Teaching Points

| Action | Shortcut (Mac) | Shortcut (Windows) |
|--------|----------------|-------------------|
| Accept full suggestion | `Tab` | `Tab` |
| Accept next word | `Cmd+→` | `Ctrl+→` |
| Dismiss suggestion | `Esc` | `Esc` |
| See alternatives | `Alt+]` / `Alt+[` | `Alt+]` / `Alt+[` |
| Jump to next edit (NES) | `Tab` (on gutter arrow) | `Tab` (on gutter arrow) |

> 🔧 **NES Settings**: Enable via `github.copilot.nextEditSuggestions.enabled`. Use `editor.inlineSuggest.edits.showCollapsed` to reduce visual noise until you Tab to a suggestion.

### Common Mistakes
- ❌ **Accepting without reviewing the union type**: Copilot might suggest `string` instead of the union — verify it matches `'gas' | 'diesel' | 'electric'`
- ❌ **Ignoring NES arrows after the edit**: The type change affects the store, components, and tests — follow the arrows
- ❌ **Not checking `types/index.ts` for conflicts**: A separate `VehicleSpecs` interface exists there with overlapping but different fields

### React-Specific Insight
> In React projects, NES is especially powerful after interface changes because TypeScript type errors ripple through components, stores, and tests. NES predicts where those ripples land and guides you there.

---

## Demo 2: Explicit Prompting for TypeScript Interfaces (10 min)

### Learning Objective
Write detailed, explicit prompts that generate accurate TypeScript interfaces with proper typing, replacing ad-hoc inline types.

### Scenario
Three view files define their own local trip interfaces (`PublicTrip` in `AllTripsView.tsx`, `SavedTrip` in `TripsView.tsx`, `FeaturedTrip` in `ExploreView.tsx`) instead of sharing a common type. We'll create a proper `TripCard` interface in `types/index.ts` using an explicit prompt.

> 🔍 **The Real Problem**: Each view defines its own trip shape inline:
> - `AllTripsView.tsx` line 10: `interface PublicTrip { id, name, description?, image_url?, distance_miles?, stops, vehicle_specs, is_featured, created_at? }`
> - `TripsView.tsx` line 10: `interface SavedTrip { id, name, stops, vehicle_specs, created_at? }`
> - `ExploreView.tsx` line 37: `interface FeaturedTrip { id, name, description?, image_url?, distance_miles? }`

### Before Demo: Setup
```bash
code frontend/src/types/index.ts
# Navigate to end of file (after Trip interface, line ~120)

# Also open these files to show the problem side-by-side:
code frontend/src/views/AllTripsView.tsx     # See line 10-20
code frontend/src/views/TripsView.tsx        # See line 10-16
code frontend/src/views/ExploreView.tsx      # See line 37-43
```

### Live Coding Steps

**Step 1: Write an explicit prompt after the existing `Trip` interface**
```typescript
// Line 121+, write this multi-line comment:

/**
 * Create a TripCard interface for rendering trip cards across all views.
 * This replaces the ad-hoc PublicTrip, SavedTrip, and FeaturedTrip interfaces.
 *
 * Requirements:
 * - id: number, required
 * - name: string, required
 * - description: string, optional
 * - image_url: string, optional
 * - distance_miles: number, optional
 * - stops: Stop[], required (imported from this file)
 * - vehicle_specs: VehicleSpecs, optional (from this file, NOT Vehicle from Vehicle.ts)
 * - is_featured: boolean, optional, default false
 * - is_public: boolean, optional
 * - created_at: string, optional (ISO date)
 * - owner_name: string, optional (for public trip display)
 *
 * Also create:
 * - TripCardProps interface for the React component props:
 *   trip: TripCard, index: number, onSelect: (trip: TripCard) => void, onDelete?: (id: number) => void
 *   showFeaturedBadge?: boolean, className?: string
 *
 * Pattern: Follow the existing VehicleSpecs interface style with JSDoc comments
 */
```

**Step 2: Press Enter and let Copilot generate**

**Expected Copilot Suggestion**:
```typescript
/**
 * Trip card data for rendering across all views.
 * Replaces PublicTrip, SavedTrip, and FeaturedTrip inline interfaces.
 */
export interface TripCard {
  /** Unique trip identifier */
  id: number;
  /** Trip name */
  name: string;
  /** Trip description */
  description?: string;
  /** Cover image URL */
  image_url?: string;
  /** Total distance in miles */
  distance_miles?: number;
  /** Trip stops */
  stops: Stop[];
  /** Vehicle specifications */
  vehicle_specs?: VehicleSpecs;
  /** Whether this trip is featured */
  is_featured?: boolean;
  /** Whether this trip is public */
  is_public?: boolean;
  /** Creation timestamp (ISO 8601) */
  created_at?: string;
  /** Display name of trip creator */
  owner_name?: string;
}

/**
 * Props for the TripCard React component.
 */
export interface TripCardProps {
  /** Trip data to render */
  trip: TripCard;
  /** Card index for default image selection */
  index: number;
  /** Callback when trip is selected */
  onSelect: (trip: TripCard) => void;
  /** Optional callback for trip deletion */
  onDelete?: (id: number) => void;
  /** Show featured badge */
  showFeaturedBadge?: boolean;
  /** Additional CSS classes */
  className?: string;
}
```

### Prompting Formula

> 📝 **Explicit Prompting Formula for TypeScript Interfaces**:
> ```
> 1. TASK: "Create [interface name] for [purpose]"
> 2. MOTIVATION: "This replaces [existing ad-hoc types]"
> 3. REQUIREMENTS: List all fields with types + optional/required
> 4. ALSO CREATE: Related component props interface
> 5. PATTERN: "Follow [existing interface] style with [JSDoc/validation]"
> ```

### Teaching Points

| Prompt Quality | Example | Result |
|----------------|---------|--------|
| ❌ Vague | "Create trip card type" | Missing fields, no JSDoc, wrong imports |
| ⚠️ Partial | "Create TripCard with id, name, stops" | Gets structure but misses optional fields |
| ✅ Explicit | Full prompt with all fields, types, motivation, component props | Complete, documented, correct interface |

### Why This Matters for React
> In React, TypeScript interfaces are the **contract between components**. When each view defines its own trip type, you get:
> - Silent bugs when API response changes (one view updated, others not)
> - Duplicate type maintenance across files
> - No autocomplete consistency across the codebase
>
> Copilot generates better interfaces when you tell it about the **existing conflicting types** and the **component that will consume it**.

---

## Demo 3: Comment-Based React Component Generation (15 min)

### Learning Objective
Generate a complete React component from descriptive comments, including TypeScript props, JSX with Tailwind, and React error handling patterns.

### Scenario
The project has **no error boundaries** — any render error in a component crashes the entire app with a white screen. We'll use comment-based generation to create a reusable `ErrorBoundary` component.

> 🔍 **The Real Problem**: Try throwing an error in any component — the entire app crashes with no recovery option. Error boundaries are a React best practice that this project is missing entirely.

### Before Demo: Setup
```bash
# Create a new file
code frontend/src/components/ErrorBoundary.tsx

# Also open for context:
code frontend/src/App.tsx  # We'll wrap routes with the boundary later
```

### Live Coding Steps

**Step 1: Write descriptive comments at the top of the new file**
```tsx
// React Error Boundary component for the Road Trip Planner app
// 
// Requirements:
// - Class component (Error Boundaries require componentDidCatch lifecycle)
// - TypeScript: Props interface with children (ReactNode), fallback? (ReactNode), onError? callback
// - State interface: hasError (boolean), error (Error | null), errorInfo (ErrorInfo | null)
// - Catches render errors in child component tree
// - Shows a styled fallback UI with Tailwind:
//   - Red/orange gradient header with warning icon
//   - Error message display (collapsible details in development)
//   - "Try Again" button that resets the error state
//   - "Go Home" button that navigates to /explore
// - Logs errors to console in development
// - Uses lucide-react icons (AlertTriangle, RefreshCw, Home)
// - Export both the class component and a functional wrapper hook: useErrorBoundary
//
// Follow project patterns:
// - Tailwind utility classes (no CSS modules)
// - lucide-react for icons
// - react-router-dom for navigation
```

**Step 2: Press Enter and type the imports**
```tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
```

**Expected Copilot Suggestion** (completes the full component):
```tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    // Log in development
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught:', error, errorInfo);
    }

    // Call optional error callback
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/explore';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-orange-500 p-6 text-white text-center">
              <AlertTriangle size={48} className="mx-auto mb-3" />
              <h2 className="text-xl font-bold">Something went wrong</h2>
              <p className="text-red-100 text-sm mt-1">
                An unexpected error occurred in this section
              </p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Error message */}
              <p className="text-gray-600 text-sm">
                {this.state.error?.message || 'An unknown error occurred'}
              </p>

              {/* Collapsible details in development */}
              {import.meta.env.DEV && this.state.errorInfo && (
                <details className="text-xs bg-gray-50 rounded-lg p-3">
                  <summary className="cursor-pointer font-medium text-gray-700">
                    Stack Trace (Development Only)
                  </summary>
                  <pre className="mt-2 overflow-auto text-gray-500 whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={this.handleReset}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw size={16} />
                  Try Again
                </button>
                <button
                  onClick={this.handleGoHome}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  <Home size={16} />
                  Go Home
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

**Step 3: Ask Copilot to add the component to `App.tsx`**

Open inline chat (`⌘I`) in `App.tsx` and type:
```
Wrap the Routes with the ErrorBoundary component. Import it from ./components/ErrorBoundary.
```

**Expected change in `App.tsx`**:
```tsx
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <Toaster position="top-center" />
        <ErrorBoundary>
          <Routes>
            {/* ... existing routes ... */}
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}
```

### Teaching Points

> 💡 **Comment-Based Generation for React Components**:
> 1. **Specify the component type**: Class (for error boundaries) vs Functional
> 2. **List all interfaces**: Props AND State separately
> 3. **Describe the JSX structure**: Mention Tailwind classes, icons, layout
> 4. **Reference project patterns**: "Use lucide-react", "Tailwind utility classes"
> 5. **Include behavior**: Error logging, reset logic, navigation

### Comment Quality Comparison

```tsx
// ❌ Too vague — Copilot may generate a basic div with no styling
// Error boundary component

// ⚠️ Partial — Gets the class structure but generic fallback UI
// React error boundary with TypeScript

// ✅ Detailed — Generates complete, project-consistent component
// React Error Boundary component for the Road Trip Planner app
// Requirements: Class component, TypeScript Props/State interfaces,
// Tailwind-styled fallback with AlertTriangle icon, Try Again + Go Home buttons,
// Collapsible stack trace in development, onError callback prop
```

### Common Mistakes
- ❌ **Using a functional component**: Error boundaries MUST be class components (React limitation) — your comment should specify this
- ❌ **Forgetting `getDerivedStateFromError`**: The static method is required for the error boundary to work
- ❌ **Not using `import.meta.env.DEV`**: Vite projects use this instead of `process.env.NODE_ENV`

---

## Demo 4: Code Explanations with Ask Mode (10 min)

### Learning Objective
Use Copilot's Ask mode with `#selection` and `#file:` context to understand complex React patterns before modifying them.

### Scenario
Understand the axios interceptor + token refresh queue pattern in `utils/axios.ts` before migrating raw `axios` calls to use `axiosInstance` (Demo 8).

### Before Demo: Setup
```bash
code frontend/src/utils/axios.ts
# Select lines 1-131 (entire file)
```

### Live Coding Steps

**Step 1: Select the entire file and open Chat in Ask mode**
Press `⌃⌘I` (Mac) or `Ctrl+Alt+I` (Windows), switch to **Ask mode**, then type:

```
Explain the security architecture in #selection. What happens when multiple API 
calls fail with 401 simultaneously? Why is there a queue? How does this relate to 
the raw axios calls in #file:views/AllTripsView.tsx and #file:views/TripsView.tsx?
```

**Expected Copilot Explanation**:
```
This file implements a token refresh queue pattern — a critical security architecture:

**The Problem It Solves:**
When an access token expires, multiple React components might fire API calls 
simultaneously (e.g., ExploreView fetches featured trips while Navigation 
checks auth status). Without a queue, each failing request would try to 
refresh the token independently, causing race conditions.

**How the Queue Works:**
1. First 401 response sets `isRefreshing = true`
2. Subsequent 401s during refresh are pushed to `failedQueue`
3. When refresh succeeds, `processQueue()` resolves all waiting promises
4. All queued requests retry with the new token
5. If refresh fails, all queued requests are rejected and tokens are cleared

**The Token Lifecycle:**
- Access token: Short-lived, stored in localStorage('token')
- Refresh token: Longer-lived, stored in localStorage('refresh_token')
- On 401: Try refresh → success: update both tokens → fail: clear both, emit 'auth:session-expired'

**The Problem with AllTripsView.tsx and TripsView.tsx:**
These files import raw `axios` and manually set `Authorization: Bearer ${token}`.
This means:
- ❌ They bypass the refresh queue entirely
- ❌ If the token expires, they get a 401 with NO automatic retry
- ❌ They manually read localStorage instead of using the interceptor
- ❌ Token refresh in one request doesn't help other raw axios calls

**Solution:** Migrate all API calls to `axiosInstance` (which we'll do in Demo 8).
```

**Step 2: Ask a follow-up about the security event**

```
What does the 'auth:session-expired' custom event do? Which components listen for it?
```

**Expected Response** — Copilot may search with `#codebase` and explain that no component currently listens for this event, which is another gap in the architecture.

**Step 3: Ask about the React implications**

```
If I wrap this in a custom hook `useAxios`, what are the pros and cons versus 
the current module-level approach? Consider React's render cycle and Zustand.
```

### Teaching Points

> 🔍 **Ask Mode Best Practices for React Devs**:
> - Use `#selection` for focused code blocks (hooks, handlers, JSX sections)
> - Use `#file:` to bring in related files for cross-file analysis
> - Ask "why" questions first, "how to change" questions second
> - Ask mode is **read-only** — perfect for understanding code before refactoring in Agent mode
> - Use inline chat (`⌘I`) for quick questions about a selected JSX block

### When to Use Ask vs Agent for Understanding

| Scenario | Use Ask Mode | Use Agent Mode |
|----------|-------------|----------------|
| "What does this hook do?" | ✅ | ❌ |
| "Why is this pattern used?" | ✅ | ❌ |
| "Show me a refactored version" | ✅ (preview only) | ✅ (applies changes) |
| "Fix this 401 handling" | ❌ | ✅ |
| "Find all files with this pattern" | ✅ with `#codebase` | ✅ with `@workspace` |

---

## Demo 5: Multi-File Refactoring with Agent Mode (15 min)

### Learning Objective
Use Agent mode to decompose a god component, extracting a focused sub-component with proper props, while maintaining all functionality.

### Scenario
`FloatingPanel.tsx` is **880 lines** with 4 tabs (itinerary, vehicle, directions, trips), inline sub-components, 30+ imports, and duplicate API call logic. We'll extract the **Vehicle Tab** into its own component.

> 🔍 **The Real Problem**: `FloatingPanel.tsx` has:
> - 30+ imports (line 1–31)
> - An inline `SortableStopItem` sub-component (line 33–82)
> - 4 tab sections with completely different concerns
> - Duplicate `axios.post` calls for vehicle analysis (line 700 AND line 719)
> - Hardcoded strings throughout (`'Vehicle specs updated by AI!'`, `'Failed to analyze vehicle'`)
> - References to "Gemini" (line 738) when the project uses Azure OpenAI

### Before Demo: Setup
```bash
# Open the god component
code frontend/src/components/FloatingPanel.tsx

# Review the vehicle tab section (lines 640–790)
# Note the duplicate axios.post calls at lines 700 and 719
```

### The Duplicate Code (Lines 698–733)

```tsx
// First copy — in onKeyDown handler (line 698):
const analyze = async () => {
  setIsAnalyzingVehicle(true);
  try {
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/vehicle-specs`, 
      { type: customVehicleDescription });
    setVehicleSpecs(res.data);
    toast.success('Vehicle specs updated by AI!');
  } catch (err) {
    toast.error('Failed to analyze vehicle');
  } finally {
    setIsAnalyzingVehicle(false);
  }
};

// Second copy — in onClick handler (line 719):
onClick={async () => {
  setIsAnalyzingVehicle(true);
  try {
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/vehicle-specs`, 
      { type: customVehicleDescription });
    setVehicleSpecs(res.data);
    toast.success('Vehicle specs updated by AI!');
  } catch (err) {
    toast.error('Failed to analyze vehicle');
  } finally {
    setIsAnalyzingVehicle(false);
  }
}}
```

### Live Coding Steps

**Step 1: Open Copilot Chat panel in Agent mode**
Press `⌃⌘I` (Mac) or `Ctrl+Alt+I` (Windows), select **Agent** from the agent picker.

**Step 2: Give Agent a detailed decomposition prompt**
```
Extract the Vehicle Tab from FloatingPanel.tsx into a new VehicleTab component.

Context:
- FloatingPanel.tsx is 880 lines with 4 tabs. The vehicle tab section is roughly 
  lines 640-790 (the section inside `{activeTab === 'vehicle' && (...)}`).
- It has DUPLICATE axios.post calls for AI vehicle analysis at lines ~700 and ~719.
- It references "Gemini" (line 738) but should reference "Azure OpenAI" per project standards.
- It uses raw `axios` for the vehicle-specs POST but should use `axiosInstance`.

Requirements:
1. Create frontend/src/components/VehicleTab.tsx
2. Props interface: vehicleSpecs (Vehicle), setVehicleSpecs, Zustand store action
3. Move all vehicle-related state into VehicleTab (customVehicleDescription, isAnalyzingVehicle)
4. Deduplicate the AI analysis logic into a single handleAnalyzeVehicle function
5. Replace raw axios.post with axiosInstance.post
6. Fix "Gemini" reference to "Azure OpenAI"
7. Keep all Tailwind classes and lucide-react icons
8. Update FloatingPanel.tsx to import and render <VehicleTab /> in the vehicle tab section
9. Follow project patterns: React.FC typing, interface-first props

Do NOT modify any other tabs in FloatingPanel.
```

**Expected Agent Actions** (creates 2 file changes):

**New file: `frontend/src/components/VehicleTab.tsx`**
```tsx
import React, { useState } from 'react';
import { Settings, Sparkles, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import axiosInstance from '../utils/axios';
import type { Vehicle } from '../types/Vehicle';

interface VehicleTabProps {
  vehicleSpecs: Vehicle;
  setVehicleSpecs: (specs: Partial<Vehicle>) => void;
}

const VehicleTab: React.FC<VehicleTabProps> = ({ vehicleSpecs, setVehicleSpecs }) => {
  const [customVehicleDescription, setCustomVehicleDescription] = useState('');
  const [isAnalyzingVehicle, setIsAnalyzingVehicle] = useState(false);

  // Single, deduplicated handler for AI vehicle analysis
  const handleAnalyzeVehicle = async () => {
    if (!customVehicleDescription) return;
    
    setIsAnalyzingVehicle(true);
    try {
      const res = await axiosInstance.post('/api/vehicle-specs', {
        type: customVehicleDescription,
      });
      setVehicleSpecs(res.data);
      toast.success('Vehicle specs updated by AI!');
    } catch (err) {
      toast.error('Failed to analyze vehicle');
    } finally {
      setIsAnalyzingVehicle(false);
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
        <Settings size={16} /> Vehicle Settings
      </h3>

      {/* AI Vehicle Description */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-2">
          Describe Your Vehicle (AI-Powered)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. 2022 Ford F-150 towing a 25ft boat"
            className="flex-1 p-2 border rounded focus:ring-blue-500 outline-none text-sm"
            value={customVehicleDescription}
            onChange={(e) => setCustomVehicleDescription(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAnalyzeVehicle();
            }}
          />
          <button
            className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={!customVehicleDescription || isAnalyzingVehicle}
            onClick={handleAnalyzeVehicle}
          >
            {isAnalyzingVehicle ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <Sparkles size={18} />
            )}
          </button>
        </div>
        <p className="text-[10px] text-gray-500 mt-1">
          * Powered by Azure OpenAI. Falls back to defaults if not configured.
        </p>
      </div>

      {/* Vehicle Spec Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* ... height, weight, width, range, mpg inputs ... */}
      </div>
    </div>
  );
};

export default VehicleTab;
```

**Updated `FloatingPanel.tsx`** — Vehicle tab section replaced:
```tsx
import VehicleTab from './VehicleTab';

// ... inside the render, the vehicle tab section becomes:
{activeTab === 'vehicle' && (
  <VehicleTab
    vehicleSpecs={vehicleSpecs}
    setVehicleSpecs={setVehicleSpecs}
  />
)}
```

### Teaching Points

> 🔧 **Agent Mode Component Decomposition Strategy**:
> 1. **Identify the boundary**: Which state is local to the tab? (→ moves to new component)
> 2. **Identify shared state**: What comes from the parent/store? (→ becomes props)
> 3. **Identify duplicates**: Identical logic that can be consolidated
> 4. **Name the violations**: raw `axios`, hardcoded strings, outdated references
> 5. **Set guardrails**: "Do NOT modify other tabs" prevents over-reaching changes

### Agent Mode Features for React Refactoring

| Feature | Description |
|---------|-------------|
| **Checkpoints** | Agent creates snapshots before changes — press "Restore" to undo |
| **Multi-file edits** | Creates new component file AND updates existing file in one operation |
| **Terminal commands** | Agent can run `npm run build` to verify TypeScript compiles |
| **Review diffs** | See exact changes before accepting — review inline diffs in each file |

### Verification
```bash
cd frontend

# Verify TypeScript compiles
npx tsc --noEmit

# Verify the build succeeds
npm run build

# Check FloatingPanel is now shorter
wc -l src/components/FloatingPanel.tsx
# Should be ~700 lines (was 880)

wc -l src/components/VehicleTab.tsx
# Should be ~100 lines
```

---

## Demo 6: Few-Shot Prompting for Custom Hooks (10 min)

### Learning Objective
Teach Copilot project-specific hook patterns by showing existing examples, then generate a new custom hook that follows the same conventions.

### Scenario
Three views (`AllTripsView`, `ExploreView`, `TripsView`) each have their own `fetchTrips` / `fetchPublicTrips` / `fetchFeaturedTrips` functions with duplicated loading state, error handling, and API calls. We'll create a `useTrips` custom hook using `useOnlineStatus` as a pattern example.

> 🔍 **The Real Problem**:
> - `AllTripsView.tsx` line 37: `fetchPublicTrips()` — raw `axios`, manual loading state
> - `ExploreView.tsx` line 60: `fetchFeaturedTrips()` — raw `axios`, manual loading state
> - `TripsView.tsx` line 30: `fetchTrips()` — raw `axios`, manual auth header, manual loading state
> - All three re-implement the same `isLoading` / `try-catch` / `toast.error` pattern

### Before Demo: Setup
```bash
# Open the existing hook as a pattern example
code frontend/src/hooks/useOnlineStatus.ts

# Open views to see the duplication
code frontend/src/views/AllTripsView.tsx   # See lines 37-50
code frontend/src/views/TripsView.tsx      # See lines 30-48
```

### Live Coding Steps

**Step 1: Create a new file and show Copilot the pattern**
```bash
code frontend/src/hooks/useTrips.ts
```

Write a few-shot prompt:
```typescript
/**
 * PATTERN EXAMPLES (Few-Shot Learning):
 *
 * Example 1: useOnlineStatus hook (hooks/useOnlineStatus.ts)
 * - Exports a named interface: OnlineStatus { isOnline: boolean; wasOffline: boolean }
 * - Returns a typed object: (): OnlineStatus
 * - Uses useState with lazy initializer: useState<boolean>(() => navigator.onLine)
 * - Uses useEffect with cleanup (removeEventListener, clearInterval)
 * - Has JSDoc with @returns and @example
 * - Also exports a simplified version: useIsOnline(): boolean
 *
 * Example 2: useTripStore (store/useTripStore.ts)
 * - Uses axiosInstance (NOT raw axios) for all API calls
 * - API endpoints: '/api/trips', '/api/trips/:id'
 * - Auth: axiosInstance automatically adds Bearer token via interceptor
 * - For public endpoints (no auth): '/api/public-trips?featured_only=true&limit=5'
 *
 * Example 3: Duplicated patterns in views:
 * - AllTripsView: useState<PublicTrip[]>([]), useState(true) for loading, fetchPublicTrips()
 * - TripsView: useState<SavedTrip[]>([]), manual localStorage.getItem('token')
 * - ExploreView: useState<FeaturedTrip[]>([]), fetchFeaturedTrips()
 *
 * NOW CREATE: useTrips custom hook
 * - Consolidates all trip-fetching logic into one reusable hook
 * - Parameters: options: { featured_only?: boolean, limit?: number, requireAuth?: boolean }
 * - Returns: { trips: TripCard[], isLoading: boolean, error: string | null, refetch: () => void }
 * - Uses axiosInstance for authenticated calls, axios for public endpoints
 * - Uses TripCard type from types/index.ts (created in Demo 2)
 * - Fetches on mount via useEffect, re-fetches when options change
 * - Handles errors with toast notifications
 * - Follow useOnlineStatus patterns: JSDoc, named interface, cleanup
 */
```

**Step 2: Press Enter and type the imports**
```typescript
import { useState, useEffect, useCallback } from 'react';
```

**Expected Copilot Suggestion**:
```typescript
import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../utils/axios';
import toast from 'react-hot-toast';
import type { TripCard } from '../types';

/**
 * Options for the useTrips hook
 */
export interface UseTripsOptions {
  /** Only fetch featured trips */
  featured_only?: boolean;
  /** Maximum number of trips to fetch */
  limit?: number;
  /** Whether this endpoint requires authentication */
  requireAuth?: boolean;
}

/**
 * Return type for the useTrips hook
 */
export interface UseTripsResult {
  /** Array of trip cards */
  trips: TripCard[];
  /** Whether a fetch is in progress */
  isLoading: boolean;
  /** Error message, if any */
  error: string | null;
  /** Manually trigger a refetch */
  refetch: () => void;
}

/**
 * Custom hook for fetching trips with loading state and error handling.
 * Consolidates duplicated trip-fetching logic from AllTripsView, ExploreView, and TripsView.
 *
 * @param options - Configuration for the trip fetch
 * @returns {UseTripsResult} Trip data, loading state, error, and refetch function
 *
 * @example
 * // Fetch all public trips
 * const { trips, isLoading } = useTrips({ requireAuth: false });
 *
 * @example
 * // Fetch featured trips with limit
 * const { trips, isLoading } = useTrips({ featured_only: true, limit: 5 });
 *
 * @example
 * // Fetch authenticated user's trips
 * const { trips, isLoading, refetch } = useTrips({ requireAuth: true });
 */
export const useTrips = (options: UseTripsOptions = {}): UseTripsResult => {
  const [trips, setTrips] = useState<TripCard[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrips = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const endpoint = options.requireAuth ? '/api/trips' : '/api/public-trips';
      const params = new URLSearchParams();

      if (options.featured_only) params.set('featured_only', 'true');
      if (options.limit) params.set('limit', String(options.limit));

      const url = params.toString() ? `${endpoint}?${params}` : endpoint;
      const res = await axiosInstance.get(url);

      setTrips(res.data);
    } catch (err) {
      const message = 'Failed to load trips';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [options.featured_only, options.limit, options.requireAuth]);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  return { trips, isLoading, error, refetch: fetchTrips };
};
```

### How Views Simplify After This Hook

**Before (AllTripsView.tsx — 20 lines of fetch logic):**
```tsx
const [trips, setTrips] = useState<PublicTrip[]>([]);
const [isLoading, setIsLoading] = useState(true);

const fetchPublicTrips = async () => {
  setIsLoading(true);
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/public-trips?featured_only=${filter === 'featured'}`
    );
    setTrips(res.data);
  } catch (error) {
    toast.error('Failed to load trips');
  } finally {
    setIsLoading(false);
  }
};
```

**After (2 lines):**
```tsx
const { trips, isLoading, refetch } = useTrips({
  featured_only: filter === 'featured',
});
```

### Teaching Points

> 📚 **Few-Shot Prompting Formula for React Hooks**:
> ```
> Example 1: [Existing hook with structure notes]
> Example 2: [Store/service pattern being consolidated]
> Example 3: [The duplication being eliminated]
> NOW CREATE: [New hook with params, return type, behavior]
> ```

### Why Few-Shot Works for React Hooks

| Approach | Prompt | Result |
|----------|--------|--------|
| Zero-shot | "Create a useTrips hook" | Generic, doesn't follow project conventions |
| One-shot | "Follow useOnlineStatus pattern, create useTrips" | Gets structure, misses API patterns |
| Few-shot (3 examples) | Show hook + store + view patterns | Follows exact project conventions |

### Common Mistakes
- ❌ **Not showing the import pattern**: If your examples use `axiosInstance`, Copilot will too. If they use raw `axios`, so will Copilot.
- ❌ **Forgetting `useCallback` for the fetch function**: Without it, the `useEffect` dependency causes infinite re-renders
- ❌ **Not specifying the return interface**: Copilot may return a tuple instead of an object

---

## Demo 7: Component Testing with Vitest + Testing Library (10 min)

### Learning Objective
Generate Zustand store tests and React component tests, then debug a failing test using inline chat.

### Scenario
The project has only **6 tests in 1 file** (`useTripStore.test.ts`), with **zero component rendering tests**. We'll generate new store tests and create the project's first component test.

### Part A: Generate Store Tests (5 min)

**Setup:**
```bash
code frontend/src/store/useTripStore.test.ts
# Review existing 6 tests — they test addStop, removeStop, updateVehicleSpecs, saveTrip, loadTrips, loadTrip
```

**Step 1: Position cursor after the last test and write a comment**
```typescript
  // Test that reordering stops correctly swaps positions
  // Given: 3 stops [A, B, C], when reorderStops(0, 2), then stops should be [B, C, A]
  it('should reorder stops correctly', () => {
```

**Expected Copilot Suggestion**:
```typescript
  it('should reorder stops correctly', () => {
    const stopA = { id: 'a', name: 'Stop A', coordinates: [0, 0] as [number, number], type: 'start' as const };
    const stopB = { id: 'b', name: 'Stop B', coordinates: [1, 1] as [number, number], type: 'stop' as const };
    const stopC = { id: 'c', name: 'Stop C', coordinates: [2, 2] as [number, number], type: 'stop' as const };

    useTripStore.getState().addStop(stopA);
    useTripStore.getState().addStop(stopB);
    useTripStore.getState().addStop(stopC);

    useTripStore.getState().reorderStops(0, 2);

    const stops = useTripStore.getState().stops;
    expect(stops[0].id).toBe('b');
    expect(stops[1].id).toBe('c');
    expect(stops[2].id).toBe('a');
  });
```

**Step 2: Generate an edge case test**
```typescript
  // Test what happens when setting vehicle specs with partial update
  // The update should merge with existing specs, not replace them
  it('should merge partial vehicle specs without losing existing values', () => {
```

**Expected Copilot Suggestion**:
```typescript
  it('should merge partial vehicle specs without losing existing values', () => {
    // Set initial custom specs
    useTripStore.getState().setVehicleSpecs({
      height: 4.0,
      weight: 15,
      width: 3.0,
    });

    // Partial update — only change height
    useTripStore.getState().setVehicleSpecs({ height: 5.0 });

    const specs = useTripStore.getState().vehicleSpecs;
    expect(specs.height).toBe(5.0);
    expect(specs.weight).toBe(15);  // Preserved
    expect(specs.width).toBe(3.0);  // Preserved
  });
```

### Part B: First Component Test (5 min)

**Step 1: Create a new test file using Agent mode**

Open Agent mode and type:
```
Create a component test for the OfflineIndicator component at 
frontend/src/components/OfflineIndicator.tsx. 

Use the existing test setup:
- Vitest framework (describe, it, expect, vi)
- @testing-library/react (render, screen)
- Mock the useOnlineStatus hook from hooks/useOnlineStatus

Test cases:
1. Renders nothing when online
2. Shows offline banner when offline
3. Shows "back online" toast when wasOffline is true

Save to frontend/src/components/__tests__/OfflineIndicator.test.tsx
```

**Expected Agent Output** — new test file:
```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import OfflineIndicator from '../OfflineIndicator';

// Mock the useOnlineStatus hook
vi.mock('../../hooks/useOnlineStatus', () => ({
  useOnlineStatus: vi.fn(),
}));

import { useOnlineStatus } from '../../hooks/useOnlineStatus';
const mockUseOnlineStatus = vi.mocked(useOnlineStatus);

describe('OfflineIndicator', () => {
  it('renders nothing when online', () => {
    mockUseOnlineStatus.mockReturnValue({ isOnline: true, wasOffline: false });
    const { container } = render(<OfflineIndicator />);
    expect(container.firstChild).toBeNull();
  });

  it('shows offline banner when offline', () => {
    mockUseOnlineStatus.mockReturnValue({ isOnline: false, wasOffline: true });
    render(<OfflineIndicator />);
    expect(screen.getByText(/offline/i)).toBeInTheDocument();
  });

  it('shows reconnected message when back online after being offline', () => {
    mockUseOnlineStatus.mockReturnValue({ isOnline: true, wasOffline: true });
    render(<OfflineIndicator />);
    expect(screen.getByText(/back online/i)).toBeInTheDocument();
  });
});
```

### Part C: Debug a Failing Test (2 min)

**Step 1: Intentionally break a test**
```typescript
// In the reorder test, change the expected order to be wrong:
expect(stops[0].id).toBe('a');  // ← This will fail (should be 'b')
```

**Step 2: Run the test**
```bash
cd frontend
npx vitest run src/store/useTripStore.test.ts
```

**Step 3: Select the failing assertion, press `⌘I` (inline chat)**:
```
This test fails because the reorder logic moves index 0 to index 2. 
After the splice, what is the actual order? Fix the assertion.
```

### Teaching Points

> 🧪 **React Testing Patterns with Copilot**:

| Testing Target | Pattern | Prompt Strategy |
|----------------|---------|-----------------|
| **Zustand store** | Direct `getState()` / `setState()` | Describe state transitions in the comment |
| **Components** | `render()` + `screen.getBy*` | Specify the mock return values |
| **Custom hooks** | `renderHook()` from `@testing-library/react` | Show the hook signature and expected behavior |
| **API calls** | `vi.mock('axios')` or `vi.mock('../utils/axios')` | Specify mock responses |

### Test Generation Prompt Tips

```typescript
// ❌ Vague — generates generic tests
// Test the store

// ✅ Specific — generates targeted, meaningful tests
// Test that reordering stops correctly swaps positions
// Given: 3 stops [A, B, C], when reorderStops(0, 2), then stops should be [B, C, A]
```

### Verification
```bash
cd frontend
npx vitest run --reporter=verbose

# Expected: All tests pass, including new ones
```

---

## Demo 8: Constants Extraction & API Standardization (10 min)

### Learning Objective
Use Agent mode to perform a bulk codebase cleanup: extract hardcoded strings to constants files and migrate raw `axios` calls to `axiosInstance`.

### Scenario
The project has **zero constants files** and **16+ raw `axios` calls** that bypass the authenticated `axiosInstance`. We'll use Agent mode for a systematic cleanup — addressing two Roadmap Phase 5 items (5.3 and 5.5) in one operation.

> 🔍 **The Real Problems**:
> - `AllTripsView.tsx` line 4: `import axios from 'axios'` — raw axios
> - `AllTripsView.tsx` line 40: `` `${import.meta.env.VITE_API_URL}/api/public-trips?...` `` — hardcoded URL
> - `TripsView.tsx` line 31-32: Manual `localStorage.getItem('token')` + `Authorization` header
> - `ExploreView.tsx` line 8: `import axios from 'axios'` — raw axios
> - `FloatingPanel.tsx` line 10-11: imports BOTH `axios` and `axiosInstance`
>
> Per `.github/copilot-instructions.md` line 56-72: **"Use `axiosInstance` only — no raw fetch/axios"**

### Live Coding Steps

**Step 1: Open Agent mode and give a comprehensive prompt**
```
I need to perform two related cleanups across the React frontend, following 
the rules in .github/copilot-instructions.md:

TASK 1: Create constants files
Create these files:
- frontend/src/constants/routes.ts — export all route paths ('/explore', '/itinerary', '/trips', '/start', '/all-trips')
- frontend/src/constants/api.ts — export all API endpoint paths ('/api/trips', '/api/public-trips', '/api/geocode', '/api/directions', '/api/search', '/api/vehicle-specs', '/api/auth/refresh')
- frontend/src/constants/index.ts — barrel export from routes.ts and api.ts

TASK 2: Migrate raw axios to axiosInstance in these files:
- frontend/src/views/AllTripsView.tsx — replace `import axios from 'axios'` with `import axiosInstance from '../utils/axios'`, replace all axios.get with axiosInstance.get, remove manual VITE_API_URL prefix (axiosInstance has baseURL configured)
- frontend/src/views/TripsView.tsx — same migration, ALSO remove manual localStorage.getItem('token') and Authorization headers (axiosInstance interceptor handles this)
- frontend/src/views/ExploreView.tsx — same migration
- frontend/src/components/FloatingPanel.tsx — remove the raw `import axios from 'axios'` (keep axiosInstance import that already exists), replace all remaining raw axios calls with axiosInstance

For each view file:
- Replace: axios.get(`${import.meta.env.VITE_API_URL}/api/...`) 
- With: axiosInstance.get(API_ENDPOINTS.TRIPS) (using constants)
- Remove any manual Authorization header additions (axiosInstance handles this)

Do NOT change any component logic, JSX, or styling. Only change imports and API call patterns.
```

**Expected Agent Output** — creates/modifies 7 files:

**New: `frontend/src/constants/routes.ts`**
```typescript
/**
 * Application route paths.
 * Single source of truth for all frontend routes.
 */
export const ROUTES = {
  HOME: '/',
  EXPLORE: '/explore',
  ITINERARY: '/itinerary',
  TRIPS: '/trips',
  START: '/start',
  ALL_TRIPS: '/all-trips',
} as const;
```

**New: `frontend/src/constants/api.ts`**
```typescript
/**
 * API endpoint paths.
 * Used with axiosInstance which already has baseURL configured.
 */
export const API_ENDPOINTS = {
  TRIPS: '/api/trips',
  PUBLIC_TRIPS: '/api/public-trips',
  GEOCODE: '/api/geocode',
  DIRECTIONS: '/api/directions',
  SEARCH: '/api/search',
  VEHICLE_SPECS: '/api/vehicle-specs',
  AUTH_REFRESH: '/api/auth/refresh',
} as const;
```

**New: `frontend/src/constants/index.ts`**
```typescript
export { ROUTES } from './routes';
export { API_ENDPOINTS } from './api';
```

**Updated: `AllTripsView.tsx`** (key changes):
```tsx
// Before:
import axios from 'axios';
// ...
const res = await axios.get(
  `${import.meta.env.VITE_API_URL}/api/public-trips?featured_only=${filter === 'featured'}`
);

// After:
import axiosInstance from '../utils/axios';
import { API_ENDPOINTS } from '../constants';
// ...
const res = await axiosInstance.get(API_ENDPOINTS.PUBLIC_TRIPS, {
  params: { featured_only: filter === 'featured' }
});
```

**Updated: `TripsView.tsx`** (key changes):
```tsx
// Before:
import axios from 'axios';
const token = localStorage.getItem('token');
const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/trips`, {
  headers: { Authorization: `Bearer ${token}` }
});

// After:
import axiosInstance from '../utils/axios';
import { API_ENDPOINTS } from '../constants';
const res = await axiosInstance.get(API_ENDPOINTS.TRIPS);
// No manual token! axiosInstance interceptor handles authentication.
```

### Teaching Points

> 🔧 **Agent Mode for Bulk Standardization**:
> - Agent can create multiple new files and modify multiple existing files in one operation
> - Use **checkpoints** to review before committing — one bad regex replacement could break many files
> - Be specific about what should NOT change ("Do NOT change JSX or styling")
> - Reference the project's `.github/copilot-instructions.md` for rules

### Before/After Comparison

| Metric | Before | After |
|--------|--------|-------|
| Constants files | 0 | 3 (routes, api, index) |
| Raw `axios` imports in views | 4 files | 0 files |
| Manual `Authorization` headers | 3 places | 0 places |
| Hardcoded API paths | 16+ strings | 0 (all in `API_ENDPOINTS`) |
| Hardcoded route paths | 8+ strings | 0 (all in `ROUTES`) |

### Verification
```bash
cd frontend

# Verify no raw axios imports remain in views
grep -r "import axios from 'axios'" src/views/
# Should return: nothing

# Verify constants are used
grep -r "API_ENDPOINTS" src/views/
# Should return: matches in all view files

# Verify build passes
npm run build

# Run tests
npx vitest run
```

---

## Workshop Summary & Key Takeaways

### Techniques Comparison Matrix (React Edition)

| Technique | When to Use | How to Access | React Example |
|-----------|-------------|---------------|---------------|
| **Inline Suggestions** | Adding interface fields, JSX props | Just type (ghost text) | Adding `fuelType` to Vehicle interface |
| **NES (Next Edit)** | Type changes that ripple | `Tab` on gutter arrow | Interface change → store → component updates |
| **Explicit Prompting** | Complex TypeScript interfaces | Detailed comment/docstring | `TripCard` interface replacing 3 inline types |
| **Comment-Based** | New React components | `// Description` + Enter | ErrorBoundary with Tailwind + lucide-react |
| **Ask Mode** | Understanding before refactoring | `⌃⌘I` → Ask + `#selection` | Axios interceptor + token refresh queue |
| **Agent Mode** | Multi-file decomposition | `⌃⌘I` → Agent | FloatingPanel → VehicleTab extraction |
| **Plan Mode** | Complex refactoring review | `⌃⌘I` → Plan | Full component decomposition plan |
| **Few-Shot** | Custom hooks from patterns | 2-3 examples + request | useOnlineStatus → useTrips hook |
| **Testing** | Store + component tests | Agent mode or inline chat | Vitest + Testing Library tests |
| **Bulk Cleanup** | Standards enforcement | Agent mode + constants | Raw axios → axiosInstance migration |

### Quick Reference Card (React Edition)

```
┌─────────────────────────────────────────────────────────────┐
│              REACT + COPILOT QUICK REFERENCE                 │
├─────────────────────────────────────────────────────────────┤
│ INLINE SUGGESTIONS                                           │
│   Tab          Accept full suggestion                        │
│   Cmd+→        Accept word-by-word                          │
│   Alt+]        Next alternative suggestion                   │
│   Tab (gutter) Jump to Next Edit Suggestion (NES)            │
│   Esc          Dismiss                                       │
├─────────────────────────────────────────────────────────────┤
│ COPILOT CHAT (⌃⌘I / Ctrl+Alt+I)                            │
│   Ask          Read-only Q&A (hooks, stores, JSX)            │
│   Agent        Autonomous edits (decompose, extract, create) │
│   Plan         Review plan before execution                  │
│   #selection   Reference highlighted TSX/hooks               │
│   #file:name   Reference entire component file               │
│   #codebase    Search across all React files                 │
│   @workspace   Workspace-aware context                       │
├─────────────────────────────────────────────────────────────┤
│ INLINE CHAT (⌘I / Ctrl+I)                                   │
│   Select code → ⌘I → ask question or request edit            │
│   Great for: Quick JSX fixes, prop additions, test fixes     │
├─────────────────────────────────────────────────────────────┤
│ REACT-SPECIFIC TIPS                                          │
│   Interface fields     → Inline suggestions shine here       │
│   Component generation → Comment-based with props spec       │
│   Hook creation        → Few-shot with existing hook example │
│   Store tests          → Describe state transitions          │
│   Component tests      → Specify mock return values          │
│   Multi-file refactor  → Agent mode with guardrails          │
└─────────────────────────────────────────────────────────────┘
```

### Common Pitfalls to Avoid (React Edition)

| Pitfall | Solution |
|---------|----------|
| Accepting interface suggestions without checking unions | Verify discriminated unions match backend schema |
| Using `any` type when Copilot can't infer | Write the interface first, then let Copilot use it |
| Letting Agent mode refactor too broadly | Set guardrails: "Do NOT modify other tabs/components" |
| Not showing hook patterns in few-shot prompts | Always include 2-3 examples with return types |
| Generating tests without mock setup | Specify `vi.mock()` targets in the prompt |
| Ignoring NES after TypeScript interface changes | Follow gutter arrows — types ripple through the app |
| Not checking `.github/copilot-instructions.md` rules | Reference project rules in Agent mode prompts |
| Accepting raw `axios` in Copilot suggestions | Your instructions file should prevent this — verify |

---

## Hands-On Exercise (Optional — 15 min)

**Challenge**: Use ALL techniques from this workshop to add a **"Bookmark" feature** to the Road Trip app.

### Steps

1. **Inline Suggestions + NES** (Demo 1 technique)
   - Add `isBookmarked: boolean` to the `TripCard` interface in `types/index.ts`
   - Watch NES propagate the field to components that use `TripCard`

2. **Explicit Prompting** (Demo 2 technique)
   - Create a `BookmarkState` interface in the Zustand store with explicit prompt:
     - `bookmarkedTripIds: Set<number>`, `toggleBookmark(id: number)`, `isBookmarked(id: number): boolean`

3. **Comment-Based Generation** (Demo 3 technique)
   - Create `components/BookmarkButton.tsx` with a descriptive comment:
     ```
     // Bookmark toggle button component
     // Props: tripId (number), isBookmarked (boolean), onToggle callback
     // Uses lucide-react Heart icon (filled when bookmarked, outline when not)
     // Tailwind: red-500 when active, gray-400 when inactive, scale animation on click
     ```

4. **Ask Mode** (Demo 4 technique)
   - Select the Zustand store `saveTrip` action and ask: "How should I persist bookmarks? localStorage, IndexedDB, or backend API? Consider the offline-first architecture."

5. **Agent Mode** (Demo 5 technique)
   - "Add a BookmarkButton to each trip card in AllTripsView.tsx. Import from components/BookmarkButton."

6. **Few-Shot Hook** (Demo 6 technique)
   - Create `useBookmarks` hook following `useTrips` pattern

7. **Testing** (Demo 7 technique)
   - Generate tests for `BookmarkButton` and `useBookmarks` hook

8. **Constants** (Demo 8 technique)
   - Add `BOOKMARKS: '/api/bookmarks'` to `constants/api.ts`

### Verification
```bash
cd frontend
npx vitest run --reporter=verbose
npm run build
```

---

## Next Workshop Preview

**Workshop 3: Advanced React Development with GitHub Copilot**
- **Custom Instructions**: Project-specific `.github/copilot-instructions.md` for React conventions
- **Custom Agents**: Building `.github/copilot-agents/*.agent.md` for specialized React workflows
  - `react-component-generator.agent.md` — generates components following project patterns
  - `type-consolidator.agent.md` — finds and merges duplicate TypeScript interfaces
- **MCP Servers**: Connecting to external tools (Figma → React components, API spec → types)
- **Checkpoints & Rollback**: Safe multi-step refactoring with restore points
- **Model Selection**: Choosing the right model for different React tasks
  - Fast models for inline suggestions and simple completions
  - Reasoning models for complex refactoring and architecture decisions

**Preparation**:
- Review `.github/copilot-instructions.md` (471 lines of project rules)
- Explore the Chat panel agents (`⌃⌘I` → toggle Agent/Plan/Ask)
- Complete the Bookmark exercise from this workshop
- Read `docs/ROADMAP.md` Phase 5 (Frontend Standardization) for context

---

## Appendix: Project Architecture Reference

### Frontend File Structure
```
frontend/src/
├── main.tsx                    # React entry point
├── App.tsx                     # Router + GoogleOAuthProvider
├── components/
│   ├── MainLayout.tsx          # Shell: sidebar + map + outlet
│   ├── MapComponent.tsx        # Mapbox GL map
│   ├── FloatingPanel.tsx       # 880-line god component (Demo 5 target)
│   ├── ErrorBoundary.tsx       # Created in Demo 3
│   ├── VehicleTab.tsx          # Extracted in Demo 5
│   ├── AuthStatus.tsx          # User badge
│   ├── OfflineIndicator.tsx    # Connection status
│   └── navigation/             # Desktop + Mobile nav
├── hooks/
│   ├── useOnlineStatus.ts      # Demo 6 pattern example
│   └── useTrips.ts             # Created in Demo 6
├── store/
│   └── useTripStore.ts         # Zustand store (Demo 1, 7)
├── types/
│   ├── index.ts                # Shared types (Demo 2)
│   ├── Vehicle.ts              # Demo 1 target
│   ├── Trip.ts, Stop.ts, etc.
├── constants/                  # Created in Demo 8
│   ├── routes.ts
│   ├── api.ts
│   └── index.ts
├── utils/
│   ├── axios.ts                # Demo 4 explanation target
│   ├── offlineStorage.ts
│   └── syncManager.ts
└── views/
    ├── ExploreView.tsx         # Demo 8 migration target
    ├── AllTripsView.tsx        # Demo 8 migration target
    ├── TripsView.tsx           # Demo 8 migration target
    └── ...
```

### Key Dependencies

| Package | Version | Used In |
|---------|---------|---------|
| `react` / `react-dom` | ^18.2.0 | Core framework |
| `zustand` | ^4.5.0 | State management (store/) |
| `react-router-dom` | ^7.9.6 | Routing (App.tsx) |
| `axios` | ^1.6.7 | HTTP (utils/axios.ts) |
| `mapbox-gl` / `react-map-gl` | ^3.1.2 / ^7.1.7 | Maps (MapComponent) |
| `@dnd-kit/core` | ^6.3.1 | Drag-and-drop (FloatingPanel) |
| `lucide-react` | ^0.330.0 | Icons (all components) |
| `tailwindcss` | ^3.4.1 | Styling (all components) |
| `vitest` | ^1.1.0 | Testing (store, components) |
| `@testing-library/react` | ^14.1.2 | Component testing |

---

## Resources

- **GitHub Copilot Docs**: https://docs.github.com/en/copilot
- **Copilot Chat Modes**: https://code.visualstudio.com/docs/copilot/copilot-chat
- **Inline Suggestions & NES**: https://code.visualstudio.com/docs/copilot/ai-powered-suggestions
- **Copilot Agents Overview**: https://code.visualstudio.com/docs/copilot/agents/overview
- **Prompt Engineering Guide**: https://code.visualstudio.com/docs/copilot/guides/prompt-engineering-guide
- **Custom Instructions**: https://code.visualstudio.com/docs/copilot/customization/custom-instructions
- **Project Rules**: `.github/copilot-instructions.md`
- **Project Roadmap**: `docs/ROADMAP.md` (Phase 5 — Frontend Standardization)
- **Testing Library Docs**: https://testing-library.com/docs/react-testing-library/intro
- **Zustand Docs**: https://docs.pmnd.rs/zustand
- **Vitest Docs**: https://vitest.dev/

**Questions?** Proceed to Workshop 3: Advanced React Development, or revisit Workshop 1: Foundational React Development for review.
