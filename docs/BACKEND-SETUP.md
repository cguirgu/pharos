# Backend + auth setup (Supabase · Google sign-in)

The app is wired to Supabase (Postgres + Auth + RLS) with **native Google
Sign-In**, online-first. It activates the moment the keys below are present;
without them it falls back to a local dev store + a local dev sign-in, so it
still runs in **Expo Go** during development.

> ⚠️ **Native Google Sign-In does not run in Expo Go.** Once you add the keys you
> must run a **dev/EAS build** (you already use EAS cloud builds — no local
> Xcode needed). The rest of the app still works in that dev build.

## 1. Supabase

1. Create a project at supabase.com.
2. Apply the schema: run `supabase/migrations/0001_init.sql` — either
   `supabase db push` (CLI, linked to the project) or paste it into the SQL
   editor. This creates the tables, the `profiles` table + new-user trigger, and
   **Row-Level Security on every table** (a row is only visible to its owner).
3. **Settings → API**: copy the **Project URL** → `SUPABASE_URL`, and the
   **anon/public** key → `SUPABASE_ANON_KEY`. (Never ship the service-role key.)
4. **Authentication → Providers → Google**: enable it, and paste the **Web**
   client ID + secret from step 2 below.

## 2. Google Cloud (OAuth)

In console.cloud.google.com → APIs & Services → Credentials, configure the OAuth
consent screen, then create **two** OAuth client IDs:

- **iOS** — bundle id `com.pharos.app`. Gives you:
  - the **iOS client ID** → `GOOGLE_IOS_CLIENT_ID`
  - its **reversed** form (`com.googleusercontent.apps.…`) → `GOOGLE_IOS_URL_SCHEME`
- **Web application** — gives the **Web client ID** → `GOOGLE_WEB_CLIENT_ID`
  (this is the token audience; also paste it + its secret into the Supabase
  Google provider in step 1.4).

## 3. Provide the keys

Local dev build: copy `.env.example` → `.env` and fill it in.
EAS / production: set them as EAS secrets, e.g.
`eas secret:create --name SUPABASE_URL --value …` for each of the five.

They are read in `app.config.ts` (`extra` + the google-signin `iosUrlScheme`) and
surfaced via `src/lib/config.ts`. `.env` is gitignored — secrets are never committed.

## 4. Run a dev build

```
eas build --profile development --platform ios   # native Google module needs this
```
Install on a device, sign in with Google → onboarding → the app. All reads/writes
go to Supabase, scoped per user by RLS. Sign-out clears the session.

## Where things live
- SQL + RLS: `supabase/migrations/0001_init.sql`
- Client: `src/lib/supabase.ts` (anon key, AsyncStorage session, auto-refresh)
- Repo: `src/db/supabaseRepo.ts` (implements the `Repo` interface)
- Google sign-in: `src/platform/googleAuth.ts` (lazy native import)
- Auth store: `src/state/auth.ts` (`signInWithGoogle` / `signOut` / session restore)
- Config gate: `src/lib/config.ts` (`isBackendConfigured()`), `src/db/repo.ts` (`getRepo()`)

## Notes
- **Online-first**: reads/writes need a connection. Offline-first sync is a later phase.
- Device-only prefs (theme, notification config) stay in local storage — never synced.
- The test-only password hash (`src/platform/hash.ts`) and email/password screens
  were removed; auth is Google-only.
