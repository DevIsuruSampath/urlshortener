#!/usr/bin/env sh
set -e

if [ "${RUN_SERVICE}" = "api" ]; then
  exec uvicorn app.main:app --app-dir /app/apps/api --host 0.0.0.0 --port "${PORT:-8000}"
fi

exec sh -c "cd /app/apps/web && npm run start -- --hostname 0.0.0.0 --port ${PORT:-3000}"
