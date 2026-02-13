#!/usr/bin/env sh
set -e

cd /app
export PYTHONPATH=/app

if [ "${DATABASE_AUTO_CREATE:-true}" = "true" ]; then
  python -m app.db.bootstrap
fi

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  alembic upgrade head
fi

exec uvicorn app.main:app --host 0.0.0.0 --port "${PORT:-8000}"
