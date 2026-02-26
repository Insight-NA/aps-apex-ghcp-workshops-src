#!/bin/bash
# GitHub Project Setup Script for Road Trip Planner
# Run with: bash setup-github-project.sh

REPO="hlucianojr1/road_tirp_app"

# Step 1: Create Labels
echo "Creating issue labels..."
gh label create "priority:critical" --color "d73a4a" --description "Must fix before production" --repo $REPO || true
gh label create "priority:high" --color "ff9800" --description "Pre-launch requirement" --repo $REPO || true
gh label create "priority:medium" --color "ffc107" --description "Post-launch enhancement" --repo $REPO || true
gh label create "priority:low" --color "4caf50" --description "Future improvement" --repo $REPO || true
gh label create "type:bug" --color "d73a4a" --description "Something isn't working" --repo $REPO || true
gh label create "type:feature" --color "0e8a16" --description "New feature or request" --repo $REPO || true
gh label create "type:testing" --color "1d76db" --description "Testing infrastructure or coverage" --repo $REPO || true
gh label create "type:docs" --color "0075ca" --description "Documentation improvements" --repo $REPO || true
gh label create "type:security" --color "d93f0b" --description "Security vulnerability or hardening" --repo $REPO || true
gh label create "type:a11y" --color "5319e7" --description "Accessibility improvements" --repo $REPO || true
gh label create "type:refactor" --color "fbca04" --description "Code refactoring" --repo $REPO || true
gh label create "type:infra" --color "0052cc" --description "Infrastructure or deployment" --repo $REPO || true
gh label create "status:blocked" --color "000000" --description "Blocked by dependencies" --repo $REPO || true

# Step 2: Create Milestones
echo "Creating milestones..."
gh api repos/$REPO/milestones -f title="Production Ready" -f description="Critical issues blocking production deployment (29-36 hours)" -f due_on="2025-12-18T23:59:59Z"
gh api repos/$REPO/milestones -f title="Pre-Launch Quality" -f description="High priority issues for launch quality (36-48 hours)" -f due_on="2026-01-08T23:59:59Z"
gh api repos/$REPO/milestones -f title="Post-Launch Enhancement" -f description="Medium priority enhancements (46-66 hours)" -f due_on="2026-02-05T23:59:59Z"
gh api repos/$REPO/milestones -f title="Future Improvements" -f description="Low priority improvements (23-31 hours)" -f due_on="2026-03-05T23:59:59Z"

# Step 3: Create Issues (Critical Priority - Production Ready Milestone)
echo "Creating critical priority issues..."

gh issue create --repo $REPO --title "[Setup] Add Frontend Testing Infrastructure" \
  --label "priority:critical,type:testing" \
  --milestone "Production Ready" \
  --body "## Problem
Frontend has zero test coverage. Vitest mentioned in PROJECT_INSTRUCTIONS.md but not installed in package.json.

**Evidence**: 
- \`frontend/src/store/useTripStore.test.ts\` exists but cannot run
- \`frontend/package.json\` missing: vitest, @testing-library/react, @testing-library/user-event

**Files Affected**: \`frontend/package.json\`, \`frontend/vite.config.ts\`

## Acceptance Criteria
- [ ] Install vitest, @testing-library/react, @testing-library/user-event
- [ ] Configure Vitest in vite.config.ts
- [ ] Verify \`useTripStore.test.ts\` runs successfully
- [ ] Add npm test script to package.json
- [ ] Document test commands in frontend/README.md
- [ ] Add 2-3 example component tests

**Estimate**: 4-6 hours"

gh issue create --repo $REPO --title "[TypeScript] Fix Type Safety Violations - Remove All 'any' Types" \
  --label "priority:critical,type:refactor" \
  --milestone "Production Ready" \
  --body "## Problem
20 instances of \`any\` type violate coding standards: \"No \`any\` types allowed\"

**Key Violations**:
- \`frontend/src/components/FloatingPanel.tsx\` line 27: any props
- \`frontend/src/components/MapComponent.tsx\` line 32: any event handlers
- \`frontend/src/views/ExploreView.tsx\` line 35: any[] for trips

**Missing**: \`frontend/src/types/\` directory doesn't exist (documented in .github/copilot-instructions.md line 65)

## Acceptance Criteria
- [ ] Create \`frontend/src/types/\` directory
- [ ] Define interfaces: Route, Leg, Feature, Stop, Vehicle, Trip, POI
- [ ] Replace all 20 \`any\` types with proper interfaces
- [ ] Enable \`\"strict\": true\` in tsconfig.json
- [ ] Fix all resulting type errors
- [ ] No TypeScript errors in build output

**Estimate**: 8-10 hours
**Dependencies**: None"

gh issue create --repo $REPO --title "[Security] Remove Hardcoded API Tokens and Create .env.example Files" \
  --label "priority:critical,type:security" \
  --milestone "Production Ready" \
  --body "## Problem
**CRITICAL SECURITY ISSUE**: Mapbox token hardcoded in docker-compose.yml lines 3-5

**Evidence**:
\\\`\\\`\\\`yaml
# NOTE: The token below is a structurally valid fake token used for training purposes only.
VITE_MAPBOX_TOKEN: pk.eyJ1IjoiZXhhbXBsZS11c2VyIiwiYSI6ImV4YW1wbGVrZXkxMjM0NTY3ODkwIn0.SomeValidLookingSignature

**Missing**: No .env.example files in frontend/ or backend/

## Acceptance Criteria
- [ ] Remove hardcoded token from docker-compose.yml
- [ ] Update docker-compose.yml to use \\\${VITE_MAPBOX_TOKEN}
- [ ] Create \`frontend/.env.example\` with all VITE_* variables
- [ ] Create \`backend/.env.example\` with all backend variables
- [ ] Document required variables in PROJECT_INSTRUCTIONS.md
- [ ] Update README.md with environment setup instructions
- [ ] Verify deployment scripts use environment variables only

**Estimate**: 2 hours
**Dependencies**: None"

gh issue create --repo $REPO --title "[Testing] Add Backend API Mocking for External Services" \
  --label "priority:critical,type:testing" \
  --milestone "Production Ready" \
  --body "## Problem
Backend tests hit real external APIs (Mapbox, Gemini, Azure Maps). CI pipeline has \`continueOnError: true\` to ignore failures.

**Evidence**: 
- \`.github/workflows/backend.yml\` line 52: continueOnError allows test failures
- \`backend/tests/\` has no fixtures for HTTP mocking

**Files Affected**: \`backend/tests/test_main.py\`, \`backend/tests/test_trips.py\`

## Acceptance Criteria
- [ ] Install pytest-httpx or responses library
- [ ] Create fixtures for Mapbox Directions API responses
- [ ] Create fixtures for Gemini AI responses
- [ ] Create fixtures for Azure Maps responses
- [ ] Update test_main.py to use mocked responses
- [ ] Update test_trips.py to use mocked responses
- [ ] Remove \`continueOnError: true\` from backend.yml
- [ ] All tests pass in CI without external API calls

**Estimate**: 6-8 hours
**Dependencies**: None"

gh issue create --repo $REPO --title "[Bug] Store Route GeoJSON in Database When Saving Trips" \
  --label "priority:critical,type:bug" \
  --milestone "Production Ready" \
  --body "## Problem
When trips are saved, the calculated route geometry is not persisted. Loading a saved trip shows stops but no route line on the map.

**Evidence**:
- \`backend/schemas.py\` TripCreate schema missing \`route_geojson\` field
- \`frontend/src/components/FloatingPanel.tsx\` line 319 calculates distance but doesn't save route
- \`backend/models.py\` Trip model has no route_geojson column

## Acceptance Criteria
- [ ] Add \`route_geojson\` column to Trip model (JSON type)
- [ ] Create Alembic migration: \`alembic revision -m \"Add route_geojson to trips\"\`
- [ ] Update TripCreate and TripResponse schemas to include route_geojson
- [ ] Update FloatingPanel.tsx save logic to include routeGeoJSON from store
- [ ] Update trip load logic to restore route on map
- [ ] Test: Save trip → reload page → route displays correctly
- [ ] Run migration in Azure: \`alembic upgrade head\`

**Estimate**: 3-4 hours
**Dependencies**: None"

# Step 3: Create Issues (High Priority - Pre-Launch Quality Milestone)
echo "Creating high priority issues..."

gh issue create --repo $REPO --title "[Feature] Implement Vehicle-Aware Routing with Mapbox Truck Profile" \
  --label "priority:high,type:feature" \
  --milestone "Pre-Launch Quality" \
  --body "## Problem
Marketing mentions \"vehicle-aware routing\" but vehicle dimensions are collected and never used. All routes use Mapbox car profile.

**Evidence**: 
- \`backend/main.py\` /api/directions endpoint doesn't pass vehicle specs to Mapbox
- Mapbox Directions API supports \`driving-traffic\`, \`driving\`, \`walking\`, \`cycling\`, \`truck\` profiles
- Vehicle height/weight/width stored but not utilized

## Acceptance Criteria
- [ ] Research Mapbox Directions API truck profile parameters
- [ ] Add vehicle_type parameter to /api/directions endpoint
- [ ] Map vehicle specs to Mapbox truck restrictions (height, weight, hazmat)
- [ ] Update frontend to pass vehicle type in route request
- [ ] Add UI indicator: \"Route safe for {vehicle_type}\"
- [ ] Test with RV (height restriction) vs car route differences
- [ ] Document limitations in PROJECT_INSTRUCTIONS.md

**Estimate**: 6-8 hours
**Dependencies**: Issue #5 (route storage)"

gh issue create --repo $REPO --title "[A11y] Add WCAG AA Accessibility Compliance" \
  --label "priority:high,type:a11y" \
  --milestone "Pre-Launch Quality" \
  --body "## Problem
Zero accessibility attributes found in codebase. WCAG AA compliance documented in PROJECT_INSTRUCTIONS.md but not implemented.

**Evidence**:
- No \`aria-label\` attributes found
- No \`role=\` attributes found
- Icon-only buttons missing labels
- No keyboard navigation testing

**Legal Risk**: Section 508 compliance required for government use

## Acceptance Criteria
- [ ] Install @axe-core/react for development
- [ ] Audit all pages with axe DevTools
- [ ] Add aria-label to all icon-only buttons
- [ ] Ensure all interactive elements keyboard accessible
- [ ] Add focus indicators (visible outline on tab)
- [ ] Test with VoiceOver (Mac) or NVDA (Windows)
- [ ] Add skip-to-content link
- [ ] Document a11y patterns in PROJECT_INSTRUCTIONS.md
- [ ] Pass WAVE accessibility checker

**Estimate**: 10-12 hours
**Dependencies**: None"

gh issue create --repo $REPO --title "[Monitoring] Configure Azure Application Insights and Structured Logging" \
  --label "priority:high,type:infra" \
  --milestone "Pre-Launch Quality" \
  --body "## Problem
No production monitoring. Backend uses print() statements instead of structured logging. No error tracking for frontend.

**Evidence**:
- \`backend/main.py\` has print(\"WARNING: SECRET_KEY not set...\")
- 12 console.log() instances in frontend production code
- No Application Insights SDK installed

## Acceptance Criteria
- [ ] Create Azure Application Insights resource
- [ ] Install applicationinsights in backend/requirements.txt
- [ ] Replace print() with logging.info/warning/error
- [ ] Add Application Insights JS SDK to frontend
- [ ] Configure custom events for route calculations
- [ ] Set up alert rules: 500 errors > 5/min, avg response time > 3s
- [ ] Create Azure Dashboard with key metrics
- [ ] Test error tracking: trigger error → verify in App Insights
- [ ] Document monitoring in AZURE_DEPLOYMENT.md

**Estimate**: 4-6 hours
**Dependencies**: None"

gh issue create --repo $REPO --title "[Docs] Create Interactive API Documentation with Examples" \
  --label "priority:high,type:docs" \
  --milestone "Pre-Launch Quality" \
  --body "## Problem
FastAPI auto-generates /docs but lacks customization, examples, and authentication documentation.

**Current State**: Basic Swagger UI at /docs with minimal descriptions

## Acceptance Criteria
- [ ] Add docstrings to all route handlers with param descriptions
- [ ] Add request/response examples to Pydantic schemas
- [ ] Document authentication flow (Google OAuth → JWT)
- [ ] Add \"Try it out\" examples for public endpoints
- [ ] Configure Swagger UI title, description, version
- [ ] Add API versioning strategy (e.g., /api/v1/)
- [ ] Document rate limits (when implemented)
- [ ] Add Redoc alternative view at /redoc
- [ ] Link to API docs from PROJECT_INSTRUCTIONS.md

**Estimate**: 4-6 hours
**Dependencies**: None"

gh issue create --repo $REPO --title "[Security] Implement JWT Refresh Token Flow" \
  --label "priority:high,type:security" \
  --milestone "Pre-Launch Quality" \
  --body "## Problem
JWT tokens expire after 15 minutes (backend/auth.py line 35). No refresh mechanism = users logged out mid-session.

**Current Behavior**: User must re-authenticate every 15 minutes

## Acceptance Criteria
- [ ] Add refresh_token column to User model (hashed)
- [ ] Create /auth/refresh endpoint
- [ ] Return both access_token (15min) and refresh_token (7 days) on login
- [ ] Frontend stores refresh_token in httpOnly cookie
- [ ] Implement token refresh interceptor in axios
- [ ] Auto-refresh access_token when expired (using refresh_token)
- [ ] Revoke refresh_token on logout
- [ ] Add refresh_token rotation (issue new on each use)
- [ ] Test: Wait 16 minutes → verify auto-refresh works

**Estimate**: 6-8 hours
**Dependencies**: None"

# Step 3: Create Issues (Medium Priority - Post-Launch Enhancement Milestone)
echo "Creating medium priority issues..."

gh issue create --repo $REPO --title "[Performance] Optimize POI Search with Batching and Caching" \
  --label "priority:medium,type:feature" \
  --milestone "Post-Launch Enhancement" \
  --body "## Problem
POI search makes 10 parallel API calls to Azure Maps (one per route sample point). Risk of rate limits and slow response.

**Evidence**: 
- \`backend/main.py\` line 244-249: samples 10 points along route
- Comment line 237: \"In production, you'd optimize this...\"

## Acceptance Criteria
- [ ] Research Azure Maps batch API endpoints
- [ ] Implement batching: single request for multiple points
- [ ] Add Redis caching layer (Azure Cache for Redis)
- [ ] Cache POI results by location hash (50km radius)
- [ ] Set TTL: 24 hours for POI data
- [ ] Add debouncing: wait 500ms after last stop change
- [ ] Monitor: compare before/after API call volume
- [ ] Document caching strategy in PROJECT_INSTRUCTIONS.md

**Estimate**: 6-8 hours
**Dependencies**: None"

gh issue create --repo $REPO --title "[Feature] Add Image Upload for Public Trips with Azure Blob Storage" \
  --label "priority:medium,type:feature" \
  --milestone "Post-Launch Enhancement" \
  --body "## Problem
Trip image_url field exists in database but no upload interface. Currently uses hardcoded Unsplash URLs.

**Evidence**:
- \`backend/models.py\` has image_url column
- \`frontend/src/views/AllTripsView.tsx\` displays images
- No upload UI in FloatingPanel save section

## Acceptance Criteria
- [ ] Create Azure Blob Storage account (or use existing)
- [ ] Add azure-storage-blob to requirements.txt
- [ ] Create /api/upload endpoint (max 5MB, jpg/png only)
- [ ] Generate SAS token for upload
- [ ] Add image upload component in FloatingPanel
- [ ] Implement client-side image compression (max 1920x1080)
- [ ] Update Trip schema to save blob URL
- [ ] Add image preview before upload
- [ ] Set blob lifecycle policy: delete after 90 days if trip deleted
- [ ] Test: Upload → save trip → reload → image displays

**Estimate**: 8-10 hours
**Dependencies**: None"

gh issue create --repo $REPO --title "[Testing] Add End-to-End Tests with Playwright" \
  --label "priority:medium,type:testing" \
  --milestone "Post-Launch Enhancement" \
  --body "## Problem
No E2E tests for critical user flows. Manual testing required for each deployment.

**Risk**: Regressions in core functionality (route calculation, trip save/load)

## Acceptance Criteria
- [ ] Install Playwright (@playwright/test)
- [ ] Configure playwright.config.ts (Chrome, Firefox, Safari)
- [ ] Write test: Create trip → add 3 stops → calculate route → save
- [ ] Write test: Load saved trip → verify stops and route display
- [ ] Write test: Search POIs → add to trip → verify marker
- [ ] Write test: Google login flow (with test account)
- [ ] Add to CI pipeline (.github/workflows/e2e.yml)
- [ ] Generate HTML test reports
- [ ] Document test commands in README.md

**Estimate**: 12-16 hours
**Dependencies**: Issue #1 (test infrastructure)"

gh issue create --repo $REPO --title "[Infra] Configure Auto-Scaling for Azure App Service" \
  --label "priority:medium,type:infra" \
  --milestone "Post-Launch Enhancement" \
  --body "## Problem
Single B1 App Service instance cannot handle traffic spikes. No auto-scaling configured.

**Evidence**: \`deploy-azure.sh\` creates fixed B1 SKU

## Acceptance Criteria
- [ ] Define scaling rules: CPU > 70% for 5min → scale out
- [ ] Set max instances: 5 (cost control)
- [ ] Set min instances: 1 (cost optimization)
- [ ] Configure scale-in delay: 10 minutes
- [ ] Add Application Gateway for load balancing
- [ ] Test: Run load test (Apache Bench) → verify scale-out
- [ ] Monitor: Check metrics after scale event
- [ ] Document scaling rules in AZURE_DEPLOYMENT.md
- [ ] Set up budget alert: >\$100/month

**Estimate**: 6-8 hours
**Dependencies**: Issue #8 (Application Insights for metrics)"

gh issue create --repo $REPO --title "[Feature] Implement AI Trip Generation with Google Gemini" \
  --label "priority:medium,type:feature" \
  --milestone "Post-Launch Enhancement" \
  --body "## Problem
\"AI Trip Planner\" button exists in StartTripView (line 43-56) but navigates to blank itinerary. No AI generation logic.

**Vision**: User enters \"3-day trip from SF to LA\" → AI generates stops and route

## Acceptance Criteria
- [ ] Design prompt template for Gemini: \"Generate {duration} road trip from {start} to {destination} with {interests}\"
- [ ] Create /api/ai/generate-trip endpoint
- [ ] Parse AI response to extract locations (geocode with Azure Maps)
- [ ] Create UI modal: duration, interests, preferences
- [ ] Handle AI errors gracefully (fallback to manual)
- [ ] Add loading state with progress indicator
- [ ] Validate AI output (ensure valid coordinates)
- [ ] Test with 5 different prompt types
- [ ] Document AI features in PROJECT_INSTRUCTIONS.md

**Estimate**: 12-16 hours
**Dependencies**: Issue #2 (TypeScript types for AI responses)"

# Step 3: Create Issues (Low Priority - Future Improvements Milestone)
echo "Creating low priority issues..."

gh issue create --repo $REPO --title "[DX] Add Pre-commit Hooks with Husky and lint-staged" \
  --label "priority:low,type:refactor" \
  --milestone "Future Improvements" \
  --body "## Problem
No automated checks before commit. Broken code can be pushed to main branch.

## Acceptance Criteria
- [ ] Install husky and lint-staged
- [ ] Configure pre-commit hook: run ESLint on staged files
- [ ] Configure pre-commit hook: run TypeScript type check
- [ ] Configure pre-commit hook: run Prettier formatting
- [ ] Add commit-msg hook: enforce conventional commits
- [ ] Add pre-push hook: run tests
- [ ] Document in CONTRIBUTING.md
- [ ] Test: Try to commit broken code → verify rejection

**Estimate**: 2-3 hours
**Dependencies**: Issue #1 (test infrastructure)"

gh issue create --repo $REPO --title "[Docs] Create Architecture Diagrams with Mermaid" \
  --label "priority:low,type:docs" \
  --milestone "Future Improvements" \
  --body "## Problem
Text-based architecture description in PROJECT_INSTRUCTIONS.md (lines 417-428). No visual diagrams.

## Acceptance Criteria
- [ ] Create system architecture diagram (frontend, backend, Azure services)
- [ ] Create component hierarchy diagram (React components)
- [ ] Create data flow diagram (user action → API → database → UI)
- [ ] Create authentication flow diagram (OAuth → JWT)
- [ ] Create deployment pipeline diagram (GitHub → Azure)
- [ ] Embed Mermaid diagrams in PROJECT_INSTRUCTIONS.md
- [ ] Export PNG versions to docs_archive/images/
- [ ] Verify diagrams render on GitHub

**Estimate**: 4-6 hours
**Dependencies**: None"

gh issue create --repo $REPO --title "[Feature] Configure Custom Domain and SSL Certificate" \
  --label "priority:low,type:infra" \
  --milestone "Future Improvements" \
  --body "## Problem
App uses default Azure domains: roadtrip-frontend-hl.azurestaticapps.net and roadtrip-api-hl.azurewebsites.net

## Acceptance Criteria
- [ ] Purchase domain (e.g., roadtrip.app) or use existing
- [ ] Configure CNAME: www → Static Web App
- [ ] Configure CNAME: api → App Service
- [ ] Add custom domain in Azure Portal
- [ ] Provision free SSL certificate (Azure managed)
- [ ] Update CORS settings with new domain
- [ ] Update ALLOWED_ORIGINS environment variable
- [ ] Test HTTPS: verify certificate valid
- [ ] Set up DNS redirect: apex → www
- [ ] Document in AZURE_DEPLOYMENT.md

**Estimate**: 3-4 hours
**Dependencies**: None"

gh issue create --repo $REPO --title "[Feature] Implement Quick Start Templates with Pre-populated Data" \
  --label "priority:low,type:feature" \
  --milestone "Future Improvements" \
  --body "## Problem
Quick Start template buttons exist in StartTripView (lines 60-84) but don't populate any data.

**Vision**: Click \"Weekend Getaway\" → pre-filled 2-day trip with sample stops

## Acceptance Criteria
- [ ] Define 4 template data structures: Weekend Getaway, Cross Country, Coastal Drive, National Parks
- [ ] Create /api/templates endpoint (returns template JSON)
- [ ] Each template includes: stops, vehicle type, duration, description
- [ ] Update StartTripView to load template on click
- [ ] Populate useTripStore with template data
- [ ] Navigate to itinerary with template loaded
- [ ] Add \"Customize\" prompt to edit template
- [ ] Test all 4 templates
- [ ] Document template format in PROJECT_INSTRUCTIONS.md

**Estimate**: 8-10 hours
**Dependencies**: Issue #2 (TypeScript types)"

gh issue create --repo $REPO --title "[Refactor] Extract Duplicate Code into Utility Functions" \
  --label "priority:low,type:refactor" \
  --milestone "Future Improvements" \
  --body "## Problem
Code duplication found in multiple files:

**1. Default Image Logic**: Repeated in AllTripsView.tsx and ExploreView.tsx (same Unsplash URLs)
**2. Token Retrieval**: \`localStorage.getItem('token')\` repeated 10+ times across components

## Acceptance Criteria
- [ ] Create \`frontend/src/utils/images.ts\` with getDefaultTripImage()
- [ ] Create \`frontend/src/hooks/useAuth.ts\` with token retrieval
- [ ] Replace all instances of duplicate image logic
- [ ] Replace all instances of localStorage.getItem('token')
- [ ] Add JSDoc comments to utility functions
- [ ] Write unit tests for new utilities
- [ ] Verify no functionality broken
- [ ] Document patterns in PROJECT_INSTRUCTIONS.md

**Estimate**: 6-8 hours
**Dependencies**: Issue #1 (test infrastructure for unit tests)"

# Step 4: Get the Project ID
echo "Fetching project ID for '@hlucianojr1's Demo Project'..."
PROJECT_ID=$(gh project list --owner hlucianojr1 --format json | jq -r '.projects[] | select(.title=="@hlucianojr1'\''s Demo Project") | .number')

if [ -z "$PROJECT_ID" ]; then
  echo "Project not found. Creating new project..."
  gh project create --owner hlucianojr1 --title "@hlucianojr1's Demo Project"
  PROJECT_ID=$(gh project list --owner hlucianojr1 --format json | jq -r '.projects[] | select(.title=="@hlucianojr1'\''s Demo Project") | .number')
fi

echo "Project ID: $PROJECT_ID"

# Step 5: Link all issues to project (requires GitHub CLI v2.40+)
echo "Linking issues to project..."
ISSUE_NUMBERS=$(gh issue list --repo $REPO --limit 100 --json number --jq '.[].number')
for ISSUE_NUM in $ISSUE_NUMBERS; do
  gh project item-add $PROJECT_ID --owner hlucianojr1 --url "https://github.com/$REPO/issues/$ISSUE_NUM"
done

echo "✅ GitHub Project setup complete!"
echo ""
echo "Next steps:"
echo "1. Visit https://github.com/users/hlucianojr1/projects/$PROJECT_ID"
echo "2. Create custom views: Sprint Backlog, By Type, Timeline, Blocked Items"
echo "3. Configure project automation in Settings"
echo "4. Start sprint planning with issues 1-5 (Production Ready milestone)"
