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

## Common Commands
```bash
# Set Node.js path
export PATH=/opt/alt/alt-nodejs22/root/usr/bin:$PATH

# First time setup
cd jewellery
git init && git remote add origin https://github.com/r-niraj/JewelleryWebReact.git
git fetch origin && git reset --hard origin/main && npm install

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
