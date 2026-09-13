# Architecture

This document describes Vigil's data model, its auth and Row-Level Security
(RLS) design, and where the AI is called. It's the map to keep the codebase
"simple, effective, and readable."

## Overview

Vigil is a Next.js (App Router) application backed by Supabase (Postgres, Auth,
RLS). The browser talks to Supabase directly for the user's own data — safely,
because RLS constrains every query to the signed-in user's rows. The Anthropic
Claude API is reached from exactly one server route.

```
Browser ──(anon key, RLS)──▶ Supabase Postgres
   │
   ├─▶ /api/chat ──(server, secret keys)──▶ Anthropic Claude API
   │                        └─(RLS)──▶ Supabase (load persona + persist turns)
   └─▶ /api/account/* ──(export / true deletion)──▶ Supabase
```

## Data model

Small, single-purpose tables (see `supabase/migrations/0002_tables.sql`; the
TypeScript mirror is `lib/types.ts`).

| Table | Purpose | Owner column |
|---|---|---|
| `profiles` | one row per auth user (display name) | `id` = `auth.users.id` |
| `loved_ones` | a person being remembered | `user_id` |
| `persona_configs` | how the echo speaks (1:1 with a loved one): relationship, personality, `characteristic_phrases text[]`, tone, topics to favor/avoid | `user_id` |
| `memories` | shared memories that ground the persona | `user_id` |
| `conversations` | a chat session with one loved one | `user_id` |
| `messages` | individual turns; immutable once written | `user_id` |
| `offerings` | written offerings left for the departed | `user_id` |
| `content_items` | admin-managed education (`category` ritual/nde, title, body, region, optional YouTube URL, `published`) | — (admin-owned) |
| `audit_log` | append-only record of admin actions | `actor` |
| `admin_users` | the admin registry (RLS on, **no policies**) | `user_id` |

Every foreign key to `auth.users` is `on delete cascade`, so deleting a user
row genuinely removes all of their data.

## Auth & RLS design

Authentication is Supabase Auth (email + password) for both users and admins.

**The database is the trust model.** RLS is enabled on every table; the default
is deny. Policies (`supabase/migrations/0004_rls.sql`):

- **User tables** (`loved_ones`, `persona_configs`, `memories`, `conversations`,
  `messages`, `offerings`): a row is reachable only when `user_id = auth.uid()`.
  Child rows must additionally belong to a loved one / conversation the user
  owns, enforced by the `SECURITY DEFINER` helpers `user_owns_loved_one()` and
  `user_owns_conversation()`.
- **`profiles`**: read/update your own row; admins may read all.
- **`content_items`**: world-readable only when `published = true`; only admins
  may write.
- **`audit_log`**: admin-read, append-only (no update/delete policy).
- **`messages`**: no update policy — turns are a record, not editable state.

**Admin model.** Admin status is *not* a column on `profiles` (which users can
update). It lives in `admin_users`, a table with RLS enabled and **no
policies**, so no client can read or modify it — admins are promoted only from
the Supabase SQL editor (service role). Code checks admin status through the
`is_admin()` SQL function.

**Hardening.** Every `SECURITY DEFINER` function pins `search_path = ''` and
schema-qualifies objects (closing the definer-function hijack). `auth.uid()` is
wrapped as `(select auth.uid())` in policies so it's evaluated once per query.
Table privileges are granted to `authenticated` only; logged-out `anon` gets
nothing.

**Admin MFA.** The `/admin` area requires a fully-verified (aal2) session.
`requireAdmin()` (`lib/auth.ts`) checks the admin registry and the session's
authenticator assurance level, redirecting to `/auth/mfa` to enroll or verify a
TOTP factor. The middleware (`middleware.ts` → `lib/supabase/middleware.ts`)
also refreshes the session on every request and blocks `/admin` for non-admins.

**Supabase clients** (`lib/supabase/`):

- `client.ts` — browser, anon key (RLS applies).
- `server.ts` — server components / routes / actions, anon key (RLS applies),
  session read from cookies. Also `createAdminClient()` (service role, bypasses
  RLS) used **only** for the audit log's context and true account deletion.
- `middleware.ts` — session refresh + route guarding.

**Data rights.** `/api/account/export` returns all of a user's rows as JSON;
`/api/account/delete` deletes the `auth.users` row (cascading everything). User
content is never used to train models.

## Where the AI is called

The Claude API is invoked in exactly one place: **`app/api/chat/route.ts`**
(Node.js runtime). Nothing else imports the Anthropic SDK, and no provider key
is ever in the client bundle.

Request flow for `POST /api/chat { conversationId, message }`:

1. Require a signed-in user (401 otherwise).
2. **Rate-limit** per user (`lib/rate-limit.ts`; 429 when exceeded).
3. Load and verify the conversation, its loved one, persona config, memories,
   and prior turns (all under RLS).
4. Persist the user's message.
5. Run **distress detection** (`lib/guardrails.detectsDistress`).
6. Build the system prompt (`lib/persona/prompt-builder.ts`) and call Claude
   (`claude-opus-5` by default, `ANTHROPIC_MODEL` to override).
7. Persist the reply and return `{ reply, distress }`.

### Guardrails, enforced in code

`lib/guardrails.ts` is the single source of truth for the symbolic-remembrance
promise:

- `PERSONA_GUARDRAILS` is injected **first** into every system prompt — the echo
  must affirm it is a reflection shaped from memory, never claim to be the real
  person / consciousness / spirit, never predict the future or report facts
  about the afterlife, and never fabricate biographical detail.
- When a message trips the distress detector, an extra in-the-moment care
  instruction is appended to the prompt, and the UI surfaces
  `SupportResourceCard` (988) gently.
- `TRANSPARENCY_NOTE` is shown in onboarding and signup, and a quiet reminder
  that "this is an echo" stays visible in the chat.

## The connection visualization

`components/ritual/` isolates the WebGL work into a few small, commented pieces:

- `shaders.ts` — GLSL for the particle field and the dimensional layers.
- `ParticleField.tsx` — a field of drifting motes travelling past the camera;
  all motion lives in the vertex shader so thousands of points stay cheap.
- `DimensionalLayers.tsx` — translucent additive shells the journey passes
  through.
- `ConnectionRitual.tsx` — composes the scene, auto-advances, and provides a
  motion-free / no-WebGL fallback (respecting `prefers-reduced-motion`).

The ritual is loaded with `next/dynamic({ ssr: false })` so `three` never runs
on the server. `app/ritual-preview` renders it in isolation for design review.

## Design system

Tokens live in `tailwind.config.ts` and `app/globals.css`: a twilight-indigo
night, a single candle-gold accent reserved for sacred/primary actions, and an
amethyst "aurora" glow. Type is Fraunces (display) + Instrument Sans (body).
Hierarchy comes from space and light (fading hairline rules, glows) rather than
boxed cards.
