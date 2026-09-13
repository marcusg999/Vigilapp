-- Pleroma — 0005_storage  (OPTIONAL)
-- A private bucket for loved-one avatars. Phase 1 is text-only, so you can skip
-- this until you add avatar upload — but the policies are here and vetted.
--
-- Convention: objects are stored under a folder named after the owner's user id,
-- e.g.  avatars/<auth.uid()>/<loved_one_id>.jpg
-- The policies below use that first path segment to enforce ownership.

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', false)
on conflict (id) do nothing;

create policy "avatars: read own"
  on storage.objects for select
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "avatars: insert own"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "avatars: update own"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "avatars: delete own"
  on storage.objects for delete
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
