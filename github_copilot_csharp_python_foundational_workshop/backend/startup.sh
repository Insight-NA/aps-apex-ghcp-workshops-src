#!/bin/bash
# Startup script for Azure App Service
# This runs Gunicorn with Uvicorn workers for production deployment

# Number of workers (2 * CPU cores + 1 is recommended)
WORKERS=${WORKERS:-4}

# Bind to the port Azure expects (default 8000)
PORT=${PORT:-8000}

# Run Gunicorn with Uvicorn worker class
exec gunicorn main:app \
    --workers $WORKERS \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:$PORT \
    --timeout 120 \
    --access-logfile - \
    --error-logfile - \
    --log-level info
