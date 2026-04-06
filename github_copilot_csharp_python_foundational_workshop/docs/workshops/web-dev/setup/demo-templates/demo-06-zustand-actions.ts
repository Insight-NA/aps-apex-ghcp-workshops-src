/**
 * Workshop Demo 6: Buggy Zustand Store Actions
 *
 * This file intentionally contains a state mutation bug.
 * Students will use Copilot Chat to identify and fix the issue.
 *
 * BUG: Direct state mutation instead of immutable update pattern.
 * Zustand requires returning a new object reference for React to detect changes.
 *
 * @see frontend/src/store/useTripStore.ts for correct pattern
 */
import { create } from 'zustand';
import { Stop } from '../types';

interface TripState {
  stops: Stop[];
  addStop: (stop: Stop) => void;
  removeStop: (id: string) => void;
  reorderStops: (fromIndex: number, toIndex: number) => void;
}

// ❌ BUGGY IMPLEMENTATION — Copilot Chat should identify these issues
export const useTripStore = create<TripState>((set) => ({
  stops: [],

  // BUG 1: Mutating the array directly with push()
  addStop: (stop) =>
    set((state) => {
      state.stops.push(stop); // ❌ Direct mutation!
      return state; // ❌ Same object reference — React won't re-render
    }),

  // BUG 2: Using splice() which mutates in place
  removeStop: (id) =>
    set((state) => {
      const index = state.stops.findIndex((s) => s.id === id);
      if (index !== -1) {
        state.stops.splice(index, 1); // ❌ Direct mutation!
      }
      return state;
    }),

  // BUG 3: Multiple mutations in reorder logic
  reorderStops: (fromIndex, toIndex) =>
    set((state) => {
      const [removed] = state.stops.splice(fromIndex, 1); // ❌ Mutation 1
      state.stops.splice(toIndex, 0, removed); // ❌ Mutation 2
      return state;
    }),
}));

/**
 * DEBUGGING EXERCISE:
 *
 * 1. Open Copilot Chat (Cmd+Shift+I / Ctrl+Shift+I)
 * 2. Select this entire file (Cmd+A / Ctrl+A)
 * 3. Ask: "Why might React components not re-render when these Zustand actions are called?"
 * 4. Follow Copilot's guidance to fix the immutability issues
 *
 * EXPECTED FIX PATTERN (from useTripStore.ts):
 *
 * addStop: (stop) => set((state) => ({
 *   stops: [...state.stops, stop]  // ✅ New array reference
 * })),
 *
 * removeStop: (id) => set((state) => ({
 *   stops: state.stops.filter((s) => s.id !== id)  // ✅ filter() returns new array
 * })),
 *
 * reorderStops: (fromIndex, toIndex) => set((state) => {
 *   const newStops = [...state.stops];  // ✅ Copy first
 *   const [removed] = newStops.splice(fromIndex, 1);
 *   newStops.splice(toIndex, 0, removed);
 *   return { stops: newStops };  // ✅ New object with new array
 * }),
 */
