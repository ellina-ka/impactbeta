# Supabase workflow setup

This app already routes the three role dashboards through `frontend/src/api/workflowService.js`. When Supabase is configured, applications and generated conventions persist in Supabase; when it is not configured, the app uses local demo data.

## 1. Configure schema

Run `supabase/migrations/20260511000000_workflow_schema.sql` in your Supabase SQL editor or with the Supabase CLI. It creates:

- `public.applications` for student submissions.
- `public.conventions` for conventions generated when an admin validates an application.
- prototype RLS policies that allow the current unauthenticated demo to read/write using the browser publishable key.

The policies are intentionally permissive for the prototype workflow. Replace them with authenticated, role-aware policies before production launch.

## 2. Configure frontend environment

Create a local `frontend/.env.local` file or set equivalent variables in your hosting provider:

```bash
REACT_APP_SUPABASE_URL=https://your-project-ref.supabase.co
REACT_APP_SUPABASE_PUBLISHABLE_KEY=sb_publishable_replace_with_your_publishable_key
REACT_APP_DEMO_FALLBACK=true
```

You can use `REACT_APP_SUPABASE_PROJECT_REF=your-project-ref` instead of `REACT_APP_SUPABASE_URL`; the frontend will derive `https://<project-ref>.supabase.co`.

Do **not** put `sb_secret_*` or service-role keys in any `REACT_APP_*` variable. Create React App exposes those variables in the public browser bundle. Secret keys belong only in trusted server-side code or one-off CLI/database administration contexts.

## 3. Verify integration

Start with fallback enabled so the demo remains usable if schema or policy setup is incomplete:

```bash
cd frontend
npm run build
```

Then run the app and smoke-test:

1. Student submits an application.
2. School admin validates it.
3. A convention appears in the admin convention list.
4. NGO admin sees conventions matching the demo NGO filter.

After the schema and policies are verified, set `REACT_APP_DEMO_FALLBACK=false` in a staging environment to make Supabase errors visible instead of silently using local demo data.
