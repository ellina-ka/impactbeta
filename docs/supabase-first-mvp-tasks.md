# Supabase-first MVP task plan

_Last updated: 2026-06-09_

## Goal

Ship ImpactBeta as one coherent Supabase-backed pilot workflow: students submit mission applications, school admins validate or reject them, validated applications generate conventions, NGO admins sign conventions, and every role sees persisted data that matches its permissions.

## MVP definition

The Supabase-first MVP is complete when a production-like build can run with `REACT_APP_DEMO_FALLBACK=false` and the following workflow succeeds against Supabase with real Auth sessions:

1. Student signs in and submits an application.
2. School admin signs in and sees that application.
3. School admin validates it.
4. A convention is created exactly once for the validated application.
5. NGO admin signs the matching convention.
6. Student, school admin, and NGO admin each see the correct updated state after refresh.

## Architecture decision

Use Supabase as the source of truth for the MVP:

- **Frontend**: React app, deployable to GitHub Pages or another static host.
- **Auth**: Supabase Auth with role/profile lookup in `public.profiles`.
- **Database**: Supabase Postgres tables in `supabase/migrations/20260511000000_workflow_schema.sql`.
- **Authorization**: Supabase row-level security policies.
- **Demo mode**: local browser data only when explicitly enabled for sales demos.
- **FastAPI backend**: keep as a legacy/admin analytics track, not the MVP source of truth.

## Task backlog

### P0 — Pilot truthfulness and integration safety

- [x] Document the Supabase-first architecture and MVP acceptance criteria.
- [x] Make demo fallback explicit in the UI so reviewers know whether they are seeing local demo data or a real Supabase-backed pilot.
- [x] Hard-fail workflow data calls when Supabase is missing and `REACT_APP_DEMO_FALLBACK=false`.
- [x] Add a repeatable Supabase smoke-test script for the end-to-end role workflow.
- [x] Clean up frontend environment examples so demo and pilot settings do not conflict.
- [ ] Run the Supabase migration in the target Supabase project.
- [ ] Create the three demo Auth users and matching `public.profiles` rows.
- [ ] Run the smoke test against the target Supabase project with fallback disabled.

### P1 — Production-real workflow polish

- [ ] Add persisted status timestamps (`submitted_at`, `validated_at`, `rejected_at`, `signed_at`) or a dedicated status history table.
- [ ] Add `validated_by`, `rejected_by`, and `signed_by` references to authenticated users.
- [ ] Add a reason/comment field for rejected applications.
- [ ] Add user-facing loading and success/error feedback for submit, validate, reject, and sign actions.
- [ ] Add automated unit tests for `workflowService.js` success, fallback, and hard-fail behavior.
- [ ] Add attachment/evidence support for application documents if the pilot school requires it.

### P2 — Sellability and institutional readiness

- [ ] Add admin exports for applications and conventions.
- [ ] Add an audit trail view/export for compliance review.
- [ ] Add invite/onboarding flows for school admins, students, and NGO admins.
- [ ] Add institution-level settings for school name, required fields, and convention copy.
- [ ] Add deployment runbook for GitHub Pages + Supabase pilot environments.
- [ ] Decide whether FastAPI should be retired, moved behind Supabase, or reserved for server-side exports/PDF/email jobs.

## Environment modes

| Mode | Required settings | Purpose |
| --- | --- | --- |
| Local demo | `REACT_APP_DEMO_MODE=true`, `REACT_APP_DEMO_FALLBACK=true` | Sales walkthrough without Supabase. |
| Integration test | Supabase URL/key, `REACT_APP_DEMO_MODE=false`, `REACT_APP_DEMO_FALLBACK=false` | Catches schema, RLS, and Auth failures. |
| Production pilot | Supabase URL/key, `REACT_APP_DEMO_MODE=false`, `REACT_APP_DEMO_FALLBACK=false` | Real users and persisted data. |

## Release gate

Do not call the product production-ready until these commands/checks pass in the target environment:

```bash
cd frontend
npm ci --no-audit --no-fund
npm run build
npm run smoke:supabase
```

The smoke test intentionally writes a timestamped application/convention pair so that role permissions and persistence are verified with real Supabase policies.
