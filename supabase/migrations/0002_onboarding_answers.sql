-- Pharos — onboarding_answers table.
--
-- Mirrors the local Drizzle table (src/db/schema.ts onboardingAnswers): one row
-- per account holding the first-run questionnaire. `answers` is the JSON string
-- the app writes (mirrors the local TEXT column; SupabaseRepo stringifies on
-- write and JSON.parses on read). Owner-only via RLS, cascades on user delete.

create table if not exists public.onboarding_answers (
  account_id uuid primary key references auth.users (id) on delete cascade,
  answers text not null,
  completed_at bigint not null,
  inserted_at timestamptz not null default now()
);

alter table public.onboarding_answers enable row level security;
create policy "owner_all" on public.onboarding_answers
  for all using (auth.uid() = account_id) with check (auth.uid() = account_id);
