#!/bin/sh
# Container start: apply pending database migrations, then run the API as PID 1 (so it receives
# SIGTERM directly and shuts down gracefully).
set -e

if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  echo "[entrypoint] prisma migrate deploy"
  npx --no-install prisma migrate deploy
fi

echo "[entrypoint] starting the API"
exec node dist/server.js
