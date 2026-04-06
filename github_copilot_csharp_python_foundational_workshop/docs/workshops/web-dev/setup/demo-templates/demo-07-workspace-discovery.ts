/**
 * Workshop Demo 7: Workspace Discovery with @workspace and MCP
 *
 * This file demonstrates how to use Copilot Chat's workspace context features
 * to understand a codebase quickly without manually searching files.
 *
 * NOT A BUG FILE — This is a reference demonstration.
 *
 * @see Uses @workspace context to query this project's patterns
 */

// ============================================================================
// EXERCISE: Understanding Store Patterns with @workspace
// ============================================================================
//
// STEP 1: Open Copilot Chat (Cmd+Shift+I / Ctrl+Shift+I)
//
// STEP 2: Try these @workspace queries to understand the codebase:
//
//   "@workspace How do React components subscribe to useTripStore?"
//   → Copilot will find: MapComponent.tsx, StopsPanel.tsx, TripPlanner.tsx
//
//   "@workspace What TypeScript types are used for stops and trips?"
//   → Copilot will find: types/index.ts with Stop, Trip, StopType interfaces
//
//   "@workspace Where is the Mapbox token configured?"
//   → Copilot will find: Backend proxy pattern in backend-java, VITE_MAPBOX_TOKEN note
//
// STEP 3: Compare to manual approach (searching files, opening each one)

// ============================================================================
// EXERCISE: Using #file for Targeted Questions
// ============================================================================
//
// #file allows you to reference specific files in your prompts:
//
//   "#file:useTripStore.ts Explain the addStop action implementation"
//   → Gets focused explanation of just that store action
//
//   "#file:MapComponent.tsx What triggers the map to re-center on stops?"
//   → Gets context-aware answer about useEffect dependencies
//
// TIP: Combine with #selection for even more precise context:
//
//   1. Select lines 77-95 in MapComponent.tsx (marker rendering logic)
//   2. Ask: "#selection Why does this use a ternary for marker color?"

// ============================================================================
// ADVANCED: MCP Servers for External Documentation (Optional)
// ============================================================================
//
// Model Context Protocol (MCP) servers provide real-time documentation access.
//
// Example with Context7 MCP server:
//
//   "Using @context7, how do I add a popup to a Marker in react-map-gl?"
//   → Fetches current react-map-gl documentation, not training data cutoff
//
//   "Using @context7, what's the Zustand immer middleware pattern?"
//   → Gets latest Zustand docs for immutable state updates
//
// WHY USE MCP?
// - Copilot's training data has a knowledge cutoff
// - Libraries like react-map-gl and Zustand update frequently
// - MCP servers fetch live documentation
//
// SETUP: MCP servers require VS Code configuration (.vscode/mcp.json)
// See: https://code.visualstudio.com/docs/copilot/copilot-extensibility-overview

// ============================================================================
// COMPARISON: Manual vs @workspace Discovery
// ============================================================================
//
// TASK: "Find all files that import useTripStore"
//
// MANUAL APPROACH (~2 minutes):
//   1. Ctrl+Shift+F (global search)
//   2. Search: "import.*useTripStore"
//   3. Click each result to understand usage
//   4. Mentally aggregate patterns
//
// @WORKSPACE APPROACH (~10 seconds):
//   "@workspace Which components use useTripStore and what state do they access?"
//
//   Copilot returns a summary:
//   - MapComponent.tsx: reads stops, routeGeoJSON for map rendering
//   - StopsPanel.tsx: reads stops, calls addStop/removeStop/reorderStops
//   - TripPlanner.tsx: reads tripId, calls saveTrip action
//   - etc.
//
// KEY INSIGHT: @workspace provides semantic understanding, not just text matching

// ============================================================================
// WHEN TO USE EACH APPROACH
// ============================================================================
//
// | Scenario                          | Best Approach              |
// |-----------------------------------|----------------------------|
// | "How is X implemented?"           | @workspace                 |
// | "Find exact string in codebase"   | Ctrl+Shift+F (grep)        |
// | "Explain this specific code"      | #file or #selection        |
// | "Latest library API syntax"       | MCP / Context7             |
// | "Debug this error with context"   | Agent mode + #codebase     |
// | "Refactor across many files"      | Agent mode                 |

export {};
