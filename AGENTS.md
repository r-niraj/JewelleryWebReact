# Project: Shopsastamart (Jwel / jewellery)

## Deployment Reference

- **Local path**: `C:\xampp\htdocs\Jwel`
- **cPanel path**: `/home2/shopsas2/jewellery/`
- **Git remote**: `https://github.com/r-niraj/JewelleryWebReact.git`
- **Site URL**: https://shopsastamart.com
- **Admin login**: admin@shopsastamart.com / BhagwatBhajan@@
- **cPanel DB**: `shopsas2_store_db` (user: `shopsas2_rajnish`, pass: `Tollfree@12`)
- **Node.js version**: 22 (at `/opt/alt/alt-nodejs22/root/usr/bin/node`)
- **App root**: `jewellery` / Entry: `server.js`
- **No Prisma** — using mysql2 + custom wrapper
- **No Sharp** — images saved as-is
- **Port** — cPanel auto-assigns, remove `PORT` from `.env`
- **@ in DB password** encoded as `%40` in `DATABASE_URL`

## .env (jewellery/.env)
```
DATABASE_URL="mysql://shopsas2_rajnish:Tollfree%4012@localhost/shopsas2_store_db"
JWT_SECRET="test-dasdad23423&4324"
NEXT_PUBLIC_SITE_URL="https://shopsastamart.com"
NODE_ENV=production
```

## File Mapping (Repo → cPanel)
Git repo has files in `server/` but on cPanel they're directly in `jewellery/`. Use `deploy.sh` (in repo root) for safe one-command deployment:
- `server/server.js` → `jewellery/server.js`
- `server/lib/*` → `jewellery/lib/*`
- `server/routes/**/*` → `jewellery/routes/**/*`
- `server/seed.js` → `jewellery/seed.js`
- `server/public/*` → `jewellery/public/*`
- `server/package.json` → `jewellery/package.json`

## cPanel Architecture Notes

### node_modules is a symlink
On cPanel, `node_modules` is a symlink managed by the Node.js venv:
```
node_modules -> /home2/shopsas2/nodevenv/jewellery/22/lib/node_modules
```
- **Do NOT** `rm -rf node_modules` — it will break the symlink
- **Do NOT** run `npm install` unless `package.json` deps changed
- If deps changed, run `npm install` (cPanel venv supports it)
- If symlink is broken: delete the broken `node_modules` dir, then restart app in cPanel UI (cPanel recreates it)

### stderr.log
Error log at `/home2/shopsas2/jewellery/stderr.log` — check this if the app fails to start:
```bash
tail -50 stderr.log
```

### Troubleshooting checklist
If changes aren't visible after deploy:
1. **Restart** cPanel → Setup Node.js App → Stop → Start (not just refresh)
2. **Hard refresh** browser (Ctrl+Shift+R) — static assets have 1yr cache
3. **Check app root** in cPanel → Setup Node.js App → verify Application Root = `/home2/shopsas2/jewellery`
4. **Check index.html** references the latest JS bundle: `grep -o 'main\.[a-z0-9]*\.js' public/index.html`
5. **Check stderr.log** for startup errors: `tail -50 stderr.log`
6. **Verify all routes** exist: `ls routes/*/`
7. **Clean nested dir** if present: `rm -rf jewellery/` (rare git clone artifact)

## Common Commands
```bash
# Set Node.js path
export PATH=/opt/alt/alt-nodejs22/root/usr/bin:$PATH

# First time setup
cd jewellery
git init && git remote add origin https://github.com/r-niraj/JewelleryWebReact.git
git fetch origin && git reset --hard origin/main
# Then: cPanel → Setup Node.js App → set root, app entry, .env, restart

# Seed
DATABASE_URL="mysql://shopsas2_rajnish:Tollfree%4012@localhost/shopsas2_store_db" node seed.js

# Standard deploy (recommended)
cd /home2/shopsas2/jewellery && git pull origin main && bash deploy.sh
# Then: cPanel → Setup Node.js App → Stop → Start

# Build frontend locally
cd client && npm run build
# Outputs to server/public/ — commit and push

# Restart in cPanel → Setup Node.js App → Stop then Start
```

## Frontend Build
- `cd client && npm run build` outputs to `server/public/`
- Commit + push to deploy

## Cleanup old assets (optional)
After many deploys, old JS/CSS bundles accumulate in `public/assets/`:
```bash
# On cPanel, remove all except the currently referenced bundle
cd /home2/shopsas2/jewellery/public/assets
ls main.*.js | grep -v "$(grep -o 'main\.[a-z0-9]*\.js' ../index.html)" | xargs rm -f
ls main.*.css | grep -v "$(grep -o 'main\.[a-z0-9]*\.css' ../index.html)" | xargs rm -f
```
