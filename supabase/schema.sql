-- ==============================================================================
-- TallyBoard - Supabase Schema, Triggers, RPC, and Row Level Security
-- ==============================================================================

-- 1. Tables

-- Boards = the top-level "question"
create table if not exists public.tally_boards (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  allow_negative boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Branches = the "branch question" / option, holds its own count
create table if not exists public.tally_branches (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.tally_boards(id) on delete cascade,
  label text not null,
  count integer not null default 0,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes for fast query lookup
create index if not exists idx_tally_branches_board_id on public.tally_branches (board_id);
create index if not exists idx_tally_boards_user_id on public.tally_boards (user_id);

-- 2. updated_at Trigger
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_boards_updated_at on public.tally_boards;
create trigger trg_boards_updated_at
  before update on public.tally_boards
  for each row execute function public.set_updated_at();

drop trigger if exists trg_branches_updated_at on public.tally_branches;
create trigger trg_branches_updated_at
  before update on public.tally_branches
  for each row execute function public.set_updated_at();

-- 3. Atomic increment/decrement RPC function
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
    when not coalesce(allow_neg, false) and count + delta < 0 then 0
    else count + delta
  end
  where id = branch_id
  returning * into result;

  return result;
end;
$$ language plpgsql security definer;

-- 4. Enable Row Level Security (RLS)
alter table public.tally_boards enable row level security;
alter table public.tally_branches enable row level security;

-- Policies for tally_boards
drop policy if exists "boards: owner full access" on public.tally_boards;
create policy "boards: owner full access"
  on public.tally_boards
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Policies for tally_branches
drop policy if exists "branches: owner full access" on public.tally_branches;
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

-- Enable Realtime for both tables
alter publication supabase_realtime add table public.tally_boards;
alter publication supabase_realtime add table public.tally_branches;

-- 5. User Feedback & Improvement Suggestions
create table if not exists public.tally_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null default 'feature',
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.tally_feedback enable row level security;

drop policy if exists "feedback: users can insert their own" on public.tally_feedback;
create policy "feedback: users can insert their own"
  on public.tally_feedback
  for insert
  with check (auth.uid() = user_id);

drop policy if exists "feedback: users can view their own" on public.tally_feedback;
create policy "feedback: users can view their own"
  on public.tally_feedback
  for select
  using (auth.uid() = user_id);

