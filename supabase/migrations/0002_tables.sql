-- Vigil — 0002_tables
-- The Phase 1 (text-only) data model. Small tables, one concern each.
-- Every user-owned table carries a user_id so RLS stays simple and fast.

------------------------------------------------------------------------------
-- profiles: one row per auth user (created automatically on signup)
------------------------------------------------------------------------------
create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

------------------------------------------------------------------------------
-- loved_ones: a departed person a user is remembering
------------------------------------------------------------------------------
create table public.loved_ones (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users (id) on delete cascade,
  name        text not null,
  born_on     date,
  died_on     date,
  avatar_path text,                       -- Storage path, not a public URL
  bio         text not null default '',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index loved_ones_user_id_idx on public.loved_ones (user_id);

------------------------------------------------------------------------------
-- persona_configs: how the "echo" should speak (1:1 with a loved one)
------------------------------------------------------------------------------
create table public.persona_configs (
  id                     uuid primary key default gen_random_uuid(),
  loved_one_id           uuid not null unique
                           references public.loved_ones (id) on delete cascade,
  user_id                uuid not null references auth.users (id) on delete cascade,
  relationship           text   not null default '',   -- e.g. "mother", "friend"
  personality            text   not null default '',
  characteristic_phrases text[] not null default '{}',  -- things they said
  tone                   text   not null default '',
  topics_to_favor        text   not null default '',
  topics_to_avoid        text   not null default '',
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);
create index persona_configs_user_id_idx on public.persona_configs (user_id);

------------------------------------------------------------------------------
-- memories: shared memories that ground the persona (feeds the prompt)
------------------------------------------------------------------------------
create table public.memories (
  id           uuid primary key default gen_random_uuid(),
  loved_one_id uuid not null references public.loved_ones (id) on delete cascade,
  user_id      uuid not null references auth.users (id) on delete cascade,
  content      text not null,
  created_at   timestamptz not null default now()
);
create index memories_loved_one_id_idx on public.memories (loved_one_id);
create index memories_user_id_idx      on public.memories (user_id);

------------------------------------------------------------------------------
-- conversations: a chat session with one loved one
------------------------------------------------------------------------------
create table public.conversations (
  id           uuid primary key default gen_random_uuid(),
  loved_one_id uuid not null references public.loved_ones (id) on delete cascade,
  user_id      uuid not null references auth.users (id) on delete cascade,
  title        text not null default '',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index conversations_user_id_idx      on public.conversations (user_id);
create index conversations_loved_one_id_idx on public.conversations (loved_one_id);

------------------------------------------------------------------------------
-- messages: individual turns in a conversation. Immutable once written.
------------------------------------------------------------------------------
create table public.messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  user_id         uuid not null references auth.users (id) on delete cascade,
  role            text not null check (role in ('user', 'assistant')),
  content         text not null,
  created_at      timestamptz not null default now()
);
create index messages_conversation_id_idx on public.messages (conversation_id, created_at);
create index messages_user_id_idx         on public.messages (user_id);

------------------------------------------------------------------------------
-- offerings: written letters left for the departed
------------------------------------------------------------------------------
create table public.offerings (
  id           uuid primary key default gen_random_uuid(),
  loved_one_id uuid not null references public.loved_ones (id) on delete cascade,
  user_id      uuid not null references auth.users (id) on delete cascade,
  body         text not null,
  created_at   timestamptz not null default now()
);
create index offerings_loved_one_id_idx on public.offerings (loved_one_id);
create index offerings_user_id_idx      on public.offerings (user_id);

------------------------------------------------------------------------------
-- content_items: admin-managed education (mourning rituals + NDE material)
------------------------------------------------------------------------------
create table public.content_items (
  id          uuid primary key default gen_random_uuid(),
  category    text not null check (category in ('ritual', 'nde')),
  title       text not null,
  body        text not null default '',
  region      text,                       -- ritual origin/region (nullable)
  youtube_url text,                       -- optional video
  published   boolean not null default false,
  created_by  uuid references auth.users (id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
create index content_items_published_idx on public.content_items (published);

------------------------------------------------------------------------------
-- audit_log: append-only record of admin actions
------------------------------------------------------------------------------
create table public.audit_log (
  id         bigint generated always as identity primary key,
  actor      uuid references auth.users (id) on delete set null,
  action     text not null,              -- e.g. 'content.create'
  entity     text,                       -- e.g. 'content_items'
  entity_id  text,                       -- affected row id (text for any pk type)
  metadata   jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index audit_log_created_at_idx on public.audit_log (created_at desc);
