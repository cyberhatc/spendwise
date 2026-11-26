# spendwise
Next.js · TypeScript · Tailwind CSS · Supabase · Recharts · Gemini AI

**Tagline:** Track Smart. Spend Better. Save More.

---

## Table of contents

1. [Overview](#overview)
2. [Features](#features)
3. [Tech stack](#tech-stack)
4. [Getting started](#getting-started)
5. [Supabase setup](#supabase-setup)
6. [Gemini AI setup](#gemini-ai-setup)
7. [Environment variables](#environment-variables)
8. [Database schema & migrations](#database-schema--migrations)
9. [Demo mode](#demo-mode)
10. [Project structure](#project-structure)
11. [Scripts](#scripts)
12. [Deployment](#deployment)
13. [Security notes](#security-notes)

---

## Overview

**SpendWise** is a student-focused personal finance and expense-tracking web app. It helps
college students record income and expenses, plan monthly budgets, set savings goals,
review spending habits, and get AI-powered insights — all in one calm, focused dashboard.

Design language: clean white / light-lavender surfaces, deep purple primary (`#6C63FF`),
soft violet accents, dark navy ink text, rounded 14–18px cards, Inter + Poppins typography,
subtle shadows and generous spacing.

**Tagline:** *Track Smart. Spend Better. Save More.*

## Features

### Public
- Landing page with hero, feature grid, how it works, benefits, CTA and footer.

### Authentication
- Sign up / login / logout, password reset (Supabase Auth), protected routes via
  middleware, session persistence, route protection for all app pages.

### Dashboard (`/dashboard`)
- Total balance, income, expenses and savings cards (computed live from transactions).
- Spending chart (last 6 months), category breakdown donut, recent transactions.
- Monthly budget progress, quick-add expense modal.

### Transactions (`/transactions`)
- Add / edit / delete transactions.
- Search, filter by category / type / month, pagination.

### Budget planner (`/budgets`)
- Monthly + per-category budgets with progress bars, warnings at 80% and 100%.

### Savings goals (`/savings`)
- Create goals (name, target, saved, deadline), progress tracking.

### Expense calendar (`/calendar`)
- Month view with daily spending summaries, navigation, click-through to transactions.

### Analytics (`/analytics`)
- Weekly / monthly / yearly reports, income vs expense charts, category comparisons,
  CSV export.

### AI financial assistant (`/ai`)
- Server-side Gemini calls through `/api/ai/*` (API key never exposed to the client).
- Spending pattern insights and chat with fallback when AI is not configured.

### Student features
- Roommate expense splitting (`/splits`).
- No-spend challenges (`/challenges`).
- Recurring expenses (`/recurring`).
- Student discounts tracker (`/discounts`).

### Profile & settings (`/profile`)
- Profile editing, currency selection (INR default), theme preference, account settings.

## Tech stack

- **Framework:** Next.js 15 (App Router) + TypeScript
- **Styling:** Tailwind CSS, custom design tokens
- **Charts:** Recharts
- **Icons:** Lucide React
- **Forms:** React Hook Form + Zod
- **Backend / DB / Auth:** Supabase (PostgreSQL + Auth) with Row Level Security
- **AI:** Google Gemini API (server-side only)
- **Currency:** Indian Rupees (₹) with Indian number formatting

## Getting started

### Prerequisites

- Node.js 18.18+
- npm 9+
- A Supabase project ([supabase.com](https://supabase.com))

### Install & run

```bash
git clone <your-repo-url> spendwise
cd spendwise

npm install

cp .env.example .env.local
# Fill in Supabase credentials (see below)

npm run dev
```

Open <http://localhost:3000>.

### Demo mode

If Supabase environment variables are missing or you set `NEXT_PUBLIC_DEMO_MODE=true`,
the app runs in **demo mode** with realistic sample student transactions (clearly marked as
demo data) stored locally — perfect for previews and local testing.

```bash
NEXT_PUBLIC_DEMO_MODE=true npm run dev
```

## Supabase setup

1. Create a project at <https://supabase.com/dashboard>.
2. Run all SQL files from `supabase/migrations/` against the SQL editor or via the CLI:

```bash
supabase db push
# or manually paste each file from supabase/migrations into the Supabase SQL editor
```

3. Enable **Authentication → Providers → Email** (and optionally Google) in the Supabase dashboard.
4. Add your local URL to the **Redirect URLs** allow-list:

```
http://localhost:3000/auth/callback
```

5. Configure **Row Level Security**: the migration files include the required RLS policies.
   Enable RLS on all tables and ensure policies reference `auth.uid()`.

### Tables

| Table | Purpose |
| --- | --- |
| `profiles` | User profile (name, avatar, currency, etc.) |
| `transactions` | Income / expense entries with category, amount, date, type |
| `budgets` | Monthly + category budgets |
| `savings_goals` | Savings goals with targets and deadlines |
| `recurring_transactions` | Recurring income / expense schedules |
| `expense_splits` | Roommate expense splits / settlements |
| `no_spend_challenges` | No-spend challenges and progress |

## Gemini AI setup

The AI assistant runs exclusively through server-side API routes (`/api/ai/*`):

```bash
GEMINI_API_KEY=<your-key>
GEMINI_MODEL=gemini-1.5-flash   # optional
```

- The API key is read server-side only and never shipped to the browser.
- If `GEMINI_API_KEY` is missing or the call fails, the assistant returns a helpful,
  locally-generated fallback response.

## Environment variables

See [`.env.example`](./.env.example):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
GEMINI_MODEL=gemini-1.5-flash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DEMO_MODE=false
```

## Database schema & migrations

Migrations live in [`supabase/migrations/`](./supabase/migrations). They create:

- `profiles` table with user relationship and RLS
- `transactions` table with category enum/check, amount, date, type, user_id + RLS
- `budgets`, `savings_goals`, `recurring_transactions`, `expense_splits`, `no_spend_challenges`
- Indexes on user_id and created_at/transaction date

All user-scoped tables include RLS policies so users can only read/insert/update their own rows.

## Demo mode

When Supabase credentials are absent (or `NEXT_PUBLIC_DEMO_MODE=true`), SpendWise uses a
local demo store seeded with realistic student transactions:

- Meals, transport, tuition, shopping, entertainment, rent, bills, health, income.
- Marked as demo data; not persisted to any remote backend.

## Project structure

```
spendwise/
├── supabase/
│   └── migrations/
│       └── 20260101000000_init.sql
├── src/
│   ├── app/
│   │   ├── (app)/               # Protected app pages
│   │   │   ├── dashboard/
│   │   │   ├── transactions/
│   │   │   ├── budgets/
│   │   │   ├── savings/
│   │   │   ├── calendar/
│   │   │   ├── analytics/
│   │   │   ├── ai/
│   │   │   ├── splits/
│   │   │   ├── recurring/
│   │   │   ├── challenges/
│   │   │   ├── discounts/
│   │   │   └── profile/
│   │   ├── (auth)/              # Login / signup / password reset
│   │   ├── api/
│   │   │   ├── ai/chat/
│   │   │   └── ai/insights/
│   │   ├── page.tsx             # Landing
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── ...
│   ├── components/
│   │   ├── ui/                  # Design system primitives
│   │   ├── charts/              # Recharts wrappers
│   │   ├── layout/              # Sidebar / topbar shell
│   │   └── ...
│   ├── hooks/
│   ├── services/
│   ├── lib/
│   │   ├── supabase/
│   │   ├── analytics.ts
│   │   ├── demo-data.ts
│   │   ├── format.ts
│   │   ├── validation.ts
│   │   └── ...
│   └── types/
├── middleware.ts
├── tailwind.config.js
├── next.config.mjs
└── .env.example
```

## Scripts

```bash
npm run dev      # start dev server
npm run build    # production build
npm start        # start production server
npm run lint     # lint
```

## Deployment

### Vercel (recommended)

The repo is ready to deploy on Vercel out of the box — a `vercel.json` is included
configuring the Next.js framework preset, build command (`next build`), install command
(`npm install`) and dev command (`next dev`).

#### Option A: Vercel Dashboard

1. Push this repository to GitHub / GitLab / Bitbucket.
2. Import the project at <https://vercel.com/new>.
3. Vercel auto-detects the **Next.js** framework — keep the suggested defaults:
   - Framework Preset: **Next.js**
   - Build Command: `next build`
   - Output Directory: `.next`
   - Install Command: `npm install`
4. Add all environment variables from [`.env.example`](#environment-variables) under
   **Project → Settings → Environment Variables**:

   | Variable | Required | Notes |
   | --- | --- | --- |
   | `NEXT_PUBLIC_SUPABASE_URL` | Live mode | Supabase project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Live mode | Supabase anon public key |
   | `SUPABASE_SERVICE_ROLE_KEY` | Live mode | Server-side only (AI insights) |
   | `GEMINI_API_KEY` | Live mode | Google AI Studio key for the assistant |
   | `GEMINI_MODEL` | Optional | Defaults to `gemini-1.5-flash` |
   | `NEXT_PUBLIC_APP_URL` | Live mode | Your Vercel deployment URL, e.g. `https://spendwise.vercel.app` |
   | `NEXT_PUBLIC_DEMO_MODE` | Optional | `false` for live, `true` for demo |

5. Redeploy after adding the variables (Vercel only injects env vars at build time for
   `NEXT_PUBLIC_*` values).

#### Option B: Vercel CLI

```bash
npm i -g vercel
vercel login
vercel        # preview deployment
vercel --prod # production deployment
```

#### Post-deploy: Supabase auth redirect

In the Supabase dashboard (**Authentication → URL Configuration**), add your Vercel URL:

```
https://<your-project>.vercel.app/auth/callback
```

And, for local dev, keep:

```
http://localhost:3000/auth/callback
```

#### Post-deploy: demo mode

If you deploy without Supabase credentials configured, the app runs in **demo mode**
locally seeded — on Vercel you can set `NEXT_PUBLIC_DEMO_MODE=true` to ship a working demo
deployment without any backend.

### Other hosts

Any Node.js host that supports Next.js (e.g. Render, Railway, Fly.io) can build the same
way:

```bash
npm run build
npm start
```

---

## Deployment checklist

- [ ] `npm run build` passes cleanly
- [ ] Supabase project created, migrations applied, RLS enabled
- [ ] `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` set
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set (server-side only)
- [ ] `GEMINI_API_KEY` set (server-side only; AI falls back gracefully if missing)
- [ ] `NEXT_PUBLIC_APP_URL` set to the production URL
- [ ] Supabase redirect URL allow-listed: `https://<your-domain>/auth/callback`
- [ ] `NEXT_PUBLIC_DEMO_MODE=false` (live) or `true` (demo)

## Security notes

- Passwords are never stored or logged by the app; Supabase Auth handles credential storage.
- The Gemini API key lives only in server-side environment variables and is never exposed
  to the browser.
- Supabase Row Level Security policies restrict all queries to the authenticated user.
- Input validation is enforced with Zod on both client and server.
- Demo mode data never touches remote backends.

---

Happy budgeting! 🎓💜
