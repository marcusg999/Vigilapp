# Supabase setup

Pleroma uses Supabase for Postgres, Auth, and Row-Level Security. The SQL in
`migrations/` is the source of truth for the schema and policies.

## Apply the migrations

**With the Supabase CLI** (recommended):

```bash
supabase link --project-ref <your-project-ref>
supabase db push
```

**Or by hand:** open the SQL Editor in the Supabase dashboard and run the files
in order:

1. `migrations/0001_init_helpers.sql` — pgcrypto, the `admin_users` registry, `is_admin()`, `set_updated_at()`
2. `migrations/0002_tables.sql` — all Phase 1 tables
3. `migrations/0003_functions_triggers.sql` — ownership helpers, auto-profile-on-signup, `updated_at` triggers
4. `migrations/0004_rls.sql` — Row-Level Security policies and grants
5. `migrations/0005_storage.sql` — *(optional)* private `avatars` bucket + per-user storage policies
6. `migrations/0006_seed.sql` — *(optional)* a few published education entries

A behavioral RLS test lives in `test/` — see "Running the tests" below.

## Environment

Copy `.env.example` to `.env.local` and fill in the project URL, the anon key,
the service-role key (server only), and your Anthropic key. See the comments in
`.env.example`.

## Create the first admin

Admin status is not self-service — it lives in the `admin_users` table, which
has RLS enabled and no policies, so no client can read or change it. Promote an
admin only from the SQL editor (which runs as the service role and bypasses
RLS):

```sql
insert into public.admin_users (user_id) values ('<their-auth-user-id>');
```

You can find the id under **Authentication → Users**.

## Admin MFA is required

The admin area (`/admin`) requires a fully-verified session (aal2). The first
time an admin visits it they are redirected to `/auth/mfa` to enroll a TOTP
authenticator (Authy, 1Password, Google Authenticator, …) and verify a code.
On later sessions they verify a code to step up before the admin area unlocks.

Make sure TOTP MFA is enabled for the project under
**Authentication → Providers → Multi-Factor**.

## A note on data

- Every user table is protected by RLS so a user can only read and write their
  own rows.
- Education content (`content_items`) is world-readable only when
  `published = true`; only admins can create or edit it.
- The `audit_log` is written with the service-role key and is readable only by
  admins.
- Users can export all of their data (`/api/account/export`) and truly delete
  their account and all associated rows (`/api/account/delete`).
- User content is never used to train models.

## Running the tests

The `test/` directory contains the vetted behavioral RLS test. Against any
Postgres 16 (the stubs stand in for what Supabase provides):

```bash
psql -f test/00_supabase_stubs.sql           # fake auth/storage schemas + roles
psql -f migrations/0001_init_helpers.sql
psql -f migrations/0002_tables.sql
psql -f migrations/0003_functions_triggers.sql
psql -f migrations/0004_rls.sql
psql -f migrations/0005_storage.sql
psql -f test/10_rls_behavior.sql             # prints PASS/FAIL per policy
```
