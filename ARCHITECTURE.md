# ARCHITECTURE.md — TallyBoard

Reference doc for folder structure, data model, and key flows. Read this
before writing backend/data-layer code. Referenced from `AGENTS.md` as
`@ARCHITECTURE.md`.

## 1. High-level flow

```
Google login (Supabase Auth)
        │
        ▼
   Dashboard  ── list of the user's Boards, each showing its live total
        │
        ▼
 Board Detail ── list of Branches, each with (−) count (+) controls
        │            Board total = sum(branch.count)
        ▼
   Summary   ── all Boards + their totals + grand total across everything
```

## 2. Folder structure

```
src/
  main.jsx                 # app entry, wraps App in providers
  App.jsx                  # router outlet
  router.jsx                # route definitions + protected-route wrapper
  lib/
    supabaseClient.js       # single Supabase client instance
  contexts/
    AuthContext.jsx         # session state, signIn/signOut helpers
  hooks/
    useBoards.js            # list/create/delete boards, subscribes to changes
    useBranches.js          # list/create/delete branches for a board
    useTallyActions.js       # increment/decrement via RPC, optimistic update
  pages/
    LoginPage.jsx
    DashboardPage.jsx
    BoardDetailPage.jsx
    SummaryPage.jsx
  components/
    BoardCard.jsx            # board title + total, used on Dashboard/Summary
    BranchRow.jsx            # label + (−) count (+) row
    AddBoardForm.jsx
    AddBranchForm.jsx
    BottomNav.jsx             # mobile tab bar: Boards / Summary / Profile
    TotalBadge.jsx
  styles/
    index.css                # Tailwind directives + safe-area utilities
.agents/
  rules/
    tallyboard-rules.md
AGENTS.md
ARCHITECTURE.md
.env.local                   # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
```

## 3. Data model (Postgres / Supabase)

```sql
-- Boards = the top-level "question"
create table public.tally_boards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  allow_negative boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Branches = the "branch question" / option, holds its own count
create table public.tally_branches (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.tally_boards(id) on delete cascade,
  label text not null,
  count integer not null default 0,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index on public.tally_branches (board_id);
create index on public.tally_boards (user_id);
```

### updated_at trigger (reuse for both tables)

```sql
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_boards_updated_at
  before update on public.tally_boards
  for each row execute function public.set_updated_at();

create trigger trg_branches_updated_at
  before update on public.tally_branches
  for each row execute function public.set_updated_at();
```

### Atomic increment/decrement (avoids race conditions across devices)

```sql
create or replace function public.adjust_branch_count(
  branch_id uuid,
  delta integer
) returns public.tally_branches as $$
declare
  result public.tally_branches;
  allow_neg boolean;
begin
  select b.allow_negative into allow_neg
  from public.tally_boards b
  join public.tally_branches br on br.board_id = b.id
  where br.id = branch_id;

  update public.tally_branches
  set count = case
    when not allow_neg and count + delta < 0 then 0
    else count + delta
  end
  where id = branch_id
  returning * into result;

  return result;
end;
$$ language plpgsql security definer;
```

Call from the client as:
```js
const { data, error } = await supabase.rpc('adjust_branch_count', {
  branch_id: branch.id,
  delta: 1, // or -1
});
```

### Row Level Security

```sql
alter table public.tally_boards enable row level security;
alter table public.tally_branches enable row level security;

create policy "boards: owner full access"
  on public.tally_boards
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "branches: owner full access"
  on public.tally_branches
  for all
  using (
    exists (
      select 1 from public.tally_boards b
      where b.id = tally_branches.board_id
      and b.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.tally_boards b
      where b.id = tally_branches.board_id
      and b.user_id = auth.uid()
    )
  );
```

`adjust_branch_count` is `security definer` specifically so an
authenticated user can bump a count via RPC while RLS still fully governs
direct table reads/writes elsewhere.

## 4. Auth flow (Google via Supabase)

1. Enable the Google provider in Supabase Dashboard → Authentication →
   Providers, with an OAuth Client ID/Secret from Google Cloud Console.
2. Add the app's redirect URL (local + production) to both Supabase's
   allowed redirect URLs and the Google OAuth client's authorized
   redirect URIs.
3. Client call:
   ```js
   await supabase.auth.signInWithOAuth({ provider: 'google' });
   ```
4. `AuthContext` listens via `supabase.auth.onAuthStateChange` and
   exposes `{ user, session, signOut }` to the rest of the app.
5. `router.jsx` wraps every route except `/login` in a `RequireAuth`
   guard that redirects to `/login` when `session` is null.

## 5. Realtime sync (optional but recommended)

Subscribe to a board's branches so counts stay in sync if the same user
has the app open on two devices:

```js
supabase
  .channel(`branches-${boardId}`)
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'tally_branches', filter: `board_id=eq.${boardId}` },
    (payload) => { /* merge into local state */ }
  )
  .subscribe();
```

## 6. Environment variables

```
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon-public-key>
```

Never commit `.env.local`; add it to `.gitignore`.

## 7. Deployment notes

- Frontend: any static host (Vercel/Netlify) — set the two env vars
  there as well.
- Supabase: run the SQL above via the SQL editor or a migrations folder
  (`supabase/migrations/`) if using the Supabase CLI, so schema changes
  are versioned alongside the app code.
