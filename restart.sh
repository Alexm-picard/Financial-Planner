#!/bin/bash

# Quick restart script for Financial Planner backend
# Usage: ./restart.sh

cd "$(dirname "$0")"

echo "🔄 Restarting backend server..."

# Try to restart, if it fails (not running), start it
pm2 restart financial-planner-backend 2>/dev/null || pm2 start ecosystem.config.cjs --env production

echo "✅ Done!"
echo ""
echo "View logs: pm2 logs financial-planner-backend"
echo "Check status: pm2 status"

