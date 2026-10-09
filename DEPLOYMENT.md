# 🚀 Kasma Tech Shop - Production Deployment Runbook

Complete guide for deploying Kasma Tech Shop to production environments with CDN edge caching, SSL, PostgreSQL persistence, and Ethiopian payment rails.

---

## 📋 System Architecture

```
                               ┌─────────────────────────┐
                               │ Cloudflare / Fastly CDN │
                               │ (Edge Caching / SSL)    │
                               └────────────┬────────────┘
                                            │
                                            ▼
                           ┌─────────────────────────────────┐
                           │   Docker Container / Host       │
                           │   Express 4 + Node 22 (Alpine)  │
                           │   ├── Port: 3000 / $PORT        │
                           │   ├── Assets: 1-yr Immutable    │
                           │   └── Health: /api/health       │
                           └────────┬───────────────┬────────┘
                                    │               │
            ┌───────────────────────┴─┐   ┌─────────┴───────────────────────┐
            ▼                         ▼   ▼                                 ▼
┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────────┐
│  PostgreSQL Database │ │  Chapa Payment Rails │ │  Telegram Bot Engine │ │  Gemini 3.5 AI Flash │
│  Neon / Cloud SQL    │ │  Telebirr, CBE, Card │ │  Merchant Alerts     │ │  SEO & Forecasting   │
└──────────────────────┘ └──────────────────────┘ └──────────────────────┘ └──────────────────────┘
```

---

## 🔑 Required Production Environment Variables

Configure these variables in your hosting provider's dashboard:

| Variable | Description | Required | Example |
| :--- | :--- | :---: | :--- |
| `NODE_ENV` | Environment identifier | Yes | `production` |
| `PORT` | Web server listening port | Yes (platform default) | `3000` or `10000` |
| `DATABASE_URL` | PostgreSQL connection string | Yes | `postgres://user:pass@ep-cool-db.neon.tech/kasma?sslmode=require` |
| `JWT_SECRET` | 256-bit secret for signing RBAC tokens | Yes | `sec_4f92a188...` |
| `ADMIN_USERNAME` | Administrator portal login handle | Yes | `kasma-admin` |
| `ADMIN_PASSWORD` | Administrator portal password | Yes | *(Set a strong secret)* |
| `CHAPA_SECRET_KEY` | Chapa Live / Test API Secret Key | Yes | `CHASECK_TEST-xxx` or `CHASECK_LIVE-xxx` |
| `CHAPA_PUBLIC_KEY` | Chapa Public Key for client-side SDK | Yes | `CHAPUBK_TEST-xxx` |
| `CHAPA_WEBHOOK_SECRET` | HMAC Secret for validating `x-chapa-signature` | Recommended | `kasma_chapa_webhook_secret_2026` |
| `TELEGRAM_BOT_TOKEN` | Bot token from @BotFather for order alerts | Optional | `8192038102:AAH9f...` |
| `GEMINI_API_KEY` | Google Gemini API key for catalog SEO & ML forecasts | Optional | `AIzaSy...` |
| `APP_URL` | Canonical public URL of your deployed app | Yes | `https://kasmashop.et` |

---

## 📦 Deployment Options

### Option 1: Render (Recommended for Fast Launch)

1. Fork or push this repository to GitHub.
2. In the [Render Dashboard](https://dashboard.render.com/):
   - Click **New** -> **Blueprint**.
   - Connect the repository containing [`render.yaml`](file:///g:/Kasma-Tech-Shop/render.yaml).
3. Fill in the sensitive environment variables (`DATABASE_URL`, `ADMIN_PASSWORD`, `CHAPA_SECRET_KEY`).
4. Click **Apply**. Render will automatically run:
   - Build: `npm install && npm run build`
   - Start: `npm run start`
   - Verification: Pings `/api/health` until healthy.

---

### Option 2: Railway

1. Install the Railway CLI or connect via [Railway.app](https://railway.app/).
2. Run in project directory:
   ```bash
   railway login
   railway init
   railway up
   ```
3. In the Railway dashboard:
   - Attach a PostgreSQL plugin or paste your external `DATABASE_URL`.
   - Set the environment variables listed in the table above.
4. Railway will automatically detect [`Dockerfile`](file:///g:/Kasma-Tech-Shop/Dockerfile) and [`railway.json`](file:///g:/Kasma-Tech-Shop/railway.json).

---

### Option 3: Google Cloud Run + Cloud CDN

1. Authenticate with Google Cloud:
   ```bash
   gcloud auth login
   gcloud config set project your-gcp-project-id
   ```
2. Build and submit container image:
   ```bash
   gcloud builds submit --tag gcr.io/your-gcp-project-id/kasma-shop:v1
   ```
3. Deploy to Cloud Run:
   ```bash
   gcloud run deploy kasma-shop \
     --image gcr.io/your-gcp-project-id/kasma-shop:v1 \
     --platform managed \
     --region europe-west1 \
     --allow-unauthenticated \
     --port 3000 \
     --set-env-vars "NODE_ENV=production,APP_URL=https://kasmashop.et"
   ```
4. Map your custom domain (`kasmashop.et`) and enable Google Cloud CDN on the load balancer to cache static assets in `/assets/*` with HTTP/3 and edge SSL termination.

---

## 🗄️ Database Initialization & Migrations

If deploying with a fresh PostgreSQL instance, push the schema:

```bash
# Push Drizzle schema to production PostgreSQL
npm run db:push

# Optional: Seed initial electronics catalog & verified demo merchants
npm run db:seed
```

---

## 🧪 Production Verification Checklist

Run these quick smoke tests against your live deployment:

1. **Health Check:**
   ```bash
   curl -i https://your-domain.com/api/health
   # Expected: HTTP 200 {"status":"ok","version":"1.0.0",...}
   ```
2. **Security Headers Verification:**
   ```bash
   curl -I https://your-domain.com/
   # Expected headers:
   # X-Content-Type-Options: nosniff
   # X-Frame-Options: SAMEORIGIN
   # Referrer-Policy: strict-origin-when-cross-origin
   ```
3. **CDN Caching Verification:**
   ```bash
   curl -I https://your-domain.com/assets/index-*.css
   # Expected header:
   # Cache-Control: public, max-age=31536000, immutable
   ```
4. **Public Order Tracking Test:**
   ```bash
   curl https://your-domain.com/api/orders/track?phone=0911223344
   ```
