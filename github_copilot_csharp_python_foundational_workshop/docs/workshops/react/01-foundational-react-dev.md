# Workshop 1: Foundational React Development with GitHub Copilot

**Duration**: 90 minutes  
**Format**: Hands-on live coding with step-by-step exercises  
**Audience**: New GitHub Copilot users familiar with React and TypeScript basics  
**Prerequisites**: Completed `setup/00-setup-instructions.md`, GitHub Copilot activated in VS Code  
**Project**: Road Trip Planner — React + TypeScript + Zustand + Mapbox GL  

---

## Learning Objectives

By the end of this workshop, you will:

1. [**Understand Copilot's Role**](#setup-understand-copilots-role-in-your-workflow-10-min) in your React development workflow  
2. [**Provide Clear Context**](#demo-1-provide-clear-context-for-better-suggestions-15-min) for better suggestions using the CORE framework  
3. [**Use Iterative Acceptance**](#demo-2-use-iterative-acceptance-of-suggestions-20-min) to shape suggestions line-by-line  
4. [**Be Mindful of Security and Privacy**](#demo-3-be-mindful-of-security-and-privacy-10-min) when Copilot suggests code  
5. [**Customize Copilot**](#optional-extension-a-customize-copilot-for-your-needs-self-study) with instruction files and settings for your project  
6. [**Leverage Copilot Chat**](#demo-4-leverage-copilot-chat-for-debugging-and-exploration-20-min) for debugging and code exploration  
7. [**Understand Copilot's Limitations**](#demo-5-understand-copilots-limitations-15-min) and when to override its suggestions  

> **Source**: These capabilities are drawn directly from [GitHub's Best Practices for Using GitHub Copilot](https://docs.github.com/en/copilot/get-started/best-practices) and [Prompt Engineering for GitHub Copilot](https://docs.github.com/en/copilot/concepts/prompting/prompt-engineering).

---

## The CORE Prompting Framework

All prompts in this workshop follow the **CORE** framework. This structured approach produces dramatically better results than vague requests.

| Letter | Element | Description | React Example |
|--------|---------|-------------|---------------|
| **C** | **Context** | Background — the component, file, libraries in use | "In this React component using Zustand and react-map-gl..." |
| **O** | **Objective** | What you want — create, explain, refactor, debug | "Create a typed props interface for vehicle selection..." |
| **R** | **Requirements** | Constraints — types, patterns, accessibility, styling | "Use union types, Tailwind classes, optional props with defaults..." |
| **E** | **Examples** | Existing patterns to follow | "Follow the Stop interface pattern in `types/Stop.ts`..." |

### How to Write CORE Prompts in React/TypeScript

**Style 1: Comment Block** (above components, interfaces, functions)
```typescript
// Context: React component in Road Trip Planner using Zustand store and react-map-gl.
// Objective: Create a TypeScript interface for the VehicleSelector component props.
// Requirements: vehicleType union ('car'|'rv'|'truck'|'suv'), onChange callback, Tailwind styling.
// Examples: Follow the Stop interface in types/Stop.ts with optional fields and JSDoc.
```

**Style 2: Copilot Chat Prompt** (for debugging, exploration, refactoring)
```
Context: I'm working on the ExploreView.tsx component in a React + TypeScript road trip planner.
         It uses Zustand for state, axios for API calls, and Tailwind for styling.
Objective: Debug why the search results aren't rendering after the API call succeeds.
Requirements: The fix should preserve the existing SearchResult interface and keep Tailwind classes.
Examples: The TripsView.tsx component fetches data correctly — use that as a reference.
```

> **CORE Formula Template**:
> ```
> Context:      "In this React [component/hook/store], using [libraries]..."
> Objective:    "Create / Debug / Refactor / Test [specific thing]..."
> Requirements: "Must use [types, patterns, accessibility rules, Tailwind]..."
> Examples:     "Follow the [ExploreView / useTripStore / Stop interface] pattern"
> ```

---

## Workshop Agenda

| Time | Demo | Copilot Capability | File(s) |
|------|------|--------------------|---------|
| 0-10 min | Setup | Copilot's Role in Your Workflow | Overview |
| 10-25 min | Demo 1 | Provide Clear Context (CORE Framework) | `types/index.ts`, new `types/VehicleOption.ts` |
| 25-45 min | Demo 2 | Iterative Acceptance of Suggestions | `components/MapComponent.tsx` |
| 45-55 min | Demo 3 | Security and Privacy Awareness | `utils/axios.ts`, `views/ExploreView.tsx` |
| 55-75 min | Demo 4 | Chat for Debugging and Exploration | `store/useTripStore.ts`, `components/MapComponent.tsx` |
| 75-90 min | Demo 5 | Understanding Limitations | Summary + Q&A |

> **Note**: Demo 6 (Customize Copilot) has been moved to **Optional Extensions** for self-study. It covers instruction files and VS Code settings — important but can be learned asynchronously.

---

## Setup: Understand Copilot's Role in Your Workflow (10 min)

### What Is GitHub Copilot?

GitHub Copilot is an AI-powered coding assistant that provides **real-time code suggestions** directly in VS Code. It works in multiple modes:

| Mode | Best For | How to Use |
|------|----------|------------|
| **Inline Suggestions** | Completing code as you type — props, functions, JSX | Just start typing; press `Tab` to accept |
| **Copilot Chat (Ask mode)** | Questions, explanations, debugging guidance | Press `Cmd+Shift+I` / `Ctrl+Shift+I` or Chat sidebar |
| **Copilot Chat (Edit mode)** | Modifying selected code with instructions | Select code → `Cmd+I` / `Ctrl+I` → describe change |
| **Copilot Chat (Agent mode)** | Multi-step tasks across files | Click Agent in Chat → describe full task |

> **Chat Modes Quick Reference**:
> - **Ask**: Answer questions, explain code, suggest approaches (read-only)
> - **Edit**: Modify selected code in place with natural language instructions  
> - **Agent**: Autonomous multi-file edits, refactoring, feature implementation (uses tools)
> - **Plan** (preview): Generate implementation plans before coding
>
> For this foundational workshop, we'll focus on **Ask** and **Edit** modes. Agent mode is covered in the intermediate workshop.

### When Copilot Shines (React Development)

- Writing TypeScript interfaces and type definitions
- Generating React component boilerplate (props, state, effects)
- Completing JSX with Tailwind classes
- Creating custom hooks following existing patterns
- Writing unit tests for components and stores
- Explaining complex code (e.g., Zustand store slices, Mapbox layers)

### When You Should Lead (Not Copilot)

- **Architecture decisions** — Copilot doesn't know your system design
- **Business logic** — It guesses based on patterns, not your requirements
- **Security review** — Always verify auth flows, token handling, API keys
- **Performance tuning** — Copilot may suggest correct but slow approaches

> **Key Mindset**: You are the **pilot**. Copilot is your **co-pilot**. You make the decisions — Copilot accelerates execution.

### Keyboard Shortcuts Reference

| Action | Mac | Windows |
|--------|-----|---------|
| Accept full suggestion | `Tab` | `Tab` |
| Accept next word | `Cmd+→` | `Ctrl+→` |
| Dismiss suggestion | `Esc` | `Esc` |
| See next alternative | `Alt+]` | `Alt+]` |
| See previous alternative | `Alt+[` | `Alt+[` |
| **Inline Chat (Edit mode)** | `Cmd+I` | `Ctrl+I` |
| **Chat sidebar (Ask mode)** | `Cmd+Shift+I` | `Ctrl+Shift+I` |
| Quick Chat (floating) | `Cmd+Shift+Alt+L` | `Ctrl+Shift+Alt+L` |

### Chat Variables Reference

Use these variables in Copilot Chat to provide targeted context:

| Variable | Purpose | Example |
|----------|---------|---------|
| `#file` | Reference a specific file | `#file:useTripStore.ts How does saveTrip work?` |
| `#selection` | Reference selected code | (Select code first) `#selection Explain this hook` |
| `#codebase` | Search entire workspace | `#codebase Where are coordinates validated?` |
| `#terminalLastCommand` | Include last terminal output | `#terminalLastCommand Why did this fail?` |
| `@workspace` | Semantic search of project | `@workspace How do components use useTripStore?` |

---

## Demo 1: Provide Clear Context for Better Suggestions (15 min)

### Copilot Capability

> *"Provide Copilot with helpful context... open relevant files and close irrelevant files."*  
> — [GitHub Copilot Best Practices](https://docs.github.com/en/copilot/get-started/best-practices#guide-copilot-towards-helpful-outputs)

Copilot generates suggestions based on **context** — the files you have open, the code surrounding your cursor, and any comments you write. The more precise your context, the better the suggestions.

### Scenario

We need a new TypeScript interface `VehicleOption` for a vehicle selection dropdown in the Road Trip Planner. We'll use the CORE framework to give Copilot maximum context.

### Before You Begin

```bash
# Step 1: Close all open files in VS Code
#         Mac: Cmd+K W  |  Windows: Ctrl+K W

# Step 2: Open the relevant type files so Copilot can learn patterns
code frontend/src/types/Stop.ts
code frontend/src/types/Vehicle.ts
code frontend/src/types/Trip.ts
code frontend/src/types/index.ts
```

> **Why close irrelevant files?** Copilot uses open tabs as context. Having unrelated files open can dilute the signal and produce less relevant suggestions.

---

### Exercise 1A: Review Existing Patterns First

Before writing any prompts, study the patterns Copilot will learn from.

#### Step 1: Open `frontend/src/types/Stop.ts`

Read the existing interface:

```typescript
export type StopType = 'start' | 'end' | 'stop';

export interface Stop {
  id: string;
  name: string;
  coordinates: [number, number];
  type: StopType;
  address?: string;
}
```

**Patterns to notice** (Copilot will pick these up):
- ✅ Exports are named (not default)
- ✅ Union types for categories (`'start' | 'end' | 'stop'`)
- ✅ Tuple type for coordinates (`[number, number]`)
- ✅ Optional fields use `?` suffix
- ✅ No `any` types anywhere

#### Step 2: Open `frontend/src/types/Vehicle.ts`

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

**Notice**: `type` is just `string` — not a union type. This is something we can improve.

---

### Exercise 1B: Create a New Interface with CORE Prompting

#### Step 1: Check What Already Exists

Before creating anything, **always search your codebase first**. Open `frontend/src/types/index.ts` and look for existing types:

```typescript
// In types/index.ts — this ALREADY exists!
export type VehicleType = 'car' | 'suv' | 'rv' | 'truck' | 'ev';
```

> **Teaching Point**: Copilot doesn't always know what types already exist in your project. If you ask it to "create a VehicleType union", it will create a duplicate — causing a TypeScript error. **Always check first, then import.**

#### Step 2: Create the New File

```bash
# In terminal:
touch frontend/src/types/VehicleOption.ts
# Then open it:
code frontend/src/types/VehicleOption.ts
```

Or in VS Code: right-click `frontend/src/types/` → New File → `VehicleOption.ts`

> **Tip**: You can also use the demo template to get started:
> ```bash
> cp docs/workshops/web-dev/setup/demo-templates/demo-01-vehicle-option.ts frontend/src/types/VehicleOption.ts
> ```

#### Step 3: Import the Existing Type

Start by importing the `VehicleType` that already exists:

```typescript
import { VehicleType } from './index';
```

#### Step 4: Write the CORE Prompt as a Comment

Type this comment block **slowly** — let Copilot read each line:

```typescript
// Context: TypeScript type file in Road Trip Planner frontend.
//   Existing types in this folder use named exports, union types for categories,
//   optional fields with '?', and JSDoc comments.
//   VehicleType is already defined in ./index — imported above.
//
// Objective: Create a VehicleOption interface for a vehicle selection dropdown component.
//
// Requirements:
//   - id: string (unique identifier)
//   - label: string (display name, e.g., "Standard Car")
//   - type: VehicleType (imported from ./index — do NOT recreate the union)
//   - icon: string (Lucide icon name)
//   - description: optional string
//   - specs: object with height, width, weight (numbers in metric)
//   - isDefault: optional boolean
//   - Re-export VehicleType for convenience
//
// Examples: Follow the Stop interface in types/Stop.ts — named export, union type alias, optional fields.
```

#### Step 5: Re-export the Existing Type

On the next line after the comment, type:

```typescript
export { VehicleType } from './index';
```

This re-exports the existing type so consumers of `VehicleOption.ts` can import everything from one place.

> **Why re-export instead of recreate?** Duplicating a type means changes in one place won't be reflected in the other. Importing keeps a single source of truth.

#### Step 6: Start the Interface

On the next line, type:

```typescript
export interface VehicleOption {
```

#### Step 7: Watch Copilot Complete the Interface

**Expected Copilot Suggestion** (may vary — review carefully):
```typescript
export interface VehicleOption {
  id: string;
  label: string;
  type: VehicleType;
  icon: string;
  description?: string;
  specs: {
    height: number;
    width: number;
    weight: number;
  };
  isDefault?: boolean;
}
```

**Review checklist**:
- ✅ Uses `VehicleType` union (not plain `string`)
- ✅ Optional fields have `?`
- ✅ `specs` is an inline object type (acceptable for now)
- ⚠️ If Copilot used `any` — reject and re-type with stricter comment

Press `Tab` to accept if the suggestion looks correct.

#### Step 8: Add a Helper Type (Test Context Awareness)

Below the interface, type this comment:

```typescript
// Default vehicle options for the dropdown
```

Pause and watch. Copilot should suggest an array constant like:

```typescript
export const DEFAULT_VEHICLE_OPTIONS: VehicleOption[] = [
  {
    id: 'car-default',
    label: 'Standard Car',
    type: 'car',
    icon: 'Car',
    description: 'Sedan or hatchback',
    specs: { height: 1.5, width: 1.8, weight: 1500 },
    isDefault: true,
  },
  // ... more options
];
```

> **Teaching Point**: Because Copilot has context from the interface you just created AND the open type files, it generates data that matches your exact schema.

> **Cleanup Note**: This `VehicleOption.ts` file was created for practice. In a real project, you might merge it with the existing `VehicleSpecs` interface in `types/index.ts` to keep a single source of truth for vehicle-related types.

---

### Exercise 1C: Bad Context vs Good Context (Comparison)

To prove context matters, let's try the **wrong** way.

#### Step 1: Close All Files

`Cmd+K W` (Mac) / `Ctrl+K W` (Windows) to close everything.

#### Step 2: Open ONLY a New Empty File

Create a temporary file:

```typescript
// File: frontend/src/types/test-no-context.ts

// Create a vehicle type
```

#### Step 3: Observe the Difference

Without context from your project's type files, Copilot might suggest:

```typescript
// ❌ Generic suggestion with no project awareness:
interface Vehicle {
  make: string;
  model: string;
  year: number;
  color: string;
}
```

This is valid TypeScript — but it has **nothing to do with your Road Trip Planner**. No `VehicleType` union, no `coordinates`, no metric specs.

#### Step 4: Delete the Test File

```bash
rm frontend/src/types/test-no-context.ts
```

> **Key Takeaway**: **Context is king.** Open relevant files, write descriptive CORE comments, and close irrelevant tabs. This is the single most impactful habit for better Copilot suggestions.

---

### Teaching Points

1. **Open tabs = Copilot context**. Keep related files open; close unrelated ones.
2. **Search before you create**. Check `types/index.ts` and existing files before asking Copilot to generate new types — avoid duplicates.
3. **CORE prompts dramatically improve output**. Compare `"make a vehicle type"` vs the full CORE comment block.
4. **Union types > plain strings**. Copilot will match whatever pattern it sees — if your existing code uses unions, new code will too.

### Verification

```bash
cd frontend
npx tsc --noEmit    # TypeScript type check — should pass with no errors
```

---

## Demo 2: Use Iterative Acceptance of Suggestions (20 min)

### Copilot Capability

> *"Pick the best available suggestion. When you are using inline suggestions, Copilot might offer more than one suggestion. You can use keyboard shortcuts to quickly look through all available suggestions."*  
> — [GitHub Copilot Best Practices](https://docs.github.com/en/copilot/get-started/best-practices#guide-copilot-towards-helpful-outputs)

Don't accept the first suggestion blindly. Use **word-by-word acceptance**, **alternative cycling**, and **partial acceptance** to shape suggestions to your exact needs.

### Scenario

We'll add a `vehicleType` prop to the `MapComponent` and use it to change the map style. Along the way, we'll practice accepting suggestions iteratively.

### Before You Begin

```bash
# Step 1: Open the component file and related types
code frontend/src/components/MapComponent.tsx
code frontend/src/types/Stop.ts
code frontend/src/store/useTripStore.ts
```

---

### Exercise 2A: Add Props Interface to MapComponent

#### Step 1: Open `frontend/src/components/MapComponent.tsx`

Current code at the top of the component (around line 9):

```typescript
const MapComponent: React.FC = () => {
  const { stops, routeGeoJSON, pois } = useTripStore();
```

Notice: no props — it reads everything from the Zustand store.

#### Step 2: Position Your Cursor

Place your cursor on **line 9** (above `const MapComponent`). Press `Enter` to create a blank line.

#### Step 3: Write a CORE Comment

```typescript
// Context: MapComponent renders a Mapbox GL map with stops, routes, and POIs.
//   Currently takes no props — reads all state from useTripStore.
// Objective: Add a props interface to accept an optional vehicleType for styling.
// Requirements:
//   - vehicleType: optional, union of 'car' | 'suv' | 'rv' | 'truck' | 'ev'
//   - showTraffic: optional boolean, default false
//   - className: optional string for Tailwind styling
// Examples: Follow AuthStatus.tsx pattern — interface with optional className prop.
```

#### Step 4: Start Typing the Interface

```typescript
interface MapComponentProps {
```

#### Step 5: Use Word-by-Word Acceptance

When Copilot suggests the first property, **don't press `Tab`**. Instead:

1. **Read** the suggestion (dimmed ghost text)
2. Press `Cmd+→` (Mac) / `Ctrl+→` (Windows) to accept **one word at a time**
3. This lets you accept `vehicleType?:` but change the type if needed

**Expected suggestion flow** (accept word by word):
```
vehicleType → ? → : → 'car' → | → 'suv' → | → 'rv' → | → 'truck' → | → 'ev' → ;
```

If at any point the suggestion diverges (e.g., Copilot writes `string` instead of the union type):
- Press `Esc` to dismiss
- Manually type the correct text
- Copilot will re-learn from what you typed

#### Step 6: Cycle Through Alternatives

After `vehicleType`, when Copilot suggests the next property:

1. Press `Alt+]` to see the **next** alternative suggestion
2. Press `Alt+[` to see the **previous** alternative
3. Pick the one that best matches your CORE requirements

**You might see these alternatives**:
```typescript
// Alternative 1:
showTraffic?: boolean;

// Alternative 2:
mapStyle?: string;

// Alternative 3:
onMarkerClick?: (stopId: string) => void;
```

Accept `showTraffic?: boolean;` (matches your CORE requirements).

#### Step 7: Complete the Interface

Your final interface should look like:

```typescript
interface MapComponentProps {
  vehicleType?: 'car' | 'suv' | 'rv' | 'truck' | 'ev';
  showTraffic?: boolean;
  className?: string;
}
```

#### Step 8: Update the Component Signature

Replace the existing component declaration. Type:

```typescript
const MapComponent: React.FC<MapComponentProps> = ({
  vehicleType = 'car',
  showTraffic = false,
  className = '',
}) => {
```

Copilot should suggest default values in the destructuring. Review each one:
- ✅ `vehicleType = 'car'` — sensible default
- ✅ `showTraffic = false` — safe default  
- ✅ `className = ''` — empty string is correct for optional Tailwind

---

### Exercise 2B: Use the New Prop in Component Logic

#### Step 1: Add Map Style Logic

Below the existing `const initialViewState = { ... }` block (around line 44), type this comment:

```typescript
// Determine map style based on vehicle type
// RVs and trucks need outdoor/terrain maps, cars use street view
```

#### Step 2: Iteratively Accept the Logic

Copilot should suggest something like:

```typescript
const mapStyleUrl = vehicleType === 'rv' || vehicleType === 'truck'
  ? 'mapbox://styles/mapbox/outdoors-v12'
  : 'mapbox://styles/mapbox/streets-v12';
```

**Iterative Review**:
- ✅ `outdoors-v12` for RVs/trucks — shows terrain, elevation (useful!)
- ✅ `streets-v12` for cars — standard navigation view
- ⚠️ What about `ev`? An EV might want to see charging stations. For now, accept and note for future improvement.

Press `Tab` to accept.

#### Step 3: Use `mapStyleUrl` in the JSX

Find the existing `<Map>` component and update `mapStyle`:

```tsx
<Map
  ref={mapRef}
  initialViewState={initialViewState}
  style={{ width: '100%', height: '100%' }}
  mapStyle={mapStyleUrl}  // Changed from hardcoded string
  mapboxAccessToken={MAPBOX_TOKEN}
  projection="mercator"
>
```

---

### Exercise 2C: Practice Rejecting Bad Suggestions

#### Step 1: Type a Vague Comment

Below the map style logic, type:

```typescript
// add some map stuff
```

#### Step 2: Observe the Poor Suggestion

Copilot might suggest something unhelpful:

```typescript
// ❌ Possible bad suggestion:
const mapStuff = {
  center: [0, 0],
  zoom: 5
};
```

This is vague because the **comment was vague**. Press `Esc` to dismiss.

#### Step 3: Replace with a CORE Comment

Delete the vague comment and type:

```typescript
// Context: MapComponent with showTraffic prop.
// Objective: Add a traffic layer to the map when showTraffic is true.
// Requirements: Use Mapbox traffic-v1 tileset, line layer, match Tailwind blue-500 color.
// Examples: Follow the routeLayerStyle pattern defined above.
```

#### Step 4: Observe the Better Suggestion

```typescript
const trafficLayerStyle = {
  id: 'traffic',
  type: 'line',
  source: 'mapbox-traffic',
  'source-layer': 'traffic',
  paint: {
    'line-color': '#3b82f6',
    'line-width': 2,
    'line-opacity': 0.6,
  },
};
```

Much better! The CORE prompt guided Copilot to the exact pattern.

---

### Exercise 2D: Study Real useEffect Patterns (Reference)

This exercise uses the **actual auto-fit bounds code** from [MapComponent.tsx](frontend/src/components/MapComponent.tsx#L14-L37) as a reference pattern.

#### Step 1: Observe the Real Pattern

Open [MapComponent.tsx](frontend/src/components/MapComponent.tsx) and find lines 14-37:

```typescript
// Auto-fit bounds when stops or route change
useEffect(() => {
  if (!mapRef.current) return;

  const bounds = new mapboxgl.LngLatBounds();
  let hasPoints = false;

  // If we have a route, fit to the route
  if (routeGeoJSON && routeGeoJSON.coordinates) {
    routeGeoJSON.coordinates.forEach((coord: [number, number]) => {
      bounds.extend(coord);
      hasPoints = true;
    });
  } 
  // Otherwise fit to stops
  else if (stops.length > 0) {
    stops.forEach(stop => {
      bounds.extend(stop.coordinates);
      hasPoints = true;
    });
  }

  if (hasPoints) {
    mapRef.current.fitBounds(bounds, {
      padding: 50,
      duration: 1000
    });
  }
}, [stops, routeGeoJSON]);
```

**Patterns to notice**:
- ✅ Early return guard: `if (!mapRef.current) return;`
- ✅ Dependency array: `[stops, routeGeoJSON]` — effect re-runs when state changes
- ✅ Conditional logic: route takes priority over individual stops
- ✅ Type annotation: `coord: [number, number]` for GeoJSON coordinates

#### Step 2: Ask Copilot to Explain

Open Copilot Chat (`Cmd+Shift+I` / `Ctrl+Shift+I`) and ask:

```
#file:MapComponent.tsx Explain the useEffect dependency array on line 37. 
Why does it include both stops and routeGeoJSON?
```

**Expected explanation**: The effect needs to re-run whenever the map bounds should change — either when stops are added/removed OR when a route is calculated.

#### Step 3: Identify Potential Improvements

With the code selected, ask:

```
What would happen if mapRef.current is null during the first render?
How does the early return handle this?
```

> **Teaching Point**: This is how you use Copilot Chat to **understand existing code** — not just generate new code. Understanding patterns in your codebase makes your CORE prompts more effective.

---

### Teaching Points


1. **`Tab` = accept all, `Cmd+→` = accept word-by-word, `Esc` = reject**. These three shortcuts are the core of iterative acceptance.
2. **`Alt+]` / `Alt+[`** cycles alternatives — the first suggestion isn't always the best.
3. **Vague comments = vague suggestions**. CORE prompts produce dramatically better results.
4. **Reject freely**. Pressing `Esc` costs nothing. A wrong acceptance costs debugging time.

### Verification

```bash
cd frontend
npx tsc --noEmit    # Should pass — new props are optional with defaults
```

---

## Demo 3: Be Mindful of Security and Privacy (10 min)

### Copilot Capability

> *"Review Copilot's suggestions carefully. Consider not just the functionality and security of the suggested code, but also the readability and maintainability of the code moving forward."*  
> — [GitHub Copilot Best Practices](https://docs.github.com/en/copilot/get-started/best-practices#check-copilots-work)

Copilot can suggest code that **works but is insecure**. In React apps, the most common security issues are: exposed API keys, unsafe `innerHTML`, missing input sanitization, and direct API calls from the frontend.

### Scenario

We'll examine how Copilot might suggest insecure patterns and how to catch them.

### Before You Begin

```bash
code frontend/src/views/ExploreView.tsx
code frontend/src/utils/axios.ts
```

---

### Exercise 3A: Spot the API Key Exposure

> **Optional**: Copy the pre-built security audit exercise to practice finding all 3 issues in one file:
> ```bash
> cp docs/workshops/web-dev/setup/demo-templates/demo-03-security-audit.tsx frontend/src/components/
> ```
> Open `frontend/src/components/demo-03-security-audit.tsx`, then use Copilot Chat with `/fix` on each issue.
> Delete the file when done: `rm frontend/src/components/demo-03-security-audit.tsx`

#### Step 1: Create a Test File

```bash
touch frontend/src/utils/test-security.ts
code frontend/src/utils/test-security.ts
```

#### Step 2: Write a Comment That Invites Insecure Code

```typescript
// Fetch directions from Mapbox API
```

#### Step 3: Watch What Copilot Suggests

Copilot might suggest:

```typescript
// ❌ INSECURE — Copilot might suggest this:
const MAPBOX_TOKEN = 'sk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbGFiY2QifQ.secret123';

export async function getDirections(coordinates: [number, number][]) {
  const coordString = coordinates.map(c => c.join(',')).join(';');
  const response = await fetch(
    `https://api.mapbox.com/directions/v5/mapbox/driving/${coordString}?access_token=${MAPBOX_TOKEN}`
  );
  return response.json();
}
```

**Security problems**:
1. 🔴 **Secret token hardcoded** — will be in the JavaScript bundle, visible in DevTools
2. 🔴 **Direct API call from frontend** — bypasses your backend proxy
3. 🔴 **No error handling** — `response.json()` can throw

#### Step 4: Write the CORE Prompt for the Secure Pattern

Delete everything and write:

```typescript
// Context: Road Trip Planner frontend. API calls go through our backend proxy
//   at VITE_API_URL to keep tokens server-side. Uses axiosInstance from utils/axios.ts.
// Objective: Create a function to fetch directions via our backend API proxy.
// Requirements:
//   - Call POST /api/directions on our backend (NOT Mapbox directly)
//   - Use axiosInstance (has auth token interceptor)
//   - Handle errors with try/catch
//   - Never include any API keys or tokens in this file
// Examples: Follow ExploreView.tsx fetchFeaturedTrips pattern — axios.get with VITE_API_URL.
```

#### Step 5: Observe the Secure Suggestion

```typescript
import axiosInstance from './axios';

export async function getDirections(coordinates: [number, number][]) {
  try {
    const response = await axiosInstance.post('/api/directions', {
      coordinates,
    });
    return response.data;
  } catch (error) {
    console.error('Failed to fetch directions:', error);
    throw error;
  }
}
```

**Security review**:
- ✅ Uses backend proxy — no direct Mapbox call
- ✅ Uses `axiosInstance` — handles auth tokens automatically
- ✅ No API keys in the file
- ✅ Error handling with try/catch

#### Step 6: Delete the Test File

```bash
rm frontend/src/utils/test-security.ts
```

---

### Exercise 3B: Spot the XSS Vulnerability

#### Step 1: In any open file, type this comment:

```typescript
// Render trip description from user input
```

Copilot might suggest:

```typescript
// ❌ DANGEROUS — XSS vulnerability:
<div dangerouslySetInnerHTML={{ __html: trip.description }} />
```

**Why this is dangerous**: If `trip.description` contains `<script>alert('hacked')</script>`, it will execute. This is a **Cross-Site Scripting (XSS)** attack.

#### Step 2: The Safe Alternative

```typescript
// ✅ SAFE — React auto-escapes text content:
<p className="text-sm text-gray-500">{trip.description}</p>
```

React automatically escapes strings rendered in JSX. Only `dangerouslySetInnerHTML` bypasses this protection.

---

### Security Checklist for Copilot Suggestions

Always check Copilot's React suggestions against this list:

| Check | What to Look For | Fix |
|-------|-------------------|-----|
| API Keys | Hardcoded tokens, `sk.xxx` strings | Use `import.meta.env.VITE_*` or backend proxy |
| Direct API Calls | `fetch('https://api.mapbox.com/...')` | Route through backend at `/api/...` |
| XSS | `dangerouslySetInnerHTML` | Use JSX text `{variable}` instead |
| Token Storage | `localStorage.setItem('secret', ...)` | Use httpOnly cookies or backend sessions |
| Logging | `console.log(password)` or `console.log(token)` | Never log sensitive data |

---

### Real Example: Secure Token Cleanup in AuthStatus.tsx

See [AuthStatus.tsx](frontend/src/components/AuthStatus.tsx#L47-L65) for the logout pattern:

```typescript
const handleLogout = async () => {
  try {
    await axiosInstance.post('/api/auth/logout');  // ✅ Notify backend
    localStorage.removeItem('token');               // ✅ Clear local tokens
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_email');
    setUser(null);
  } catch (error) {
    // ✅ Still clear tokens even if server fails
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_email');
    setUser(null);
  }
};
```

**Security patterns to notice**:
- ✅ Backend logout endpoint invalidates server-side session
- ✅ Always clears local storage, even on error (defense in depth)
- ✅ Uses `axiosInstance` which handles auth headers automatically

---

### Teaching Points

1. **Copilot has no security context**. It generates code that works — not code that's safe. You must verify.
2. **The backend proxy pattern** is critical: frontend → your API → external API. Tokens stay server-side.
3. **React's built-in XSS protection** works automatically — unless you use `dangerouslySetInnerHTML`.
4. **CORE prompts prevent most issues**: By specifying "use axiosInstance" and "never include API keys", you steer Copilot away from insecure patterns.

---

## Optional Extension A: Customize Copilot for Your Needs (Self-Study)

> **Note**: This section has been moved to optional self-study to fit the 90-minute workshop. Complete it after the workshop for deeper customization skills.

### Copilot Capability

> *"Follow good coding practices... Use a consistent code style and patterns, use descriptive names for variables and functions, comment your code, structure your code into modular, scoped components."*  
> — [Prompt Engineering for GitHub Copilot](https://docs.github.com/en/copilot/concepts/prompting/prompt-engineering#follow-good-coding-practices)

You can customize Copilot's behavior at the **project level** using instruction files, and at the **settings level** using VS Code configuration.

### Scenario

We'll create a project instruction file that teaches Copilot our React + TypeScript conventions, then show how VS Code settings fine-tune behavior.

### Before You Begin

```bash
# Check if instruction file already exists
ls -la .github/copilot-instructions.md
```

---

### Exercise A1: Create a Project Instruction File

#### Step 1: Create the File

```bash
mkdir -p .github
touch .github/copilot-instructions.md
code .github/copilot-instructions.md
```

#### Step 2: Write Project-Specific Rules

```markdown
# Road Trip Planner — Copilot Instructions

## Tech Stack
- Frontend: React 18.x + TypeScript + Vite
- Styling: Tailwind CSS (no CSS-in-JS, no styled-components)
- State: Zustand (no Redux, no Context API for global state)
- Maps: react-map-gl + Mapbox GL JS
- HTTP: axios with custom axiosInstance (see utils/axios.ts)
- Icons: Lucide React (no FontAwesome, no Material Icons)
- Routing: React Router v6

## TypeScript Rules
- NEVER use `any` type — use `unknown` and narrow with type guards
- Use union types for categories: `'car' | 'suv' | 'rv' | 'truck' | 'ev'`
- All coordinates are [longitude, latitude] (GeoJSON standard, NOT [lat, lng])
- Export interfaces as named exports (not default)
- Use `React.FC<Props>` for component typing

## React Patterns
- Functional components only (no class components)
- Props interfaces above the component, named `ComponentNameProps`
- Destructure props with defaults in the function signature
- Use custom hooks in `src/hooks/` for shared logic
- Keep components under 200 lines — extract sub-components

## Styling Rules
- Use Tailwind utility classes exclusively
- No inline styles (style={{ }}) except for dynamic map dimensions
- Follow existing color scheme: blue-500 primary, gray-900 text, green-500 success, red-500 error

## API Patterns
- NEVER call external APIs (Mapbox, Google) directly from frontend
- All API calls go through backend proxy at VITE_API_URL
- Use axiosInstance from utils/axios.ts (has auth interceptor)
- Handle errors with try/catch and toast notifications

## File Organization
- Types: `src/types/` — one file per domain (Stop.ts, Vehicle.ts, Trip.ts)
- Components: `src/components/` — reusable UI components
- Views: `src/views/` — full page views (routed components)
- Hooks: `src/hooks/` — custom React hooks
- Utils: `src/utils/` — helper functions, axios config
- Store: `src/store/` — Zustand stores
```

#### Step 3: How It Works

Once saved, Copilot automatically reads `.github/copilot-instructions.md` and applies these rules to **every suggestion** in the project. You don't need to reference it — it's always active.

**Test it**: In any React file, type:

```typescript
// Create a styled button component
```

With the instruction file active, Copilot should suggest Tailwind classes (not CSS-in-JS):

```typescript
// ✅ WITH instruction file:
const StyledButton: React.FC<{ label: string }> = ({ label }) => (
  <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
    {label}
  </button>
);

// ❌ WITHOUT instruction file (Copilot might suggest):
import styled from 'styled-components';
const StyledButton = styled.button`
  padding: 8px 16px;
  background: blue;
`;
```

---

### Exercise A2: VS Code Settings for Copilot

#### Step 1: Open VS Code Settings

Press `Cmd+,` (Mac) / `Ctrl+,` (Windows). Search for "copilot".

#### Step 2: Key Settings to Configure

```json
// .vscode/settings.json
{
  // Enable Copilot for our tech stack
  "github.copilot.enable": {
    "typescript": true,
    "typescriptreact": true,
    "javascript": true,
    "markdown": true,
    "json": true
  },

  // Disable for files that shouldn't have AI suggestions
  "github.copilot.enable": {
    "plaintext": false,  // Prevents suggesting in .env files
    "yaml": true
  }
}
```

#### Step 3: Workspace-Level Settings (Already Configured)

The project may already have a `.vscode/settings.json` that configures TypeScript strict mode, Tailwind IntelliSense, and other tools. Copilot respects these settings when generating code.

---

### Teaching Points

1. **Instruction files are the highest-impact customization**. Write them once, and every developer on the team gets consistent Copilot behavior.
2. **Be specific in instruction files** — "Tailwind CSS" is better than "CSS framework", "Zustand" is better than "state management".
3. **VS Code settings** fine-tune when Copilot activates (by language) and how it behaves.
4. **Instruction files stack**: Project-level (`.github/`), workspace-level, and org-level instructions all contribute.

---

## Demo 4: Leverage Copilot Chat for Debugging and Exploration (20 min)

### Copilot Capability

> *"Copilot Chat is best suited for: answering questions about code in natural language, generating large sections of code then iterating, accomplishing specific tasks with keywords and skills."*  
> — [GitHub Copilot Best Practices](https://docs.github.com/en/copilot/get-started/best-practices#choose-the-right-copilot-tool-for-the-job)

Copilot Chat (`Cmd+I`) is different from inline suggestions. Use it for debugging, understanding unfamiliar code, and generating multi-file changes.

### Scenario

We'll debug a coordinate bug in `MapComponent.tsx` and explore unfamiliar Zustand store code using Chat.

### Before You Begin

```bash
# Step 1: Copy the debug demo template into the project
cp docs/workshops/web-dev/setup/demo-templates/demo-05-debug-coordinates.tsx frontend/src/components/

# Step 2: Open the buggy file and the real MapComponent for reference
code frontend/src/components/demo-05-debug-coordinates.tsx
code frontend/src/components/MapComponent.tsx
code frontend/src/store/useTripStore.ts
```

---

### Exercise 4A: Debug a Coordinate Bug with Chat

#### Step 1: Understand the Bug

Open `frontend/src/components/demo-05-debug-coordinates.tsx`. This component has markers for San Francisco, Los Angeles, and Las Vegas — but they appear in the middle of the ocean. The `⚠️ Coordinate order looks wrong!` detector at the bottom confirms the issue.

The bug is in coordinate order: `[lat, lng]` instead of `[lng, lat]`.

Buggy data (from the demo file):

```typescript
// BUG: These use [latitude, longitude] — WRONG for Mapbox
const testStops = [
  { name: 'San Francisco', coordinates: [37.7749, -122.4194] },   // [lat, lng] ❌
  { name: 'Los Angeles', coordinates: [34.0522, -118.2437] },     // [lat, lng] ❌
  { name: 'Las Vegas', coordinates: [36.1699, -115.1398] },       // [lat, lng] ❌
];
```

#### Step 2: Open Copilot Chat

Press `Cmd+I` (Mac) / `Ctrl+I` (Windows) to open inline chat, or click the Copilot Chat icon in the sidebar.

#### Step 3: Write a CORE-Framework Chat Prompt

Type this in the Chat input:

```
Context: I'm working on MapComponent.tsx in a Road Trip Planner React app that uses
react-map-gl (Mapbox). The component renders Marker components with longitude and
latitude props.

Objective: Debug why markers for San Francisco (37.7749, -122.4194) and
Los Angeles (34.0522, -118.2437) are showing in the middle of the ocean.

Requirements: Explain the root cause, show the fix, and suggest a TypeScript type
to prevent this in the future.

Examples: The Marker component in our code uses stop.coordinates[0] for longitude
and stop.coordinates[1] for latitude.
```

#### Step 4: Read Copilot's Response

Copilot Chat should explain:

> **Root Cause**: The coordinates are in `[latitude, longitude]` order, but Mapbox
> (and the GeoJSON specification) requires `[longitude, latitude]`. When
> `coordinates[0]` (37.7749, a latitude) is passed as `longitude`, the marker
> renders at longitude 37.77° — which is in the Mediterranean Sea.
>
> **Fix**: Reverse the coordinate order in the data:
> ```typescript
> const testStops = [
>   { name: 'San Francisco', coordinates: [-122.4194, 37.7749] },  // [lng, lat] ✅
>   { name: 'Los Angeles', coordinates: [-118.2437, 34.0522] },    // [lng, lat] ✅
> ];
> ```
>
> **Prevention**: Create a labeled tuple type:
> ```typescript
> export type GeoJSONCoordinate = [longitude: number, latitude: number];
> ```

#### Step 5: Apply the Chat Suggestion

If Chat offers an "Apply" or "Insert at Cursor" button, use it. Otherwise, manually update the coordinates in `demo-05-debug-coordinates.tsx`.

#### Step 6: Clean Up

After completing the exercise, delete the demo file:

```bash
rm frontend/src/components/demo-05-debug-coordinates.tsx
```

---

### Exercise 4B: Explore Unfamiliar Code with Chat

#### Step 1: Select Code in useTripStore.ts

Open `frontend/src/store/useTripStore.ts`. Select the `reorderStops` function (lines ~92-98):

```typescript
reorderStops: (startIndex, endIndex) =>
  set((state) => {
    const newStops = Array.from(state.stops);
    const [removed] = newStops.splice(startIndex, 1);
    newStops.splice(endIndex, 0, removed);
    return { stops: newStops };
  }),
```

#### Step 2: Ask Chat to Explain

With the code selected, press `Cmd+I` and type:

```
Explain this Zustand store action step by step. I'm new to Zustand and
don't understand the set() callback pattern or why splice is called twice.
```

#### Step 3: Read the Explanation

Copilot Chat should explain:
- `set()` is Zustand's way of updating state (similar to React's `setState`)
- The callback receives the current state
- `Array.from()` creates a copy (immutability)
- First `splice(startIndex, 1)` removes the item
- Second `splice(endIndex, 0, removed)` inserts it at the new position
- `return { stops: newStops }` merges the new stops into state

#### Step 4: Ask a Follow-Up

```
Can you show me how to add a unit test for reorderStops that moves
the second stop to the first position?
```

Copilot Chat should generate a test:

```typescript
import { useTripStore } from './useTripStore';

describe('useTripStore', () => {
  beforeEach(() => {
    useTripStore.setState({
      stops: [
        { id: '1', name: 'San Francisco', coordinates: [-122.4194, 37.7749], type: 'start' },
        { id: '2', name: 'Los Angeles', coordinates: [-118.2437, 34.0522], type: 'stop' },
        { id: '3', name: 'Las Vegas', coordinates: [-115.1398, 36.1699], type: 'end' },
      ],
    });
  });

  it('should reorder stops by moving second to first position', () => {
    useTripStore.getState().reorderStops(1, 0);
    const stops = useTripStore.getState().stops;
    expect(stops[0].name).toBe('Los Angeles');
    expect(stops[1].name).toBe('San Francisco');
    expect(stops[2].name).toBe('Las Vegas');
  });
});
```

---

### Exercise 4C: Use Chat Keywords for Focused Help

Copilot Chat supports special keywords that change its behavior:

| Keyword | Purpose | Example |
|---------|---------|---------|
| `@workspace` | Search across entire project | `@workspace Where is the Mapbox token configured?` |
| `/explain` | Explain selected code | Select code → `/explain` |
| `/fix` | Fix an error or bug | Select broken code → `/fix` |
| `/tests` | Generate test(s) | Select function → `/tests` |
| `#file` | Reference a specific file | `#file:useTripStore.ts How does saveTrip work?` |
| `#selection` | Reference selected code | `#selection What does this reducer do?` |

#### Try It

1. Type `@workspace What components use the useTripStore?` — Copilot searches your whole project
2. Select the `useEffect` in `MapComponent.tsx` → Type `/explain` — Copilot explains auto-fit bounds
3. Type `#file:types/Stop.ts Add a 'notes' optional string field` — Copilot references the specific file

---

### Teaching Points

1. **Chat = debugging, exploration, explanations**. Inline = code completion. Use the right tool for the job.
2. **CORE works in Chat too**. Structure your Chat prompts with Context, Objective, Requirements, Examples.
3. **Follow-up questions** deepen the conversation. Don't stop at the first response.
4. **Keywords** (`@workspace`, `/fix`, `#file`) give Chat laser-focused context.

---

### Optional: MCP Servers for External Documentation

> **Note**: This is an advanced topic. Skip if time is limited.

Model Context Protocol (MCP) servers like Context7 provide **real-time documentation access** beyond Copilot's training data cutoff.

**Example**: Get current react-map-gl documentation:
```
Using @context7, how do I add a popup to a Marker in react-map-gl v7?
```

**Why use MCP?**
- Libraries update frequently — Copilot's training data may be outdated
- MCP fetches live documentation, not cached knowledge
- Particularly useful for Zustand, react-map-gl, and rapidly evolving libraries

**Setup**: MCP servers require VS Code configuration. See the [demo-07-workspace-discovery.ts](../web-dev/setup/demo-templates/demo-07-workspace-discovery.ts) template for usage patterns.

---

## Demo 5: Understand Copilot's Limitations (15 min)

### Copilot Capability

> *"Copilot is not designed to: respond to prompts unrelated to coding and technology. Replace your expertise and skills. Remember that you are in charge, and Copilot is a powerful tool at your service."*  
> — [GitHub Copilot Best Practices](https://docs.github.com/en/copilot/get-started/best-practices#understand-copilots-strengths-and-weaknesses)

Understanding what Copilot **cannot** do is just as important as knowing what it can.

### Limitation 1: Outdated API Knowledge

Copilot's training data has a cutoff. It may suggest deprecated APIs.

#### Example: Mapbox API Version

```typescript
// Type this comment:
// Fetch directions from Mapbox

// ❌ Copilot MIGHT suggest (outdated):
const url = `https://api.mapbox.com/v4/directions/${coords}.json?access_token=${token}`;
// v4 is deprecated! Current version is v5.

// ✅ Correct:
const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coords}?access_token=${token}`;
```

**Mitigation**: Use Copilot Chat with `@context7` or reference documentation:
```
@context7 What is the current version of the Mapbox Directions API?
```

---

### Limitation 2: Cannot Understand Your Business Requirements

Copilot knows code patterns but not **why** your app exists.

#### Example: Trip Validation Logic

```typescript
// Type:
// Validate a trip before saving

// Copilot might suggest:
function validateTrip(trip: Trip): boolean {
  return trip.name.length > 0 && trip.stops.length > 0;
}
```

This is **syntactically correct** but **business-wrong**. Your real rules might be:
- Minimum 2 stops (start + end)
- Maximum 25 stops (API limit)
- No duplicate coordinates
- Each stop needs a name (not just `""`

**Mitigation**: Always encode business rules in your CORE prompt:
```typescript
// Context: Trip validation in Road Trip Planner.
// Objective: Validate trip before saving to backend.
// Requirements:
//   - Minimum 2 stops (start + end), maximum 25
//   - No duplicate coordinates (within 0.001 degree tolerance)
//   - Each stop must have a non-empty name
//   - Trip name required, max 100 characters
// Examples: Follow the Trip interface in types/Trip.ts.
```

---

### Limitation 3: May Generate Plausible But Wrong Code

Copilot can produce code that **looks right** but has subtle bugs.

#### Example: Distance Calculation

```typescript
// Copilot might suggest (WRONG formula):
function getDistance(coord1: [number, number], coord2: [number, number]): number {
  const dx = coord1[0] - coord2[0];
  const dy = coord1[1] - coord2[1];
  return Math.sqrt(dx * dx + dy * dy);  // ❌ Euclidean distance on a sphere!
}
```

This uses **Euclidean distance** — fine for flat surfaces, **wrong for Earth's curved surface**. It becomes increasingly inaccurate over long distances.

The correct approach uses the **Haversine formula** or a library like `@turf/turf`:

```typescript
import * as turf from '@turf/turf';

function getDistance(coord1: [number, number], coord2: [number, number]): number {
  return turf.distance(turf.point(coord1), turf.point(coord2), { units: 'miles' });
}
```

**Mitigation**: Always run tests. If Copilot generates logic, write a test case with known values:
```typescript
// San Francisco to Los Angeles ≈ 347 miles
expect(getDistance([-122.42, 37.77], [-118.24, 34.05])).toBeCloseTo(347, -1);
```

---

### Limitation 4: Context Window Limits

Copilot can only process a limited amount of context. In very large files or projects:
- It may miss patterns from files not currently open
- Long files may get truncated in its context window
- Very old code in a file may be deprioritized

**Mitigation**:
- Keep files under 200 lines (matches our instruction file rule)
- Open related files in tabs
- Use `#file` references in Chat to explicitly include context

---

### Limitation 5: State Management Library Confusion (React-Specific)

Copilot may suggest the wrong state management library based on its training data frequency.

#### Example: This Project Uses Zustand, Not Redux

```typescript
// You type:
// Add a toggle for showing rest stops on the map

// Copilot might suggest (WRONG library):
import { useDispatch, useSelector } from 'react-redux';

export function useRestStops() {
  const dispatch = useDispatch();
  const showRestStops = useSelector((state) => state.map.showRestStops);
  return { showRestStops, toggle: () => dispatch(toggleRestStops()) };
}
```

This is **syntactically valid Redux** — but this project uses **Zustand**. The correct pattern:

```typescript
// ✅ CORRECT - follows project's Zustand pattern (see useTripStore.ts)
import { create } from 'zustand';

interface MapSettingsState {
  showRestStops: boolean;
  toggleRestStops: () => void;
}

export const useMapSettings = create<MapSettingsState>((set) => ({
  showRestStops: false,
  toggleRestStops: () => set((state) => ({ showRestStops: !state.showRestStops })),
}));
```

**Mitigation**: 
- Include `#file:useTripStore.ts` in Chat to show Copilot your Zustand pattern
- Add to your CORE prompt: "State Management: Zustand (NOT Redux, MobX, or Context API)"
- Reference `copilot-instructions.md` which already specifies Zustand-only

---

### Limitation 6: Map Library Confusion (React-Specific)

Copilot may suggest Leaflet or Google Maps when your project uses React Map GL (Mapbox).

#### Example: Adding a Map Marker

```typescript
// You type:
// Add a marker for each stop

// Copilot might suggest (WRONG library):
import { Marker } from 'react-leaflet';

function StopMarkers({ stops }) {
  return stops.map(stop => (
    <Marker key={stop.id} position={[stop.lat, stop.lng]} />
  ));
}
```

This uses **react-leaflet** — but this project uses **react-map-gl** (Mapbox). The correct pattern:

```typescript
// ✅ CORRECT - uses react-map-gl Marker (this project's library)
import { Marker } from 'react-map-gl';

function StopMarkers({ stops }: { stops: Stop[] }) {
  return (
    <>
      {stops.map(stop => (
        <Marker 
          key={stop.id} 
          longitude={stop.coordinates[0]} 
          latitude={stop.coordinates[1]}
        >
          <div className="stop-marker">{stop.name}</div>
        </Marker>
      ))}
    </>
  );
}
```

**Key Differences**:
- react-leaflet: `position={[lat, lng]}` (array)
- react-map-gl: `longitude={...} latitude={...}` (separate props, lng first!)

**Mitigation**:
- Include `#file:MapComponent.tsx` when working on map features
- Add to CORE prompt: "Map Library: react-map-gl (Mapbox GL JS wrapper) — NOT Leaflet, Google Maps, or OpenLayers"
- Coordinates are always `[longitude, latitude]` (GeoJSON format, NOT `[lat, lng]`)

---

### Limitations Summary

| Limitation | Risk | Mitigation |
|-----------|------|------------|
| Outdated APIs | Deprecated/broken calls | Use `@context7`, check docs |
| No business knowledge | Missing validation rules | Encode rules in CORE prompts |
| Plausible but wrong | Subtle bugs (math, logic) | Write tests with known values |
| Context window limits | Misses remote patterns | Keep files small, open related tabs |
| State library confusion | Redux instead of Zustand | Include `#file:useTripStore.ts`, CORE prompt |
| Map library confusion | Leaflet instead of react-map-gl | Include `#file:MapComponent.tsx`, CORE prompt |
| No runtime awareness | Can't test its own code | Run `cd frontend && npx tsc --noEmit && npm test` |
| Security blind spots | Keys, XSS, auth issues | Manual security review |

---

### Teaching Points

1. **Always verify Copilot's output**. Type-check (`cd frontend && npx tsc --noEmit`), test (`npm test`), and review manually.
2. **Encode domain knowledge in prompts**. Copilot doesn't know your business rules — tell it.
3. **Test with known values**. If Copilot generates a calculation, test with values you can verify.
4. **Include stack context**. State management (Zustand), map library (react-map-gl), styling (Tailwind) — tell Copilot your stack.
5. **You are the expert**. Copilot accelerates — it doesn't replace your judgment.

---

## Workshop Wrap-Up

### What You Learned

| # | Capability | Key Technique |
|---|-----------|---------------|
| 1 | Copilot's Role | Pilot (you) + Co-pilot (AI). You decide, it accelerates. |
| 2 | Clear Context | CORE framework: Context, Objective, Requirements, Examples |
| 3 | Iterative Acceptance | `Tab` (all), `Cmd+→` (word), `Alt+]` (alternatives), `Esc` (reject) |
| 4 | Security Awareness | Review for API keys, XSS, direct API calls. Use backend proxy. |
| 5 | Chat for Debugging | `Cmd+Shift+I` for Ask, `Cmd+I` for Edit, `@workspace`/`#file` for context |
| 6 | Limitations | Outdated APIs, no business knowledge, plausible but wrong code |

> **Bonus**: Complete **Optional Extension A** (Customization) for instruction files and VS Code settings.

### CORE Framework Quick Reference

```
C - Context:      Where am I? What's the component, library, file?
O - Objective:    What do I want? Create, debug, refactor, explain, test?
R - Requirements: What are the constraints? Types, patterns, accessibility?
E - Examples:     What existing pattern should it follow?
```

### Next Steps

- **Practice**: Apply CORE prompts to any React task this week
- **Experiment**: Try `@workspace`, `/fix`, and `#file` in Copilot Chat daily
- **Workshop 2**: Intermediate React Development — custom hooks, advanced Zustand patterns, and Copilot agents

### Resources

- [GitHub Copilot Best Practices](https://docs.github.com/en/copilot/get-started/best-practices)
- [Prompt Engineering for GitHub Copilot](https://docs.github.com/en/copilot/concepts/prompting/prompt-engineering)
- [GitHub Copilot Chat Cheat Sheet](https://docs.github.com/en/copilot/using-github-copilot/github-copilot-chat-cheat-sheet)
- [Asking GitHub Copilot Questions in Your IDE](https://docs.github.com/en/copilot/using-github-copilot/asking-github-copilot-questions-in-your-ide)
- Project reference: `docs/workshops/web-dev/00-key-definitions-best-practices.md`
