# AGENTS.md — Project Context

## What this app is

**TallyBoard** — a mobile-first tally counter app.

A user creates a **Board** (a top-level question, e.g. "Demography"). Inside a
Board, the user adds one or more **Branches** (sub-questions / options, e.g.
"18–25", "26–40", "41+"). Each Branch has its own increment (+) and
decrement (−) counter. The Board displays the **live total** of all its
Branches' counts. A separate **Summary** view lists every Board the user
owns with its grand total, for an at-a-glance overview.

Example:
```
Board: "Demography"
  Branch "18-25"  -> count 10
  Branch "26-40"  -> count 5
  Board total     -> 15
```

## Goals (in priority order)

1. Fast, thumb-friendly counting on a phone — this is the core loop, it
   must never feel laggy or require confirmation dialogs.
2. Data must persist per-user and survive refresh/offline blips.
3. Simple Google sign-in, no separate password flow.
4. Clean summary/reporting view across all boards.

## Tech stack (fixed — do not swap without asking)

- **Frontend:** React 18 + Vite
- **Styling:** Tailwind CSS, mobile-first breakpoints
- **Routing:** React Router v6
- **Backend/persistence/auth:** Supabase (Postgres + Auth + Realtime)
- **Auth method:** Supabase Auth, Google OAuth provider only
- **State:** React Context + hooks (no Redux); Zustand only if state
  genuinely outgrows Context — ask before adding it
- **Hosting target:** static frontend (Vercel/Netlify-style), Supabase cloud
  project for backend

## Core domain model

- `tally_boards` — the "question" (title, owner)
- `tally_branches` — the "branch question" (label, count, belongs to a board)

Full schema, RLS policies, and folder layout live in **@ARCHITECTURE.md** —
read it before generating backend or data-layer code.

## Where the rules live

Coding standards, UX rules, and guardrails for this project are in
**`.agents/rules/tallyboard-rules.md`**. Those rules are always active for
this workspace — treat them as binding constraints, not suggestions.

## Non-negotiable product behaviors

- Incrementing/decrementing a branch must update the Board total
  **instantly in the UI** (optimistic update), then sync to Supabase.
- A Board's total is always the sum of its Branches' counts — never a
  separately stored/editable number.
- Every board and branch is scoped to the signed-in user via `user_id`;
  no user should ever be able to read/write another user's data (enforced
  at the DB level with RLS, not just in the UI).
- Counts cannot go below 0 unless the user explicitly enables negative
  counts for that board (default: floor at 0).
- The app must be usable one-handed on a small phone screen first;
  desktop layout is a progressive enhancement, not the design starting
  point.

## Current milestone

Building the MVP: Google login → Dashboard (list of boards) → Board detail
(branches with counters + running total) → Summary (all boards + grand
totals). Ask before expanding scope beyond this (e.g. sharing boards,
exporting CSV, multi-language) — note it as a "later" idea instead.
