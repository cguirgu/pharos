-- Pharos — initial Postgres schema for Supabase.
--
-- Mirrors the local Drizzle schema (src/db/schema.ts). Every per-account table
-- carries `account_id uuid` referencing auth.users, with Row-Level Security so a
-- row is only ever visible/editable by its owner (auth.uid() = account_id).
-- Entity ids stay `text` (the app's id() format); JSON columns are jsonb;
-- created_at/updated_at hold the app's epoch-millis (bigint), and every table
-- gets a server-managed `inserted_at` for audit. Device-only prefs (theme,
-- notification config, session) are NOT stored here — they stay local.
--
-- Apply via the Supabase CLI (`supabase db push`) or the SQL editor.

-- ── profiles (app data attached to a Supabase auth user) ──────────────────────
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  journey_stage text check (journey_stage in ('grew-up', 'returning', 'exploring')),
  onboarding_complete boolean not null default false,
  created_at timestamptz not null default now()
);

-- Seed a profile row when a new auth user is created.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email) values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users for each row execute function public.handle_new_user();

-- ── per-account data tables ───────────────────────────────────────────────────
create table if not exists public.practices (
  id text primary key,
  account_id uuid not null references auth.users (id) on delete cascade,
  created_at bigint not null,
  name text not null,
  category text not null,
  kind text not null,
  cadence jsonb not null,
  measure text not null,
  target integer,
  parts jsonb,
  reminder jsonb,
  intention text,
  state text not null,
  resume_on text,
  sort_order integer not null,
  inserted_at timestamptz not null default now()
);
create index if not exists practices_account_idx on public.practices (account_id);

create table if not exists public.practice_logs (
  account_id uuid not null references auth.users (id) on delete cascade,
  practice_id text not null,
  date text not null,
  status text not null,
  value integer,
  parts jsonb,
  inserted_at timestamptz not null default now(),
  primary key (account_id, practice_id, date)
);
create index if not exists practice_logs_account_idx on public.practice_logs (account_id);

create table if not exists public.rest_days (
  account_id uuid not null references auth.users (id) on delete cascade,
  date text not null,
  inserted_at timestamptz not null default now(),
  primary key (account_id, date)
);

create table if not exists public.journal_entries (
  account_id uuid not null references auth.users (id) on delete cascade,
  id text not null,
  date text not null,
  title text not null,
  body text not null,
  passage_ref text,
  created_at bigint not null,
  updated_at bigint not null,
  inserted_at timestamptz not null default now(),
  primary key (account_id, id)
);

create table if not exists public.highlights (
  account_id uuid not null references auth.users (id) on delete cascade,
  id text not null,
  source text not null,
  anchor jsonb not null,
  text_snapshot text not null,
  reference_label text not null,
  note text,
  color text,
  label text,
  created_at bigint not null,
  updated_at bigint not null,
  inserted_at timestamptz not null default now(),
  primary key (account_id, id)
);

create table if not exists public.reading_plans (
  account_id uuid not null references auth.users (id) on delete cascade,
  plan_id text not null,
  start_date text not null,
  created_at bigint not null,
  inserted_at timestamptz not null default now(),
  primary key (account_id, plan_id)
);

create table if not exists public.reading_progress (
  account_id uuid not null references auth.users (id) on delete cascade,
  plan_id text not null,
  day_number integer not null,
  completed_on text not null,
  inserted_at timestamptz not null default now(),
  primary key (account_id, plan_id, day_number)
);

create table if not exists public.office_logs (
  account_id uuid not null references auth.users (id) on delete cascade,
  date text not null,
  office_key text not null,
  inserted_at timestamptz not null default now(),
  primary key (account_id, date, office_key)
);

create table if not exists public.learn_lessons (
  account_id uuid not null references auth.users (id) on delete cascade,
  lesson_id text not null,
  completed_on text not null,
  correct integer not null,
  total integer not null,
  inserted_at timestamptz not null default now(),
  primary key (account_id, lesson_id)
);

-- ── Row-Level Security: every table owner-only ────────────────────────────────
alter table public.profiles enable row level security;
create policy "profiles_owner" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

do $$
declare tbl text;
begin
  foreach tbl in array array[
    'practices','practice_logs','rest_days','journal_entries','highlights',
    'reading_plans','reading_progress','office_logs','learn_lessons'
  ] loop
    execute format('alter table public.%I enable row level security', tbl);
    execute format(
      'create policy "owner_all" on public.%I for all using (auth.uid() = account_id) with check (auth.uid() = account_id)',
      tbl
    );
  end loop;
end $$;
