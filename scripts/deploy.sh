#!/bin/bash
set -e

echo "============================================"
echo "  ChatsFunnels - Production Deployment"
echo "============================================"
echo ""

# Check if .env.production exists
if [ ! -f .env.production ]; then
  echo "ERROR: .env.production not found!"
  echo "Copy .env.production.example and fill in your values:"
  echo "  cp .env.production.example .env.production"
  echo "  nano .env.production"
  exit 1
fi

# Check for default values
if grep -q "CHANGE_ME" .env.production; then
  echo "WARNING: .env.production contains default values!"
  echo "Please update NEXTAUTH_SECRET and POSTGRES_PASSWORD"
  echo ""
  read -p "Continue anyway? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

echo "==> Building containers..."
docker compose build --no-cache

echo "==> Starting services..."
docker compose up -d

echo "==> Waiting for database..."
sleep 5

echo "==> Checking services..."
docker compose ps

echo ""
echo "============================================"
echo "  Deployment complete!"
echo ""
echo "  App: http://$(hostname -I | awk '{print $1}'):3000"
echo "  Logs: docker compose logs -f app"
echo "  Stop: docker compose down"
echo "============================================"
