---
name: rate-limiting
description: "Add rate limiting to API proxy endpoints (Mapbox, Azure Maps, Gemini) with per-user and global limits. Covers Python (slowapi) and C# (AspNetCoreRateLimit) implementations."
---

## Context
The Road Trip Planner proxies external APIs with rate limits:
- Mapbox: 600 req/min (shared)
- Google Gemini: 60 req/min (per user)
- Azure Maps: 5000 req/day

No rate limiting is implemented on our side, risking quota exhaustion and abuse.

## Objective
Add rate limiting middleware to Python and C# backend services.

## Requirements

### Python (FastAPI + slowapi)

```python
# backend/security.py (new file)
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)

# backend/main.py
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@app.post("/api/directions")
@limiter.limit("10/minute")  # Per-user limit (Mapbox proxy)
async def get_directions(request: Request, ...):
    ...

@app.get("/api/poi/nearby")
@limiter.limit("20/minute")  # Per-user limit (Azure Maps proxy)
async def search_places(request: Request, ...):
    ...
```

**Rate Limits to Apply:**

| Endpoint | Per-User Limit | Global Limit |
|----------|---------------|-------------|
| `POST /api/directions` | 10/min | 100/min |
| `GET /api/poi/nearby` | 20/min | 200/min |
| `POST /api/vehicle/parse` | 5/min | 30/min |
| `POST /auth/google` | 5/min | 50/min |

### C# (AspNetCoreRateLimit)

```csharp
// Program.cs
builder.Services.AddMemoryCache();
builder.Services.Configure<IpRateLimitOptions>(options =>
{
    options.GeneralRules = new List<RateLimitRule>
    {
        new() { Endpoint = "POST:/api/vehicle/parse-vehicle", Period = "1m", Limit = 5 },
        new() { Endpoint = "POST:/api/vehicle/generate-trip", Period = "1m", Limit = 5 }
    };
});
builder.Services.AddInMemoryRateLimiting();
builder.Services.AddSingleton<IRateLimitConfiguration, RateLimitConfiguration>();
```

### Test Requirements
- Test that requests within limit succeed (200)
- Test that requests exceeding limit return 429 Too Many Requests
- Test that rate limit resets after window expires
- Mock time to avoid slow tests

## Example
```python
# test_rate_limiting.py
def test_rate_limit_exceeded(client):
    """Verify /api/directions returns 429 after exceeding limit."""
    for _ in range(11):
        response = client.post("/api/directions", json=valid_request)
    assert response.status_code == 429
```

Use `@security-remediation` for implementation with the TDD Red → Green → Refactor cycle.
