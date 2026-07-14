# Getting Pharos through App Review

## Round 2 — rejection of 1.0 (16), July 14, 2026 (submission 55accd52-4d9a-44ff-b600-c143a44cc2e6)

Apple rejected build 16 on two guidelines. Both are fixed; resubmission needs a
**new binary** (code changed) plus two App Store Connect / web steps.

### Fix A — Guideline 5.1.1(v): forced registration
The app required sign-in before any feature. **Added guest mode**: a
"Continue without an account" link on the welcome screen opens the full app —
onboarding, rule, journal, Bible, Learn — with all data stored **only on the
device** (the local SQLite store; the backend is never touched by a guest).
Sync, and nothing else, still requires an account. This also makes the privacy
policy's long-standing "without signing in, your content never leaves your
device" true in practice.

Code: `GUEST_ACCOUNT_ID` + per-account repo dispatch (`src/db/repo.ts`),
`continueAsGuest` / guest session restore (`src/state/auth.ts`), welcome link
(`app/auth/welcome.tsx`), guest account panel (`app/(tabs)/you.tsx`).
Guest → sign-up does NOT migrate the on-device data (deliberate; the guest rows
are preserved locally, so a migration can ship later).

### Fix B — Guideline 1.5: Support URL
`https://pharos-app.com/` had no support information. **Added
`web/support/index.html`** — contact email, response expectation, and FAQ
(account deletion, data export, reminders) — and a Support link on the landing
page.

### Resubmission steps
1. Push `web/` to main so Vercel redeploys; verify `https://pharos-app.com/support/` loads.
2. App Store Connect → App Information: set **Support URL** to
   `https://pharos-app.com/support/`.
3. Update **App Review Information** notes (see below — sign-in is no longer required).
4. New build: `eas build -p ios --profile production` then `eas submit -p ios --latest`
   (bump the build number; verify `npm test` + `npx tsc --noEmit` first).
5. Reply to the App Review message, e.g.:

> Thank you for the review. Both issues are addressed in the new build:
>
> **5.1.1(v):** The app no longer requires registration. A "Continue without an
> account" option on the welcome screen gives full access to the app's features
> (daily rule, Coptic calendar, offline Bible, learning path, journal), with all
> data stored on-device. An account is only required for the account-based
> feature of syncing data across devices.
>
> **1.5:** The Support URL now points to https://pharos-app.com/support/, which
> provides a contact email and support information. We've updated the Support
> URL field in App Store Connect accordingly.

---

## Round 1 — pre-submission fixes

Two things in the earlier build were likely to bounce a first submission. Both are
now fixed in code; each needs a small external step + a **fresh build** (native
config changed, so this can't ship as an OTA update).

## Fix 1 — Guideline 4.8 (Login Services): Sign in with Apple
The app offered Google + email but no Sign in with Apple. When you use Google/social
login, Apple requires an equivalent privacy option. **Added:** native Sign in with
Apple, shown first on the welcome screen (iOS).

Code: `src/platform/appleAuth.ts`, `useAuth.signInWithApple` (`src/state/auth.ts`),
button in `app/auth/welcome.tsx`, `expo-apple-authentication` + `ios.usesAppleSignIn`
+ plugin in `app.config.ts`.

**External steps (required):**
1. **Supabase → Authentication → Providers → Apple → Enable.** Under **Authorized
   Client IDs** add the bundle id **`com.pharosapp.app`**. (Native sign-in validates
   the token's audience against the bundle id — no Services ID/secret needed for the
   native-only flow.)
2. **Apple Developer:** the App ID needs the **Sign in with Apple** capability. Expo's
   `usesAppleSignIn` adds the entitlement and EAS managed credentials add the
   capability at build time — confirm it's present on the App ID after the build.

## Fix 2 — Guideline 2.1 (Completeness): no more visible placeholders
Reviewers could reach screens showing "to be supplied" / "coming soon". **Gated for
launch** (flags in `src/content/flags.ts`):
- `HOURS_READY = false` — the Today fast/feast banner no longer opens the Hours; this
  also removes the Ordo (reached only from Hours). Removes the placeholder Agpeya prose.
- `CONTENT_LICENSED = false` (existing) — the daily commemoration is hidden on Today,
  Word, and Ordo instead of showing "⟨ commemoration to be supplied ⟩".
- Removed the Learn "Audio coming soon" label.
Flip these flags back on when the verified Agpeya text / Synaxarium license land.

## Rebuild + resubmit
The current version is **Waiting for Review** with the un-fixed binary. Since these
fixes need a new binary anyway:
1. `eas build -p ios --profile production`
2. If the in-flight review is still pending, remove that build from the version and
   attach the new one (or just submit the new build when the current review returns).
3. `eas submit -p ios --latest`.

Verify locally first: `npm test` (308 pass) and `npx tsc --noEmit` (clean). *(Local
node is currently broken via Homebrew — see note at bottom.)*

---

## App Review Information — paste into App Store Connect

**Sign-In required:** No. The app is fully usable without an account via
"Continue without an account" on the welcome screen. A demo account is provided for
testing the optional account features (sync, deletion, export); reviewers may also
use Sign in with Apple.

> Demo account
> Username: `<create a Supabase email/password account and put it here>`
> Password: `<password>`

**Review notes:**
> Pharos is a Coptic Orthodox devotional companion — a daily rule of life, the Coptic
> calendar (fasts/feasts), an offline King James Bible with reading plans, a Coptic
> alphabet learning path, a journal, and highlights.
>
> No sign-in is required: choose "Continue without an account" on the welcome screen
> to use every feature with data stored on-device. Creating an account (Sign in with
> Apple or email/password) is optional and only adds syncing across devices.
>
> Account deletion is in-app: You → Delete account (removes the account and all synced
> data). Data export is under You → Export my data.
>
> The app collects only what's needed to run the optional account (email, display name,
> and the user's own rule/journal/reading data for sync). Guests' data never leaves the
> device. No ads, no tracking, no analytics.

**Contact:** provide first/last name, phone, and email (e.g. `thepharosapp@gmail.com`).

---

## Pre-submit checklist (mandatory fields)
- [ ] Screenshots (6.7" required).
- [ ] Description, Keywords, **Support URL**, **Copyright** (e.g. `2026 <name>`).
- [ ] **App Privacy** completed *and published* + Privacy Policy URL.
- [ ] **Pricing and Availability** set (Free).
- [ ] Age rating + Primary Category.
- [ ] **App Review Information**: demo account + contact (above).
- [ ] Build attached, no "Missing Compliance".
- [ ] Agreements → Apple Developer Program agreement **Active**.

---

*Env note: local `node` (Homebrew 24.6.0) is broken after a `simdjson` upgrade
(`libsimdjson.26.dylib` missing). Workaround used for verification: the standalone
`/usr/local/bin/node` (v20). Permanent fix: `brew reinstall node`.*
