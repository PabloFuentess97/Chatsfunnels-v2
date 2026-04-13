#!/bin/sh
set -e

echo "==> Running database migrations..."
npx prisma migrate deploy 2>/dev/null || echo "==> No pending migrations or first run"

echo "==> Starting ChatsFunnels..."
exec node server.js
