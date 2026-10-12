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

---

## 🌐 Cloudflare CDN & Edge Caching Architecture

### ⏱️ When Should You Add Cloudflare & Edge Caching?

| Milestones / Triggers | Why It's Critical for Kasma Tech Shop | Recommended Action |
| :--- | :--- | :--- |
| **Day 1 (Public Launch & Custom Domain)** | Connecting `kasmashop.et` or public domain. Cloudflare provides **free Anycast DNS, SSL/TLS termination, DDoS protection, and HTTP/3**. | Point your domain's Nameservers to Cloudflare immediately. |
| **Ethiopian Telecom Latency (>2s First Paint)** | Servers on Render/Railway/Cloud Run are physically located in Europe (Frankfurt) or the US. Round-trip ping from Ethio Telecom / Safaricom to Europe is **140ms–220ms**. Without a CDN, loading 15 assets takes 3+ seconds just in TCP handshakes. | Proxy traffic through Cloudflare (Orange Cloud) to serve assets from East Africa/regional edge PoPs (Nairobi, Djibouti, Mombasa, Dubai). |
| **Flash Deals & Holiday Sales Traffic Spikes** | During Ethiopian holidays (*Enkutatash, Genna, Timkat*) or flash sales, concurrent visitors surge. A single server will hit CPU caps and database connection pooling limits. | Edge cache product catalog API responses (`/api/products`) with `stale-while-revalidate`. 90%+ of traffic hits the edge cache, sparing PostgreSQL. |
| **Image & Asset Bandwidth Reduction** | Kasma showcases high-res gadget photography (laptops, cameras, smartphones). Mobile data in Ethiopia is metered and sensitive. | Enable Cloudflare Polish / Auto WebP/AVIF conversion and Brotli compression to cut payload sizes by 60–75%. |

---

### 🛡️ Edge Caching Matrix: What to Cache vs What to Bypass

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              CLOUDFLARE EDGE CACHING RULES                             │
├──────────────────────────────┬──────────────────────────────┬──────────────────────────┤
│           RESOURCE           │        CACHE BEHAVIOR        │       CACHE-CONTROL      │
├──────────────────────────────┼──────────────────────────────┼──────────────────────────┤
│ Hashed Assets (/assets/*.js) │ Cache at Edge (1 Year)       │ public, max-age=31536000 │
│ Product Images & Icons       │ Cache at Edge (7 Days)       │ public, max-age=604800   │
│ Web Fonts (.woff2)           │ Cache at Edge (1 Year)       │ public, max-age=31536000 │
│ Catalog API (/api/products)  │ Edge Cache + SWR (5 Minutes) │ s-maxage=300, SWR=600    │
├──────────────────────────────┼──────────────────────────────┼──────────────────────────┤
│ SPA Shell (index.html)       │ NEVER Cache (Must revalidate)│ no-cache, no-store       │
│ Payments & Webhooks          │ BYPASS CDN (Strict Dynamic)  │ private, no-store        │
│ Auth / Profile / Courier PIN │ BYPASS CDN (Strict Dynamic)  │ private, no-store        │
└──────────────────────────────┴──────────────────────────────┴──────────────────────────┘
```

#### 1. Static Assets (Cache Everything at Edge)
Configure a **Cache Rule** in the Cloudflare dashboard:
- **Expression:** `(http.request.uri.path starts_with "/assets/") or (http.request.uri.path contains ".png") or (http.request.uri.path contains ".jpg") or (http.request.uri.path contains ".webp")`
- **Cache Eligibility:** Eligible for cache
- **Edge TTL:** Respect origin headers or Override: `1 month`
- **Browser TTL:** `1 year`

#### 2. SPA Root Route (`index.html`)
- **Expression:** `(http.request.uri.path eq "/") or (http.request.uri.path eq "/index.html")`
- **Cache Eligibility:** Bypass cache (Ensures users immediately receive new frontend releases without stale cached bundles).

#### 3. Secure Dynamic APIs (Strict Bypass)
- **Expression:** `(http.request.uri.path starts_with "/api/payments") or (http.request.uri.path starts_with "/api/courier") or (http.request.uri.path starts_with "/api/auth") or (http.request.uri.path starts_with "/api/merchant")`
- **Cache Eligibility:** Bypass cache

---

### ⚡ Recommended Cloudflare Performance Toggles

In your Cloudflare Dashboard under **Speed** -> **Optimization**:
1. **HTTP/3 (QUIC):** `ON` (Crucial for mobile devices dropping packets on cellular towers in Addis Ababa; recovers lost packets without stalling TCP connections).
2. **0-RTT Connection Resumption:** `ON` (Eliminates round-trip delay for returning shoppers).
3. **Brotli Compression:** `ON` (Compresses JS and CSS 15–20% smaller than standard Gzip).
4. **Early Hints (103):** `ON` (Pre-loads critical fonts and CSS while the server prepares the initial response).
5. **Always Online™:** `ON` (Serves cached product pages even if your origin server restarts).

