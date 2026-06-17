# Supabase workflow setup

ImpactBeta's sellable MVP should use Supabase as the source of truth for the role workflow. The React dashboards already route application and convention reads/writes through `frontend/src/api/workflowService.js`.

Use local demo data only for clearly labeled sales walkthroughs. For integration testing and pilot deployments, set `REACT_APP_DEMO_FALLBACK=false` so schema, Auth, and RLS failures are visible.

## 1. Configure schema

Run `supabase/migrations/20260511000000_workflow_schema.sql` in your Supabase SQL editor or with the Supabase CLI. It creates:

- `public.applications` for student submissions.
- `public.conventions` for conventions generated when an admin validates an application.
- `public.profiles` for role assignment after Supabase Auth login.
- role-aware RLS policies for school admin, student, and NGO access.

Then create the three demo Auth users in Supabase and use `supabase/seed.sql` to load credible applications and generated conventions.

Recommended demo accounts:

| Role | Email | Password |
| --- | --- | --- |
| School admin | `admin@impactbeta.app` | `Impactbeta2026!` |
| Student | `lina.moreau@sciencespo.fr` | `Impactbeta2026!` |
| NGO admin | `ngo@impactbeta.app` | `Impactbeta2026!` |

After creating the Auth users, add matching rows to `public.profiles` with their Auth user IDs:

- `admin@impactbeta.app`: `school_admin`, organization `Sciences Po`
- `lina.moreau@sciencespo.fr`: `student`, organization `Sciences Po`
- `ngo@impactbeta.app`: `ngo_admin`, organization `Croix-Rouge`

## 2. Configure frontend environment

Create a local `frontend/.env.local` file or set equivalent variables in your hosting provider:

```bash
REACT_APP_SUPABASE_URL=https://your-project-ref.supabase.co
REACT_APP_SUPABASE_PUBLISHABLE_KEY=sb_publishable_replace_with_your_publishable_key
REACT_APP_DEMO_MODE=false
REACT_APP_DEMO_FALLBACK=false
```

You can use `REACT_APP_SUPABASE_PROJECT_REF=your-project-ref` instead of `REACT_APP_SUPABASE_URL`; the frontend will derive `https://<project-ref>.supabase.co`.

Do **not** put `sb_secret_*` or service-role keys in any `REACT_APP_*` variable. Create React App exposes those variables in the public browser bundle. Secret keys belong only in trusted server-side code or one-off CLI/database administration contexts.

## 3. Verify integration

Install dependencies and build the app with fallback disabled so integration problems are visible before the sales demo:

```bash
cd frontend
npm ci --no-audit --no-fund
npm run build
npm run smoke:supabase
```

The smoke test signs in as the demo student, school admin, and NGO admin. It then creates a timestamped application, validates it, creates a convention, signs it as the NGO, and confirms the student can read the signed convention.

If your demo credentials differ, override them before running the smoke test:

```bash
export IMPACTBETA_DEMO_PASSWORD='your-demo-password'
export IMPACTBETA_STUDENT_EMAIL='student@example.edu'
export IMPACTBETA_ADMIN_EMAIL='admin@example.edu'
export IMPACTBETA_NGO_EMAIL='ngo@example.org'
npm run smoke:supabase
```

## 4. Manual smoke test

After the automated smoke test passes, run the browser app and verify:

1. The status banner says **Pilot mode**.
2. Student submits an application.
3. School admin validates it.
4. A convention appears in the admin convention list.
5. Admin, student, and NGO can download the generated convention PDF.
6. NGO admin sees and signs conventions matching the demo NGO filter.
7. Refreshing the browser keeps the updated state.

For local rehearsals without Supabase, set `REACT_APP_DEMO_MODE=true` and `REACT_APP_DEMO_FALLBACK=true`. The app will use in-browser demo data and show the clearly labeled demo status banner.
