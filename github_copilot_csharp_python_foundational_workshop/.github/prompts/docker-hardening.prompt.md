---
name: docker-hardening
description: "Harden a Dockerfile to production-grade security: non-root user, healthcheck, .dockerignore, multi-stage build, pinned base images. Use for Python, C#, Java, or Node.js services."
---

## Context
You are hardening a Dockerfile for the Road Trip Planner project. The current Dockerfiles run as root, lack healthchecks, and have no `.dockerignore`.

## Objective
Apply production-grade security hardening to the Dockerfile at `{{ path }}`.

## Requirements

### Non-Root User
```dockerfile
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
USER appuser
```

### Healthcheck
```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD curl -f http://localhost:${PORT}/health || exit 1
```

### .dockerignore (create alongside Dockerfile)
```
.env
.git
__pycache__
*.pyc
venv/
node_modules/
tests/
*.md
.github/
```

### Multi-Stage Build (if not already)
- Stage 1: Install dependencies
- Stage 2: Copy only runtime artifacts

### Pinned Base Images
```dockerfile
# ✅ Pin to digest or specific version
FROM python:3.11-slim@sha256:abc123...
# ❌ Never use :latest
```

### Minimized Layers
- Combine RUN commands with `&&`
- Clean up package manager caches in the same layer

## Example

```dockerfile
# Stage 1: Build
FROM python:3.11-slim AS builder
WORKDIR /build
COPY requirements.txt .
RUN pip install --no-cache-dir --target=/deps -r requirements.txt

# Stage 2: Runtime
FROM python:3.11-slim
RUN addgroup --system appgroup && adduser --system --ingroup appgroup appuser
WORKDIR /app
COPY --from=builder /deps /usr/local/lib/python3.11/site-packages
COPY . .
USER appuser
EXPOSE 8000
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

Apply the security agent (`@security-remediation`) to implement these changes with TDD.
