#!/bin/bash
# deploy.sh — safe deployment from repo server/ to jewellery/ root
# Usage: cd /home2/shopsas2/jewellery && git pull && bash deploy.sh
set -e

echo "=== Step 1: Copying server files to root ==="
cp -v server/server.js .
cp -v server/package.json .
cp -rv server/lib/. lib/
cp -rv server/routes/. routes/
cp -rv server/prisma/. prisma/ 2>/dev/null || true
cp -rv server/public/. public/

echo ""
echo "=== Step 2: Installing dependencies ==="
rm -rf node_modules package-lock.json 2>/dev/null || true
npm install --no-optional --ignore-scripts || npm install

echo ""
echo "=== Step 3: Verification ==="
echo "Server files present:"
ls -la server.js package.json
echo ""
echo "Lib files:"
ls lib/
echo ""
echo "Route files:"
ls routes/
echo ""
echo "Frontend asset hash:"
grep -o 'main\.[a-z0-9]*\.js' public/index.html
echo ""
echo "Last 3 commits deployed:"
git log --oneline -3

echo ""
echo "=========================================="
echo "  DEPLOY COMPLETE"
echo "=========================================="
echo "Now restart the Node.js app in cPanel:"
echo "  Setup Node.js App → Stop → Start"
echo ""
