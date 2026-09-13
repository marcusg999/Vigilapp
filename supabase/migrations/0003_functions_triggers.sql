-- Pleroma — 0003_functions_triggers
-- Ownership helpers used by RLS, plus the triggers that keep the data tidy.
-- These come after 0002 because they reference the tables created there.

------------------------------------------------------------------------------
-- Ownership helpers
------------------------------------------------------------------------------
-- user_owns_loved_one(): does the given loved one belong to the current user?
-- Child tables use this in WITH CHECK so a user can't attach rows (a memory, a
-- persona config, an offering...) to someone else's loved one.
create or replace function public.user_owns_loved_one(p_loved_one_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.loved_ones l
    where l.id = p_loved_one_id and l.user_id = auth.uid()
  );
$$;

-- user_owns_conversation(): same idea, for message inserts.
create or replace function public.user_owns_conversation(p_conversation_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.conversations c
    where c.id = p_conversation_id and c.user_id = auth.uid()
  );
$$;

------------------------------------------------------------------------------
-- Auto-create a profile row whenever someone signs up
------------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data ->> 'display_name', ''));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

------------------------------------------------------------------------------
-- Keep updated_at fresh on the tables that have it
------------------------------------------------------------------------------
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger set_loved_ones_updated_at
  before update on public.loved_ones
  for each row execute function public.set_updated_at();

create trigger set_persona_configs_updated_at
  before update on public.persona_configs
  for each row execute function public.set_updated_at();

create trigger set_conversations_updated_at
  before update on public.conversations
  for each row execute function public.set_updated_at();

create trigger set_content_items_updated_at
  before update on public.content_items
  for each row execute function public.set_updated_at();
