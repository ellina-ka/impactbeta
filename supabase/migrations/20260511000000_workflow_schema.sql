-- Workflow persistence for the role dashboards.
-- Run this in the Supabase SQL editor or through the Supabase CLI before
-- disabling REACT_APP_DEMO_FALLBACK in the frontend.

create extension if not exists pgcrypto;

do $$
begin
  create type public.user_role as enum ('school_admin', 'student', 'ngo_admin');
exception
  when duplicate_object then null;
end
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null,
  role public.user_role not null default 'student',
  organization_name text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  student_name text not null,
  student_email text not null,
  ngo_name text not null,
  school_name text not null default 'Sciences Po',
  mission_description text not null,
  start_date date not null,
  end_date date not null,
  target_hours integer not null check (target_hours > 0),
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
  school_name text not null default 'Sciences Po',
  mission_description text not null,
  start_date date not null,
  end_date date not null,
  target_hours integer not null check (target_hours > 0),
  status text not null default 'ready' check (status in ('ready', 'signed', 'completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (application_id)
);

alter table public.applications
  add column if not exists school_name text not null default 'Sciences Po';

alter table public.conventions
  add column if not exists school_name text not null default 'Sciences Po';

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

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.applications enable row level security;
alter table public.conventions enable row level security;

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.current_user_org()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(nullif(organization_name, ''), 'Sciences Po') from public.profiles where id = auth.uid()
$$;

drop policy if exists "Profiles are visible to owners and school admins" on public.profiles;
create policy "Profiles are visible to owners and school admins"
on public.profiles
for select
to authenticated
using (id = auth.uid() or public.current_user_role() = 'school_admin');

drop policy if exists "Users can create their own profile" on public.profiles;
create policy "Users can create their own profile"
on public.profiles
for insert
to authenticated
with check (
  id = auth.uid()
  and email = auth.jwt() ->> 'email'
  and role = 'student'
);

drop policy if exists "Owners and school admins can maintain profiles" on public.profiles;
drop policy if exists "Students can maintain their own non privileged profile" on public.profiles;
create policy "Students can maintain their own non privileged profile"
on public.profiles
for update
to authenticated
using (id = auth.uid() and public.current_user_role() = 'student')
with check (
  id = auth.uid()
  and email = auth.jwt() ->> 'email'
  and role = 'student'
);

drop policy if exists "School admins can maintain profiles" on public.profiles;
create policy "School admins can maintain profiles"
on public.profiles
for update
to authenticated
using (public.current_user_role() = 'school_admin')
with check (public.current_user_role() = 'school_admin');

drop policy if exists "School admins can read all applications" on public.applications;
create policy "School admins can read all applications"
on public.applications
for select
to authenticated
using (
  public.current_user_role() = 'school_admin'
  and school_name = public.current_user_org()
);

drop policy if exists "Students can read their applications" on public.applications;
create policy "Students can read their applications"
on public.applications
for select
to authenticated
using (public.current_user_role() = 'student' and student_email = auth.jwt() ->> 'email');

drop policy if exists "NGO admins can read matching applications" on public.applications;
create policy "NGO admins can read matching applications"
on public.applications
for select
to authenticated
using (
  public.current_user_role() = 'ngo_admin'
  and ngo_name ilike '%' || public.current_user_org() || '%'
);

drop policy if exists "Students can create their applications" on public.applications;
create policy "Students can create their applications"
on public.applications
for insert
to authenticated
with check (
  public.current_user_role() = 'student'
  and student_email = auth.jwt() ->> 'email'
  and school_name = public.current_user_org()
);

drop policy if exists "School admins can validate or reject applications" on public.applications;
create policy "School admins can validate or reject applications"
on public.applications
for update
to authenticated
using (
  public.current_user_role() = 'school_admin'
  and school_name = public.current_user_org()
)
with check (
  public.current_user_role() = 'school_admin'
  and school_name = public.current_user_org()
);

drop policy if exists "School admins can read all conventions" on public.conventions;
create policy "School admins can read all conventions"
on public.conventions
for select
to authenticated
using (
  public.current_user_role() = 'school_admin'
  and school_name = public.current_user_org()
);

drop policy if exists "Students can read their conventions" on public.conventions;
create policy "Students can read their conventions"
on public.conventions
for select
to authenticated
using (public.current_user_role() = 'student' and student_email = auth.jwt() ->> 'email');

drop policy if exists "NGO admins can read matching conventions" on public.conventions;
create policy "NGO admins can read matching conventions"
on public.conventions
for select
to authenticated
using (
  public.current_user_role() = 'ngo_admin'
  and ngo_name ilike '%' || public.current_user_org() || '%'
);

drop policy if exists "School admins can create conventions" on public.conventions;
create policy "School admins can create conventions"
on public.conventions
for insert
to authenticated
with check (
  public.current_user_role() = 'school_admin'
  and school_name = public.current_user_org()
);

drop policy if exists "School admins can update their conventions" on public.conventions;
create policy "School admins can update their conventions"
on public.conventions
for update
to authenticated
using (
  public.current_user_role() = 'school_admin'
  and school_name = public.current_user_org()
)
with check (
  public.current_user_role() = 'school_admin'
  and school_name = public.current_user_org()
);

drop policy if exists "NGO admins can sign matching conventions" on public.conventions;
create policy "NGO admins can sign matching conventions"
on public.conventions
for update
to authenticated
using (
  public.current_user_role() = 'ngo_admin'
  and ngo_name ilike '%' || public.current_user_org() || '%'
)
with check (
  public.current_user_role() = 'ngo_admin'
  and ngo_name ilike '%' || public.current_user_org() || '%'
  and status in ('ready', 'signed', 'completed')
);
