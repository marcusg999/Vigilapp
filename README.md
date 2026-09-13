# Pleroma

A quiet, sacred space to remember someone who has died — and to sit with their
memory through a guided ritual of connection.

Pleroma lets a signed-in person create a profile, add a loved one, gather the
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

## Run it locally

### Prerequisites

- **Node.js 20+** and npm
- A free **Supabase** project (Postgres + Auth)
- An **Anthropic API key** (for the echo chat)

### 1. Install

```bash
npm install
```

### 2. Create a Supabase project and apply the schema

1. Create a project at [supabase.com](https://supabase.com). Under
   **Project Settings → API**, copy the **Project URL**, the **anon** (public)
   key, and the **service_role** key.
2. Apply the SQL in [`supabase/migrations`](supabase/migrations) **in order** —
   either with the Supabase CLI or by pasting each file into the dashboard SQL
   editor. Then promote your first admin and enable TOTP MFA. Full steps
   (including the behavioral RLS test) are in
   [`supabase/README.md`](supabase/README.md).

   ```bash
   supabase link --project-ref <your-project-ref>
   supabase db push        # or paste supabase/migrations/*.sql in order
   ```

3. Under **Authentication → URL Configuration**, set the **Site URL** to
   `http://localhost:3000` for local development (add your deployed URL later),
   and make sure TOTP MFA is enabled under **Authentication → Providers →
   Multi-Factor**.

### 3. Configure environment

```bash
cp .env.example .env.local
```

Fill in the values (each is documented in [`.env.example`](.env.example)):

| Variable | Exposed to browser? | What it is |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Supabase Project URL (RLS constrains it) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | Supabase anon key (RLS constrains it) |
| `SUPABASE_SERVICE_ROLE_KEY` | **no — server only** | bypasses RLS; used only for the audit log context and true account deletion |
| `ANTHROPIC_API_KEY` | **no — server only** | the persona is called only from a server route |
| `ANTHROPIC_MODEL` | no | model id (defaults to `claude-opus-5`) |
| `NEXT_PUBLIC_SITE_URL` | yes | `http://localhost:3000` locally |

Only the `NEXT_PUBLIC_*` variables ever reach the client bundle. Never commit
`.env.local` — it is gitignored.

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

## Deploy to Netlify

Netlify auto-detects Next.js and installs its official runtime
(`@netlify/plugin-nextjs`), so the App Router, server components, middleware,
and route handlers all run without extra wiring. A [`netlify.toml`](netlify.toml)
is included that pins the build command and Node version.

1. **Connect the repo.** Push to GitHub, then in Netlify choose
   **Add new site → Import an existing project** and select the repository. The
   build command (`next build`) and the Next runtime are detected automatically.
2. **Set environment variables** under **Site configuration → Environment
   variables** — the same keys as `.env.local`:
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL`, and
   `NEXT_PUBLIC_SITE_URL` set to your Netlify URL
   (e.g. `https://your-site.netlify.app`). Keep the service-role and Anthropic
   keys as regular (non-public) variables — only `NEXT_PUBLIC_*` reaches the
   browser.
3. **Point Supabase at the deployed site.** In **Authentication → URL
   Configuration**, set the **Site URL** to your Netlify URL and add
   `https://your-site.netlify.app/auth/callback` to the **Redirect URLs** (used
   for email confirmation and any OAuth).
4. **Migrations are not run by Netlify.** Apply `supabase/migrations/*` to your
   Supabase project once (step 2 of local setup) — the deploy only serves the app.
5. **Deploy.** Netlify builds and serves it on every push to the default branch.

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
