# Security Policy

## Reporting a vulnerability

**Please do not open a public issue for a security problem.** A public report tells
everyone about the weakness before there is a fix.

Report it privately, in either of these ways:

1. **GitHub (preferred)** — go to the **Security** tab of this repository and click
   **Report a vulnerability**. This opens a private advisory only the maintainer can see.
2. **Email** — <support@cgsoftwarestudio.com>.

Please include what you found, the steps to reproduce it, and what an attacker could do with
it. If you have a suggested fix, even better.

**What to expect:** an acknowledgement within 7 days, and updates as the fix progresses. If
you'd like credit in the release notes, say so and you'll get it.

## Scope

In scope:

- The mobile app in this repository (`app/`, `src/`)
- The Supabase edge function and row-level-security policies (`supabase/`)
- The static legal/support site (`web/`)
- Anything that could expose another user's data, journal entries, or account

Out of scope:

- Vulnerabilities in third-party services themselves (Expo, Supabase, RevenueCat, Apple) —
  please report those to the vendor
- Missing hardening that has no practical exploit path (e.g. absent headers on the static
  marketing pages)

## What this app stores

The app is **local-first**: with no backend keys configured it runs entirely on-device with
no account. When a Supabase backend *is* configured, accounts use Sign in with Apple or
email/password, and every table is protected by row-level security so a row is readable only
by its owner. There is no analytics or tracking SDK in the app.

## For contributors

Never commit real credentials. `.env` is git-ignored, `.env.example` holds placeholders only,
and every key is read from the environment at build time (see `app.config.ts`). Secret
scanning with push protection is enabled on this repository — if a push is blocked because it
contains a key, do not work around it: rotate that key and remove it from your commit.
