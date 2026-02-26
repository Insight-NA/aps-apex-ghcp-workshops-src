# Azure Testing Services Implementation - Agent Prompt

> **Run this prompt with**: `@speckit.implement` or `@Plan` agent
> **Estimated Duration**: 2-3 hours
> **Branch**: Create `feature/azure-testing-services` from `ui_updates`

---

## Objective

Implement comprehensive Azure Testing Services for the Road Trip Planner application. This includes:
1. Adding Issues #29 and #30 to ROADMAP.md
2. Creating JSON-driven test configuration
3. Building Terraform testing module
4. Expanding backend and frontend test coverage
5. Configuring Playwright E2E tests
6. Hardening CI/CD pipelines

---

## Task 1: Update ROADMAP.md with Issues #29 and #30

### Location
File: `/Users/hluciano/projects/road_trip_app/ROADMAP.md`

### Issue #29: Azure Testing Services Implementation
Add to **Milestone 2: Pre-Launch Quality** section (after Issue #10).

```markdown
### Issue #29: Azure Testing Services Implementation
- **Labels**: `priority:high`, `type:testing`, `type:infra`
- **Estimate**: 16-24 hours
- **Problem**: No comprehensive test infrastructure. CI pipelines allow test failures (`continueOnError: true`). 12 API endpoints and 11 frontend components lack tests. No E2E testing. No JSON-driven configuration for test environments.
- **Evidence**:
  - `backend/tests/` has only 4 test files covering ~50 tests
  - `.github/workflows/backend.yml` line 44: `continue-on-error: true`
  - `azure-pipelines.yml` line 51: `continueOnError: true`
  - No Playwright config despite `@playwright/test` in package.json
  - No `test-config/` directory for environment-specific test settings
- **Acceptance Criteria**:
  - [ ] Create `test-config/` directory with JSON schema and environment configs
  - [ ] Create `test-config/test-config.schema.json` for validation
  - [ ] Create `test-config/ci.json` for GitHub Actions/Azure DevOps
  - [ ] Create `test-config/dev.json` for local development
  - [ ] Create `test-config/integration.json` for integration testing
  - [ ] Create Terraform `modules/testing/` with Azure Load Testing, test database, test storage
  - [ ] Add backend tests for `/health` and `/api/health` endpoints
  - [ ] Add backend tests for all 4 auth endpoints (`google`, `guest`, `refresh`, `logout`)
  - [ ] Add backend tests for API proxies (`geocode`, `directions`, `search`, `optimize`)
  - [ ] Add backend tests for trip CRUD (`PUT /api/trips/{id}`, `DELETE`, `GET /api/public-trips`)
  - [ ] Add pytest-httpx fixtures for mocking Mapbox, Azure Maps, Gemini APIs
  - [ ] Add frontend tests for `FloatingPanel`, `MapComponent`, `AuthStatus` components
  - [ ] Add frontend tests for all 5 views (`AllTripsView`, `ExploreView`, `ItineraryView`, `StartTripView`, `TripsView`)
  - [ ] Add frontend tests for utilities (`offlineStorage`, `syncManager`, `useOnlineStatus`)
  - [ ] Create `frontend/playwright.config.ts` with settings from JSON config
  - [ ] Create `frontend/e2e/` directory with critical flow tests
  - [ ] Write E2E test: Create trip → add stops → calculate route → save
  - [ ] Write E2E test: Load saved trip → verify stops and route display
  - [ ] Write E2E test: Authentication flow (Google login mock)
  - [ ] Update `.github/workflows/backend.yml` to read from `test-config/ci.json`
  - [ ] Update `.github/workflows/backend.yml` to use PostgreSQL service container
  - [ ] Remove `continue-on-error: true` from `.github/workflows/backend.yml`
  - [ ] Add frontend test stage to `.github/workflows/frontend.yml`
  - [ ] Update `azure-pipelines.yml` to read from JSON config with PowerShell
  - [ ] Remove `continueOnError: true` from `azure-pipelines.yml`
  - [ ] Add E2E test stage to CI pipelines
  - [ ] Enforce 80% coverage threshold for backend (fail CI if below)
  - [ ] Document test configuration in `test-config/README.md`
- **Dependencies**: Issue #1 (Frontend Testing Infrastructure) - ✅ COMPLETED
- **Agent Workflow**: `@tdd-red` → `@tdd-green` → `@terraform-azure-planning`
```

### Issue #30: Migrate E2E Tests to Azure Container Instances
Add to **Milestone 3: Post-Launch Enhancement** section (after Issue #15).

```markdown
### Issue #30: Migrate E2E Tests to Azure Container Instances
- **Labels**: `priority:medium`, `type:infra`, `type:testing`
- **Estimate**: 8-12 hours
- **Problem**: GitHub Actions E2E execution will become slow as test suite grows. Need dedicated Azure infrastructure for parallel test execution and user journey tests.
- **Trigger**: Test suite runtime exceeds 10 minutes in CI
- **Acceptance Criteria**:
  - [ ] Enable `enable_test_containers: true` in Terraform testing module
  - [ ] Create Azure Container Instance for Playwright execution
  - [ ] Configure persistent test PostgreSQL database in Azure
  - [ ] Enable Azure Load Testing for endpoint performance baselines
  - [ ] Create JMeter/K6 load test scripts for critical endpoints
  - [ ] Add user journey tests (full trip planning flow with multiple stops)
  - [ ] Configure test artifact storage in Azure Blob
  - [ ] Set up Playwright trace viewer integration
  - [ ] Update CI/CD to trigger Azure Container Instance for E2E
  - [ ] Add performance regression alerts (>20% response time increase)
  - [ ] Document migration in `infrastructure/terraform/modules/testing/README.md`
- **Dependencies**: Issue #29 (Azure Testing Services Implementation)
- **Agent Workflow**: `@terraform-azure-planning` → Manual review → Deploy
```

### Update Summary Table
Update the Milestone 2 and Milestone 3 tables to include the new issues:
- Milestone 2: Add 16-24 hours for Issue #29, update total to 52-72 hours
- Milestone 3: Add 8-12 hours for Issue #30, update total to 58-84 hours

---

## Task 2: Create JSON Test Configuration Structure

### Directory Structure
```
test-config/
├── README.md
├── test-config.schema.json
├── ci.json
├── dev.json
└── integration.json
```

### File: `test-config/test-config.schema.json`
```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Road Trip Planner Test Configuration",
  "type": "object",
  "required": ["environment", "test_suites"],
  "properties": {
    "environment": {
      "type": "string",
      "enum": ["local", "ci", "integration"],
      "description": "Test execution environment"
    },
    "test_suites": {
      "type": "object",
      "properties": {
        "unit": {
          "type": "object",
          "properties": {
            "enabled": { "type": "boolean", "default": true },
            "backend": {
              "type": "object",
              "properties": {
                "enabled": { "type": "boolean", "default": true },
                "markers": { "type": "array", "items": { "type": "string" } },
                "timeout_seconds": { "type": "integer", "default": 60 },
                "parallel": { "type": "boolean", "default": true },
                "coverage_threshold": { "type": "integer", "default": 80 }
              }
            },
            "frontend": {
              "type": "object",
              "properties": {
                "enabled": { "type": "boolean", "default": true },
                "timeout_seconds": { "type": "integer", "default": 60 },
                "coverage_threshold": { "type": "integer", "default": 0 },
                "coverage_enabled": { "type": "boolean", "default": false }
              }
            }
          }
        },
        "integration": {
          "type": "object",
          "properties": {
            "enabled": { "type": "boolean", "default": false },
            "markers": { "type": "array", "items": { "type": "string" } },
            "timeout_seconds": { "type": "integer", "default": 300 },
            "database": {
              "type": "object",
              "properties": {
                "use_service_container": { "type": "boolean", "default": true },
                "connection_string_env": { "type": "string", "default": "TEST_DATABASE_URL" }
              }
            }
          }
        },
        "e2e": {
          "type": "object",
          "properties": {
            "enabled": { "type": "boolean", "default": false },
            "browser": { "type": "string", "enum": ["chromium", "firefox", "webkit"], "default": "chromium" },
            "headless": { "type": "boolean", "default": true },
            "base_url": { "type": "string", "default": "http://localhost:5173" },
            "timeout_seconds": { "type": "integer", "default": 30 },
            "retries": { "type": "integer", "default": 2 },
            "workers": { "type": "integer", "default": 1 }
          }
        }
      }
    },
    "mocking": {
      "type": "object",
      "properties": {
        "mapbox_api": { "type": "boolean", "default": true },
        "gemini_api": { "type": "boolean", "default": true },
        "azure_maps_api": { "type": "boolean", "default": true },
        "google_oauth": { "type": "boolean", "default": true }
      }
    },
    "artifacts": {
      "type": "object",
      "properties": {
        "screenshots_on_failure": { "type": "boolean", "default": true },
        "video_on_failure": { "type": "boolean", "default": false },
        "trace_on_failure": { "type": "boolean", "default": true }
      }
    },
    "tags": {
      "type": "object",
      "additionalProperties": { "type": "string" }
    }
  }
}
```

### File: `test-config/ci.json`
```json
{
  "environment": "ci",
  "test_suites": {
    "unit": {
      "enabled": true,
      "backend": {
        "enabled": true,
        "markers": ["unit", "not slow"],
        "timeout_seconds": 60,
        "parallel": true,
        "coverage_threshold": 80
      },
      "frontend": {
        "enabled": true,
        "timeout_seconds": 60,
        "coverage_threshold": 0,
        "coverage_enabled": false
      }
    },
    "integration": {
      "enabled": true,
      "markers": ["integration"],
      "timeout_seconds": 300,
      "database": {
        "use_service_container": true,
        "connection_string_env": "TEST_DATABASE_URL"
      }
    },
    "e2e": {
      "enabled": true,
      "browser": "chromium",
      "headless": true,
      "base_url": "http://localhost:5173",
      "timeout_seconds": 30,
      "retries": 2,
      "workers": 1
    }
  },
  "mocking": {
    "mapbox_api": true,
    "gemini_api": true,
    "azure_maps_api": true,
    "google_oauth": true
  },
  "artifacts": {
    "screenshots_on_failure": true,
    "video_on_failure": false,
    "trace_on_failure": true
  },
  "tags": {
    "Pipeline": "GitHub Actions",
    "Environment": "CI",
    "ManagedBy": "test-config"
  }
}
```

### File: `test-config/dev.json`
```json
{
  "environment": "local",
  "test_suites": {
    "unit": {
      "enabled": true,
      "backend": {
        "enabled": true,
        "markers": ["unit"],
        "timeout_seconds": 120,
        "parallel": false,
        "coverage_threshold": 0
      },
      "frontend": {
        "enabled": true,
        "timeout_seconds": 120,
        "coverage_threshold": 0,
        "coverage_enabled": false
      }
    },
    "integration": {
      "enabled": false,
      "markers": ["integration"],
      "timeout_seconds": 300,
      "database": {
        "use_service_container": false,
        "connection_string_env": "DATABASE_URL"
      }
    },
    "e2e": {
      "enabled": false,
      "browser": "chromium",
      "headless": false,
      "base_url": "http://localhost:5173",
      "timeout_seconds": 60,
      "retries": 0,
      "workers": 1
    }
  },
  "mocking": {
    "mapbox_api": true,
    "gemini_api": true,
    "azure_maps_api": true,
    "google_oauth": true
  },
  "artifacts": {
    "screenshots_on_failure": true,
    "video_on_failure": true,
    "trace_on_failure": true
  },
  "tags": {
    "Environment": "Development",
    "ManagedBy": "test-config"
  }
}
```

### File: `test-config/integration.json`
```json
{
  "environment": "integration",
  "test_suites": {
    "unit": {
      "enabled": false,
      "backend": {
        "enabled": false,
        "markers": [],
        "timeout_seconds": 60,
        "parallel": true,
        "coverage_threshold": 0
      },
      "frontend": {
        "enabled": false,
        "timeout_seconds": 60,
        "coverage_threshold": 0,
        "coverage_enabled": false
      }
    },
    "integration": {
      "enabled": true,
      "markers": ["integration"],
      "timeout_seconds": 600,
      "database": {
        "use_service_container": false,
        "connection_string_env": "AZURE_TEST_DATABASE_URL"
      }
    },
    "e2e": {
      "enabled": true,
      "browser": "chromium",
      "headless": true,
      "base_url": "https://roadtrip-test.azurestaticapps.net",
      "timeout_seconds": 60,
      "retries": 3,
      "workers": 4
    }
  },
  "mocking": {
    "mapbox_api": false,
    "gemini_api": false,
    "azure_maps_api": false,
    "google_oauth": true
  },
  "artifacts": {
    "screenshots_on_failure": true,
    "video_on_failure": true,
    "trace_on_failure": true
  },
  "tags": {
    "Environment": "Integration",
    "ManagedBy": "test-config"
  }
}
```

### File: `test-config/README.md`
Create a README documenting:
- Purpose of JSON-driven test configuration
- Schema validation process
- How to add new environments
- How CI/CD pipelines consume these configs
- Examples of modifying test behavior

---

## Task 3: Create Terraform Testing Module

### Directory Structure
```
infrastructure/terraform/modules/testing/
├── main.tf
├── variables.tf
├── outputs.tf
└── README.md
```

### Key Resources to Create
1. **Azure Load Testing** (feature-flagged: `enable_load_testing`)
2. **Test PostgreSQL Flexible Server** (feature-flagged: `enable_test_database`)
3. **Test Storage Account** for artifacts (feature-flagged: `enable_test_storage`)
4. **Test Container Instance** for Playwright (feature-flagged: `enable_test_containers`)

### Variables to Support
```hcl
variable "enable_load_testing" {
  type        = bool
  default     = false
  description = "Enable Azure Load Testing resource"
}

variable "enable_test_database" {
  type        = bool
  default     = false
  description = "Enable dedicated test PostgreSQL database"
}

variable "enable_test_storage" {
  type        = bool
  default     = false
  description = "Enable test artifact storage account"
}

variable "enable_test_containers" {
  type        = bool
  default     = false
  description = "Enable Azure Container Instance for E2E tests"
}
```

---

## Task 4: Add Backend Test Coverage

### New Test Files to Create

#### File: `backend/tests/test_health.py`
Test endpoints:
- `GET /health` - basic health check
- `GET /api/health` - detailed health with DB status

#### File: `backend/tests/test_auth.py`
Test endpoints:
- `POST /api/auth/google` - Google OAuth login (mock Google verification)
- `POST /api/auth/guest` - Guest login
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/logout` - Logout and token revocation

#### File: `backend/tests/test_api_proxies.py`
Test endpoints with mocked external APIs:
- `GET /api/geocode` - Mapbox geocoding proxy
- `GET /api/directions` - Mapbox directions proxy
- `GET /api/search` - Azure Maps search proxy
- `GET /api/optimize` - Mapbox optimization proxy

#### File: `backend/tests/test_trips_extended.py`
Extend existing test_trips.py with:
- `PUT /api/trips/{trip_id}` - Update trip
- `DELETE /api/trips/{trip_id}` - Delete trip
- `GET /api/public-trips` - List public trips

#### File: `backend/tests/conftest.py`
Create shared fixtures:
- `mock_mapbox_response` - pytest-httpx fixture for Mapbox API
- `mock_azure_maps_response` - pytest-httpx fixture for Azure Maps
- `mock_gemini_response` - pytest-httpx fixture for Gemini AI
- `mock_google_oauth` - Mock Google OAuth verification
- `test_user` - Authenticated test user fixture
- `test_db` - Test database session fixture

### Install pytest-httpx
Add to `backend/requirements.txt`:
```
pytest-httpx>=0.21.0
```

---

## Task 5: Add Frontend Test Coverage

### Component Tests to Create

#### File: `frontend/src/components/FloatingPanel.test.tsx`
Test:
- Renders with default props
- Stop list displays correctly
- Add stop functionality
- Remove stop functionality
- Save trip button behavior
- Route calculation trigger

#### File: `frontend/src/components/MapComponent.test.tsx`
Test:
- Renders map container
- Displays markers for stops
- Route line renders with GeoJSON

#### File: `frontend/src/components/AuthStatus.test.tsx`
Test:
- Shows login button when not authenticated
- Shows user info when authenticated
- Logout button triggers logout

### View Tests to Create
Create test files for each view in `frontend/src/views/`:
- `AllTripsView.test.tsx`
- `ExploreView.test.tsx`
- `ItineraryView.test.tsx`
- `StartTripView.test.tsx`
- `TripsView.test.tsx`

### Utility Tests to Create
- `frontend/src/utils/offlineStorage.test.ts`
- `frontend/src/utils/syncManager.test.ts`
- `frontend/src/hooks/useOnlineStatus.test.ts`

---

## Task 6: Configure Playwright E2E Tests

### File: `frontend/playwright.config.ts`
```typescript
import { defineConfig, devices } from '@playwright/test';
import testConfig from '../test-config/ci.json';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: testConfig.test_suites.e2e.retries,
  workers: testConfig.test_suites.e2e.workers,
  reporter: 'html',
  use: {
    baseURL: process.env.BASE_URL || testConfig.test_suites.e2e.base_url,
    trace: testConfig.artifacts.trace_on_failure ? 'on-first-retry' : 'off',
    screenshot: testConfig.artifacts.screenshots_on_failure ? 'only-on-failure' : 'off',
    video: testConfig.artifacts.video_on_failure ? 'on-first-retry' : 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

### E2E Test Files to Create

#### File: `frontend/e2e/trip-creation.spec.ts`
```typescript
import { test, expect } from '@playwright/test';

test.describe('Trip Creation Flow', () => {
  test('should create a trip with multiple stops and calculate route', async ({ page }) => {
    // Navigate to app
    // Add start location
    // Add end location
    // Add intermediate stop
    // Click calculate route
    // Verify route displays on map
    // Save trip
    // Verify trip saved successfully
  });
});
```

#### File: `frontend/e2e/trip-loading.spec.ts`
```typescript
import { test, expect } from '@playwright/test';

test.describe('Trip Loading Flow', () => {
  test('should load a saved trip and display route', async ({ page }) => {
    // Navigate to trips list
    // Click on saved trip
    // Verify stops display
    // Verify route displays on map
  });
});
```

#### File: `frontend/e2e/auth.spec.ts`
```typescript
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should complete guest login flow', async ({ page }) => {
    // Navigate to app
    // Click guest login
    // Verify authenticated state
    // Verify user can create trip
  });
});
```

### Update `frontend/package.json`
Add scripts:
```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed"
  }
}
```

---

## Task 7: Update CI/CD Pipelines

### Update `.github/workflows/backend.yml`

Key changes:
1. Add job to load test config from JSON
2. Add PostgreSQL service container
3. Remove `continue-on-error: true`
4. Add coverage threshold check
5. Use config values for timeouts and markers

### Update `.github/workflows/frontend.yml`

Key changes:
1. Add test execution stage (currently only lint)
2. Add E2E test stage with Playwright
3. Upload test artifacts on failure

### Update `azure-pipelines.yml`

Key changes:
1. Add PowerShell step to parse JSON config
2. Remove `continueOnError: true`
3. Add frontend test stage
4. Add E2E test stage

---

## Validation Checklist

After implementation, verify:
- [ ] `ROADMAP.md` contains Issues #29 and #30 with full acceptance criteria
- [ ] `test-config/` directory exists with schema and 3 environment configs
- [ ] JSON schema validation passes: `npx ajv validate -s test-config/test-config.schema.json -d test-config/ci.json`
- [ ] `modules/testing/` Terraform module created with feature flags
- [ ] Backend tests pass: `cd backend && pytest tests/ -v`
- [ ] Backend coverage meets 80% threshold
- [ ] Frontend tests pass: `cd frontend && npm test`
- [ ] Playwright config exists and tests run: `cd frontend && npm run test:e2e`
- [ ] CI pipelines no longer have `continueOnError: true`
- [ ] All new test files follow existing patterns

---

## Notes

- **Do NOT** replace existing architecture (React, Zustand, FastAPI, SQLAlchemy)
- **Do NOT** modify existing test files unless fixing bugs
- **DO** follow TDD workflow: write tests first, then implementation
- **DO** use existing patterns from `test_trips.py` and `useTripStore.test.ts`
- **DO** mock all external API calls (Mapbox, Azure Maps, Gemini, Google OAuth)
