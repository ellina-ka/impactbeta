# Static GitHub Pages Mode — Do This Today

This checklist gives exact edits to get a **frontend-only** deployment working on GitHub Pages.

## 1) Add static mode env files

### File: `frontend/.env.production`
Create this file with:

```env
REACT_APP_STATIC_MODE=true
REACT_APP_ADMIN_ASSET_VERSION=20260205
```

### File: `frontend/.env.development`
Create this file with:

```env
REACT_APP_STATIC_MODE=false
REACT_APP_BACKEND_URL=http://localhost:8001
```

---

## 2) Add a static API wrapper and mock data

### File: `frontend/src/data/mockData.js`
Create this file and export a default object with at least:

- `terms`
- `settings`
- `kpisByTerm`
- `programsByTerm`
- `verificationRequestsByTerm`
- `studentsByTerm`

Use your real sample values from current backend responses.

### File: `frontend/src/api/client.js`
Create this file:

- Read `REACT_APP_STATIC_MODE`.
- If static mode is true, return data from `mockData.js`.
- If static mode is false, call existing backend endpoints.

Implement functions (exact names recommended):

- `getTerms()`
- `getSettings()`
- `getKpis(termId)`
- `getPrograms(termId)`
- `getProgram(programId)`
- `getVerificationRequests(termId, status)`
- `getStudents(termId)`
- `getStudent(studentId, termId)`
- `confirmVerification(requestId)`
- `rejectVerification(requestId, reason)`
- `flagVerification(requestId, reason)`
- `updateSettings(payload)`
- `getExportUrl(type, termId)`

In static mode, mutating calls can resolve `{ ok: true }` and update local in-memory copies so UI feels live.

---

## 3) Replace direct `fetch` usage in React components

Update each file to import from `frontend/src/api/client.js`.

### File: `frontend/src/App.js`
Replace direct fetch calls with wrapper calls:

- Initial load: `getTerms()`, `getSettings()`
- Term load: `getKpis(selectedTerm)`, `getPrograms(selectedTerm)`, `getVerificationRequests(selectedTerm, 'awaiting_confirmation')`, `getStudents(selectedTerm)`
- Actions: `confirmVerification`, `rejectVerification`, `flagVerification`, `updateSettings`

### File: `frontend/src/components/ActivitiesPage.js`
Use wrapper for:

- verification request list
- service log list (add `getServiceLogs(termId)` in client if needed)
- confirm/reject/flag actions

### File: `frontend/src/components/ParticipantsPage.js`
Use wrapper `getStudent(studentId, selectedTerm)`.

### File: `frontend/src/components/Dashboard.js`
Use wrapper `getProgram(programId)` for modal details.

### File: `frontend/src/components/ReportsPage.js`
Use `getExportUrl(type, selectedTerm)`.

If static mode is true, export button behavior should:

- either generate a CSV in-browser,
- or show a toast saying “Static demo mode: export file generation is mocked”.

---

## 4) Configure GitHub Pages deployment

### File: `frontend/package.json`
Add these fields/scripts:

```json
{
  "homepage": "https://<YOUR_GITHUB_USERNAME>.github.io/impactbeta",
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
}
```

Install dependency:

```bash
cd frontend && npm install --save-dev gh-pages
```

> If you prefer GitHub Actions only, you can skip `gh-pages` script method and use the workflow below.

### File: `.github/workflows/deploy-pages.yml`
Create workflow:

- Trigger: push to `main`
- Build from `frontend`
- Upload `frontend/build`
- Deploy with `actions/deploy-pages`

Use this exact workflow:

```yaml
name: Deploy frontend to GitHub Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: true

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
          cache-dependency-path: frontend/package-lock.json
      - name: Install deps
        run: npm ci
        working-directory: frontend
      - name: Build
        run: npm run build
        working-directory: frontend
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: frontend/build

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

---

## 5) Update docs so teammate can deploy without you

### File: `README.md`
Add section `## GitHub Pages (Static Demo)` with:

1. “This mode does not run FastAPI backend.”
2. “Set `REACT_APP_STATIC_MODE=true` in production.”
3. “Push to main to deploy via Actions.”
4. The final URL format.

Also add section `## Full-stack mode (later)` with:

- frontend hosted anywhere,
- backend hosted on Render/Railway/Fly.io,
- `REACT_APP_BACKEND_URL` set to backend URL.

---

## 6) One-time GitHub repo settings

In GitHub UI:

- **Settings → Pages → Build and deployment → Source = GitHub Actions**
- Save.

If using custom domain later:

- Add `CNAME` in Pages settings
- Keep HTTPS enabled

---

## 7) Smoke test before pushing

Run:

```bash
cd frontend
npm ci
npm run build
npx serve -s build
```

Open local URL and verify:

- dashboard loads
- term switcher works
- no failing network calls required for static mode
- admin images load from `/admins/...`

---

## 8) Definition of done for “today”

You are done today when:

- Main page loads from GitHub Pages URL.
- No critical UI errors in console.
- Team member can clone and redeploy from README only.
