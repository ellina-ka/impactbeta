-- Workflow persistence for the role dashboards.
-- Run this in the Supabase SQL editor or through the Supabase CLI before
-- disabling REACT_APP_DEMO_FALLBACK in the frontend.

create extension if not exists pgcrypto;

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  student_name text not null,
  student_email text not null,
  ngo_name text not null,
  mission_description text not null,
  start_date date not null,
  end_date date not null,
  target_hours integer not null check (target_hours >= 0),
  status text not null default 'pending' check (status in ('pending', 'validated', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.conventions (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  student_name text not null,
  student_email text not null,
  ngo_name text not null,
  mission_description text not null,
  start_date date not null,
  end_date date not null,
  target_hours integer not null check (target_hours >= 0),
  status text not null default 'ready' check (status in ('ready', 'signed', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (application_id)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists applications_set_updated_at on public.applications;
create trigger applications_set_updated_at
before update on public.applications
for each row
execute function public.set_updated_at();

drop trigger if exists conventions_set_updated_at on public.conventions;
create trigger conventions_set_updated_at
before update on public.conventions
for each row
execute function public.set_updated_at();

alter table public.applications enable row level security;
alter table public.conventions enable row level security;

-- Prototype policies for the current unauthenticated dashboard demo.
-- Replace these with role-aware policies before production launch.
drop policy if exists "Prototype dashboard can read applications" on public.applications;
create policy "Prototype dashboard can read applications"
on public.applications
for select
to anon, authenticated
using (true);

drop policy if exists "Prototype dashboard can create applications" on public.applications;
create policy "Prototype dashboard can create applications"
on public.applications
for insert
to anon, authenticated
with check (true);

drop policy if exists "Prototype dashboard can update applications" on public.applications;
create policy "Prototype dashboard can update applications"
on public.applications
for update
to anon, authenticated
using (true)
with check (true);

drop policy if exists "Prototype dashboard can read conventions" on public.conventions;
create policy "Prototype dashboard can read conventions"
on public.conventions
for select
to anon, authenticated
using (true);

drop policy if exists "Prototype dashboard can create conventions" on public.conventions;
create policy "Prototype dashboard can create conventions"
on public.conventions
for insert
to anon, authenticated
with check (true);
