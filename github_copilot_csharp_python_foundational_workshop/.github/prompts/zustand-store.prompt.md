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
