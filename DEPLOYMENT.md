# MINARA — Deployment Guide (Hostinger Node.js hosting + Vercel)

This guide assumes you have **never deployed a server before** and explains
each step, not just the command. You have a **Hostinger Node.js hosting
plan** (shared hosting), not a VPS — that changes the approach:

- A VPS gives you root access to a whole computer — you install and control
  nginx/PM2/SSL yourself.
- Node.js hosting (what you have) is **managed** — Hostinger runs the app
  for you through a form in hPanel. No terminal required for the app
  itself, and no ability to run 3 apps behind your own nginx.

So here's the plan, and it's genuinely a good one, not a compromise:

| App | Where it runs | Cost | Why |
|---|---|---|---|
| **API** (`apps/api`) | Your Hostinger Node.js plan | Already paid for | It's the one thing that must stay running 24/7 for payments/webhooks — perfect fit for hosting you already own. |
| **Store** (`apps/store`) | **Vercel** | Free | Vercel is built by the Next.js team specifically for apps like this. Free tier is generous, deploy is "connect GitHub → click deploy." |
| **Admin** (`apps/admin`) | **Vercel** | Free | Same reasoning. |

Total setup time: roughly **1–2 hours**, mostly waiting on DNS.

---

## Before you start — things you need

- [ ] Your Hostinger **Node.js hosting** plan active — a domain is **not**
      required to follow this guide. See "Testing without a domain first"
      right below.
- [ ] A **free Vercel account** — sign up at vercel.com using your GitHub
      account (this also connects your repo automatically).
- [ ] A **free MongoDB Atlas account** — your database. Hostinger doesn't
      include one. Sign up at mongodb.com/cloud/atlas, create a free **M0**
      cluster.
- [ ] A **Razorpay account in live mode** (not test mode), KYC approved.
- [ ] Your code already on GitHub — done, `github.com/ady254/Ecom`.

---

## Testing without a domain first (recommended — do this before buying anything)

You don't need to own a domain to test the entire site end-to-end,
including real payments and webhooks. Both Vercel and Hostinger give you a
free temporary web address before you attach a custom domain:

- **Vercel** automatically gives every project a URL like
  `minara-store.vercel.app` — no setup needed, it's there the moment you
  deploy.
- **Hostinger** gives your hosting account a temporary preview URL too —
  look on your hosting's main hPanel screen (or inside the Node.js
  application screen once created) for something like
  `https://yourusername.hostingersite.com` or a similar auto-generated
  address. If you don't see one listed, open a chat with Hostinger support
  and ask "what's the temporary URL for my Node.js hosting account before I
  connect a domain?" — every shared hosting account has one.

**How this changes the steps below:** everywhere this guide says
`https://minara.in`, `https://admin.minara.in`, or `https://api.minara.in`,
substitute your temporary URLs instead (e.g. `https://minara-store.vercel.app`,
`https://minara-admin.vercel.app`, `https://yourusername.hostingersite.com`).
Every env var, the CORS settings, the Razorpay webhook — all of it works
identically with temporary URLs, because none of the code cares *which*
domain it's given, only that `FRONTEND_URL`/`ADMIN_URL`/`NEXT_PUBLIC_API_URL`
are set correctly and consistently.

**Once you buy a real domain later:** you just replace these URLs in the
same three places (Vercel project → Settings → Environment Variables;
Hostinger's Node.js app → Environment Variables; and Vercel → Settings →
Domains to attach the real domain) — then redeploy Store/Admin
(automatic on Vercel) and restart the API. No code changes, nothing to
rebuild from scratch, no data lost — it's a pure address swap.

---

## Step 1 — Deploy the Store to Vercel (free)

1. Go to vercel.com → **Add New → Project** → pick your `Ecom` GitHub repo.
2. Vercel will ask for a **Root Directory** — click "Edit" and set it to
   `apps/store`. This tells Vercel "only build this folder," which matters
   because your repo has 3 separate apps in it.
3. Under **Environment Variables**, add:
   ```
   NEXT_PUBLIC_API_URL = https://api.minara.in/api/v1
   NEXT_PUBLIC_GOOGLE_CLIENT_ID = (only if you use Google sign-in, else skip)
   ```
   (You'll set up `api.minara.in` in Step 3 — that's fine, add the value
   now, it doesn't need to exist yet.)
4. Click **Deploy**. Takes 1–3 minutes.

**✅ Checkpoint:** Vercel gives you a URL like `minara.vercel.app` — open it,
your store should load (product data will fail until Step 4, that's
expected for now).

### Connect your real domain

In the Vercel project → **Settings → Domains**, add `minara.in` (and
`www.minara.in`). Vercel shows you DNS records to add. Go to Hostinger
hPanel → **Domains → DNS**, and add exactly what Vercel showed you
(usually an `A` record for `@` and a `CNAME` for `www`). Vercel issues free
HTTPS automatically once DNS points to it — no certbot, nothing to install.

**No domain yet?** Skip this "Connect your real domain" part entirely for
now — your `minara-store.vercel.app` URL already works over HTTPS and is
all you need for testing. Come back to this step once you've bought a
domain.

---

## Step 2 — Deploy the Admin to Vercel (free)

Repeat Step 1 exactly, but:
- Root Directory: `apps/admin`
- Env var: `NEXT_PUBLIC_API_URL = https://api.minara.in/api/v1`
- Domain: use a subdomain like `admin.minara.in` instead of the main domain
  (Vercel → Settings → Domains → add `admin.minara.in`, then add the CNAME
  record it shows you in Hostinger's DNS panel).

**✅ Checkpoint:** `admin.minara.in` loads the admin login page (login will
fail until later steps — expected).

---

## Step 3 — Deploy the API to your Hostinger Node.js plan

1. In hPanel, go to your hosting plan → **Websites** (or **Advanced**) →
   look for **Node.js**. This opens Hostinger's Node.js application
   manager.
2. **Create Application**:
   - **Node.js version:** 20.x
   - **Application root:** a folder for your code, e.g. `minara-api`
   - **Application URL:** the subdomain `api.minara.in` (add this
     subdomain first under Domains if it doesn't exist yet)
   - **Application startup file:** `apps/api/dist/server.js` (you'll
     upload the built code — see next step)
3. Getting your code onto the hosting: if your plan includes **SSH/Git
   access** (check hPanel → Advanced → SSH Access), the easiest way is:
   ```bash
   ssh your-username@your-server -p your-port
   cd ~/minara-api   # or wherever your Application root points
   git clone https://github.com/ady254/Ecom.git .
   cd apps/api
   npm install --production=false
   npm run build
   ```
   If your plan has **no SSH access**, use hPanel's **File Manager** to
   upload the contents of `apps/api` (you'll need to build it on your own
   PC first — run `pnpm --filter @minara/api build` locally, then upload
   the `dist` folder plus `package.json`, then use hPanel's Node.js screen
   to run `npm install --production` on the server).
4. In the same Node.js application screen, there's an **Environment
   Variables** section — add each of these (values explained below):

   | Variable | Where to get it |
   |---|---|
   | `MONGODB_URI` | MongoDB Atlas → Database → **Connect** → **Drivers** → copy the string, replace `<password>` with your Atlas user's password |
   | `JWT_ACCESS_SECRET` | Run locally: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
   | `JWT_REFRESH_SECRET` | Run that command again — must be a **different** value |
   | `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Razorpay Dashboard → Settings → API Keys — make sure the **Live mode** toggle (top-left) is on |
   | `RAZORPAY_WEBHOOK_SECRET` | Set up in Step 5 below — come back and fill this in after |
   | `FRONTEND_URL` | Your Vercel store URL, e.g. `https://minara.in` |
   | `ADMIN_URL` | Your Vercel admin URL, e.g. `https://admin.minara.in` |
   | `NODE_ENV` | `production` |
   | `COOKIE_SAMESITE` | `none` — **important**: because the store/admin (Vercel) and API (Hostinger) are on different hosting providers, cookies need `SameSite=None`. The code already sends `Secure` automatically whenever this is set to `none`, so this is safe over HTTPS. |
   | Email settings (`EMAIL_HOST`, `EMAIL_USER`, etc.) | Your email provider's SMTP details |

   Also, in Atlas → **Network Access**, add `0.0.0.0/0` (allow from
   anywhere) — shared hosting IPs can change, unlike a VPS's fixed IP, so
   you can't lock this down to one address here.

5. Click **Restart Application** in the Node.js manager screen after
   saving env vars — this is the shared-hosting equivalent of the PM2
   restart you'd do on a VPS.

**✅ Checkpoint:** visit `https://api.minara.in/health/check` — it should
report MongoDB connected.

---

## Step 4 — Confirm the store and admin can now reach the API

Revisit `https://minara.in` — products should now load. Revisit
`https://admin.minara.in` — try logging in (you'll create the actual admin
account in Step 6).

If products *don't* load, open your browser's DevTools (F12) → Network tab
→ reload → look for a red/failed request. A CORS error in the console
almost always means `FRONTEND_URL`/`ADMIN_URL` in the API's env vars don't
exactly match your real Vercel domains (including `https://`, no trailing
slash).

---

## Step 5 — Connect Razorpay's webhook (don't skip this)

This guarantees you never lose track of a payment, even if the customer's
browser closes right after paying.

1. Razorpay Dashboard → **Settings → Webhooks → Add New Webhook**
2. **URL:** `https://api.minara.in/api/v1/payments/razorpay/webhook`
3. **Secret:** make up a random string, save it somewhere safe
4. **Active events:** tick `payment.captured`, `payment.failed`,
   `refund.processed`

Now go back to the API's environment variables in hPanel, paste that same
secret into `RAZORPAY_WEBHOOK_SECRET`, save, and click **Restart
Application** again.

---

## Step 6 — Create your admin login

If you have SSH access (Step 3), run:
```bash
cd ~/minara-api/apps/api
SEED_ADMIN_EMAIL=you@example.com SEED_ADMIN_PASSWORD='Choose-A-Strong-Password-1' npm run seed:admin
```

If you don't have SSH access, run this **locally** on your own PC instead,
pointing it at your live database — temporarily set `MONGODB_URI` in your
local `apps/api/.env` to the same Atlas connection string you used on the
server, then:
```bash
cd apps/api
SEED_ADMIN_EMAIL=you@example.com SEED_ADMIN_PASSWORD='Choose-A-Strong-Password-1' pnpm seed:admin
```
(It talks directly to Atlas over the internet, so it doesn't matter which
machine runs it.)

---

## Step 7 — Test that everything actually works

Go through this in order — don't call the deployment done until every box
is checked.

- [ ] `curl https://api.minara.in/health/check` shows MongoDB connected.
- [ ] Log into `https://admin.minara.in` with the account from Step 6.
- [ ] Place a **Cash on Delivery test order** on the store — confirmation
      email arrives, order appears in the admin dashboard, product stock
      decreases.
- [ ] Create a ₹1 test product, buy it with a **real Razorpay payment** —
      order shows `paid`; Razorpay Dashboard → Webhooks shows a `200`
      delivery logged.
- [ ] Cancel that order from the admin — Razorpay shows an automatic
      refund, and stock is restored.
- [ ] Try logging into the admin dashboard with a normal customer
      account — it should be refused.

---

## Updating your site after this

- **Store or Admin changed:** just `git push` — Vercel automatically
  rebuilds and redeploys within a minute or two. Nothing else to do.
- **API changed:**
  ```bash
  cd ~/minara-api        # via SSH
  git pull
  cd apps/api
  npm install --production=false
  npm run build
  ```
  Then click **Restart Application** in hPanel's Node.js screen. (No SSH?
  Repeat the local-build-then-upload process from Step 3.)

---

## Free monitoring (worth the 5 minutes)

- **UptimeRobot** (free, uptimerobot.com) — point it at
  `https://api.minara.in/health/check` and your store's homepage, checked
  every 5 minutes, alerts you by email/WhatsApp the moment something's down.
- **Vercel dashboard** — shows build logs and runtime errors for
  Store/Admin automatically, no setup needed.
- **Hostinger hPanel → Node.js → Logs** — shows the API's console output,
  useful when something breaks.
- **MongoDB Atlas → Alerts** — free built-in warnings for storage/connection
  issues.

---

## Troubleshooting

**Store loads but no products show, and DevTools console shows a CORS
error**
→ `FRONTEND_URL` or `ADMIN_URL` in the API's env vars don't exactly match
your Vercel URLs. Fix, save, restart the application.

**Login works but you get logged out immediately / refresh doesn't work**
→ `COOKIE_SAMESITE` must be `none` (Step 3) since Store and API are on
different domains. Also double check the API is being served over
**HTTPS** — `SameSite=None` cookies are rejected by browsers over plain
HTTP.

**API's Node.js app shows as crashed/stopped in hPanel**
→ Check **Logs** in the same Node.js manager screen for the actual error —
almost always a wrong `MONGODB_URI` or a missing environment variable.

**Vercel build fails**
→ Click into the failed deployment → **Build Logs**. If it complains about
the wrong folder, double-check **Root Directory** is set to `apps/store`
(or `apps/admin`) in Project Settings → General.

**A payment succeeded in Razorpay but the order still shows "pending"**
→ Razorpay Dashboard → Webhooks → your webhook → check recent deliveries.
A red/failed delivery almost always means `RAZORPAY_WEBHOOK_SECRET` in
hPanel doesn't match what you entered in Razorpay. Fix and restart the
application.

**MongoDB Atlas connection fails ("could not connect")**
→ Confirm Atlas → Network Access has `0.0.0.0/0` allowed (Step 3) — shared
hosting doesn't have one fixed IP the way a VPS does.

---

## If you later want more control (optional, not required)

Everything above works well for a launch and steady small-to-medium
traffic. If you ever outgrow shared hosting or want everything on one
server you fully control, upgrading to a **Hostinger VPS** plan lets you
run all 3 apps yourself with PM2 + nginx — ask me for that guide when
you're ready; the money-path code doesn't change at all, only how it's
hosted.
