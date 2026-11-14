# Deployment Guide: Vercel & Render

This guide walks you through deploying the **Phasor SADC Space Weather Defense Platform** to production using **Render** (for the Python FastAPI scientific backend) and **Vercel** (for the Next.js Operations Dashboard and Vite Landing Page).

```
   ┌────────────────────────────────────────────────────────┐
   │                  Vercel (Frontends)                    │
   │  1. Operations Control Room: apps/dashboard (Next.js)   │
   │  2. Editorial Landing Page: apps/home (Vite)           │
   └──────────────────────────┬─────────────────────────────┘
                              │
               HTTPS / CORS   │  REST APIs & Telemetry
                              ▼
   ┌────────────────────────────────────────────────────────┐
   │                   Render (Backend)                     │
   │  FastAPI Scientific Physics Engine: server/main.py     │
   │  (SAPP Grid, GNSS PRISM, Health, Aviation Triad)       │
   └────────────────────────────────────────────────────────┘
```

---

## Part 1: Deploy Backend to Render

Render will host your FastAPI scientific computation backend.

### Option A: 1-Click Render Blueprint (Recommended)
Because the repository includes [`render.yaml`](../render.yaml), you can deploy with zero manual setup:

1. Log into your [Render Dashboard](https://dashboard.render.com/).
2. Click **New +** in the top right and select **Blueprint**.
3. Connect your GitHub repository: `https://github.com/ShawnTheCreator/phasor-`.
4. Render will automatically read `render.yaml` and configure:
   - **Service Name:** `phasor-api`
   - **Runtime:** Python 3.11
   - **Region:** Frankfurt (or Oregon)
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn server.main:app --host 0.0.0.0 --port $PORT`
   - **Health Check Path:** `/api/status`
5. Click **Apply**.
6. Once deployed, note down your live service URL (e.g. `https://phasor-api.onrender.com`).

---

### Option B: Manual Web Service Setup
If you prefer setting up manually:

1. Click **New +** $\to$ **Web Service**.
2. Select your repository: `ShawnTheCreator/phasor-`.
3. Configure settings:
   - **Name:** `phasor-api`
   - **Region:** Frankfurt (EU) or Oregon (US)
   - **Branch:** `main`
   - **Root Directory:** *(leave blank / repository root)*
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn server.main:app --host 0.0.0.0 --port $PORT`
   - **Plan:** Free
4. Add **Environment Variables** in the Render settings:
   | Key | Value | Description |
   | :--- | :--- | :--- |
   | `PYTHON_VERSION` | `3.11.8` | Python runtime version |
   | `NOAA_SWPC_RTSW_URL` | `https://services.swpc.noaa.gov/products/solar-wind/plasma-1-day.json` | Live solar wind stream |
   | `NOAA_MAG_URL` | `https://services.swpc.noaa.gov/products/solar-wind/mag-1-day.json` | Live IMF telemetry |
   | `SANSA_HERMANUS_API_URL` | `https://spaceweather.sansa.org.za/api/geomag/her` | SANSA Hermanus node |
   | `AFRICAS_TALKING_USERNAME` | `phasor_sadc` | Africa's Talking username |
   | `AFRICAS_TALKING_API_KEY` | *(your key)* | Optional for live SMS |
5. Click **Create Web Service**.
6. When deployment finishes, test the endpoint in your browser:
   `https://<your-render-url>/api/status`
   You should see: `{"status": "online", "system": "Phasor / GridGuard Africa"}`.

---

## Part 2: Deploy Frontend to Vercel

Vercel natively supports Next.js and Vite monorepos.

### Step 1: Deploy the Operations Control Room (`apps/dashboard`)

1. Log into your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** $\to$ **Project**.
3. Import your GitHub repository: `https://github.com/ShawnTheCreator/phasor-`.
4. In the **Configure Project** screen:
   - **Project Name:** `phasor-dashboard` (or your preferred name)
   - **Framework Preset:** `Next.js` (auto-detected)
   - **Root Directory:** Click **Edit** and select:
     ```
     apps/dashboard
     ```
5. Expand the **Environment Variables** section and add:
   - **Key:** `NEXT_PUBLIC_API_URL`
   - **Value:** `https://<your-render-app>.onrender.com` *(your Render backend URL from Part 1, without trailing slash)*
6. Click **Deploy**.
7. Vercel will build the Next.js app in ~45 seconds and give you a live production URL (e.g. `https://phasor-dashboard.vercel.app`).

---

### Step 2: Deploy the Editorial Landing Page (`apps/home`) *(Optional)*

If you wish to deploy the public 3D landing page alongside the dashboard:

1. In Vercel, click **Add New...** $\to$ **Project**.
2. Select the same repository: `ShawnTheCreator/phasor-`.
3. In **Configure Project**:
   - **Project Name:** `phasor-home`
   - **Framework Preset:** `Vite` (auto-detected)
   - **Root Directory:** Click **Edit** and select:
     ```
     apps/home
     ```
4. Expand **Environment Variables**:
   - **Key:** `VITE_DASHBOARD_URL`
   - **Value:** `https://phasor-dashboard.vercel.app` *(the Vercel dashboard URL from Step 1)*
5. Click **Deploy**.

---

## Part 3: Verification & Health Checks

Once both services are deployed, test the full loop:

1. **Backend Health Check:**
   Navigate to:
   ```
   https://<your-render-service>.onrender.com/api/status
   ```
2. **Interactive API Documentation:**
   Explore live FastAPI Swagger docs:
   ```
   https://<your-render-service>.onrender.com/docs
   ```
3. **Multi-Hazard SADC Operational Pictures:**
   Open your Vercel Dashboard (`https://<your-vercel-dashboard>.vercel.app/`):
   - **SAPP Power Grid:** `/grid`
   - **GNSS Scintillation & EPB Drift:** `/gnss`
   - **Health Resilience & Hospital Overlay:** `/health`
   - **Aviation Risk Triad:** `/aviation`
   - **LEO Satellite Drag:** `/satellites`
   - **Civil Protection Public Safety:** `/public`

---

## Part 4: Troubleshooting & Tips

- **Render Free Tier Cold Starts:** Free Render instances spin down after 15 minutes of inactivity and take ~30–50 seconds to boot on the first request. The dashboard includes built-in fallback mock data and automatic retries so the UI never crashes during a cold start.
- **CORS:** Cross-Origin Resource Sharing is enabled by default in `server/main.py` (`allow_origins=["*"]`), allowing requests from your Vercel domain.
- **Continuous Deployment:** Every time you push to the `main` branch on GitHub (`git push origin main`), both Render and Vercel will automatically re-build and deploy your updates.
