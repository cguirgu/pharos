-- Pharos — push_tokens table.
--
-- Holds one row per DEVICE that has opted in to release announcements. This is
-- the only remote-notification feature in the app; every other cue is a local
-- scheduled notification with no server involved.
--
-- Design notes:
--
-- * Keyed by the Expo push token, not by account. Announcements are a property
--   of the install, not of a login: the app is usable as a guest, and a guest
--   who opts in should still hear about a new version. `account_id` is
--   therefore NULLABLE and only recorded when someone happens to be signed in.
--
-- * NO SELECT POLICY, on purpose. RLS is enabled and the policies below grant
--   insert / update / delete only. With no select policy, the anon key cannot
--   read this table at all — so a leaked anon key cannot be used to harvest
--   the push tokens of the whole userbase. The send script reads it with the
--   service-role key, which bypasses RLS and must never ship in the app.
--
-- * Rows are matched by token for update/delete. A token is a long unguessable
--   string that only the device itself holds, which is what makes "delete the
--   row whose token is X" a safe opt-out for an unauthenticated client.
--
-- App Store guideline 4.5.4 requires an explicit opt-in for promotional pushes
-- and an in-app way out. A row existing here IS the record of that consent; the
-- opt-out deletes it. See src/domain/notifications/announcements.ts.

create table if not exists public.push_tokens (
  -- The Expo push token, e.g. "ExponentPushToken[xxxxxxxx]".
  token text primary key,
  -- Set only if the device was signed in when it opted in. Null for guests.
  account_id uuid references auth.users (id) on delete set null,
  -- 'ios' | 'android' — lets the send script target a platform if ever needed.
  platform text not null default 'ios',
  -- The app version that registered, so a release can skip devices already on it.
  app_version text,
  inserted_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists push_tokens_account_id_idx on public.push_tokens (account_id);

alter table public.push_tokens enable row level security;

-- Register (opt in). Anyone running the app may add their own device.
drop policy if exists "push_tokens_insert" on public.push_tokens;
create policy "push_tokens_insert" on public.push_tokens
  for insert to anon, authenticated
  with check (true);

-- Refresh (token rotation, version bump, or linking an account after sign-in).
drop policy if exists "push_tokens_update" on public.push_tokens;
create policy "push_tokens_update" on public.push_tokens
  for update to anon, authenticated
  using (true) with check (true);

-- Opt out. The device deletes the row whose token it holds.
drop policy if exists "push_tokens_delete" on public.push_tokens;
create policy "push_tokens_delete" on public.push_tokens
  for delete to anon, authenticated
  using (true);

-- Deliberately no SELECT policy: reading is service-role only.

comment on table public.push_tokens is
  'Devices opted in to release announcements (App Store guideline 4.5.4). No select policy — service-role reads only.';
