# Impact Beta demo readiness review

_Last updated: 2026-05-10_

## Executive status

Impact Beta currently has two product tracks in the same repository:

1. **Legacy MyImpact admin dashboard**: FastAPI + React pages for terms, programs, participants, service logs, verification actions, settings, and CSV exports.
2. **Current live workflow demo**: React role-based flow for school admin, student, and NGO admin around applications and generated conventions.

The live demo path is intentionally frontend-first. It can run without a hosted backend by using local demo workflow data. If Supabase is configured but its tables/policies are not ready, the workflow now falls back to local demo data by default so the demo does not break in front of reviewers.

## What works for a demo now

- School admin view shows request KPIs, pending student applications, validation/rejection actions, and generated conventions.
- Student view can submit a new application in the browser session and see status/convention information.
- NGO view can review conventions assigned to the demo NGO filter.
- Language switching is available for French and English.
- GitHub Pages deployment builds the React frontend only, with static/demo flags enabled.

## What is not production-real yet

- Local demo data is not persistent after refresh unless Supabase is correctly provisioned.
- Supabase requires the `profiles`, `applications`, and `conventions` tables with the column names expected by `frontend/src/api/workflowService.js`.
- Supabase Auth and RLS are now the recommended production path, but they must be provisioned and smoke-tested in the target Supabase project before pilot use.
- The FastAPI backend remains a legacy/admin analytics track; the Supabase workflow path is the MVP source of truth.
- GitHub Pages cannot host the FastAPI server. A Supabase-backed workflow is the fastest path to real multi-user data for the current MVP.

## Why the live workflow can fail

The most likely current failure modes are:

1. **Dependency lock mismatch**: `npm ci` failed because `package-lock.json` was missing the resolved Tailwind nested `yaml` package metadata. This has been corrected.
2. **Supabase configured but not ready**: if `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_PUBLISHABLE_KEY`/`REACT_APP_SUPABASE_ANON_KEY` exist but the tables/policies are missing, reads/writes throw errors. Demo builds can fall back to local data, but pilot builds should set `REACT_APP_DEMO_FALLBACK=false`.
3. **Expecting GitHub Pages to run backend logic**: Pages only serves static files, so FastAPI endpoints are unavailable there.
4. **Branch mismatch**: the Pages workflow deploys only pushes to `main` or manual workflow dispatches.

## Tomorrow demo scope

For a credible demo by tomorrow, keep the promise tight:

- Show the role selector: school admin, student, NGO admin.
- Student submits an application.
- School admin validates or rejects it.
- Validated applications generate conventions.
- NGO admin sees conventions ready for signature.
- Explain that persistence is either demo-mode in-memory or Supabase-backed when the database is provisioned.

Do **not** promise production readiness, complete audit exports, or real multi-user persistence unless the Supabase pilot environment has passed the smoke test first.

## Immediate checklist before pushing demo

1. Run `npm ci --no-audit --no-fund` in `frontend/`.
2. Run `npm run build` in `frontend/`.
3. Push/merge to `main` or manually dispatch the Pages workflow.
4. Open the GitHub Pages URL and smoke-test:
   - page loads,
   - role selector works,
   - student submit works,
   - admin validate creates a convention,
   - NGO view displays convention data.
5. If using Supabase, run `npm run smoke:supabase` with table names, columns, policies, profiles, and publishable-key permissions configured before disabling demo fallback in a live pilot.

## ETA

- **Stabilized frontend demo deploy**: same day, assuming GitHub Actions can install dependencies and build.
- **Supabase-backed persistent workflow**: 0.5-1 day after schema, profiles, RLS policies, and `npm run smoke:supabase` are verified.
- **Production-grade app** with auth, persistence, audits, hosted backend strategy, tests, and real access controls: several additional days minimum.
