# Supabase Migrations Guide (For Django Developers)

This guide explains how database migrations work in Supabase compared to Django.

---

## 1. Quick Concept Mapping

| Concept | Django (`manage.py`) | Supabase (`supabase-cli`) |
| :--- | :--- | :--- |
| **Migration history table** | `django_migrations` | `supabase_migrations.schema_migrations` |
| **Create a new migration** | `python manage.py makemigrations <name>` | `npx supabase migration new <name>` |
| **Apply migrations** | `python manage.py migrate` | `npx supabase db push` |
| **Migration file format** | Python (`0001_initial.py`) | Raw SQL (`<timestamp>_<name>.sql`) |
| **Schema definition** | `models.py` | `supabase/schema.sql` or migration files |

---

## 2. Method A: CLI Workflow (Recommended for Git & Teams)

This workflow creates version-controlled `.sql` files inside `supabase/migrations/` that can be committed to GitHub.

### Step 1: Link your local project (One-time setup)
```bash
npx supabase login
npx supabase link --project-ref uhlnzysuaemmyqhzzshy
```
*(You will be prompted for your Supabase database password).*

### Step 2: Create a migration file (Equivalent to `makemigrations`)
```bash
npx supabase migration new init_tally_schema
```
This generates a timestamped file:
```text
supabase/migrations/20260824000000_init_tally_schema.sql
```

### Step 3: Add your SQL statements
Paste your table definitions, RLS policies, triggers, or alterations into the generated `.sql` file.

### Step 4: Apply migrations to the live database (Equivalent to `migrate`)
```bash
npx supabase db push
```
Supabase executes all unapplied migration files in order and marks them as applied.

---

## 3. Common Migration Operations (Cheatsheet)

### Add a new column
```sql
alter table public.tally_boards
add column if not exists description text;
```

### Rename a column
```sql
alter table public.tally_branches
rename column label to option_name;
```

### Drop a column (use with care)
```sql
alter table public.tally_boards
drop column if exists description;
```

### Create a new table with RLS
```sql
create table if not exists public.tally_tags (
  id uuid primary key default gen_random_uuid(),
  board_id uuid not null references public.tally_boards(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

alter table public.tally_tags enable row level security;

create policy "tags: owner full access"
  on public.tally_tags
  for all
  using (
    exists (
      select 1 from public.tally_boards b
      where b.id = tally_tags.board_id
      and b.user_id = auth.uid()
    )
  );
```

---

## 4. Method B: Web Dashboard (Quick / Visual)

If you don't want to use the CLI:

1. Open **[Supabase Dashboard](https://supabase.com/dashboard)** &rarr; Select your project.
2. Go to **SQL Editor** (`>_` icon in left sidebar).
3. Click **New Query**.
4. Paste the SQL script from `supabase/schema.sql`.
5. Click **Run** (`Ctrl + Enter`).
