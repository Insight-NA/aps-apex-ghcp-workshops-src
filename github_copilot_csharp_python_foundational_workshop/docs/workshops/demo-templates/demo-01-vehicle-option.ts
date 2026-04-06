/**
 * Demo 1 — Provide Clear Context for Better Suggestions
 *
 * INSTRUCTIONS:
 * 1. Copy this file into the types folder:
 *      cp docs/workshops/web-dev/setup/demo-templates/demo-01-vehicle-option.ts frontend/src/types/VehicleOption.ts
 *
 * 2. Open the copied file AND these context files in VS Code tabs:
 *      - frontend/src/types/index.ts   ← VehicleType already defined here!
 *      - frontend/src/types/Stop.ts
 *      - frontend/src/types/Vehicle.ts
 *      - frontend/src/types/Trip.ts
 *
 * 3. Place your cursor below the CORE prompt comment block.
 *
 * 4. Follow the step-by-step instructions in the workshop
 *    to let Copilot generate the VehicleOption interface.
 *
 * 5. Delete the practice file when done:
 *      rm frontend/src/types/VehicleOption.ts
 */

import { VehicleType } from './index';

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

// 👇 Start typing here: export { VehicleType } from './index';
// Then: export interface VehicleOption {
