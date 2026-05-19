# Supabase workflow setup

This app already routes the three role dashboards through `frontend/src/api/workflowService.js`. When Supabase is configured, applications and generated conventions persist in Supabase; when it is not configured, the app uses local demo data.

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
REACT_APP_DEMO_FALLBACK=false
```

You can use `REACT_APP_SUPABASE_PROJECT_REF=your-project-ref` instead of `REACT_APP_SUPABASE_URL`; the frontend will derive `https://<project-ref>.supabase.co`.

Do **not** put `sb_secret_*` or service-role keys in any `REACT_APP_*` variable. Create React App exposes those variables in the public browser bundle. Secret keys belong only in trusted server-side code or one-off CLI/database administration contexts.

## 3. Verify integration

Build the app with fallback disabled so integration problems are visible before the sales demo:

```bash
cd frontend
npm run build
```

Then run the app and smoke-test:

1. Student submits an application.
2. School admin validates it.
3. A convention appears in the admin convention list.
4. Admin, student, and NGO can download the generated convention PDF.
5. NGO admin sees conventions matching the demo NGO filter.

For local rehearsals without Supabase, set `REACT_APP_DEMO_MODE=true`. The app will use in-browser demo data and a role switcher.
