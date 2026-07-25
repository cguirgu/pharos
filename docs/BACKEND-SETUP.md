# Backend + auth setup (Supabase · Sign in with Apple · email + password)

The app is wired to Supabase (Postgres + Auth + RLS). It activates the moment the
keys below are present; **without them it falls back to a local store and a local
dev sign-in, so it still runs in Expo Go with no setup at all.** Contributors do
not need any of this to work on the app.

Auth offers two options: **Sign in with Apple** and **email + password**. (Google
Sign-In was removed — see the note at the bottom.)

> ⚠️ **Sign in with Apple does not run in Expo Go.** To exercise it you need a dev or
> EAS build (cloud builds — no local Xcode needed). Email/password and the rest of the
> app work fine in Expo Go.

## 1. Supabase

1. Create a project at supabase.com.
2. Apply the schema: run the files in `supabase/migrations/` — either
   `supabase db push` (CLI, linked to the project) or paste them into the SQL
   editor. This creates the tables, the `profiles` table + new-user trigger, and
   **Row-Level Security on every table** (a row is only visible to its owner).
3. **Settings → API**: copy the **Project URL** → `SUPABASE_URL`, and the
   **anon/public** key → `SUPABASE_ANON_KEY`. (Never ship the service-role key.)
4. **Authentication → Providers → Apple**: enable it, and configure your Apple
   Service ID / key per Supabase's Apple provider guide.

## 2. Provide the keys

Local dev build: copy `.env.example` → `.env` and fill it in.
EAS / production: set them as EAS secrets, e.g.
`eas secret:create --name SUPABASE_URL --value …` for each.

They are read in `app.config.ts` (`extra`) and surfaced via `src/lib/config.ts`.
`.env` is gitignored — secrets are never committed.

Optional: `REVENUECAT_IOS_KEY` enables the "Support the app" in-app purchase. When it
is absent that feature stays inert. See `docs/SUPPORT-IAP.md`.

## 3. Run a dev build

```
eas build --profile development --platform ios   # needed for Sign in with Apple
```
Install on a device, sign in → onboarding → the app. All reads/writes go to
Supabase, scoped per user by RLS. Sign-out clears the session.

## Where things live
- SQL + RLS: `supabase/migrations/`
- Account deletion: `supabase/functions/delete-account/`
- Client: `src/lib/supabase.ts` (anon key, storage-backed session, auto-refresh)
- Repo: `src/db/supabaseRepo.ts` (implements the `Repo` interface)
- Sign in with Apple: `src/platform/appleAuth.ts` (lazy native import)
- Credential validation: `src/domain/auth/credentials.ts` (pure — email + password rules)
- Auth store: `src/state/auth.ts` (`signInWithApple` / `signInWithPassword` /
  `signUpWithPassword` / `signOut` / session restore)
- Config gate: `src/lib/config.ts` (`isBackendConfigured()`), `src/db/repo.ts` (`getRepo()`)

## Notes
- **Online-first**: reads/writes need a connection. Offline-first sync is a later phase.
- Device-only prefs (theme, notification config) stay in local storage — never synced.
- **Google Sign-In was removed** during App Store review (Guideline 4.8); Sign in with
  Apple plus email/password is the supported set. Any `GOOGLE_*` keys in older notes are
  obsolete.
