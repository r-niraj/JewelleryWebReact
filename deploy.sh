#!/bin/bash
# deploy.sh — safe deployment from repo server/ to jewellery/ root
# Usage: cd /home2/shopsas2/jewellery && git pull origin main && bash deploy.sh
set -e

# cPanel requires explicit Node.js path
export PATH=/opt/alt/alt-nodejs22/root/usr/bin:$PATH

echo "=== Step 1: Safety checks ==="
# Remove stale nested jewellery/ dir if it somehow exists
if [ -d "jewellery" ]; then
  echo "WARNING: Found nested jewellery/ directory — removing it"
  rm -rf jewellery
fi

# Verify node_modules symlink (cPanel manages this via Node.js venv)
if [ ! -L "node_modules" ]; then
  echo "WARNING: node_modules is not a symlink. Run 'rm -rf node_modules' then restart app in cPanel UI"
fi

echo ""
echo "=== Step 2: Copying server files to root ==="
cp -v server/server.js .
cp -v server/package.json .
cp -rv server/lib/. lib/
cp -rv server/routes/. routes/
cp -rv server/prisma/. prisma/ 2>/dev/null || true
cp -rv server/public/. public/

echo ""
echo "=== Step 3: Installing dependencies ==="
# Check if package.json changed by comparing checksum
OLD_HASH=$(md5sum package.json 2>/dev/null | cut -d' ' -f1 || echo "")
NEW_HASH=$(md5sum server/package.json 2>/dev/null | cut -d' ' -f1 || echo "")
if [ "$OLD_HASH" != "$NEW_HASH" ]; then
  echo "package.json changed — running npm install"
  npm install
else
  echo "package.json unchanged — skipping npm install"
fi

echo ""
echo "=== Step 4: Verification ==="
echo "Server files:"
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
echo "Error log size:"
ls -lh stderr.log 2>/dev/null || echo "No stderr.log"

echo ""
echo "=========================================="
echo "  DEPLOY COMPLETE"
echo "=========================================="
echo "Next steps:"
echo "  1. cPanel → Setup Node.js App → Stop → Start"
echo "  2. Hard refresh site (Ctrl+Shift+R)"
echo "  3. If issues, check: tail -50 stderr.log"
echo ""
