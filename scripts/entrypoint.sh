#!/bin/sh
set -e

PRISMA="node node_modules/prisma/build/index.js"

echo "============================================"
echo "  ChatsFunnels - Starting up..."
echo "============================================"

echo "==> Waiting for database and syncing schema..."
RETRIES=20
SUCCESS=0

while [ $RETRIES -gt 0 ]; do
  if $PRISMA db push --skip-generate --accept-data-loss 2>&1; then
    SUCCESS=1
    break
  fi
  RETRIES=$((RETRIES - 1))
  echo "==> Database not ready, retrying in 3s... ($RETRIES attempts left)"
  sleep 3
done

if [ $SUCCESS -eq 1 ]; then
  echo "==> Database schema synced successfully!"
else
  echo "ERROR: Could not sync database after multiple retries."
  echo "==> Starting anyway (app may fail on DB queries)..."
fi

echo "==> Starting ChatsFunnels server on port ${PORT:-3000}..."
exec node server.js
