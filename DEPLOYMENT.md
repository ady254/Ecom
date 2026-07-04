# MINARA — Production Deployment Guide (Hostinger)

MINARA is three Node.js services in one monorepo:

| Service | Folder | Runs on | Purpose |
|---|---|---|---|
| API | `apps/api` | port 5000 | Express + MongoDB — all data, auth, payments |
| Store | `apps/store` | port 3000 | Next.js customer storefront |
| Admin | `apps/admin` | port 3001 | Next.js admin dashboard |

**Recommended domain layout** (keeps auth cookies working with the default `COOKIE_SAMESITE=lax`):

```
minara.in           → Store   (port 3000)
admin.minara.in     → Admin   (port 3001)
api.minara.in       → API     (port 5000)
```

Because all three share the registrable domain `minara.in`, the refresh-token
cookie works with `SameSite=Lax`. Only if the store lives on a *different*
domain than the API (e.g. Vercel + Hostinger) do you need `COOKIE_SAMESITE=none`.

---

## Which Hostinger plan?

- **Hostinger VPS (KVM 1/2)** — ✅ recommended. Runs all three services with PM2.
  This guide is written for VPS.
- **Hostinger managed Node.js (hPanel web hosting)** — runs **one** Node app per
  site. Workable if you create three websites/subdomains (one per service), each
  pointing at its app folder — but resource limits are tight for three apps.
  If your plan only supports one Node app comfortably: host the **API** on
  Hostinger and deploy Store + Admin to Vercel (free tier), then set
  `COOKIE_SAMESITE=none` on the API.
- Hostinger does **not** offer managed MongoDB — use **MongoDB Atlas** (free
  M0 tier is fine to start). Images are already on Cloudinary, email on SMTP,
  so the server itself stays stateless: nothing is lost if it's rebuilt.

---

## 1. One-time server setup (VPS)

```bash
# as root on a fresh Ubuntu VPS
apt update && apt upgrade -y
curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && apt install -y nodejs nginx
corepack enable && corepack prepare pnpm@10.33.0 --activate
npm install -g pm2
```

Point DNS in hPanel: `A` records for `@`, `admin`, `api` → your VPS IP.

## 2. Get the code onto the server

```bash
cd /var/www
git clone <your-repo-url> minara
cd minara
pnpm install
```

## 3. Environment variables

**`apps/api/.env`** — copy from `apps/api/.env.example` and fill in real values:

- `MONGODB_URI` — from MongoDB Atlas (Database → Connect → Drivers).
  In Atlas → Network Access, allow your VPS IP only.
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` — generate each with:
  `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
- `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` — **live** keys from the Razorpay
  dashboard (not `rzp_test_…`).
- `RAZORPAY_WEBHOOK_SECRET` — see step 6.
- `FRONTEND_URL=https://minara.in`, `ADMIN_URL=https://admin.minara.in`
  (these drive CORS and the links inside emails).
- `NODE_ENV=production`, `COOKIE_SAMESITE=lax`
- `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` — for step 7.

**`apps/store/.env.production`** and **`apps/admin/.env.production`**:

```
NEXT_PUBLIC_API_URL=https://api.minara.in/api/v1
```

## 4. Build and run

```bash
cd /var/www/minara
pnpm build          # builds API (tsup), Store and Admin (next build)
pnpm --filter @minara/api test   # 22 money-path tests must pass
pm2 start ecosystem.config.js
pm2 save && pm2 startup          # auto-restart on reboot
```

## 5. Nginx reverse proxy + HTTPS

Create `/etc/nginx/sites-available/minara`:

```nginx
server {
    server_name minara.in www.minara.in;
    location / { proxy_pass http://127.0.0.1:3000; include proxy_params; proxy_set_header X-Forwarded-Proto $scheme; }
}
server {
    server_name admin.minara.in;
    location / { proxy_pass http://127.0.0.1:3001; include proxy_params; proxy_set_header X-Forwarded-Proto $scheme; }
}
server {
    server_name api.minara.in;
    client_max_body_size 6m;   # product image uploads (5MB limit + headroom)
    location / { proxy_pass http://127.0.0.1:5000; include proxy_params; proxy_set_header X-Forwarded-Proto $scheme; }
}
```

```bash
ln -s /etc/nginx/sites-available/minara /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx
apt install -y certbot python3-certbot-nginx
certbot --nginx -d minara.in -d www.minara.in -d admin.minara.in -d api.minara.in
```

The API already sets `trust proxy`, so rate limiting and secure cookies work
correctly behind nginx.

## 6. Razorpay webhook (required — this is what guarantees no lost payments)

Razorpay Dashboard → **Settings → Webhooks → Add New Webhook**:

- **URL:** `https://api.minara.in/api/v1/payments/razorpay/webhook`
- **Secret:** generate a random string, save it, and put the same value in
  `RAZORPAY_WEBHOOK_SECRET` in `apps/api/.env`
- **Events:** `payment.captured`, `payment.failed`, `refund.processed`

Then `pm2 restart minara-api`. Even if a customer's browser dies right after
paying, the webhook marks the order paid. Unpaid online orders are auto-
cancelled after 30 minutes and their stock is released.

## 7. Seed the admin account

```bash
cd /var/www/minara/apps/api
SEED_ADMIN_EMAIL=you@minara.in SEED_ADMIN_PASSWORD='a-strong-password' pnpm seed:admin
```

(In production the script refuses to run without `SEED_ADMIN_PASSWORD`.)

## 8. Verify the deployment

1. `curl https://api.minara.in/health/check` → MongoDB + Cloudinary both ✅.
2. Place a **COD test order** on the store → confirmation email arrives,
   product stock decreases, order appears in the admin dashboard.
3. Place a **₹1 Razorpay test** (create a temporary ₹1 product) → pay → order
   shows `paid`; check Razorpay dashboard → Webhooks shows a `200` delivery.
4. Cancel that order in the admin → Razorpay shows an automatic refund and
   stock is restored.
5. Log into `admin.minara.in` — a non-admin account must be bounced to /login.

## Updating the site later

```bash
cd /var/www/minara
git pull
pnpm install && pnpm build && pnpm --filter @minara/api test
pm2 reload ecosystem.config.js   # graceful: in-flight requests finish first
```

## Monitoring (do this — it's free)

- **UptimeRobot** (free): monitor `https://api.minara.in/health/check` and both
  sites every 5 min; alerts to your email/WhatsApp.
- `pm2 logs minara-api` for API logs; `pm2 monit` for memory/CPU.
- MongoDB Atlas has built-in alerts (Atlas → Alerts) for storage/connections.
