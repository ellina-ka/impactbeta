# impactbeta
My Impact Beta Version

## Frontend deployment checklist
1. Build from the frontend folder:
   - `cd frontend && npm ci && npm run build`
2. Publish the `frontend/build` directory (not `frontend/src`).
3. If hosted under a subpath, set CRA base path at build time:
   - `PUBLIC_URL=/your-subpath npm run build`
4. Bust CDN/browser cache for admin avatars by changing:
   - `REACT_APP_ADMIN_ASSET_VERSION=<new-value> npm run build`

Admin avatars are served from `${PUBLIC_URL}/admins/lio.png` and `${PUBLIC_URL}/admins/ellina.png`.

## GitHub Pages (Static Demo) — now implemented
This repo now supports a **static demo mode** for GitHub Pages.

### What is included
- Static-mode API wrapper: `frontend/src/api/client.js`
- Demo data source: `frontend/src/data/mockData.js`
- Components switched away from direct `fetch(...)` calls
- GitHub Pages workflow: `.github/workflows/deploy-pages.yml`
- Env defaults:
  - `frontend/.env.production` -> static mode on
  - `frontend/.env.development` -> backend mode on (localhost)

### How to deploy with GitHub Pages
1. In GitHub repo settings, set **Pages source** to **GitHub Actions**.
2. Push to `main`.
3. Workflow builds `frontend` and deploys `frontend/build`.
4. Site URL should be:
   - `https://<your-github-username>.github.io/impactbeta/`

### Local run modes
- Full-stack local (with FastAPI backend):
  - backend on `http://localhost:8001`
  - run `cd frontend && npm start`
- Static demo local (no backend):
  - `cd frontend && REACT_APP_STATIC_MODE=true npm start`
