---
applyTo: "bff/**/*.{ts,js}"
---
# Node.js BFF (Backend-for-Frontend) Standards

Apply the [general architecture rules](../copilot-instructions.md) alongside these BFF-specific rules.

## Role — Thin Routing Layer Only
The BFF is an **API gateway**. It must not contain business logic.

```
Allowed:  request proxying, response forwarding, CORS headers, request-ID injection, health aggregation
Forbidden: data transformation, business rules, DB access, external API calls (beyond proxying)
```

## Stack (Non-Negotiable)
- **Runtime**: Node.js with Express — no Fastify, Koa, or Hapi
- **Language**: TypeScript
- **Proxy**: `http-proxy-middleware` — do not implement manual proxy logic

## Route Table
| Incoming path | Forwards to |
|---|---|
| `/api/auth/*` | `backend-python:8000` |
| `/api/trips*` | `backend-python:8000` |
| `/api/public-trips*` | `backend-python:8000` |
| `/api/vehicle-specs` | `backend-python:8000` |
| `/api/v1/parse-vehicle` | `backend-csharp:8081` |
| `/api/v1/generate-trip` | `backend-csharp:8081` |
| `/api/geocode*` | `backend-java:8082` |
| `/api/directions*` | `backend-java:8082` |
| `/api/search*` | `backend-java:8082` |
| `/api/optimize*` | `backend-java:8082` |
| `/health` | BFF (aggregated health check) |

## Project Structure
```
bff/src/
  routes/       # Proxy route definitions and /health
  middleware/   # request-id injection, error handling, CORS
  index.ts      # Express app + server bootstrap
```

## Proxy Pattern
```typescript
// ✅ CORRECT — declare target in environment variable, never hardcode
import { createProxyMiddleware } from 'http-proxy-middleware';

app.use(
  '/api/trips',
  createProxyMiddleware({
    target: process.env.PYTHON_BACKEND_URL,  // e.g. http://backend-python:8000
    changeOrigin: true,
  }),
);
```
- Backend URLs come from environment variables — never hardcoded strings

## Aggregated Health Check
```typescript
// GET /health — calls all backends and aggregates status
app.get('/health', async (_req, res) => {
  const checks = await Promise.allSettled([
    fetch(`${process.env.PYTHON_BACKEND_URL}/health`),
    fetch(`${process.env.JAVA_BACKEND_URL}/health`),
    fetch(`${process.env.CSHARP_BACKEND_URL}/health`),
  ]);
  const healthy = checks.every((c) => c.status === 'fulfilled');
  res.status(healthy ? 200 : 503).json({ status: healthy ? 'ok' : 'degraded' });
});
```

## No Hardcoded Strings
```typescript
// ❌ WRONG
target: 'http://backend-python:8000'
// ✅ CORRECT
target: process.env.PYTHON_BACKEND_URL
```
All backend URLs, port numbers, and paths must come from environment variables.
