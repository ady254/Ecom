# MINARA — Deploying all 3 apps on Hostinger (Beginner's Guide)

You're hosting everything on your **Hostinger Business plan** (Node.js
support, 3 GB RAM, 2 cores). No custom domain yet — you'll use **3 free
temporary URLs**, one per app, and swap in a real domain later.

## The big picture

Your project is 3 separate programs. On Hostinger, each one becomes its own
**Website** (with its own temporary URL) running as a **Node.js app**:

| App | Folder | Becomes Hostinger website | Port role |
|---|---|---|---|
| **API** | `apps/api` | e.g. `api-xxxx.hostingersite.com` | Express backend — the brain |
| **Store** | `apps/store` | e.g. `store-xxxx.hostingersite.com` | Customer website |
| **Admin** | `apps/admin` | e.g. `admin-xxxx.hostingersite.com` | Your dashboard |

**Do them in this order: API first.** Both the Store and Admin are useless
until the API is live, and the API is the simplest to deploy — so it's the
perfect one to learn the workflow on.

> **Honest heads-up:** deploying 3 Node apps by hand on shared hosting is
> more involved than a one-click host. You'll use SSH (a terminal into your
> server) and repeat a recipe 3 times. Take it one app at a time. Once the
> API works, the two frontends are the same steps twice.

---

## Before you start

- [ ] The standalone code changes are pushed to GitHub. (Already prepared in
      `apps/store/next.config.ts` and `apps/admin/next.config.ts` — just make
      sure your latest commit is pushed, since the server pulls from GitHub.)
- [ ] **MongoDB Atlas** free cluster ready, and its connection string handy.
- [ ] **Razorpay live keys** ready.
- [ ] **SSH access enabled** — hPanel → your hosting → **Advanced → SSH
      Access**. Note the SSH IP, port, username, and password shown there.

---

## PHASE 1 — Deploy the API

### 1.1 Create the API website

hPanel → **Websites → Add Website**. When it asks for a domain, choose the
**temporary domain** option (don't connect a real domain). You'll get a URL
like `api-xxxxx.hostingersite.com`. Write it down — this is your **API URL**.

### 1.2 SSH into your server

On your Windows PC, open **PowerShell**:
```
ssh your-ssh-username@your-ssh-ip -p your-ssh-port
```
(all three values are on the SSH Access page). Enter the password when
prompted (characters won't show as you type — normal).

**✅ Checkpoint:** your prompt changes to something like `u268180176@server1881`.

### 1.3 Get the code and build it

Find your API website's folder first — usually under `domains/` or
`public_html`. List what's there:
```bash
ls ~/domains
```
You'll see a folder named after your API's temporary URL. Go into it and
clone your project **inside** it:
```bash
cd ~/domains/api-xxxxx.hostingersite.com
git clone https://github.com/ady254/Ecom.git app
cd app
corepack enable && corepack prepare pnpm@10.33.0 --activate
pnpm install
pnpm --filter @minara/api build
```
This installs everything and compiles the API to `apps/api/dist/server.js`.

**✅ Checkpoint:** `ls apps/api/dist/server.js` prints the path (no error).

### 1.4 Create the API's environment file

```bash
cd ~/domains/api-xxxxx.hostingersite.com/app/apps/api
cp .env.example .env
nano .env
```
Fill in each value (arrow keys to move, `Ctrl+O` then `Enter` to save,
`Ctrl+X` to exit):

| Variable | Value |
|---|---|
| `MONGODB_URI` | Your Atlas connection string (replace `<password>`) |
| `JWT_ACCESS_SECRET` | Run `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` and paste |
| `JWT_REFRESH_SECRET` | Run that again — a **different** value |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Razorpay → Settings → API Keys (**Live mode**) |
| `RAZORPAY_WEBHOOK_SECRET` | Set in Phase 4 — leave blank for now |
| `FRONTEND_URL` | Your Store URL, e.g. `https://store-xxxxx.hostingersite.com` |
| `ADMIN_URL` | Your Admin URL, e.g. `https://admin-xxxxx.hostingersite.com` |
| `NODE_ENV` | `production` |
| `COOKIE_SAMESITE` | `none` (the apps are on different subdomains) |
| Email (`EMAIL_HOST`, `EMAIL_USER`, …) | Your SMTP details |

In Atlas → **Network Access**, add `0.0.0.0/0` (shared hosting IPs vary).

### 1.5 Register the API as a Node.js app

hPanel → your API website → **Advanced → Node.js** (or the **Node.js**
section) → **Create Application**:
- **Node.js version:** 20.x
- **Application root:** `domains/api-xxxxx.hostingersite.com/app/apps/api`
- **Application URL:** your API temporary URL
- **Application startup file:** `dist/server.js`

Save, then click **Restart Application**.

**✅ Checkpoint:** open `https://api-xxxxx.hostingersite.com/health/check` in
your browser — it should report MongoDB connected. **The API is live.** 🎉

---

## PHASE 2 — Deploy the Store

### 2.1 Create the Store website
hPanel → **Add Website** → temporary domain → note the URL
(`store-xxxxx.hostingersite.com`).

### 2.2 Clone and build (with the API URL baked in)
```bash
cd ~/domains/store-xxxxx.hostingersite.com
git clone https://github.com/ady254/Ecom.git app
cd app
corepack enable && corepack prepare pnpm@10.33.0 --activate
pnpm install
```
Tell the Store where the API is, then build:
```bash
cd apps/store
echo "NEXT_PUBLIC_API_URL=https://api-xxxxx.hostingersite.com/api/v1" > .env.production
# (optional) if you use Google sign-in, add on the next line:
# echo "NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-id" >> .env.production
cd ../..
pnpm --filter @minara/store build
```

### 2.3 Copy the static files into the standalone folder
Next.js standalone doesn't include images/CSS by default — copy them in:
```bash
cd ~/domains/store-xxxxx.hostingersite.com/app/apps/store
cp -r public .next/standalone/apps/store/
cp -r .next/static .next/standalone/apps/store/.next/
```

### 2.4 Register the Store as a Node.js app
hPanel → Store website → **Node.js → Create Application**:
- **Node.js version:** 20.x
- **Application root:**
  `domains/store-xxxxx.hostingersite.com/app/apps/store/.next/standalone/apps/store`
- **Application URL:** your Store temporary URL
- **Application startup file:** `server.js`

Save → **Restart Application**.

**✅ Checkpoint:** open `https://store-xxxxx.hostingersite.com` — the store
loads **and** products appear (proving it reached the API).

---

## PHASE 3 — Deploy the Admin

Exactly the same as Phase 2, replacing `store` with `admin` everywhere:

```bash
cd ~/domains/admin-xxxxx.hostingersite.com
git clone https://github.com/ady254/Ecom.git app
cd app
corepack enable && corepack prepare pnpm@10.33.0 --activate
pnpm install
cd apps/admin
echo "NEXT_PUBLIC_API_URL=https://api-xxxxx.hostingersite.com/api/v1" > .env.production
cd ../..
pnpm --filter @minara/admin build
cd apps/admin
cp -r public .next/standalone/apps/admin/ 2>/dev/null || true
cp -r .next/static .next/standalone/apps/admin/.next/
```

Node.js app:
- **Application root:**
  `domains/admin-xxxxx.hostingersite.com/app/apps/admin/.next/standalone/apps/admin`
- **Startup file:** `server.js`

**✅ Checkpoint:** `https://admin-xxxxx.hostingersite.com` loads the login page.

---

## PHASE 4 — Razorpay webhook + admin account

### 4.1 Webhook
Razorpay Dashboard → **Settings → Webhooks → Add New Webhook**:
- **URL:** `https://api-xxxxx.hostingersite.com/api/v1/payments/razorpay/webhook`
- **Secret:** make up a random string, save it
- **Events:** `payment.captured`, `payment.failed`, `refund.processed`

Then put that secret into the API's `.env`:
```bash
cd ~/domains/api-xxxxx.hostingersite.com/app/apps/api
nano .env      # set RAZORPAY_WEBHOOK_SECRET=...
```
Restart the API application in hPanel.

### 4.2 Create your admin login
```bash
cd ~/domains/api-xxxxx.hostingersite.com/app/apps/api
SEED_ADMIN_EMAIL=you@example.com SEED_ADMIN_PASSWORD='A-Strong-Password-1' pnpm seed:admin
```

---

## PHASE 5 — Test everything

- [ ] `https://api-xxxxx.hostingersite.com/health/check` → DB connected.
- [ ] Log into the Admin with the account from 4.2.
- [ ] Place a **Cash on Delivery** order on the Store → confirmation email
      arrives, order shows in Admin, stock drops.
- [ ] Buy a ₹1 test product with **real Razorpay** → order shows `paid`;
      Razorpay → Webhooks shows a `200` delivery.
- [ ] Cancel that order in Admin → Razorpay shows an auto-refund, stock restored.
- [ ] Log into Admin with a normal customer account → refused.

---

## Updating an app later

```bash
cd ~/domains/<that-app>.hostingersite.com/app
git pull
pnpm install
pnpm --filter @minara/<api|store|admin> build
# For store/admin only, re-copy static files (Phase 2.3 / 3):
#   cp -r apps/store/public apps/store/.next/standalone/apps/store/
#   cp -r apps/store/.next/static apps/store/.next/standalone/apps/store/.next/
```
Then **Restart Application** in hPanel for that app.

---

## When you buy a real domain later

It's a pure swap, no rebuild-from-scratch:
1. In hPanel, connect the domain / point subdomains (`api.`, `admin.`, `@`)
   to the matching websites.
2. Update `FRONTEND_URL` / `ADMIN_URL` in the API's `.env`, and
   `NEXT_PUBLIC_API_URL` in each frontend's `.env.production`, to the real
   URLs.
3. Rebuild the two frontends (their API URL is baked in at build time),
   re-copy static files, restart all three apps.
4. Update the Razorpay webhook URL to the real API domain.

---

## Troubleshooting

**`health/check` doesn't load / app shows stopped in hPanel**
→ hPanel → Node.js → your app → check the **log**. Almost always a wrong
`MONGODB_URI` or a missing env var. Also confirm the **startup file** path
matches exactly.

**Store loads but no products; browser console (F12) shows a CORS error**
→ `FRONTEND_URL`/`ADMIN_URL` in the API `.env` must exactly match the real
Store/Admin URLs (with `https://`, no trailing slash). Fix, restart the API.

**Store shows unstyled / broken images**
→ You skipped the static-file copy (Phase 2.3). Re-run those two `cp`
commands, then restart the app.

**Login works then immediately logs out**
→ `COOKIE_SAMESITE=none` must be set in the API `.env`, and every app must
be on **https** (Hostinger temporary URLs already are).

**Payment succeeded but order still `pending`**
→ Razorpay → Webhooks → check recent deliveries. A failed one means
`RAZORPAY_WEBHOOK_SECRET` doesn't match. Fix in `.env`, restart the API.

**`pnpm: command not found` after reconnecting SSH**
→ Re-run `corepack enable && corepack prepare pnpm@10.33.0 --activate`.
