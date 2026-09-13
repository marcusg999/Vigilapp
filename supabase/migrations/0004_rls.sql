-- Vigil — 0004_rls
-- Row-Level Security. This is the heart of the app's trust model.
--
-- Rules of thumb encoded below:
--   * RLS is enabled on every table. Default = deny; a row is only reachable
--     if a policy explicitly allows it.
--   * A user can only touch rows where user_id = their own auth.uid().
--   * Child rows must belong to a loved one / conversation the user owns.
--   * Education content is readable when published; only admins write it.
--   * The audit log is admin-read and append-only.
--   * auth.uid() is wrapped in (select ...) so Postgres evaluates it once per
--     query instead of once per row.

------------------------------------------------------------------------------
-- profiles
------------------------------------------------------------------------------
alter table public.profiles enable row level security;

create policy "profiles: read own or admin"
  on public.profiles for select
  using ( id = (select auth.uid()) or public.is_admin() );

create policy "profiles: insert self"
  on public.profiles for insert
  with check ( id = (select auth.uid()) );

create policy "profiles: update own"
  on public.profiles for update
  using ( id = (select auth.uid()) )
  with check ( id = (select auth.uid()) );

create policy "profiles: delete own"
  on public.profiles for delete
  using ( id = (select auth.uid()) );

------------------------------------------------------------------------------
-- loved_ones
------------------------------------------------------------------------------
alter table public.loved_ones enable row level security;

create policy "loved_ones: select own"
  on public.loved_ones for select
  using ( user_id = (select auth.uid()) );

create policy "loved_ones: insert own"
  on public.loved_ones for insert
  with check ( user_id = (select auth.uid()) );

create policy "loved_ones: update own"
  on public.loved_ones for update
  using ( user_id = (select auth.uid()) )
  with check ( user_id = (select auth.uid()) );

create policy "loved_ones: delete own"
  on public.loved_ones for delete
  using ( user_id = (select auth.uid()) );

------------------------------------------------------------------------------
-- persona_configs  (must own the loved one it points at)
------------------------------------------------------------------------------
alter table public.persona_configs enable row level security;

create policy "persona_configs: select own"
  on public.persona_configs for select
  using ( user_id = (select auth.uid()) );

create policy "persona_configs: insert own"
  on public.persona_configs for insert
  with check (
    user_id = (select auth.uid())
    and public.user_owns_loved_one(loved_one_id)
  );

create policy "persona_configs: update own"
  on public.persona_configs for update
  using ( user_id = (select auth.uid()) )
  with check (
    user_id = (select auth.uid())
    and public.user_owns_loved_one(loved_one_id)
  );

create policy "persona_configs: delete own"
  on public.persona_configs for delete
  using ( user_id = (select auth.uid()) );

------------------------------------------------------------------------------
-- memories  (must own the loved one)
------------------------------------------------------------------------------
alter table public.memories enable row level security;

create policy "memories: select own"
  on public.memories for select
  using ( user_id = (select auth.uid()) );

create policy "memories: insert own"
  on public.memories for insert
  with check (
    user_id = (select auth.uid())
    and public.user_owns_loved_one(loved_one_id)
  );

create policy "memories: update own"
  on public.memories for update
  using ( user_id = (select auth.uid()) )
  with check (
    user_id = (select auth.uid())
    and public.user_owns_loved_one(loved_one_id)
  );

create policy "memories: delete own"
  on public.memories for delete
  using ( user_id = (select auth.uid()) );

------------------------------------------------------------------------------
-- conversations  (must own the loved one)
------------------------------------------------------------------------------
alter table public.conversations enable row level security;

create policy "conversations: select own"
  on public.conversations for select
  using ( user_id = (select auth.uid()) );

create policy "conversations: insert own"
  on public.conversations for insert
  with check (
    user_id = (select auth.uid())
    and public.user_owns_loved_one(loved_one_id)
  );

create policy "conversations: update own"
  on public.conversations for update
  using ( user_id = (select auth.uid()) )
  with check ( user_id = (select auth.uid()) );

create policy "conversations: delete own"
  on public.conversations for delete
  using ( user_id = (select auth.uid()) );

------------------------------------------------------------------------------
-- messages  (must own the conversation; immutable once written)
------------------------------------------------------------------------------
alter table public.messages enable row level security;

create policy "messages: select own"
  on public.messages for select
  using ( user_id = (select auth.uid()) );

create policy "messages: insert own"
  on public.messages for insert
  with check (
    user_id = (select auth.uid())
    and public.user_owns_conversation(conversation_id)
  );

-- No UPDATE policy: messages are a record of what was said and can't be edited.

create policy "messages: delete own"
  on public.messages for delete
  using ( user_id = (select auth.uid()) );

------------------------------------------------------------------------------
-- offerings  (must own the loved one)
------------------------------------------------------------------------------
alter table public.offerings enable row level security;

create policy "offerings: select own"
  on public.offerings for select
  using ( user_id = (select auth.uid()) );

create policy "offerings: insert own"
  on public.offerings for insert
  with check (
    user_id = (select auth.uid())
    and public.user_owns_loved_one(loved_one_id)
  );

create policy "offerings: update own"
  on public.offerings for update
  using ( user_id = (select auth.uid()) )
  with check (
    user_id = (select auth.uid())
    and public.user_owns_loved_one(loved_one_id)
  );

create policy "offerings: delete own"
  on public.offerings for delete
  using ( user_id = (select auth.uid()) );

------------------------------------------------------------------------------
-- content_items  (public reads published; admin writes)
------------------------------------------------------------------------------
alter table public.content_items enable row level security;

create policy "content_items: read published or admin"
  on public.content_items for select
  using ( published = true or public.is_admin() );

create policy "content_items: admin insert"
  on public.content_items for insert
  with check ( public.is_admin() );

create policy "content_items: admin update"
  on public.content_items for update
  using ( public.is_admin() )
  with check ( public.is_admin() );

create policy "content_items: admin delete"
  on public.content_items for delete
  using ( public.is_admin() );

------------------------------------------------------------------------------
-- audit_log  (admin read; append-only)
------------------------------------------------------------------------------
alter table public.audit_log enable row level security;

create policy "audit_log: admin read"
  on public.audit_log for select
  using ( public.is_admin() );

create policy "audit_log: admin insert"
  on public.audit_log for insert
  with check ( public.is_admin() );

-- No UPDATE or DELETE policies: the audit trail can't be rewritten.

------------------------------------------------------------------------------
-- Table & function privileges
------------------------------------------------------------------------------
-- RLS decides *which rows*; GRANTs decide *whether the role may touch the
-- table at all*. We grant to `authenticated` only. `anon` (logged-out) gets
-- nothing, so the whole app is behind login. RLS still constrains every row.
grant usage on schema public to authenticated;

grant select, insert, update, delete
  on public.profiles, public.loved_ones, public.persona_configs,
     public.memories, public.conversations, public.messages,
     public.offerings, public.content_items, public.audit_log
  to authenticated;

grant execute on function public.is_admin()                     to authenticated;
grant execute on function public.user_owns_loved_one(uuid)      to authenticated;
grant execute on function public.user_owns_conversation(uuid)   to authenticated;

-- Note: admin_users is deliberately NOT granted to authenticated. Only the
-- service_role (which bypasses RLS) manages admin membership.
