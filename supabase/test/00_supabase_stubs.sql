-- Local-only stubs that mimic what Supabase provides in a real project.
-- NOT part of the app migrations — used only to validate our SQL here.

create role anon nologin;
create role authenticated nologin;
create role service_role nologin bypassrls;

create schema if not exists auth;
create table auth.users (
  id                 uuid primary key default gen_random_uuid(),
  email              text,
  raw_user_meta_data jsonb not null default '{}'::jsonb
);

-- auth.uid() reads the JWT 'sub' claim in real Supabase. Here we fake it via a
-- session setting so we can simulate different logged-in users.
create schema if not exists auth_helpers;
create or replace function auth.uid()
returns uuid language sql stable as $$
  select nullif(current_setting('vigil.uid', true), '')::uuid
$$;

-- Minimal storage schema so 0005_storage.sql can be validated too.
create schema if not exists storage;
create table storage.buckets (
  id     text primary key,
  name   text not null,
  public boolean not null default false
);
create table storage.objects (
  id        uuid primary key default gen_random_uuid(),
  bucket_id text references storage.buckets (id),
  name      text not null,
  owner     uuid
);
create or replace function storage.foldername(name text)
returns text[] language sql immutable as $$
  select string_to_array(name, '/')
$$;
