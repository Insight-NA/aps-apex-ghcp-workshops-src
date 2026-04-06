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
