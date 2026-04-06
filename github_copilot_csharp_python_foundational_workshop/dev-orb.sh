#!/bin/bash

# =============================================================================
# Road Trip App - Development Environment Startup (OrbStack)
# =============================================================================
#
# This script starts the full development environment using OrbStack
# as the container runtime (drop-in Docker replacement).
#
# Usage:
#   ./dev-orb.sh          # Start all services
#   ./dev-orb.sh build    # Rebuild all containers
#   ./dev-orb.sh down     # Stop all services
#   ./dev-orb.sh logs     # View logs
#   ./dev-orb.sh ps       # Show running containers
#
# Access:
#   - Gateway:       http://localhost:8080
#   - NEW Frontend:  http://localhost:8080/v2  (or http://localhost:3001 direct)
#   - OLD Frontend:  http://localhost:8080/v1  (or http://localhost:3000 direct)
#   - Backend API:   http://localhost:8000
#   - AI Service:    http://localhost:8001
#   - PostgreSQL:    localhost:5432
#   - Redis:         localhost:6379
# =============================================================================

set -e

COMPOSE_FILE="docker-compose.dev.yml"

# Verify OrbStack is running
if ! command -v docker &> /dev/null; then
    echo "Error: Docker CLI not found. Please install OrbStack (https://orbstack.dev)."
    exit 1
fi

if ! docker info &> /dev/null 2>&1; then
    echo "Error: Docker engine is not running. Please start OrbStack."
    exit 1
fi

# Use docker compose (V2 — provided by OrbStack)
DOCKER_COMPOSE="docker compose"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_banner() {
    echo -e "${BLUE}"
    echo "╔═══════════════════════════════════════════════════════════════╗"
    echo "║     🚗 Road Trip App - Dev Environment (OrbStack)             ║"
    echo "╚═══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

print_urls() {
    echo -e "${GREEN}"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "  Services are starting up..."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "  🌐 Gateway (unified access):  http://localhost:8080"
    echo "  🆕 NEW Frontend (AI-driven):  http://localhost:8080/v2"
    echo "  📱 OLD Frontend (current):    http://localhost:8080/v1"
    echo ""
    echo "  📡 Backend API:               http://localhost:8000"
    echo "  🤖 AI Service:                http://localhost:8001"
    echo "  🐘 PostgreSQL:                localhost:5432"
    echo "  📦 Redis:                     localhost:6379"
    echo ""
    echo "  Direct access (bypass gateway):"
    echo "  • NEW Frontend: http://localhost:3001"
    echo "  • OLD Frontend: http://localhost:3000"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo -e "${NC}"
}

check_env() {
    if [ ! -f .env ]; then
        echo -e "${YELLOW}Warning: .env file not found. Creating from template...${NC}"
        if [ -f .env.example ]; then
            cp .env.example .env
            echo -e "${YELLOW}Please update .env with your API keys.${NC}"
        else
            echo -e "${RED}Error: .env.example not found. Please create .env file.${NC}"
            exit 1
        fi
    fi
}

case "${1:-up}" in
    up|start)
        print_banner
        check_env
        echo -e "${BLUE}Starting development environment (OrbStack)...${NC}"
        $DOCKER_COMPOSE -f $COMPOSE_FILE up -d
        print_urls
        echo -e "${GREEN}Use './dev-orb.sh logs' to view logs${NC}"
        ;;
    build)
        print_banner
        check_env
        echo -e "${BLUE}Rebuilding containers...${NC}"
        $DOCKER_COMPOSE -f $COMPOSE_FILE build --no-cache
        echo -e "${GREEN}Build complete. Run './dev-orb.sh' to start.${NC}"
        ;;
    down|stop)
        echo -e "${YELLOW}Stopping all services...${NC}"
        $DOCKER_COMPOSE -f $COMPOSE_FILE down
        echo -e "${GREEN}All services stopped.${NC}"
        ;;
    logs)
        $DOCKER_COMPOSE -f $COMPOSE_FILE logs -f ${2:-}
        ;;
    ps|status)
        $DOCKER_COMPOSE -f $COMPOSE_FILE ps
        ;;
    restart)
        echo -e "${YELLOW}Restarting ${2:-all services}...${NC}"
        $DOCKER_COMPOSE -f $COMPOSE_FILE restart ${2:-}
        ;;
    clean)
        echo -e "${RED}Removing all containers and volumes...${NC}"
        $DOCKER_COMPOSE -f $COMPOSE_FILE down -v --remove-orphans
        echo -e "${GREEN}Cleanup complete.${NC}"
        ;;
    *)
        echo "Usage: ./dev-orb.sh [command]"
        echo ""
        echo "Commands:"
        echo "  up, start    Start all services (default)"
        echo "  build        Rebuild all containers"
        echo "  down, stop   Stop all services"
        echo "  logs [svc]   View logs (optionally for specific service)"
        echo "  ps, status   Show running containers"
        echo "  restart [s]  Restart all or specific service"
        echo "  clean        Remove all containers and volumes"
        ;;
esac
