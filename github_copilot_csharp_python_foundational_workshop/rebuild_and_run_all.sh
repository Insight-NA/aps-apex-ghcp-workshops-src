#!/usr/bin/env bash

# Rebuild and run all Docker services, optionally start mobile app
#
# Usage:
#   ./rebuild_and_run_all.sh              # Build, start Docker, then launch mobile
#   ./rebuild_and_run_all.sh --no-mobile  # Build and start Docker services only
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCKER_COMPOSE_FILE="$ROOT_DIR/docker-compose.yml"

# ── Parse CLI arguments ──
SKIP_MOBILE=false
while [[ $# -gt 0 ]]; do
  case $1 in
    --no-mobile) SKIP_MOBILE=true; shift ;;
    *) echo "Unknown option: $1"; echo "Usage: $0 [--no-mobile]"; exit 1 ;;
  esac
done

# ── Verify Docker is available ──
if ! command -v docker &>/dev/null; then
  echo "Error: docker is not installed or not on PATH." >&2
  exit 1
fi

# Prefer 'docker compose' but fall back to 'docker-compose'
if docker compose version &>/dev/null; then
  DOCKER_COMPOSE_CMD=(docker compose -f "$DOCKER_COMPOSE_FILE")
elif command -v docker-compose &>/dev/null; then
  DOCKER_COMPOSE_CMD=(docker-compose -f "$DOCKER_COMPOSE_FILE")
else
  echo "Error: neither 'docker compose' nor 'docker-compose' is available." >&2
  exit 1
fi

# ── Helper: wait for a health endpoint ──
wait_for_health() {
  local name="$1"
  local url="$2"
  local max_attempts="${3:-60}"
  local attempt=1

  echo "  Waiting for $name at $url ..."
  while (( attempt <= max_attempts )); do
    if curl -sf "$url" >/dev/null 2>&1; then
      echo "  ✓ $name is healthy."
      return 0
    fi
    echo "    Attempt $attempt/$max_attempts: $name not ready, retrying..."
    ((attempt++))
    sleep 2
  done

  echo "Error: $name did not become ready at $url within $((max_attempts * 2)) seconds." >&2
  echo "Check logs with: ${DOCKER_COMPOSE_CMD[*]} logs" >&2
  return 1
}

cd "$ROOT_DIR"

TOTAL_STEPS=3
if [ "$SKIP_MOBILE" = false ]; then
  TOTAL_STEPS=4
fi

# ── Step 1: Build ──
echo "[1/$TOTAL_STEPS] Building all Docker images (postgres, backend-python, backend-csharp, backend-java, bff, frontend)..."
"${DOCKER_COMPOSE_CMD[@]}" build

# ── Step 2: Start containers ──
echo "[2/$TOTAL_STEPS] Starting all containers..."
"${DOCKER_COMPOSE_CMD[@]}" up -d

# ── Step 3: Health checks for ALL services ──
echo "[3/$TOTAL_STEPS] Verifying all services are healthy..."
HEALTH_FAILED=false

wait_for_health "Python Backend (FastAPI)"  "http://localhost:8000/health"         60 || HEALTH_FAILED=true
wait_for_health "C# Backend (ASP.NET)"      "http://localhost:8081/health"         60 || HEALTH_FAILED=true
wait_for_health "Java Backend (Spring Boot)" "http://localhost:8082/actuator/health" 90 || HEALTH_FAILED=true
wait_for_health "BFF (Node.js/Express)"      "http://localhost:3000/health"         60 || HEALTH_FAILED=true
wait_for_health "Frontend (Nginx)"           "http://localhost:5173"                30 || HEALTH_FAILED=true

if [ "$HEALTH_FAILED" = true ]; then
  echo ""
  echo "⚠ Some services failed health checks. Check container logs:"
  echo "  ${DOCKER_COMPOSE_CMD[*]} logs backend-python"
  echo "  ${DOCKER_COMPOSE_CMD[*]} logs backend-csharp"
  echo "  ${DOCKER_COMPOSE_CMD[*]} logs backend-java"
  echo "  ${DOCKER_COMPOSE_CMD[*]} logs bff"
  echo "  ${DOCKER_COMPOSE_CMD[*]} logs frontend"
  exit 1
fi

echo ""
echo "All Docker services are running and healthy:"
echo "  Frontend:       http://localhost:5173"
echo "  BFF:            http://localhost:3000"
echo "  Python Backend: http://localhost:8000"
echo "  C# Backend:     http://localhost:8081"
echo "  Java Backend:   http://localhost:8082"
echo "  PostgreSQL:     localhost:5432"
echo ""

# ── Step 4 (optional): Launch mobile app ──
if [ "$SKIP_MOBILE" = false ]; then
  echo "[4/$TOTAL_STEPS] Starting React Native mobile app (Expo)..."
  cd "$ROOT_DIR/mobile"

  # Ensure dependencies are installed before starting Expo
  if [ ! -d "node_modules" ]; then
    echo "Installing mobile app dependencies (npm install)..."
    npm install
  fi

  # Detect platform and choose Expo target
  case "$(uname -s)" in
    Darwin*)  EXPO_TARGET="--ios" ;;
    *)        EXPO_TARGET="" ;;  # Android/default on Windows/Linux
  esac

  echo "Launching Expo dev server (npm start)..."
  # This will run until you stop it (Ctrl+C)
  npx expo start $EXPO_TARGET
else
  echo "Skipping mobile app launch (--no-mobile flag set)."
fi
