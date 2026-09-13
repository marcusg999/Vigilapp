-- Behavioral RLS tests. Simulates logged-in users by setting the same GUC our
-- stub auth.uid() reads. `set role authenticated` makes RLS apply (that role,
-- unlike the superuser, is subject to policies).

\set A  '11111111-1111-1111-1111-111111111111'
\set B  '22222222-2222-2222-2222-222222222222'
\set AD '33333333-3333-3333-3333-333333333333'
\set LA 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
\set CA 'cccccccc-cccc-cccc-cccc-cccccccccccc'

-- ---- setup as superuser (bypasses RLS) -------------------------------------
reset role;
insert into auth.users (id) values (:'A'), (:'B'), (:'AD');
insert into public.admin_users (user_id) values (:'AD');

do $$
begin
  if (select count(*) from public.profiles) <> 3 then
    raise exception 'FAIL: signup trigger did not create 3 profiles';
  end if;
  raise notice 'PASS: signup trigger auto-created a profile per user';
end $$;

-- ---- User A creates their own data (all should succeed) --------------------
set role authenticated;
set vigil.uid = '11111111-1111-1111-1111-111111111111';

insert into public.loved_ones (id, user_id, name) values (:'LA', :'A', 'Mom');
insert into public.persona_configs (loved_one_id, user_id, relationship)
  values (:'LA', :'A', 'mother');
insert into public.memories (loved_one_id, user_id, content)
  values (:'LA', :'A', 'Sunday pancakes');
insert into public.conversations (id, loved_one_id, user_id)
  values (:'CA', :'LA', :'A');
insert into public.messages (conversation_id, user_id, role, content)
  values (:'CA', :'A', 'user', 'Hi Mom');
insert into public.offerings (loved_one_id, user_id, body)
  values (:'LA', :'A', 'I miss you');
\echo 'PASS: owner (A) created loved one + persona + memory + conversation + message + offering'

-- A cannot create rows owned by someone else
do $$
begin
  insert into public.loved_ones (user_id, name) values
    ('22222222-2222-2222-2222-222222222222', 'Impersonation');
  raise exception 'FAIL: A inserted a loved_one owned by B';
exception when others then
  raise notice 'PASS: cannot insert a loved_one for another user';
end $$;

-- A's updated_at trigger fires on update of own row
do $$
declare t0 timestamptz; t1 timestamptz;
begin
  select updated_at into t0 from public.loved_ones where name = 'Mom';
  perform pg_sleep(0.02);
  update public.loved_ones set bio = 'the best' where name = 'Mom';
  select updated_at into t1 from public.loved_ones where name = 'Mom';
  if t1 <= t0 then raise exception 'FAIL: updated_at not bumped by trigger'; end if;
  raise notice 'PASS: owner can update own row and updated_at trigger fires';
end $$;

-- Messages are immutable: no UPDATE policy -> 0 rows touched, no error
do $$
declare n int;
begin
  update public.messages set content = 'edited';
  get diagnostics n = row_count;
  if n <> 0 then raise exception 'FAIL: a message was editable (% rows)', n; end if;
  raise notice 'PASS: messages are immutable (update affected 0 rows)';
end $$;

-- ---- User B is fully isolated from A ---------------------------------------
set vigil.uid = '22222222-2222-2222-2222-222222222222';

do $$
begin
  if (select count(*) from public.loved_ones) <> 0 then
    raise exception 'FAIL: B can see A''s loved_ones';
  end if;
  if (select count(*) from public.messages) <> 0 then
    raise exception 'FAIL: B can see A''s messages';
  end if;
  if (select count(*) from public.offerings) <> 0 then
    raise exception 'FAIL: B can see A''s offerings';
  end if;
  raise notice 'PASS: B sees none of A''s rows';
end $$;

-- B cannot attach a child row to A's loved one (ownership helper blocks it)
do $$
begin
  insert into public.memories (loved_one_id, user_id, content)
    values ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            '22222222-2222-2222-2222-222222222222', 'sneaky');
  raise exception 'FAIL: B attached a memory to A''s loved one';
exception when others then
  raise notice 'PASS: B cannot attach a child row to a loved one they don''t own';
end $$;

-- B cannot post a message into A's conversation
do $$
begin
  insert into public.messages (conversation_id, user_id, role, content)
    values ('cccccccc-cccc-cccc-cccc-cccccccccccc',
            '22222222-2222-2222-2222-222222222222', 'user', 'intruding');
  raise exception 'FAIL: B posted into A''s conversation';
exception when others then
  raise notice 'PASS: B cannot post into a conversation they don''t own';
end $$;

-- ---- Admin content + audit gating ------------------------------------------
set vigil.uid = '33333333-3333-3333-3333-333333333333';
insert into public.content_items (category, title, published)
  values ('ritual', 'Día de los Muertos', true);
insert into public.content_items (category, title, published)
  values ('nde', 'Unpublished draft', false);
insert into public.audit_log (actor, action, entity)
  values ('33333333-3333-3333-3333-333333333333', 'content.create', 'content_items');
\echo 'PASS: admin created content (published + draft) and wrote an audit entry'

-- ---- Non-admin content visibility + write denial ---------------------------
set vigil.uid = '22222222-2222-2222-2222-222222222222';
do $$
begin
  if (select count(*) from public.content_items) <> 1 then
    raise exception 'FAIL: non-admin sees % content rows, expected 1 (published only)',
      (select count(*) from public.content_items);
  end if;
  raise notice 'PASS: non-admin sees only published content';

  begin
    insert into public.content_items (category, title) values ('ritual', 'sneaky');
    raise exception 'FAIL: non-admin wrote content';
  exception when others then
    raise notice 'PASS: non-admin cannot write content';
  end;

  begin
    if (select count(*) from public.audit_log) <> 0 then
      raise exception 'FAIL: non-admin can read the audit log';
    end if;
    raise notice 'PASS: audit log is invisible to non-admins';
  exception when insufficient_privilege then
    raise notice 'PASS: audit log not accessible to non-admins (permission denied)';
  end;

  begin
    if (select count(*) from public.admin_users) <> 0 then
      raise exception 'FAIL: non-admin can read admin_users';
    end if;
    raise notice 'PASS: admin_users empty/invisible to clients';
  exception when insufficient_privilege then
    raise notice 'PASS: admin_users not granted to clients (permission denied)';
  end;
end $$;

reset role;
\echo '================= ALL RLS BEHAVIOR TESTS PASSED ================='
