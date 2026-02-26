# Plan: Mobile MVP (React Native iOS/Android)

**Feature ID**: mobile-mvp  
**Milestone**: 1.5 - Mobile MVP  
**Due Date**: January 22, 2026  
**Effort**: 50-70 hours  
**Priority**: High

---

## Overview

Add React Native mobile application (iOS + Android) to existing Road Trip Planner project. The mobile app shares the same FastAPI backend with the web app, following the Backend-for-Frontend (BFF) pattern.

**Key Requirements**:
- iOS and Android support with single codebase
- Reuse existing backend API endpoints (no backend changes)
- Share business logic via Zustand stores (100% code reuse target)
- React Native Maps for map rendering (different from web's React Map GL)
- Google OAuth authentication
- App Store and Google Play submissions

---

## Technical Stack

### Mobile Framework
- **React Native 0.77+**: Core mobile framework with New Architecture enabled
- **Expo SDK 52+**: Managed workflow for cross-platform tooling
- **TypeScript 5.0+**: Type safety and modern language features
- **React Navigation 6.0+**: Navigation library (stack + bottom tabs)

### State Management & Data
- **Zustand 4.0+**: Global state management (shared with web)
- **TanStack Query (React Query)**: Server state management and caching
- **AsyncStorage**: Persistent local storage for tokens and offline data

### UI & Maps
- **React Native Maps 1.0+**: Map rendering with Mapbox integration
- **React Native Safe Area Context**: Handle notches and safe areas
- **React Native Screens**: Native screen optimization

### Development & Testing
- **Jest**: Unit testing framework
- **@testing-library/react-native**: Component testing
- **EAS Build**: Cloud builds for iOS and Android
- **EAS Submit**: App store submission automation

### Backend Integration
- **Axios**: HTTP client for API calls
- **FastAPI Backend**: Existing Python backend serves both web and mobile
- **Same API Endpoints**: /api/trips, /api/directions, /api/pois, /auth/google

---

## Architecture

### Option 4: Web Frontend + Mobile Frontend + Shared Backend

```
┌─────────────────────────────────────────────────────┐
│                 Mobile Clients                      │
│  ┌────────────────────┐  ┌────────────────────┐   │
│  │   iOS App          │  │   Android App      │   │
│  │   React Native     │  │   React Native     │   │
│  │   + Expo           │  │   + Expo           │   │
│  └────────────────────┘  └────────────────────┘   │
└─────────────────────────────────────────────────────┘
                     │
                     │ REST/HTTP (Same as Web)
                     ▼
┌─────────────────────────────────────────────────────┐
│           FastAPI Backend (BFF Pattern)             │
│  ┌──────────────────────────────────────────────┐  │
│  │  Routes: /api/trips, /api/directions, etc   │  │
│  │  Services: ai_service.py, vehicle_service.py│  │
│  │  Auth: auth.py (Google OAuth + JWT)         │  │
│  └──────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────┘
                     │
                     ▼
        ┌────────────────────────────┐
        │  External APIs             │
        │  - Mapbox Directions       │
        │  - Google Gemini AI        │
        │  - Azure Maps POI          │
        └────────────────────────────┘
```

**Key Points**:
- Mobile and web apps use identical API endpoints
- Backend proxies external APIs (API keys hidden from clients)
- Zustand stores can be shared between web and mobile with minimal changes
- Authentication flow identical (Google OAuth → JWT → Bearer token)

---

## Project Structure

```
road_trip_app/
├── mobile/                      # NEW - React Native mobile app
│   ├── App.tsx                  # Root component with navigation
│   ├── app.json                 # Expo configuration
│   ├── package.json             # Mobile dependencies
│   ├── tsconfig.json            # TypeScript config
│   ├── .env                     # Environment variables
│   ├── eas.json                 # EAS Build configuration
│   ├── src/
│   │   ├── navigation/          # React Navigation setup
│   │   │   ├── RootNavigator.tsx
│   │   │   ├── AppNavigator.tsx
│   │   │   └── AuthNavigator.tsx
│   │   ├── screens/             # Screen components
│   │   │   ├── TripListScreen.tsx
│   │   │   ├── TripDetailScreen.tsx
│   │   │   ├── TripPlannerScreen.tsx
│   │   │   ├── MapScreen.tsx
│   │   │   ├── LoginScreen.tsx
│   │   │   └── ProfileScreen.tsx
│   │   ├── components/          # Reusable UI components
│   │   │   ├── TripCard.tsx
│   │   │   ├── StopMarker.tsx
│   │   │   ├── AddStopModal.tsx
│   │   │   └── RoutePolyline.tsx
│   │   ├── store/               # Zustand stores (shared with web)
│   │   │   ├── useTripStore.ts
│   │   │   ├── useAuthStore.ts
│   │   │   └── useMapStore.ts
│   │   ├── services/            # API clients
│   │   │   ├── api.ts           # Axios instance
│   │   │   ├── tripService.ts
│   │   │   ├── authService.ts
│   │   │   └── mapService.ts
│   │   ├── types/               # TypeScript interfaces (shared with web)
│   │   │   ├── Trip.ts
│   │   │   ├── Stop.ts
│   │   │   ├── Route.ts
│   │   │   └── User.ts
│   │   ├── hooks/               # Custom React hooks
│   │   │   ├── useTrips.ts
│   │   │   ├── useAuth.ts
│   │   │   └── useLocation.ts
│   │   └── utils/               # Helper functions
│   │       ├── storage.ts       # AsyncStorage wrapper
│   │       ├── location.ts      # Location utilities
│   │       └── validation.ts
│   └── __tests__/               # Jest tests
│       ├── components/
│       ├── screens/
│       └── services/
├── backend/                     # EXISTING - No changes needed
│   ├── main.py                  # FastAPI routes (serves web + mobile)
│   ├── auth.py
│   ├── ai_service.py
│   └── ...
├── frontend/                    # EXISTING - Web app continues unchanged
│   ├── src/
│   └── ...
└── infrastructure/              # Deployment scripts
    ├── deploy-azure.sh          # Backend + web deployment
    └── deploy-mobile.sh         # NEW - Mobile build/submit script
```

---

## File Organization

### Files to Create (New)
1. `mobile/App.tsx` - Root component with navigation setup
2. `mobile/app.json` - Expo configuration with iOS/Android settings
3. `mobile/package.json` - Mobile-specific dependencies
4. `mobile/tsconfig.json` - TypeScript configuration
5. `mobile/.env` - Environment variables (VITE_API_URL, VITE_MAPBOX_TOKEN)
6. `mobile/eas.json` - EAS Build profiles (development, preview, production)
7. `mobile/src/navigation/RootNavigator.tsx` - Root navigation setup
8. `mobile/src/navigation/AppNavigator.tsx` - Main app navigation (authenticated)
9. `mobile/src/navigation/AuthNavigator.tsx` - Authentication flow navigation
10. `mobile/src/screens/TripListScreen.tsx` - List of saved trips
11. `mobile/src/screens/TripDetailScreen.tsx` - Trip details with map
12. `mobile/src/screens/TripPlannerScreen.tsx` - Create/edit trips
13. `mobile/src/screens/MapScreen.tsx` - Full-screen map view
14. `mobile/src/screens/LoginScreen.tsx` - Google OAuth login
15. `mobile/src/screens/ProfileScreen.tsx` - User profile and settings
16. `mobile/src/components/TripCard.tsx` - Trip list item component
17. `mobile/src/components/StopMarker.tsx` - Map marker for stops
18. `mobile/src/components/AddStopModal.tsx` - Modal to add stops
19. `mobile/src/components/RoutePolyline.tsx` - Route line on map
20. `mobile/src/store/useTripStore.ts` - Trip state management
21. `mobile/src/store/useAuthStore.ts` - Authentication state
22. `mobile/src/store/useMapStore.ts` - Map state (region, markers)
23. `mobile/src/services/api.ts` - Axios instance with interceptors
24. `mobile/src/services/tripService.ts` - Trip API calls
25. `mobile/src/services/authService.ts` - Auth API calls
26. `mobile/src/services/mapService.ts` - Map/directions API calls
27. `mobile/src/types/Trip.ts` - Trip type definitions
28. `mobile/src/types/Stop.ts` - Stop type definitions
29. `mobile/src/types/Route.ts` - Route/GeoJSON type definitions
30. `mobile/src/types/User.ts` - User type definitions
31. `mobile/src/hooks/useTrips.ts` - Custom hook for trip operations
32. `mobile/src/hooks/useAuth.ts` - Custom hook for authentication
33. `mobile/src/hooks/useLocation.ts` - Custom hook for location services
34. `mobile/src/utils/storage.ts` - AsyncStorage wrapper
35. `mobile/src/utils/location.ts` - Location utilities
36. `mobile/src/utils/validation.ts` - Validation helpers
37. `mobile/README.md` - Mobile setup and development guide
38. `infrastructure/deploy-mobile.sh` - Mobile deployment script

### Files to Modify (Existing)
- None required - Backend API already serves mobile clients with same endpoints

### Files to Reference (Existing)
1. `frontend/src/store/useTripStore.ts` - Reference for Zustand store structure
2. `frontend/src/types/*.ts` - Reference for TypeScript interfaces
3. `backend/main.py` - Backend API endpoints
4. `backend/schemas.py` - Pydantic schemas for API validation
5. `PROJECT_INSTRUCTIONS.md` - Project conventions and architecture
6. `.specify/memory/constitution.md` - React Native development standards

---

## Dependencies

### New NPM Packages (mobile/package.json)
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-native": "^0.77.0",
    "expo": "^52.0.0",
    "react-native-maps": "^1.14.0",
    "react-navigation/native": "^6.1.0",
    "react-navigation/stack": "^6.3.0",
    "react-navigation/bottom-tabs": "^6.5.0",
    "react-native-safe-area-context": "^4.10.0",
    "react-native-screens": "^3.31.0",
    "zustand": "^4.5.0",
    "axios": "^1.6.0",
    "@tanstack/react-query": "^5.28.0",
    "@react-native-async-storage/async-storage": "^1.23.0",
    "expo-auth-session": "^5.5.0",
    "expo-location": "^17.0.0",
    "expo-constants": "^16.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-native": "^0.77.0",
    "jest": "^29.7.0",
    "@testing-library/react-native": "^12.4.0",
    "@testing-library/jest-native": "^5.4.0",
    "typescript": "^5.3.0"
  }
}
```

### Backend Dependencies
- No changes required - existing FastAPI backend serves mobile clients

---

## Risk Mitigation

### High-Risk Tasks
1. **React Native Maps Configuration**: Platform-specific setup for iOS/Android
   - **Mitigation**: Follow official docs, test on physical devices early
   
2. **Google OAuth on Mobile**: Different flow than web (uses Expo AuthSession)
   - **Mitigation**: Use Expo AuthSession, test on physical devices (simulators limited)
   
3. **iOS/Android Signing**: Code signing certificates and provisioning profiles
   - **Mitigation**: Use EAS Build managed credentials, document setup process
   
4. **App Store Submissions**: Apple 1-7 days, Google hours-2 days, 40% rejection rate
   - **Mitigation**: Submit 2 weeks before deadline, prepare for re-submissions

### Testing Strategy
- Unit tests: 70% coverage target for business logic (services, stores, utils)
- Component tests: Key screens and components using @testing-library/react-native
- Integration tests: API calls with mocked responses
- Manual testing: Physical iOS and Android devices (OAuth requires real devices)
- Performance testing: Verify <3s startup, 60 FPS animations, <200MB memory

---

## Timeline

**Total Duration**: 4 weeks (Dec 19, 2025 - Jan 15, 2026)

### Week 1 (Dec 19-25): Setup + Foundation + US1/US2
- Phase 1: Mobile Project Setup (T001-T010, 4-6 hours)
- Phase 2: Foundational Infrastructure (T011-T020, 6-8 hours)
- Phase 3: US1 - Trip List (T021-T029, 6-8 hours)
- Phase 4: US2 - Map View (T030-T044, 8-12 hours)

### Week 2 (Dec 26 - Jan 1): US3/US4 + Navigation + Testing
- Phase 5: US3 - Trip Planner (T045-T058, 10-14 hours)
- Phase 6: US4 - Authentication (T059-T070, 6-8 hours)
- Phase 7: Navigation Structure (T071-T079, 4-6 hours)
- Phase 8: Testing (T080-T089, 6-10 hours)

### Week 3 (Jan 2-8): Builds + Store Prep
- Phase 9: Build & Store Prep (T090-T110, 6-10 hours)
  - EAS Build setup
  - App icons and splash screens
  - iOS signing and TestFlight
  - Android signing and internal testing
  - Store metadata and screenshots
  - Submissions to App Store and Google Play

### Week 4 (Jan 9-15): Polish + Review Buffer
- Phase 10: Polish (T111-T123, 4-6 hours)
  - iOS-specific polish
  - Android-specific polish
  - Performance optimization
  - Accessibility improvements
- Buffer time for store review feedback (Apple typically 1-3 days, Google faster)

**Key Dates**:
- Jan 15: Submit to App Store and Google Play
- Jan 22-28: Target approval window (Milestone 1.5 due Jan 22)

---

## Success Criteria

### Functional Requirements
- ✅ View list of saved trips with images and metadata
- ✅ Display trip details with map, stops, and route
- ✅ Create new trips with multiple stops
- ✅ Search locations and add as stops
- ✅ Calculate routes between stops
- ✅ Save trips to backend database
- ✅ Google OAuth login
- ✅ View and edit user profile

### Performance Requirements
- ✅ App startup: <3 seconds on mid-range devices
- ✅ Map rendering: 60 FPS with route and markers
- ✅ Memory usage: <200MB under normal use
- ✅ Network resilience: Handle offline mode gracefully

### Quality Requirements
- ✅ Test coverage: 70% for business logic (services, stores, utils)
- ✅ TypeScript strict mode: No `any` types
- ✅ Physical device testing: iOS and Android devices tested
- ✅ Store submissions: Both App Store and Google Play submitted
- ✅ Store approval: Apps live on stores by Jan 22-28

### Documentation
- ✅ mobile/README.md with setup instructions
- ✅ API documentation references backend endpoints
- ✅ Deployment guide for EAS Build and submissions
- ✅ Troubleshooting guide for common issues

---

## Notes

- **Backend Changes**: None required - mobile uses existing API endpoints
- **Code Reuse**: Zustand stores, TypeScript types, and business logic shared with web
- **Map Library**: React Native Maps (not React Map GL - web only)
- **Testing**: Physical devices required for OAuth flow testing
- **Submissions**: Budget 2 weeks for store approvals (Apple slower than Google)
