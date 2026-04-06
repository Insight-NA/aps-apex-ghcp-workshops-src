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
