-- Vigil — 0001_init_helpers
-- Extensions, the admin registry, and small helper functions used by RLS.
-- Everything here is intentionally boring and readable: no clever tricks.

-- gen_random_uuid() is built in on PG13+, but pgcrypto guarantees it exists.
create extension if not exists pgcrypto;

------------------------------------------------------------------------------
-- Admin registry
------------------------------------------------------------------------------
-- Who is an admin is NOT self-service. This table has RLS enabled with NO
-- policies, so no logged-in user (anon or authenticated) can read or write it.
-- You promote an admin only from the Supabase SQL editor (service_role, which
-- bypasses RLS):
--
--   insert into public.admin_users (user_id) values ('<auth.users.id>');
--
create table public.admin_users (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.admin_users enable row level security;
-- (no policies on purpose -> all client access denied)

------------------------------------------------------------------------------
-- Helper functions
------------------------------------------------------------------------------
-- is_admin(): true when the current user is in admin_users.
-- SECURITY DEFINER so it can read admin_users regardless of the caller's RLS.
-- search_path is pinned to '' and every object is schema-qualified, which
-- closes the classic "search_path hijack" hole in definer functions.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users a where a.user_id = auth.uid()
  );
$$;

-- set_updated_at(): generic BEFORE UPDATE trigger to keep updated_at honest.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
