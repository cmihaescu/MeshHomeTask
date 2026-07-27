# Deploy this app for free

You can host the full app (frontend + backend) on a **single free URL** using [Vercel](https://vercel.com) or [Render](https://render.com).

## Option 0: Single project on Vercel (one URL)

The repo is pre-configured for Vercel: `vercel.json` builds the Vite frontend as static output and runs the Express backend as a serverless function (`api/index.js`). All `/api/*` and `/webhook*` requests hit the backend; everything else serves the React app.

1. **Push your code to GitHub** (if not already).

2. Go to [vercel.com/new](https://vercel.com/new), import the repo.
   - **Framework Preset:** Other (auto-detected from `vercel.json`).
   - **Root Directory:** leave as repo root.
   - Build command / output directory are already set by `vercel.json` — don't override them.

3. **Environment variables** (Project → Settings → Environment Variables) — same set as the Render blueprint:
   - Backend: `MESH_ENV`, `MESH_LINK_VERSION`, `MESH_API_URL_SANDBOX`, `MESH_API_URL_PRODUCTION`, `MESH_CLIENT_ID` (+ `_V1`/`_V2`), `MESH_CLIENT_SECRET_SANDBOX` / `MESH_CLIENT_SECRET_PRODUCTION` (+ `_V1`/`_V2`), `BINANCE_ACCESS_TOKEN`.
   - Frontend (baked in at build time): `VITE_MESH_CLIENT_ID` (+ `_V1`/`_V2`), `VITE_BINANCE_ACCESS_TOKEN`, `VITE_LEDGER_ACCESS_TOKEN`.
   - After adding/changing `VITE_*` vars you must **redeploy** for them to take effect.

4. **Deploy.** You get one URL, e.g. `https://your-app.vercel.app`. Register `https://your-app.vercel.app/webhook` in the Mesh dashboard as the webhook endpoint, and whitelist the domain in Mesh to avoid CSP errors.

Alternatively from the CLI: `npm i -g vercel && vercel` (then `vercel --prod`).

**Serverless caveat:** the backend's in-memory store (orders, stored Mesh tokens, wallet addresses) does not persist between serverless invocations on Vercel — each request may hit a fresh instance. Fine for demoing the payment flow; if you need the stored data to survive, use Render (Option A below) or move the store to a database.

---

## Option A: Single service on Render (one URL, recommended)

1. **Push your code to GitHub** (if not already).

2. **Create a Render account** at [render.com](https://render.com) (free).

3. **New → Web Service**
   - Connect your GitHub repo.
   - **Root Directory:** leave empty (use repo root).
   - **Runtime:** Node.
   - **Build Command:**
   ```bash
   cd frontend && npm install && npm run build && cd ../backend && npm install
   ```
   - **Start Command:**
   ```bash
   cd backend && npm start
   ```
   - **Instance type:** Free.

4. **Environment variables** (in Render dashboard → Environment):
   - Add any your backend needs (e.g. `MESH_CLIENT_ID`, `MESH_CLIENT_SECRET`, `MESH_API_URL`, `PORT`).
   - For the frontend Mesh SDK, add:
     - `VITE_MESH_CLIENT_ID` = same as your Mesh client ID (so the frontend can connect to Mesh).

5. **Deploy.** Render will build the frontend, then run the backend. The backend serves the frontend and the API from one URL, e.g. `https://your-app-name.onrender.com`.

**Note:** On the free tier the service may sleep after inactivity; the first request after that can be slow.

---

## Option B: Frontend and backend on different URLs

If you prefer to host frontend and backend separately (e.g. frontend on Vercel, backend on Render):

1. **Backend on Render:** New → Web Service, Root Directory: `backend`, Build: `npm install`, Start: `npm start`. Add env vars. You get e.g. `https://your-backend.onrender.com`.

2. **Frontend on Vercel or Netlify:** Connect the repo, Root: `frontend`, Build: `npm run build`, Publish: `dist`. Add env var **`VITE_API_URL`** = `https://your-backend.onrender.com` (no trailing slash).

3. **Code change:** The frontend must use `VITE_API_URL` for API calls (e.g. `fetch(import.meta.env.VITE_API_URL + '/api/...')`). Right now the app uses relative `/api/...`; for Option A that’s fine because the backend serves the app. For Option B you’d need to add and use `VITE_API_URL` in all API fetch calls.

---

## Mesh webhooks in production

Your backend has a `/webhook` (or similar) route for Mesh. For Mesh to call it:

1. Expose your deployed URL (e.g. `https://your-app.onrender.com/webhook`).
2. Register that URL in the Mesh dashboard as the webhook endpoint.
3. No need for ngrok once the app is deployed.

---

## Other free options

- **Railway** – Free tier with a monthly credit; similar “one repo, one service” setup.
- **Fly.io** – Free tier; deploy with a Dockerfile or their Node setup.
- **Vercel** – Best for frontend; backend would need to be refactored into serverless functions or hosted elsewhere (e.g. Render) as in Option B.

Option A (single service on Render) is the simplest way to get one free URL for the whole app.
