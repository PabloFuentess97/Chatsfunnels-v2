#!/bin/sh
set -e

echo "============================================"
echo "  ChatsFunnels - Starting up..."
echo "============================================"

# Wait for PostgreSQL to accept connections
echo "==> Waiting for database..."
RETRIES=15
until npx prisma db push --skip-generate --accept-data-loss > /dev/null 2>&1 || [ $RETRIES -eq 0 ]; do
  echo "==> Database not ready, retrying... ($RETRIES attempts left)"
  RETRIES=$((RETRIES - 1))
  sleep 3
done

if [ $RETRIES -eq 0 ]; then
  echo "ERROR: Could not connect to database after multiple retries"
  echo "==> Attempting to start anyway..."
else
  echo "==> Database schema synced successfully!"
fi

echo "==> Starting ChatsFunnels server on port ${PORT:-3000}..."
exec node server.js
