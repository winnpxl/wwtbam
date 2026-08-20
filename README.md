# WWTBAM

Who Wants to Be a Millionaire — play general knowledge or pick a profession.
15 questions, 3 lifelines, up to $1,000,000.

Next.js 16 · TypeScript · Tailwind v4 · Supabase · Claude

## Setup

```bash
npm install
```

Create `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Never put an `sb_secret_…` value in a `NEXT_PUBLIC_` variable — those ship to the browser.

Then, in the Supabase SQL Editor:

1. Run `supabase/migrations/001_initial.sql` — creates tables and RLS policies
2. Generate questions and run the result:

```bash
npx tsx scripts/generate-questions.ts   # writes supabase/seed.sql
```

```bash
npm run dev
```

## Game rules

Prize ladder runs $100 → $1,000,000 with safe havens at **$1,000** and **$64,000** — a wrong answer drops you to the last one cleared.

Lifelines, one use each: **50:50** (removes two wrong answers), **Ask the Audience** (simulated poll), **AI Hint** (Claude gives a cryptic clue).

Answers are verified server-side; `correct_idx` is never sent to the client before the reveal.

## Layout

```
app/            pages + API routes
components/     game UI
hooks/useGame   game state machine
lib/            types, prize ladder, Supabase clients, Claude wrapper
proxy.ts        auth protection for /profile and /play/game
supabase/       schema migration
scripts/        question generator
```

Without Supabase credentials the app still runs — pages render and routes
return 503 with a readable message instead of failing.

## Deploy

Push to `main`, import on Vercel, set the four env vars above (with
`NEXT_PUBLIC_SITE_URL` as the production URL), and add that domain to
Supabase → Authentication → URL Configuration.
