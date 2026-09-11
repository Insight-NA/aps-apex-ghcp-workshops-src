# Road Trip Planner - Mobile App (React Native)

Mobile application for the Road Trip Planner built with React Native and Expo.

## Features

- 🗺️ **Interactive Trip Planning** - Add stops, calculate routes, view on map
- 🚗 **Vehicle-Aware Routing** - Specify vehicle type and dimensions for safe routing
- 💾 **Trip Management** - Save and load trips with cloud sync
- 🔐 **Google OAuth Authentication** - Secure login with Google account
- 📱 **Cross-Platform** - Works on iOS and Android

## Prerequisites

- Node.js 18+ and npm
- Expo CLI: `npm install -g expo-cli`
- iOS Simulator (macOS) or Android Emulator
- Backend API running (see `../backend/README.md`)

## Setup

### 1. Install Dependencies

```bash
cd mobile
npm install
```

### 2. Configure Environment Variables

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
# Backend API
VITE_API_URL=http://localhost:8000  # or your Azure backend URL

# Google OAuth (get from https://console.cloud.google.com/apis/credentials)
EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID=your-expo-client-id
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your-android-client-id
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id

# Google Maps (get from https://console.cloud.google.com/google/maps-apis)
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# Mapbox (get from https://account.mapbox.com/access-tokens/)
EXPO_PUBLIC_MAPBOX_TOKEN=your-mapbox-token
```

### 3. Update Google Maps API Key in app.json

Edit `app.json` and replace the placeholder with your actual key:

```json
{
  "expo": {
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "your-actual-google-maps-api-key"
        }
      }
    }
  }
}
```

### 4. Configure Firebase (google-services.json)

`google-services.json` contains project-specific keys and is **git-ignored** — it must never be committed.

1. Copy the sample file:
   ```bash
   cp google-services.json.example google-services.json
   ```
2. Go to your [Firebase Console](https://console.firebase.google.com/) project settings, download the real `google-services.json` for your Android app, and replace the copied file with it.
3. If you don't have a Firebase project yet, create one and register the Android app with package name `com.hlucianojr.roadtrip`.

### 5. Configure Google OAuth

#### Create OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 Client IDs for:
   - **iOS**: iOS application type
   - **Android**: Android application type (use package name: `com.roadtrip.app`)
   - **Expo**: Web application type with redirect URI: `https://auth.expo.io/@your-expo-username/road-trip-planner`
   - **Web**: Web application type (for backend verification)

#### Add Redirect URI Scheme

The app uses `roadtrip://` as the OAuth redirect scheme. This is configured in `app.json`:

```json
{
  "expo": {
    "scheme": "roadtrip"
  }
}
```

## Development

### Start Development Server

```bash
npm start
```

This opens the Expo DevTools in your browser. You can then:

- Press `i` to open iOS Simulator
- Press `a` to open Android Emulator
- Scan QR code with Expo Go app on your physical device

### Run on iOS Simulator (macOS only)

```bash
npm run ios
```

### Run on Android Emulator

```bash
npm run android
```

### Run on Physical Device

1. Install **Expo Go** from App Store (iOS) or Play Store (Android)
2. Scan the QR code from `npm start`

## Project Structure

```
mobile/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── AddStopModal.tsx
│   │   ├── ErrorBoundary.tsx
│   │   ├── MapComponent.tsx
│   │   ├── TripCard.tsx
│   │   └── VehiclePickerModal.tsx
│   ├── navigation/        # Navigation setup
│   │   ├── AppNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   └── RootNavigator.tsx
│   ├── screens/          # Screen components
│   │   ├── ExploreScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   ├── TripDetailScreen.tsx
│   │   ├── TripListScreen.tsx
│   │   └── TripPlannerScreen.tsx
│   ├── services/         # API client
│   │   └── api.ts
│   ├── store/           # Zustand state management
│   │   ├── useAuthStore.ts
│   │   └── useTripStore.ts
│   ├── types/           # TypeScript types
│   │   ├── navigation.ts
│   │   ├── POI.ts
│   │   ├── Route.ts
│   │   ├── Stop.ts
│   │   ├── Trip.ts
│   │   └── Vehicle.ts
│   └── utils/           # Utility functions
│       └── auth.ts
├── app.json             # Expo configuration
├── package.json
└── tsconfig.json
```

## Key Features Implementation

### Authentication Flow

1. User taps "Sign in with Google" on LoginScreen
2. expo-auth-session opens Google OAuth in browser
3. User authorizes app and returns with access token
4. App sends token to backend `/auth/google` endpoint
5. Backend validates with Google and returns JWT
6. App stores JWT in AsyncStorage via useAuthStore
7. RootNavigator switches to AppNavigator

### Trip Planning Flow

1. User navigates to TripPlannerScreen
2. Adds stops via AddStopModal (searches backend `/api/search-places`)
3. Optionally selects vehicle type via VehiclePickerModal
4. Taps "Calculate Route" → calls `/api/directions` with stops and vehicle specs
5. App displays route on map and shows distance/duration
6. User taps "Save" → calls `/api/trips` to persist trip
7. Trip appears in TripListScreen

### Map Display

- Uses React Native Maps with Google Maps (Android) or Apple Maps (iOS)
- Renders route polyline from GeoJSON coordinates
- Shows color-coded markers: green (start), blue (stop), red (end)
- Auto-fits bounds to show entire route

## Testing

### Run Tests

```bash
npm test
```

### Test Coverage

```bash
npm run test:coverage
```

## Building for Production

### Configure EAS Build

```bash
npm install -g eas-cli
eas login
eas build:configure
```

### Build for iOS

```bash
eas build --platform ios
```

### Build for Android

```bash
eas build --platform android
```

## Troubleshooting

### "Cannot connect to backend"

- Ensure backend is running: `cd ../backend && uvicorn main:app --reload`
- Check `VITE_API_URL` in `.env` matches backend URL
- For physical device, use your computer's IP instead of `localhost`

### "Google Sign In Failed"

- Verify all Google OAuth Client IDs are set in `.env`
- Check redirect URI scheme matches `app.json` (should be `roadtrip://`)
- Ensure backend can verify Google tokens (needs `GOOGLE_CLIENT_ID` env var)

### "Maps not displaying on Android"

- Replace placeholder Google Maps API key in `app.json`
- Enable Maps SDK for Android in Google Cloud Console
- Rebuild app after changing `app.json`

### "Module not found" errors

```bash
npm install
npx expo start --clear
```

## Contributing

See main project `PROJECT_INSTRUCTIONS.md` for development guidelines.

## Status

**Current Implementation**: ~40% complete (MVP Phase 1-4 done)

### ✅ Completed
- Project setup and dependencies
- Navigation structure (tabs + stack)
- Authentication state management (useAuthStore)
- Trip state management (useTripStore)
- Google OAuth login
- Trip list and detail screens
- Map display with route polylines
- Trip planner with stop management
- Route calculation
- Vehicle type picker

### 🚧 In Progress
- Explore screen (POI discovery)
- Testing infrastructure

### ⏳ Planned
- EAS Build configuration
- App icons and splash screens
- Store submission

For detailed roadmap, see `../ROADMAP.md` Milestone 1.5 (Mobile MVP).

## License

See main project LICENSE file.


## Run

Backend 
cd /Users/hluciano/projects/road_trip_app
docker compose up backend

To start (or restart) the backend only:
docker compose up -d --build backend
To just restart without rebuilding:
docker compose restart backend
To see logs:
docker compose logs -f backend


cd /Users/hluciano/projects/road_trip_app/mobile
npm install (if needed)
npm run ios (or npm start / npx expo start --ios)