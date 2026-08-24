# Workspace Rule: TallyBoard Engineering Standards

Applies to: entire repository. These are always-on constraints for any
agent working in this workspace.

## 1. Stack discipline

- React function components + hooks only. No class components.
- Vite project structure — never introduce Next.js, CRA config, or webpack
  configs.
- Tailwind CSS utility classes for styling. No CSS-in-JS libraries, no
  separate SCSS pipeline.
- Supabase JS client (`@supabase/supabase-js`) is the only data-access
  layer. Never call `fetch` directly against Supabase REST/Realtime
  endpoints — use the SDK.
- Do not add a state-management library (Redux, Zustand, Jotai, Recoil)
  without explicit approval — Context + hooks is the default.

## 2. Project structure

- Keep the folder layout defined in `ARCHITECTURE.md`. New files go in the
  matching folder (`components/`, `hooks/`, `pages/`, `lib/`, `contexts/`).
- One component per file. File name matches the default export
  (`BranchCounter.jsx` exports `BranchCounter`).
- Co-locate a hook's data logic in `hooks/`, never inline Supabase calls
  inside a component body — components call hooks, hooks call Supabase.

## 3. Data & Supabase rules

- Never disable Row Level Security on any table. Every table that stores
  user data must have RLS enabled with explicit policies.
- Never hardcode a Supabase URL or anon key in source — always read from
  `import.meta.env.VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY`.
- Counter increment/decrement must go through the atomic RPC functions
  defined in `ARCHITECTURE.md` (`increment_branch` / `decrement_branch`),
  never a client-side `read count -> write count+1`, which is a race
  condition with multiple devices/tabs open.
- All new tables need: `id uuid default gen_random_uuid() primary key`,
  a `user_id` (directly or via parent FK) for ownership, `created_at`,
  and `updated_at` with a trigger to bump it.
- Never write a migration that drops a column/table containing user data
  without calling that out explicitly and asking first.

## 4. Auth rules

- Google is the only sign-in method. Do not add email/password,
  magic-link, or other OAuth providers unless asked.
- Every route except the login screen is protected — redirect
  unauthenticated users to `/login`.
- Never log, print, or persist access tokens/refresh tokens outside of
  what the Supabase SDK manages internally.

## 5. UX / mobile-first rules

- Design and build for a ~375px-wide viewport first, then scale up with
  Tailwind `sm:`/`md:`/`lg:` prefixes. Never start from a desktop layout.
- Tap targets (especially the +/− counter buttons) must be at least 44x44
  logical pixels.
- Counter taps must feel instant: update local/optimistic state
  immediately, then persist in the background. Show a subtle sync
  indicator on failure, not a blocking spinner on every tap.
- No `window.confirm`/`alert` for routine actions (incrementing,
  navigating). Reserve confirmation UI for destructive actions only
  (deleting a board or branch).
- Respect safe-area insets (`env(safe-area-inset-*)`) for bottom
  navigation on iOS.

## 6. Code quality

- Prefer small, composable components over large page files.
- Every Supabase call site must handle the error case (toast or inline
  message) — never swallow errors silently.
- No `any`-style untyped catch-alls if TypeScript is introduced later;
  if the project stays JS, still validate/guard external data shapes
  (e.g. Supabase responses) before rendering.
- Keep components under ~150 lines; if a component grows past that,
  propose splitting it out.

## 7. When unsure

- If a request conflicts with these rules or with `ARCHITECTURE.md`,
  say so explicitly and propose the compliant alternative rather than
  silently deviating.
- If a task requires a new dependency, name it and its bundle-size/
  maintenance trade-off before installing it.
