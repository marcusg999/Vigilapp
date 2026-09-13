# Vigil

A quiet, sacred space to remember someone who has died — and to sit with their
memory through a guided ritual of connection.

Vigil lets a signed-in person create a profile, add a loved one, gather the
memories that make that person themselves, pass through a slow WebGL "connection
ritual," and then speak with a warm AI **echo** shaped from those memories.
People can leave written offerings, and read an education section on mourning
traditions and near-death-experience material curated by admins.

> **Guiding principle (non-negotiable).** Everything here is framed as *symbolic
> ritual and remembrance*, never literal contact. The echo never claims to be
> the deceased's real consciousness, never predicts the future, and never
> reports facts about the afterlife. It is warm, speaks in the loved one's
> remembered cadence, and gently supports healthy grief. See
> [`lib/guardrails.ts`](lib/guardrails.ts) and [ARCHITECTURE.md](ARCHITECTURE.md).

This repository is **Phase 1 (MVP)**: auth + profile, add-a-loved-one and
persona onboarding, text chat with the echo, the connection visualization,
written offerings, the education section, and a secure admin dashboard.

## Stack

- **Next.js (App Router) + React + TypeScript + Tailwind CSS**
- **react-three-fiber + drei** for the connection visualization
- **Supabase** — Postgres, Auth, Row-Level Security (Edge/Storage-ready)
- **Anthropic Claude API** for the echo, called **only** from a server route

## Getting started

### 1. Install

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in your Supabase project URL and keys and your Anthropic API key. The
service-role and Anthropic keys are **server-only** — never expose them to the
browser. See the comments in [`.env.example`](.env.example).

### 3. Set up the database

Apply the SQL migrations and (optionally) the seed content. Full instructions,
including how to promote the first admin and enable MFA, are in
[`supabase/README.md`](supabase/README.md).

```bash
supabase db push        # or paste supabase/migrations/*.sql in order
```

### 4. Run

```bash
npm run dev             # http://localhost:3000
```

Other scripts:

```bash
npm run build           # production build
npm run typecheck       # tsc --noEmit
npm run lint            # next lint
```

## What's where

```
app/
  page.tsx                     Landing / hero (public)
  auth/                        login, signup, MFA, callback, sign-out
  app/                         signed-in area (shell + nav)
    page.tsx                   "Remembrance" — the user's loved ones
    loved-ones/new/            guided persona onboarding
    loved-ones/[id]/           detail: memories, offerings, enter the ritual
    loved-ones/[id]/connect/   the ritual → chat experience
    education/                 "Traditions" — published content
    profile/                   account, MFA, data export + deletion
  admin/                       MFA-gated admin: dashboard + content CRUD
  api/chat/                    the ONLY place the Claude API is called
  api/account/                 data export + true deletion
components/
  ritual/                      r3f connection visualization (isolated shaders)
  chat/                        chat room + connect experience
  admin/  app-shell/  brand/   supporting UI
lib/
  supabase/                    browser, server, admin, and middleware clients
  guardrails.ts                symbolic-not-literal rules + distress detection
  persona/prompt-builder.ts    assembles the echo's system prompt
  rate-limit.ts  auth.ts  audit.ts  types.ts
supabase/
  migrations/                  schema, RLS, storage, seed
  test/                        behavioral RLS test
```

## Safety & privacy

- **Symbolic framing** is enforced in the persona system prompt and surfaced to
  users (a transparency note in onboarding and a persistent reminder in chat).
- **Lightweight distress detection** gently surfaces a support resource (988).
- **RLS on every table** — users can only read and write their own rows.
- **Admin requires MFA** and a distinct admin registry.
- **One-tap data export** and **true account deletion** (cascades all rows).
- **User content is never used to train models.**

See [ARCHITECTURE.md](ARCHITECTURE.md) for the data model, the auth/RLS design,
and exactly where and how the AI is invoked.
