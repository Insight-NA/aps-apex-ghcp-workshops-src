# Tasks: Mobile MVP (React Native iOS/Android)

**Feature ID**: mobile-mvp  
**Milestone**: 1.5 - Mobile MVP  
**Due Date**: January 22, 2026  
**Total Effort**: 50-70 hours  
**Priority**: High

**Prerequisites**: 
- Milestone 1 (Production Ready) completed by Dec 18, 2025
- Backend FastAPI endpoints functional (same as web)
- Constitution v1.0.0 with React Native standards

**Context**: Add React Native mobile app (iOS + Android) that shares backend API and business logic with existing React web app. Uses Backend-for-Frontend (BFF) pattern - FastAPI backend serves both web and mobile clients with identical endpoints.

---

## Format: `- [ ] [ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1, US2, US3) - mobile tasks map to existing web user stories
- Include exact file paths

---

## Phase 1: Mobile Project Setup

**Purpose**: Initialize Expo React Native project structure and dependencies

**Goal**: Mobile development environment ready with all required libraries installed

- [ ] T001 Initialize Expo project: `npx create-expo-app mobile --template blank-typescript`
- [ ] T002 Install core dependencies: `npm install --prefix mobile react-native-maps @react-navigation/native @react-navigation/stack @react-navigation/bottom-tabs react-native-safe-area-context react-native-screens`
- [ ] T003 [P] Install state/API dependencies: `npm install --prefix mobile zustand axios @tanstack/react-query`
- [ ] T004 [P] Configure TypeScript in mobile/tsconfig.json (strict mode enabled)
- [ ] T005 Configure app.json with iOS bundle ID (com.roadtrip.app), Android package, permissions (location, maps)
- [ ] T006 [P] Add environment variables: Create mobile/.env with VITE_API_URL, VITE_MAPBOX_TOKEN
- [ ] T007 [P] Install development dependencies: `npm install --prefix mobile -D @types/react @types/react-native jest @testing-library/react-native`
- [ ] T008 Test iOS Simulator: `npx expo start --ios` from mobile directory
- [ ] T009 Test Android Emulator: `npx expo start --android` from mobile directory
- [ ] T010 Document mobile setup in mobile/README.md (prerequisites, commands, troubleshooting)

**Checkpoint**: Blank Expo app runs on iOS Simulator and Android Emulator

---

## Phase 2: Foundational Mobile Infrastructure

**Purpose**: Core mobile architecture that blocks all feature development

**⚠️ CRITICAL**: No feature screens can be built until this phase is complete

- [ ] T011 Setup React Navigation container in mobile/App.tsx
- [ ] T012 [P] Configure navigation theme (colors, fonts matching web app brand)
- [ ] T013 Create navigation types file: mobile/src/types/navigation.ts with screen params
- [ ] T014 [P] Create API client: mobile/src/services/api.ts (axios instance with baseURL, interceptors)
- [ ] T015 [P] Setup authentication interceptor: Add Bearer token to all requests in mobile/src/services/api.ts
- [ ] T016 [P] Copy Zustand store from web: mobile/src/store/useTripStore.ts (100% code reuse from frontend/src/store/useTripStore.ts)
- [ ] T017 [P] Create TypeScript types: mobile/src/types/Stop.ts, Trip.ts, POI.ts, Route.ts (copy from frontend/src/types/)
- [ ] T018 Setup AsyncStorage for token persistence: Install @react-native-async-storage/async-storage
- [ ] T019 Create auth utilities: mobile/src/utils/auth.ts (saveToken, getToken, removeToken)
- [ ] T020 Configure error boundary: mobile/src/components/ErrorBoundary.tsx

**Checkpoint**: Navigation ready, API client configured, stores available, types defined

---

## Phase 3: User Story 1 - View Trip List (Priority: P1) 🎯 MVP

**Goal**: User can see their saved trips in a scrollable list (mobile version of AllTripsView)

**Independent Test**: Open app → see list of trips with images, titles, dates → tap trip → navigate to detail screen

### Implementation for User Story 1

- [ ] T021 [P] [US1] Create TripListScreen component: mobile/src/screens/TripListScreen.tsx
- [ ] T022 [P] [US1] Create TripCard component: mobile/src/components/TripCard.tsx (trip image, title, dates, distance)
- [ ] T023 [US1] Implement GET /api/trips endpoint call in TripListScreen (reuse useTripStore.fetchTrips)
- [ ] T024 [US1] Add FlatList with pull-to-refresh for trip list rendering
- [ ] T025 [US1] Handle loading state (ActivityIndicator) and empty state (illustration + CTA)
- [ ] T026 [US1] Add navigation to TripDetailScreen on card tap
- [ ] T027 [US1] Style TripListScreen with React Native StyleSheet (match web Tailwind colors)
- [ ] T028 [US1] Test on iOS physical device (verify safe area insets)
- [ ] T029 [US1] Test on Android physical device (verify back button behavior)

**Checkpoint**: User Story 1 functional - trips display in list, tappable, loading/error states handled

---

## Phase 4: User Story 2 - View Trip on Map (Priority: P1) 🎯 MVP

**Goal**: User can see trip route and stops rendered on interactive map (mobile version of MapComponent)

**Independent Test**: Open trip → map displays with markers for stops → route polyline drawn between stops → map auto-fits bounds

### Implementation for User Story 2

- [ ] T030 [P] [US2] Install React Native Maps: `npx expo install react-native-maps`
- [ ] T031 [P] [US2] Configure iOS Podfile for Google Maps (if using Google) or Apple Maps
- [ ] T032 [P] [US2] Configure Android build.gradle for Google Maps API key
- [ ] T033 [US2] Create MapComponent: mobile/src/components/MapComponent.tsx (MapView from react-native-maps)
- [ ] T034 [US2] Implement markers rendering: Use <Marker /> components for each stop
- [ ] T035 [US2] Implement route polyline: Use <Polyline /> component for routeGeoJSON coordinates
- [ ] T036 [US2] Add auto-fit bounds logic: Calculate region from stops/route coordinates
- [ ] T037 [US2] Create TripDetailScreen: mobile/src/screens/TripDetailScreen.tsx (map + stop list)
- [ ] T038 [US2] Connect TripDetailScreen to navigation params (receive tripId)
- [ ] T039 [US2] Fetch trip details: Call GET /api/trips/{tripId} on screen mount
- [ ] T040 [US2] Populate map with trip stops and route from useTripStore
- [ ] T041 [US2] Add map controls: Zoom buttons, current location button
- [ ] T042 [US2] Handle location permissions: Request ACCESS_FINE_LOCATION (Android), NSLocationWhenInUseUsageDescription (iOS)
- [ ] T043 [US2] Test map rendering on iOS Simulator (verify markers and polyline)
- [ ] T044 [US2] Test map rendering on Android Emulator (verify Google Maps API key works)

**Checkpoint**: User Story 2 functional - trip map displays with stops, route, interactive controls

---

## Phase 5: User Story 3 - Plan New Trip (Priority: P2)

**Goal**: User can create new trip, add stops, calculate route (mobile version of FloatingPanel + ItineraryView)

**Independent Test**: Tap "New Trip" → add start/end locations → add waypoints → calculate route → save trip

### Implementation for User Story 3

- [ ] T045 [P] [US3] Create TripPlannerScreen: mobile/src/screens/TripPlannerScreen.tsx
- [ ] T046 [P] [US3] Create AddStopModal: mobile/src/components/AddStopModal.tsx (search location input)
- [ ] T047 [US3] Implement location search: Call Azure Maps API via backend /api/search endpoint
- [ ] T048 [US3] Add stop to trip: Update useTripStore.addStop with coordinates, label
- [ ] T049 [US3] Render stop list: FlatList with draggable items (react-native-draggable-flatlist)
- [ ] T050 [US3] Implement stop reordering: Update useTripStore.reorderStops on drag end
- [ ] T051 [US3] Add "Calculate Route" button: Call POST /api/directions with stops
- [ ] T052 [US3] Display calculated route on map: Update useTripStore.routeGeoJSON
- [ ] T053 [US3] Add vehicle selection: Dropdown for car/truck/RV (pass to /api/directions)
- [ ] T054 [US3] Implement trip save: Call POST /api/trips with title, stops, routeGeoJSON
- [ ] T055 [US3] Add save confirmation modal: "Trip saved!" → navigate to TripDetailScreen
- [ ] T056 [US3] Handle validation: Require at least 2 stops before calculating route
- [ ] T057 [US3] Test trip creation flow on iOS device
- [ ] T058 [US3] Test trip creation flow on Android device

**Checkpoint**: User Story 3 functional - create trip, add stops, calculate route, save trip

---

## Phase 6: User Story 4 - Authentication (Priority: P2)

**Goal**: User can log in with Google OAuth, view profile, log out (mobile version of auth.py integration)

**Independent Test**: Tap "Login" → Google OAuth flow → redirect back to app → profile shows user info → tap logout

### Implementation for User Story 4

- [ ] T059 [P] [US4] Install Expo AuthSession: `npx expo install expo-auth-session expo-crypto`
- [ ] T060 [P] [US4] Configure Google OAuth client ID in app.json (iOS scheme, Android package)
- [ ] T061 [US4] Create LoginScreen: mobile/src/screens/LoginScreen.tsx
- [ ] T062 [US4] Implement Google OAuth flow: Use AuthSession.useAuthRequest with Google provider
- [ ] T063 [US4] Send Google token to backend: Call POST /api/auth/google with OAuth token
- [ ] T064 [US4] Store JWT token: Save access_token to AsyncStorage on successful login
- [ ] T065 [US4] Create ProfileScreen: mobile/src/screens/ProfileScreen.tsx (user name, email, avatar)
- [ ] T066 [US4] Fetch user profile: Call GET /api/me (requires Bearer token)
- [ ] T067 [US4] Add logout button: Clear AsyncStorage token, reset navigation to LoginScreen
- [ ] T068 [US4] Add authentication guard: Redirect to LoginScreen if no token found
- [ ] T069 [US4] Test Google login on iOS physical device (requires real OAuth credentials)
- [ ] T070 [US4] Test Google login on Android physical device

**Checkpoint**: User Story 4 functional - login, profile display, logout

---

## Phase 7: Navigation Structure and Tab Bar

**Purpose**: Connect all screens with bottom tab navigation (mobile version of MobileBottomNav)

- [ ] T071 Create bottom tab navigator: mobile/src/navigation/BottomTabNavigator.tsx
- [ ] T072 Add tabs: Trips (TripListScreen), Explore (placeholder), New Trip (TripPlannerScreen), Profile (ProfileScreen)
- [ ] T073 [P] Add tab icons: Install @expo/vector-icons, use MaterialCommunityIcons
- [ ] T074 [P] Configure tab bar styling: Colors, badges, label styles
- [ ] T075 Add stack navigator for trip detail: TripListScreen → TripDetailScreen
- [ ] T076 Test navigation flow: Tab switching, stack navigation, back button
- [ ] T077 Add deep linking configuration: Handle roadtrip://trip/{tripId} URLs
- [ ] T078 Test deep links on iOS device (verify URL scheme registered)
- [ ] T079 Test deep links on Android device (verify intent filters)

**Checkpoint**: Complete navigation structure with bottom tabs and stack navigation

---

## Phase 8: Testing (OPTIONAL - if TDD requested)

**Purpose**: Automated tests for critical mobile user flows

- [ ] T080 [P] Configure Jest for React Native: Update mobile/jest.config.js
- [ ] T081 [P] Setup @testing-library/react-native: Add preset to jest.config.js
- [ ] T082 [P] Write unit test for useTripStore: mobile/src/store/__tests__/useTripStore.test.ts
- [ ] T083 [P] Write unit test for API client: mobile/src/services/__tests__/api.test.ts
- [ ] T084 [P] Write component test for TripCard: mobile/src/components/__tests__/TripCard.test.tsx
- [ ] T085 [P] Write component test for MapComponent: Mock react-native-maps, test marker rendering
- [ ] T086 Write integration test for trip creation flow: Render TripPlannerScreen → add stops → save
- [ ] T087 Write integration test for authentication flow: LoginScreen → mock OAuth → ProfileScreen
- [ ] T088 Add test coverage report: Configure Jest coverage in package.json (target 70%+)
- [ ] T089 Run tests in CI: Add mobile test job to .github/workflows/mobile.yml

**Checkpoint**: Test suite passes, coverage >70%

---

## Phase 9: Build Configuration and App Store Preparation

**Purpose**: Production builds ready for TestFlight and Google Play submission

- [ ] T090 Install EAS CLI: `npm install -g eas-cli`
- [ ] T091 Login to Expo: `eas login` (create Expo account if needed)
- [ ] T092 Configure EAS Build: Run `eas build:configure` in mobile directory
- [ ] T093 [P] Generate app icon: Create mobile/assets/icon.png (1024x1024)
- [ ] T094 [P] Generate splash screen: Create mobile/assets/splash.png (match brand colors)
- [ ] T095 [P] Configure iOS app.json: Bundle identifier, version, build number
- [ ] T096 [P] Configure Android app.json: Package name, version code, permissions
- [ ] T097 Setup iOS signing: Add credentials to Expo account (Apple Developer Program required)
- [ ] T098 Setup Android signing: Generate keystore, add to Expo credentials
- [ ] T099 Build iOS production: `eas build --platform ios --profile production`
- [ ] T100 Build Android production: `eas build --platform android --profile production`
- [ ] T101 Test iOS IPA on physical device: Install via TestFlight
- [ ] T102 Test Android APK/AAB on physical device: Install via internal testing track
- [ ] T103 [P] Create App Store metadata: Description, keywords, category (Navigation)
- [ ] T104 [P] Create Google Play metadata: Description, short description, category
- [ ] T105 [P] Generate screenshots: iOS (6.5", 5.5") and Android (Pixel, Tablet)
- [ ] T106 [P] Write privacy policy: Document data collection (location, user profile)
- [ ] T107 Setup App Store Connect: Create app record, upload screenshots
- [ ] T108 Setup Google Play Console: Create app, upload screenshots
- [ ] T109 Submit iOS to App Store: Upload IPA, submit for review (TestFlight first)
- [ ] T110 Submit Android to Google Play: Upload AAB, submit to internal testing → production

**Checkpoint**: Apps submitted to stores, in review

---

## Phase 10: Polish and Mobile-Specific Optimization

**Purpose**: Platform-specific polish, performance optimization, offline support

- [ ] T111 [P] Add iOS-specific UI polish: Native haptic feedback, SF Symbols icons
- [ ] T112 [P] Add Android-specific UI polish: Material Design ripple effects, system back button handling
- [ ] T113 Optimize bundle size: Run `npx react-native-bundle-visualizer`, remove unused deps
- [ ] T114 Add offline support: Cache trips in AsyncStorage, sync when online
- [ ] T115 Optimize map performance: Cluster markers when zoomed out (react-native-maps-super-cluster)
- [ ] T116 Add error tracking: Install Sentry, configure for React Native
- [ ] T117 Add analytics: Install Firebase Analytics or Expo Analytics
- [ ] T118 Test battery usage: Profile app with Xcode Instruments (iOS) or Android Profiler
- [ ] T119 Test memory usage: Verify <200MB on older devices (iPhone 8, Pixel 3)
- [ ] T120 Test startup time: Verify <3s cold start on physical devices
- [ ] T121 Add accessibility: VoiceOver labels (iOS), TalkBack labels (Android)
- [ ] T122 Test in low bandwidth: Throttle network, verify graceful degradation
- [ ] T123 Document known issues: Create mobile/KNOWN_ISSUES.md

**Checkpoint**: Mobile app polished, performant, accessible

---

## Dependencies and Critical Path

### Dependency Graph

```
Setup (T001-T010)
  ↓
Foundation (T011-T020)
  ↓
  ├─→ US1: Trip List (T021-T029) → Parallel OK
  ├─→ US2: Map View (T030-T044) → Parallel OK
  ├─→ US3: Trip Planner (T045-T058) → Depends on US2 (map)
  └─→ US4: Auth (T059-T070) → Parallel OK
      ↓
Navigation (T071-T079)
  ↓
Testing (T080-T089) → Parallel with builds
  ↓
Builds & Store Prep (T090-T110)
  ↓
Polish (T111-T123)
```

### Critical Path (Sequential Tasks)

1. **Setup → Foundation** (T001-T020): 16-20 hours
2. **US2 Map View** (T030-T044): Required for US3, 8-12 hours
3. **US3 Trip Planner** (T045-T058): Depends on US2, 10-14 hours
4. **Navigation Structure** (T071-T079): 4-6 hours
5. **Build Config** (T090-T110): 6-10 hours

**Total Critical Path**: ~44-62 hours

### Parallel Opportunities

**After Foundation (T020)**, can run in parallel:
- US1: Trip List (T021-T029) - 6-8 hours
- US4: Authentication (T059-T070) - 6-8 hours

**During Build Phase**, can run in parallel:
- Testing (T080-T089) - 6-10 hours
- Store metadata preparation (T103-T106) - 2-3 hours

---

## Implementation Strategy

### Week 1 (Dec 19-25): Setup + Foundation + US1/US2
- Days 1-2: Setup and Foundation (T001-T020)
- Days 3-5: US1 Trip List + US2 Map View in parallel (T021-T044)
- Day 6-7: US3 Trip Planner (T045-T058)

### Week 2 (Dec 26-Jan 1): US3/US4 + Navigation + Testing
- Days 1-2: Complete US3, start US4 Auth (T045-T070)
- Days 3-4: Navigation Structure (T071-T079)
- Days 5-7: Testing suite (T080-T089)

### Week 3 (Jan 2-8): Builds + Store Prep
- Days 1-2: Build configuration (T090-T102)
- Days 3-5: Store metadata, screenshots, policies (T103-T108)
- Days 6-7: Submit to stores (T109-T110)

### Week 4 (Jan 9-15): Polish + Store Review Buffer
- Days 1-3: Polish and optimization (T111-T123)
- Days 4-7: Buffer for store rejections, iterate on feedback

### Target Dates
- **Jan 15, 2026**: Submit to App Store and Google Play
- **Jan 22-28, 2026**: Approval and public launch

---

## Risk Mitigation

### High-Risk Tasks

1. **T030-T032: React Native Maps Configuration** 
   - Risk: Platform-specific build issues
   - Mitigation: Test early on physical devices, follow Expo docs exactly

2. **T059-T064: Google OAuth Integration**
   - Risk: OAuth redirect issues on mobile
   - Mitigation: Use Expo AuthSession (tested pattern), test on real devices only

3. **T097-T098: iOS/Android Signing**
   - Risk: Certificate/keystore issues
   - Mitigation: Apple Developer Program required ($99/year), test EAS Build early

4. **T109-T110: App Store Submissions**
   - Risk: Rejection (40% first-time rejection rate)
   - Mitigation: 1-week buffer, common issues: privacy policy, permissions justification

### Blockers

- **Apple Developer Program**: Required for iOS build ($99/year, 24-48hr approval)
- **Google Play Developer**: Required for Android ($25 one-time, instant)
- **Physical Devices**: iOS/Android devices needed for OAuth testing (Simulators don't support full OAuth)

---

## Acceptance Criteria (Milestone 1.5 Complete)

- [ ] Mobile app runs on iOS and Android physical devices
- [ ] User can view trip list, tap to see trip on map
- [ ] User can create new trip, add stops, calculate route, save
- [ ] User can log in with Google OAuth, view profile, log out
- [ ] Bottom tab navigation works across all screens
- [ ] App submitted to App Store (TestFlight) and Google Play (internal testing)
- [ ] Test coverage >70% (if testing phase included)
- [ ] Performance meets targets: <3s startup, 60 FPS, <200MB memory
- [ ] Offline support: Cached trips viewable without network
- [ ] Accessibility: VoiceOver/TalkBack labels on key UI elements

---

## Post-Milestone Tasks (Not Blocking Launch)

These can be deferred to Milestone 2 (Pre-Launch Quality):

- [ ] Add image upload for trips (Issue #15)
- [ ] Implement AI trip generation (Issue #14)
- [ ] Add POI search along route (Explore screen)
- [ ] Implement offline route calculation
- [ ] Add push notifications for trip reminders
- [ ] Implement trip sharing via deep links
- [ ] Add social features (like/comment on public trips)

---

## Related Documentation

- **Constitution**: `.specify/memory/constitution.md` - Mobile development standards
- **Roadmap**: `ROADMAP.md` - Milestone 1.5 context
- **Web Project**: `PROJECT_INSTRUCTIONS.md` - Backend API reference
- **BFF Architecture**: `docs/adr/001-bff-architecture-strategy.md` - Backend integration pattern

---

**Total Tasks**: 123  
**Estimated Hours**: 50-70 (conservative estimate with buffers)  
**Target Completion**: January 22, 2026  
**Store Approval**: By January 28, 2026
