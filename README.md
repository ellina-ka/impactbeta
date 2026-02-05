# impactbeta (v0)

This repository now has a **working v0** that can run on **GitHub Pages**.

In simple terms:
- The **website UI works** on GitHub Pages.
- The data is currently **demo/mock data** in frontend code for Pages mode.
- The real backend still exists in this repo, but GitHub Pages does not run backend servers.

---

## 1) What this v0 is (plain words)

Think of the project as two parts:

1. **Frontend (React)** = what people see in the browser.
2. **Backend (FastAPI)** = where real data usually lives and where API endpoints run.

GitHub Pages can host only static frontend files. So for v0, we added a **static mode**:

- In static mode, the frontend reads from local mock data (`frontend/src/data/mockData.js`).
- The UI actions (confirm/reject/flag/settings) are simulated in-memory so the app still feels interactive.
- No real database is being updated on GitHub Pages.

So yes: **it “works” on GitHub now as a demo product.**

---

## 2) Exactly what was implemented for this version

### Core changes
- Added API wrapper with two modes: live backend mode and static demo mode:
  - `frontend/src/api/client.js`
- Added mock data source used by static mode:
  - `frontend/src/data/mockData.js`
- Refactored key pages to call the API wrapper instead of hard-coded direct backend fetches:
  - `frontend/src/App.js`
  - `frontend/src/components/ActivitiesPage.js`
  - `frontend/src/components/Dashboard.js`
  - `frontend/src/components/ParticipantsPage.js`
  - `frontend/src/components/ReportsPage.js`

### GitHub Pages deployment
- Added CI workflow for Pages deployment:
  - `.github/workflows/deploy-pages.yml`
- Build is performed from `frontend/` and publishes `frontend/build`.

### Environment setup
- Added env examples:
  - `frontend/.env.production.example`
  - `frontend/.env.development.example`
- `frontend/package.json` uses relative homepage paths (`"homepage": "."`) to avoid path issues in project pages.

---

## 3) What works right now vs what does not

### ✅ Works now (v0)
- UI pages load on GitHub Pages.
- Switching terms and navigating pages works.
- Demo actions work in the current browser session (simulated data changes).
- Team can review flows and design without running backend.

### ⚠️ Not “production real” yet
- Data is not persistent in static mode (refresh resets to mock baseline).
- No real database writes on GitHub Pages.
- Export/report behavior is partially mocked in static mode.
- Multi-user collaboration on real data is not possible yet.

---

## 4) How your teammate should run this

### A) GitHub Pages demo (no backend)
1. In GitHub repo settings → **Pages** → Source: **GitHub Actions**.
2. Push to `main`.
3. Workflow deploys site.
4. URL pattern:
   - `https://<your-github-username>.github.io/impactbeta/`

### B) Local full-stack dev (frontend + backend)
Backend:
```bash
cd backend
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8001 --reload
```

Frontend:
```bash
cd frontend
cp .env.development.example .env.development
npm ci
npm start
```

### C) Local static demo mode (frontend only)
```bash
cd frontend
cp .env.production.example .env.production
npm ci
REACT_APP_STATIC_MODE=true npm start
```

---

## 5) Ownership/collab notes for this v0

- You now have a clean GitHub-hosted demo baseline.
- Your teammate can pull and run the exact same demo behavior.
- This is a good milestone tag candidate (example: `v0-pages-demo`).

Recommended immediate team habit:
- Keep `main` stable and deployable.
- Do feature work in branches.
- Merge only when Pages deploy and smoke check pass.

---

## 6) What to do next (v1): real backend + real data

You asked: “does backend data need another website?”

**Short answer:** yes, the backend must run somewhere as a web service/API (not on GitHub Pages).

### Architecture for v1
- Frontend: GitHub Pages (or Vercel/Netlify later)
- Backend API: separate host (Render / Railway / Fly.io / AWS / etc.)
- Database: Postgres (managed DB on Render/Neon/Supabase/etc.)

Frontend will call:
- `REACT_APP_BACKEND_URL=https://your-api-domain.com`

### Practical step-by-step next plan
1. **Backend deploy target**: choose Render or Railway (fastest start).
2. **Move backend from in-memory store to database** (Postgres).
3. **Keep same API contract** so frontend changes are minimal.
4. **Set CORS** to allow your frontend domain.
5. **Set frontend env** `REACT_APP_BACKEND_URL` to hosted API URL.
6. **Add auth** (admin login) before real users/data.
7. **Add backups + migration scripts** for DB.
8. **Then connect custom domain**.

---

## 7) Suggested release roadmap

- **v0 (current):** GitHub Pages static demo, mock data.
- **v1:** hosted backend + real DB + persistent data.
- **v1.1:** auth/roles + audit hardening.
- **v2:** production polish, observability, automated tests, custom domain everywhere.

---

## 8) File map for partner handoff

- Frontend app root: `frontend/src/App.js`
- API abstraction layer: `frontend/src/api/client.js`
- Mock data for Pages mode: `frontend/src/data/mockData.js`
- Pages deployment pipeline: `.github/workflows/deploy-pages.yml`
- Backend service entrypoint: `backend/server.py`

If your teammate reads only this README + those files, they should understand the full v0 setup.
