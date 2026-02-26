# Meeting Agenda

Date: 12/08/2025 to 12/11/2025
The following will be our agenda for Tuesday and Thursday

## Topics

| Foundational                                      | Intermediate                      | Advance                               |  Expert |
| :----------------                                 | :------                           | ----                                  | :---- |
| Copilot's Role                                    | Inline Code Suggestions           | Chain-of-Thought Prompting            |    Copilot Extensions (have evolved into MCP servers) |
| Provide Clear Context for Better Suggestions      | Prompting                         | Instruction File                      |    MCP Servers     |
| Use Iterative Acceptance of Suggestions           | Code Explanations                 | Prompt Files                          |     Enterprise Policy Management    |
| Be Mindful of Security and Privacy                | Comment-Based Generation          | Copilot Code Review                   |     Model Selection & Cost Optimization    |
| Customize Copilot for Your Needs                  | Code Refactoring                  | Copilot Plan Mode                     | GitHub Copilot Certification |
| Copilot's Chat for Debugging and Exploration      | Copilot Chat                      | Copilot Coding Agent                  | Copilot Spec Kit |
| Understand Limitations                            | Few-Shot Prompting                | Copilot Agent HQ                      | Copilot Metrics  |
|                                                   | Unit Testing & Debugging          | Architecture & Tech Stack Generation  ||
|                                                   | CoPilot CLI                       |                                       ||

---

## Key Definitions

## What is GitHub Copilot?

**GitHub Copilot** is an AI-powered coding assistant developed by GitHub. It uses large language models (LLMs) trained on billions of lines of public code to provide:

- **Inline code completions** as you type
- **Chat-based assistance** for explanations, debugging, and code generation
- **Code review capabilities** for pull requests
- **Agent-based automation** for complex, multi-file tasks

Copilot integrates into IDEs (VS Code, JetBrains, Neovim) and understands context from your open files, project structure, and comments to generate relevant suggestions.

## What is an MCP Server?

**MCP (Model Context Protocol) Server** is an open standard that enables AI assistants to securely connect to external data sources and tools. MCP Servers:

- Provide **real-time context** from databases, APIs, file systems, and internal tools
- Allow Copilot to **ground responses in authoritative data** rather than just training data
- Enable **read/write operations** with proper access controls
- Replace the older "Copilot Extensions" architecture with a standardized protocol

Example: An MCP Server can connect Copilot to your Azure resources, allowing it to query actual deployment status or fetch live configuration data.

## What are Custom Agents?

**Custom Agents** are specialized AI assistants configured to perform specific tasks within your codebase. They:

- Are defined via markdown files (`.agent.md`) with system prompts and instructions
- Can be scoped to specific directories, file types, or domains
- Execute multi-step workflows autonomously (with human approval gates)
- Inherit project context from instruction files and codebase analysis

Example: A `@tdd-agent` that enforces test-driven development by writing failing tests first, then implementing code to pass them.

## What are Prompt Files?

**Prompt Files** (`.prompt.md`) are reusable, version-controlled prompts stored in your repository. They:

- Standardize common tasks across team members
- Can include variables (`{{variable}}`) for dynamic content
- Are invoked directly in Copilot Chat using file references
- Ensure consistency in code generation, reviews, and documentation

Example: `prompts/create-component.prompt.md` that scaffolds a new React Native component with proper TypeScript types and tests.

## What and Why is an Instruction File?

**Instruction Files** (`.github/copilot-instructions.md` or `.copilot/instructions.md`) are project-level configuration files that:

- Define **coding standards, conventions, and architectural patterns** for your project
- Steer Copilot toward **project-specific terminology and technologies**
- Prevent Copilot from suggesting **anti-patterns or incompatible libraries**
- Are automatically loaded as context for all Copilot interactions

**Why use them?** Without instructions, Copilot uses generic best practices. With instructions, it understands YOUR stack (e.g., "use Zustand for state, not Redux" or "all coordinates are [longitude, latitude]").

## What is Chain of Thought Prompting?

**Chain of Thought (CoT)** is a prompting technique that asks the AI to **reason step-by-step** before providing an answer. It:

- Improves accuracy for complex, multi-step problems
- Makes the AI's reasoning visible and verifiable
- Reduces errors by breaking problems into smaller logical steps

**Trigger phrases:** "Think step by step", "Let's break this down", "First... then... finally..."

Example: "Think step by step: how should I refactor this component to support offline mode while maintaining existing functionality?"

## What is Few-Shot Prompting?

**Few-Shot Prompting** provides **2-5 examples** of the desired input/output pattern before asking for a new generation. It:

- Teaches the AI your preferred style, format, or structure
- Reduces ambiguity by showing rather than telling
- Works especially well for consistent code patterns

Example: Show 2 existing TypeScript interfaces, then ask: "Generate a `Trip` interface following this same pattern."

## What is Tree of Thoughts Prompting?

**Tree of Thoughts (ToT)** is an advanced prompting technique where the AI:

- Explores **multiple reasoning paths** in parallel (like branches of a tree)
- Evaluates each path for viability before proceeding
- Backtracks from dead ends and pursues promising alternatives
- Synthesizes the best solution from explored branches

**When to use:** Complex architectural decisions, algorithm design, debugging elusive issues.

Example: "Explore three different approaches to implementing offline sync. For each approach, list pros, cons, and implementation complexity. Then recommend the best option."

## What is Self-Consistency Prompting?

**Self-Consistency Prompting** generates **multiple independent solutions** to the same problem, then selects the most common or highest-confidence answer. It:

- Reduces variance in AI outputs
- Identifies robust solutions that emerge across multiple attempts
- Highlights edge cases when solutions diverge significantly

**When to use:** Critical code paths, security-sensitive implementations, complex calculations.

Example: "Generate three independent implementations of the route distance calculator. Compare them and identify the most reliable approach."

---

## 📋 Recent Project Updates

### Version Management System (December 17, 2024)
✅ **Implemented comprehensive version display across web and mobile**
- **Web**: Version displayed in desktop sidebar with hover tooltip showing build timestamp
- **Mobile**: Full version info shown at bottom of Profile screen  
- **Format**: `v1.0.0 (Built: Dec 16, 2024 8:52 PM EST)`

✅ **Created Semantic Versioning Agent**
- **New prompt file**: `.github/prompts/version-update.prompt.md`
- Enforces strict **SemVer 2.0.0** compliance (MAJOR.MINOR.PATCH)
- Validates change type against description (prevents mismatched version bumps)
- Automatically updates all version files across frontend and mobile
- Creates git commits and tags following semantic versioning conventions
- **Usage**: Reference this prompt in Copilot Chat when updating versions

**Files Updated:**
```
✓ frontend/package.json (version: 1.0.0)
✓ frontend/src/utils/version.ts (NEW)
✓ frontend/src/components/VersionDisplay.tsx (NEW)
✓ frontend/vite.config.ts (build timestamp injection)
✓ mobile/package.json (version: 1.0.0)
✓ mobile/app.json (expo.version: 1.0.0)
✓ mobile/src/constants/version.ts (NEW)
✓ mobile/src/screens/ProfileScreen.tsx (displays version)
```

**Semantic Versioning Quick Reference:**
| Type | Version | Use When |
|------|---------|----------|
| **MAJOR** | X.0.0 | Breaking changes, incompatible API changes |
| **MINOR** | X.Y.0 | New features, backward-compatible additions |
| **PATCH** | X.Y.Z | Bug fixes, backward-compatible corrections |

**Example Workflow:**
```bash
# Using the version update agent via Copilot Chat
1. Reference: @workspace .github/prompts/version-update.prompt.md
2. Specify: MAJOR, MINOR, or PATCH
3. Describe: What changed in this release
4. Confirm: Agent validates and updates all files
5. Result: Git commit + tag created automatically
```

---

## GitHub Copilot Capabilities for Mobile Development (React Native)

This guide organizes GitHub Copilot capabilities across **Foundational**, **Intermediate**, **Advanced**, and **Expert** levels, mapped to React Native mobile development. Each item includes a description and practical examples from the Road Trip Planner app codebase.

---

## Foundational

### Understand Copilot's Role in Your Workflow

**Role & Responsibility:** Mobile developers build cross-platform apps with complex state, navigation, and native integrations. Copilot accelerates routine tasks (component scaffolding, hooks, styles) while you own UX decisions, performance optimization, and platform-specific edge cases.
**Examples:**

- *Prompt (Chat):* "Summarize the navigation structure in `RootNavigator.tsx` and identify which screens require authentication."
- *Inline:* Start a new component and type `// TripCard component displaying trip name, image, and distance` to let Copilot scaffold the component.

**React Native Example from Codebase:**

``` text
Prompt: "Explain the authentication flow in RootNavigator.tsx and how it decides between AuthNavigator and AppNavigator."
```

### Provide Clear Context for Better Suggestions

**Role & Responsibility:** High-quality suggestions depend on your component structure, types, and store patterns. Organize your `/src` with clear directories (`components/`, `screens/`, `store/`, `types/`) to prime Copilot.
**Examples:**

- Open `useTripStore.ts` alongside a screen file, then prompt: "Add a `clearRoute` action that resets routeGeoJSON, routeDistance, and routeDuration to initial values."
- Reference your type files: "Generate a new screen component that uses the `Stop` interface from `types/Stop.ts`."

**React Native Example from Codebase:**
```
Prompt: "Looking at useTripStore.ts, add a new action `updateStopName(id: string, name: string)` that updates the name of a stop by ID."
```

### Use Iterative Acceptance of Suggestions

**Role & Responsibility:** Mobile development is incremental. Accept small blocks, test on device/simulator, and iterate.
**Examples:**

- Accept the `useState` hooks for a form, run on simulator, then request: "Add form validation with error messages for empty fields."
- In `MapComponent.tsx`, accept the `Marker` rendering, test on device, then ask: "Add a callout that shows stop details when marker is tapped."

**React Native Example from Codebase:**
```text
Step 1: Accept the FlatList rendering in TripPlannerScreen.tsx
Step 2: Test scrolling behavior
Step 3: Prompt: "Add pull-to-refresh functionality to the stops FlatList using RefreshControl."
```

### Be Mindful of Security and Privacy

**Role & Responsibility:** Mobile apps handle tokens, location data, and user credentials. Never hardcode secrets.
**Examples:**

- *Prompt:* "Review `api.ts` for security best practices. Ensure tokens are stored securely and not logged."
- Ask Copilot Chat: "What's the recommended way to store auth tokens in React Native - AsyncStorage or SecureStore?"

**React Native Example from Codebase:**
```text
Prompt: "Audit the api.ts interceptor. Is getToken() using secure storage? Suggest improvements for storing JWT tokens on iOS and Android."
```

### Customize Copilot for Your Needs

**Role & Responsibility:** Configure Copilot to favor React Native, TypeScript, and your state management pattern (Zustand).
**Examples:**

- Enable suggestions in `.tsx`, `.ts` files; configure settings to prefer functional components with hooks.
- Add instruction file specifying: "Use Zustand for state, React Navigation for routing, react-native-maps for maps."

**React Native Example from Codebase:**

```text
.github/copilot-instructions.md:
- State Management: Zustand ONLY (see useTripStore.ts pattern)
- Navigation: React Navigation with typed params (AppStackParamList)
- Maps: react-native-maps with PROVIDER_GOOGLE on Android
```

### Leverage Copilot's Chat for Debugging and Exploration

**Role & Responsibility:** Reduce debugging time by analyzing errors, stack traces, and unfamiliar native module behavior.
**Examples:**

- Paste a Metro bundler error and ask: "Explain this error and how to fix it in my React Native project."
- "Walk me through how `MapComponent.tsx` transforms GeoJSON coordinates to react-native-maps format."

**React Native Example from Codebase:**

```text
Prompt: "Explain why the Polyline in MapComponent.tsx maps coordinates as [coord[1], coord[0]]. Is this correct for GeoJSON?"
```

### Understand Limitations

**Role & Responsibility:** Validate suggestions on both iOS and Android. Copilot may suggest web-only APIs or incorrect native module usage.
**Examples:**

- "Verify if `Platform.select()` is the correct way to handle iOS vs Android differences here."
- "Does `Marker` from react-native-maps support the `onCalloutPress` prop I'm trying to use?"

**React Native Example from Codebase:**

```text
Prompt: "Review the provider selection logic in MapComponent.tsx. Is PROVIDER_DEFAULT correct for iOS or should we explicitly use Apple Maps?"
```

---

## Intermediate

### Inline Code Suggestions

**Role & Responsibility:** Quickly scaffold components, hooks, and styled views; enforce TypeScript types.
**Examples:**

- Comment: `// Custom hook to debounce search input` → accept hook implementation with `useState` and `useEffect`.
- In a new screen file: `// Screen with ScrollView, header image, and list of POIs` → let Copilot scaffold the JSX structure.

**React Native Example from Codebase:**

```tsx
// In AddStopModal.tsx, start typing:
// useEffect to debounce search query with 500ms delay
// Copilot suggests the debounce pattern already in the file (lines 18-27)
```

### Prompting

**Role & Responsibility:** Precise prompts yield reusable components aligned with your patterns.
**Examples:**

- "Create a reusable `IconButton` component with size, color, and onPress props following our styling conventions in HomeScreen."
- "Generate a custom hook `useLocationPermission` that requests and tracks location permission status on iOS and Android."

**React Native Example from Codebase:**

```text
Prompt: "Create a VehicleCard component similar to TripCard that displays vehicle type, height, and weight with an edit button. Use the Vehicle type from types/Vehicle.ts."
```

### Code Explanations

**Role & Responsibility:** Understand complex native integrations, navigation patterns, and third-party libraries.
**Examples:**

- "Explain what `QueryClientProvider` does in App.tsx and why it wraps the NavigationContainer."
- "What does `SplashScreen.preventAutoHideAsync()` do and when is `hideAsync()` called?"

**React Native Example from Codebase:**

```text
Prompt: "Explain the splash screen pattern in App.tsx. Why do we call preventAutoHideAsync() and how does onLayoutRootView() work?"
```

### Comment-Based Generation

**Role & Responsibility:** Use structured comments as mini-specs for components and functions.
**Examples:**

```tsx
// Component: RouteStatsCard
// Props: distance (meters), duration (seconds), legs (Leg[])
// Display: formatted km, hours/minutes, leg count
// Style: card with shadow, blue accent color
```

Ask Copilot to complete the component respecting the spec.

**React Native Example from Codebase:**

```tsx
// In TripPlannerScreen.tsx, add comment:
// Inline route summary showing distance in km and duration in minutes
// Only visible when routeGeoJSON exists
// Copilot generates the conditional rendering (already exists lines 114-120)
```

### Code Refactoring

**Role & Responsibility:** Reduce code duplication, improve performance, and enhance readability.
**Examples:**

- "Refactor the category and place renderers in HomeScreen into separate components."
- "Extract the API error handling logic in TripPlannerScreen into a reusable utility function."

**React Native Example from Codebase:**

```text
Prompt: "Refactor TripPlannerScreen.tsx to extract the stop list item into a separate StopListItem component with props for stop data, index, and onRemove callback."
```

### Copilot Chat

**Role & Responsibility:** Use Chat to plan features, debug issues, and generate documentation.
**Examples:**

- "Produce a PR description for adding offline support to the trip store."
- "Generate JSDoc comments for all functions in useTripStore.ts."

**React Native Example from Codebase:**

```text
Prompt: "Generate TypeDoc comments for the useTripStore hook, documenting each state property and action with usage examples."
```

### Few-Shot Prompting

**Role & Responsibility:** Provide examples to guide Copilot toward your patterns.
**Examples:**

- Show `Stop` and `Vehicle` interfaces, then: "Generate a `POI` interface with id, name, coordinates, category, and rating."
- Provide `HomeScreen` and `ExploreScreen` patterns, then: "Generate a `SettingsScreen` with the same navigation and styling patterns."

**React Native Example from Codebase:**

```text
Prompt: "Looking at Stop.ts and Vehicle.ts interfaces, generate a Waypoint interface with id, name, coordinates, arrivalTime, and departureTime fields."
```

### Unit Testing & Debugging

**Role & Responsibility:** Ensure component and hook reliability with tests.
**Examples:**

- "Write Jest tests for useTripStore.ts covering addStop, removeStop, and reorderStops actions."
- "Generate test cases for AddStopModal including search debouncing and stop selection."

**React Native Example from Codebase:**

```text
Prompt: "Write Jest tests for useTripStore.ts:
1. Test addStop() adds a stop to empty array
2. Test removeStop() removes correct stop by ID  
3. Test reorderStops() moves stop from index 0 to index 2
4. Test resetTrip() clears all trip data"
```

### Copilot CLI

**Role & Responsibility:** Use Copilot in terminal for React Native commands and troubleshooting.
**Examples:**

- `gh copilot explain "npx expo start --ios --clear"` → understand Expo CLI flags
- `gh copilot suggest "fix react-native-maps not showing on iOS simulator"` → get troubleshooting steps

**React Native Example from Codebase:**

```bash
gh copilot explain "npx expo prebuild --clean && npx expo run:ios"
gh copilot suggest "generate app icons for iOS and Android from a single source image"
```

---

## Advanced

### Chain-of-Thought Prompting

**Role & Responsibility:** Drive complex features with stepwise reasoning and checkpoints.
**Examples:**

- "Think step by step: design offline support for the trip planner. Consider: local storage, sync queue, conflict resolution, and UI indicators."
- "Break down: how should we implement deep linking to open a specific trip from a shared URL?"

**React Native Example from Codebase:**

```text
Prompt: "Think step by step: implement an offline mode for useTripStore.ts.
1. What data needs to be persisted locally?
2. How do we detect online/offline status?
3. How do we sync pending changes when back online?
4. How do we handle conflicts?
5. What UI changes are needed to show offline status?"
```

### Instruction File

**Role & Responsibility:** Maintain a project-level instruction file to steer Copilot toward React Native and project conventions.
**Examples:**

- Create `.github/copilot-instructions.md` describing component patterns, navigation structure, and state management rules.

**React Native Example from Codebase:**

```markdown
# .github/copilot-instructions.md for Road Trip Mobile

## React Native Conventions
- Use functional components with TypeScript
- State: Zustand stores in src/store/ (see useTripStore.ts pattern)
- Navigation: React Navigation with typed params
- Maps: react-native-maps (Google on Android, Apple on iOS)
- API: axios via src/services/api.ts with auth interceptor

## Coordinate Format
- Always [longitude, latitude] (GeoJSON spec)
- Convert to {latitude, longitude} only for react-native-maps

## Component Structure
- Props interface defined above component
- StyleSheet at bottom of file
- Use SafeAreaView for screen components
```

### Prompt Files

**Role & Responsibility:** Keep reusable prompts for common mobile development tasks.
**Examples:**

- `prompts/new-screen.prompt.md` for scaffolding a new screen with navigation types
- `prompts/new-store-action.prompt.md` for adding Zustand store actions consistently

**React Native Example from Codebase:**

```markdown
# prompts/new-screen.prompt.md

Create a new React Native screen component with:
- TypeScript props interface using StackScreenProps
- SafeAreaView wrapper with proper styles
- Navigation header configuration
- Loading and error states
- Connection to relevant Zustand store

Screen name: {{screenName}}
Store to connect: {{storeName}}
Navigation params: {{params}}
```

### Copilot Code Review

**Role & Responsibility:** Accelerate PR reviews for mobile-specific concerns.
**Examples:**

- "Review this PR for React Native anti-patterns: inline styles, missing memo, unnecessary re-renders."
- "Check if this navigation change handles the Android back button correctly."

**React Native Example from Codebase:**

```text
Prompt: "Review MapComponent.tsx for performance issues. Are there unnecessary re-renders? Should we memoize the coordinates transformation?"
```

### Copilot Plan Mode

**Role & Responsibility:** Ask Copilot to plan multi-file changes before implementation.
**Examples:**

- "Plan adding a favorites feature: which files need changes, what new types, stores, and screens are needed?"
- "Plan refactoring from react-native-maps to mapbox-gl. List all affected files and migration steps."

**React Native Example from Codebase:**

```text
Prompt: "Plan adding a 'favorite trips' feature to the mobile app:
1. What changes to Trip type?
2. What new Zustand actions in useTripStore?
3. What UI changes in TripCard and TripListScreen?
4. What new API endpoints needed?"
```

### Copilot Coding Agent

**Role & Responsibility:** Let Copilot implement scoped changes with human oversight.
**Examples:**

- "Create a PR that adds a loading skeleton to TripCard while images load."
- "Implement the VehiclePickerModal with type selection and dimension inputs." (Approve changes before merge)

**React Native Example from Codebase:**

```text
Prompt: "@agent Create a PR that adds pull-to-refresh to TripListScreen.tsx. Include:
1. Add refreshing state
2. Implement onRefresh callback that reloads trips
3. Add RefreshControl to FlatList
4. Test on iOS and Android"
```

### Architecture & Tech Stack Generation

**Role & Responsibility:** Draft mobile architecture diagrams and evaluate tech stack options.
**Examples:**

- "Generate a mermaid diagram showing the data flow from API to Zustand store to UI components."
- "Compare react-native-maps vs mapbox-gl-native for our use case with vehicle routing."

**React Native Example from Codebase:**

```text
Prompt: "Generate a mermaid sequence diagram showing the trip save flow:
User taps Save → TripPlannerScreen → useTripStore.saveTrip → api.post → Backend → Response → UI Update"
```

---

## Expert

### Custom Coding Agent

**Role & Responsibility:** Author agents that automate repetitive mobile development tasks.
**Examples:**

- Build an agent that generates new screens with proper navigation integration, types, and tests.
- Create an agent that audits components for accessibility (a11y) compliance.

**React Native Example from Codebase:**

```markdown
# .github/copilot-agents/react-native-screen.agent.md

## Role
Generate new React Native screens following project conventions.

## Workflow
1. Create screen file in src/screens/
2. Add TypeScript navigation types to types/navigation.ts
3. Register screen in AppNavigator.tsx
4. Create basic Jest test file
5. Add to navigation stacks as needed

## Conventions
- Use SafeAreaView with useSafeAreaInsets hook
- Connect to relevant Zustand store
- Include loading and error states
- Follow HomeScreen.tsx as reference pattern
```

### Prompt Engineering Mastery

**Role & Responsibility:** Design sophisticated prompts with roles, constraints, and verification.
**Examples:**

- Use the pattern: *role* → *context* → *constraints* → *steps* → *outputs* → *verification*

**React Native Example from Codebase:**

```text
Prompt: "You are a senior React Native developer reviewing code for a production app.

CONTEXT: The useTripStore.ts manages trip planning state with stops, routes, and vehicle specs.

CONSTRAINTS:
- Must maintain backward compatibility with existing API
- No external state management libraries (Zustand only)
- TypeScript strict mode compliance

TASK: Add a feature to track the last 5 viewed trips.

OUTPUT: Provide the code changes with inline comments explaining decisions.

VERIFY: Ensure the solution handles app restart (persistence) and memory limits (max 5 trips)."
```

### MCP Servers (Model Context Protocol)

**Role & Responsibility:** Connect Copilot to live mobile backend data and device logs for context-aware assistance.
**Examples:**

- MCP server providing live backend API schema for accurate type generation
- MCP server streaming device logs for real-time debugging assistance

**React Native Example from Codebase:**

```text
# MCP Server for Road Trip Mobile

Expose:
- Live FastAPI OpenAPI schema for type generation
- Current trip data for testing/debugging
- Azure Maps POI search for location verification
- Device logs from Expo for error analysis
```

### Enterprise Policy Management

**Role & Responsibility:** Govern Copilot usage for mobile teams with security and compliance controls.
**Examples:**

- Block suggestions containing hardcoded API keys or tokens
- Require human approval for changes to authentication flows
- Audit all Copilot-generated code changes in security-sensitive files

**React Native Example from Codebase:**

```yaml
# Enterprise Copilot Policy for Mobile

blocked_patterns:
  - "AsyncStorage.setItem.*token"  # Enforce SecureStore for tokens
  - "console.log.*password"        # Prevent credential logging
  
require_review:
  - "src/store/useAuthStore.ts"    # Auth changes need human review
  - "src/services/api.ts"          # API client changes need review
```

### Model Selection & Cost Optimization

**Role & Responsibility:** Choose appropriate models for different mobile development tasks.
**Examples:**

- Use faster models for inline completions and simple scaffolding
- Use advanced models for architectural decisions and complex debugging
- Cache common prompt patterns for component generation

**React Native Example from Codebase:**

```text
Task → Model Selection:
- Component scaffolding → GPT-4o-mini (fast, cost-effective)
- Navigation refactoring → GPT-4o (complex reasoning)
- Performance debugging → Claude Opus (deep analysis)
- Type generation → GPT-4o-mini (pattern matching)
```

### GitHub Copilot Certification

**Role & Responsibility:** Validate React Native + Copilot proficiency for team leads and architects.
**Examples:**

- Demonstrate expertise in mobile-specific Copilot workflows
- Show mastery of instruction files, agents, and MCP for mobile development

### Copilot Spec Kit

**Role & Responsibility:** Produce living specs for mobile features from prompts and code analysis.
**Examples:**

- Generate ADR (Architecture Decision Record) for navigation library choice
- Create RFC for implementing push notifications with Copilot-assisted documentation

**React Native Example from Codebase:**

```text
Prompt: "Generate an ADR for the decision to use Zustand over Redux in this React Native app. Include:
1. Context and problem statement
2. Decision drivers (bundle size, learning curve, TypeScript support)
3. Considered options (Redux, MobX, Context API)
4. Decision outcome with rationale
5. Consequences and trade-offs"
```

### Copilot Metrics

**Role & Responsibility:** Measure Copilot's impact on mobile development velocity and quality.
**Examples:**

- Track component creation time with/without Copilot
- Measure bug rates in Copilot-generated vs. manually-written code
- Monitor test coverage for Copilot-suggested implementations

**React Native Example from Codebase:**

```text
Metrics to Track:
- Time to scaffold new screen (target: <5 min with Copilot)
- Type error rate in generated code (target: <2%)
- Test coverage for store actions (target: >80%)
- PR review time for Copilot-assisted changes
```

---

## How to Use This Guide

- Start at **Foundational** and apply the examples in a sandbox React Native project.
- Progress to **Intermediate**, then **Advanced**, validating outputs with tests and simulator runs.
- Adopt **Expert** practices with governance, metrics, and team-wide standards.

---

## Challenges in Mobile Development with AI

Mobile development presents unique challenges for AI-assisted coding:

1. **Platform Fragmentation**: iOS and Android have different APIs, behaviors, and edge cases. Copilot suggestions may work on one platform but fail on another.

2. **Native Module Complexity**: Third-party libraries like `react-native-maps` or `expo-location` have platform-specific setup. Copilot may not know your specific configuration.

3. **Debugging Across Layers**: Errors can occur in JavaScript, native code, or the bridge between them. AI can help, but you need to identify which layer is problematic.

4. **Rapid Framework Evolution**: React Native and Expo evolve quickly. Copilot's training data may lag behind the latest APIs or deprecated patterns.

5. **Device-Specific Testing**: Simulator/emulator behavior differs from real devices. Always validate Copilot suggestions on actual hardware for critical features.

6. **App Store Compliance**: AI-generated code must still meet Apple and Google guidelines for privacy, permissions, and performance.

---

## Best Practices for AI-Assisted Mobile Development

### Start Small and Iterate

Don't try to generate entire screens or features in one prompt. Start with:

- Individual components
- Single store actions
- Specific utility functions

Then integrate and test before moving to the next piece.

### Leverage Your Type System

React Native + TypeScript is a powerful combination with AI. Your types (like `Stop`, `Vehicle`, `Trip`) provide crucial context that improves Copilot suggestions. Keep types up-to-date and well-documented.

### Test on Both Platforms Early

Generate code, then immediately test on both iOS and Android. Platform-specific issues are easier to fix when changes are small.

### Build Your Prompt Library

Create reusable prompts for common patterns in your codebase:

- New screen scaffolding
- Zustand store actions
- API service functions
- Component with proper accessibility

### Use Instruction Files Wisely

Your `.github/copilot-instructions.md` should document:

- State management patterns (Zustand)
- Navigation structure
- Coordinate format conventions
- Styling conventions

This prevents Copilot from suggesting incompatible patterns (Redux, different styling libraries, etc.)

### Review Generated Code for Mobile Gotchas

Always check AI-generated code for:

- Memory leaks (missing cleanup in useEffect)
- Infinite re-render loops
- Missing platform-specific handling
- Accessibility attributes
- Proper error boundaries

---

## Advice

**Start at the edges, not the core.** Begin using Copilot for:

- Writing tests for existing components
- Generating documentation and comments
- Scaffolding new utility functions
- Creating TypeScript interfaces from API responses

As you build confidence and learn effective prompting, gradually expand to:

- Component generation with proper types
- Store actions and state management
- Navigation and screen implementations
- Complex features with multi-file changes

The goal is to **augment your expertise, not replace it**. Copilot accelerates the typing and pattern recall; you provide the architectural judgment, UX decisions, and quality assurance that make great mobile apps.  