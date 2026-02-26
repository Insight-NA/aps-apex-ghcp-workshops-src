#!/usr/bin/env bash

# Rebuild and run backend + web in Docker, then start mobile app
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
DOCKER_COMPOSE_FILE="$ROOT_DIR/docker-compose.yml"

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

cd "$ROOT_DIR"

echo "[1/4] Building backend and frontend Docker images..."
"${DOCKER_COMPOSE_CMD[@]}" build

echo "[2/4] Starting backend and frontend containers..."
"${DOCKER_COMPOSE_CMD[@]}" up -d

echo "[3/4] Waiting for backend health endpoint to be ready (http://localhost:8000/health)..."
BACKEND_URL="http://localhost:8000/health"
MAX_ATTEMPTS=30
ATTEMPT=1

while (( ATTEMPT <= MAX_ATTEMPTS )); do
  if curl -sf "$BACKEND_URL" >/dev/null 2>&1; then
    echo "Backend is up and responding."
    break
  fi
  echo "  Attempt $ATTEMPT/$MAX_ATTEMPTS: backend not ready yet, retrying..."
  ((ATTEMPT++))
  sleep 1
done

if (( ATTEMPT > MAX_ATTEMPTS )); then
  echo "Error: backend did not become ready at $BACKEND_URL within $MAX_ATTEMPTS seconds." >&2
  echo "Check container logs with: ${DOCKER_COMPOSE_CMD[*]} logs backend" >&2
  exit 1
fi

echo "[4/4] Starting React Native mobile app (Expo) for testing..."
cd "$ROOT_DIR/mobile"

# Ensure dependencies are installed before starting Expo
if [ ! -d "node_modules" ]; then
  echo "Installing mobile app dependencies (npm install)..."
  npm install
fi

# This will run until you stop it (Ctrl+C)
echo "Launching Expo dev server (npm start)..."
npx expo start --ios
