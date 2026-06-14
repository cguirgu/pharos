# Pharos — Architecture

## The one hard rule
**`src/domain` is pure TypeScript.** It imports nothing from react/react-native/
expo and never calls `new Date()`. Everything liturgical and rule-related
(calendar, cadence, streaks) is provable with `npm test` alone. This is why the
whole engine was built and tested before any UI existed.

## Layers (inside → out)
```
src/domain/        ★ pure TS — calendar + rule engines (no RN/Expo, no clock)
  coptic/          gregorian↔coptic, pascha, seasons, feasts, fasting, clock(injectable)
  rule/            practice model, 6 cadences, statuses, streaks, stats, history
src/db/            persistence: Repo interface + MemoryRepo (web/tests) + SqliteRepo (device, Drizzle)
src/state/         zustand stores — thin glue over domain + db (clock, rule)
src/platform/      app-layer helpers: system clock (the ONE new Date()), id generator
                   (NB: not `src/app/` — that name collides with Expo Router's routes dir)
src/ui/            theme tokens, codex components, screen-support (Page, sheets, format, copy)
app/               Expo Router routes — thin files: (tabs)/*, practice/*
```

## Time is injected (never read in the domain)
- `src/domain/coptic/clock.ts` holds a settable today-provider; the domain calls
  `today()` only when it must, and tests call `setFixedToday()`.
- `src/app/today.ts` installs the **system clock** (the single permitted
  `new Date()`), wired in by `src/state/clock.ts`.
- `src/state/clock.ts` also powers the hidden **dev date-override** (`src/ui/DevDate.tsx`)
  so liturgical behaviour is testable on any date, on-device.

## Accounts & auth (local, swappable)
- **Local, multi-account, test-only.** `src/state/auth.ts` (`useAuth`) owns sign-up /
  sign-in / sign-out / switch-account / completeOnboarding and the persisted session.
  It is the **seam a real backend (e.g. Supabase) slots into** later.
- Credentials are stored locally; `src/platform/hash.ts` is a **non-secure, test-only**
  hash that a real backend replaces.
- **Data is isolated per account**: every practice/log/rest-day carries an `accountId`.
  `useAuth` drives `useRule.load(accountId)` on account change and `clear()` on sign-out.
- Onboarding (3 steps) writes the account's profile + creates the chosen starter rule
  (`src/db/seed.ts` `starterPractices(createdAt, selection)`); there is no auto-seed.
- Routing gate: `app/index.tsx` → `/auth/welcome` (no session) · `/onboarding`
  (account, not onboarded) · `/(tabs)/today` (ready). `app/_layout.tsx` calls
  `useAuth.load()` on mount.

## Persistence
- `Repo` (`src/db/repo.ts`) is the boundary, with **account methods**
  (`createAccount`/`findAccountByEmail`/`getAccount`/`listAccounts`/`updateAccount`,
  `getSession`/`setSession`) and **account-scoped data methods**
  (`listPractices(accountId)`, `upsertPractice(accountId, p)`, …). `getRepo()` returns:
  - **MemoryRepo** on web / in jest (fully testable, accounts isolated by `accountId`), and
  - **SqliteRepo** (`src/db/sqliteRepo.ts`, Drizzle + expo-sqlite) on device.
- Schema: `src/db/schema.ts` (`accounts` + `practices`/`practice_logs`/`rest_days` with
  `account_id` + `settings`; Drizzle tables + a `CREATE TABLE IF NOT EXISTS` bootstrap).
  Union/array fields (cadence, parts, reminder) are JSON text.
- `src/state/rule.ts` holds the active account's data and persists every mutation.

## Navigation
Expo Router. The native tab bar is hidden; `app/(tabs)/_layout.tsx` renders the
custom `NavLedger`. Practice editor/detail live under `app/practice/`.

## Testing
- `jest-expo` preset; domain + state + UI-label tests run with `npm test`.
- Visual verification is via **Expo Go** on a device and **Expo web** — the
  no-Xcode environment can't run the iOS simulator (see `TESTING.md`).
- RNTL component rendering is not yet wired for RN 0.85 / React 19 new-arch in
  jest; UI is verified at the string/logic layer (`__tests__/ui/today-labels.test.ts`)
  and via device testing meanwhile.

## Conventions
TypeScript strict; no `any` in `src/domain`. Tokens only (no inline hex in
screens). Sharp corners everywhere. All copy in `src/ui/copy.ts`. Conventional
commits; commit at phase gates.
