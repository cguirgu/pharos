# Getting Pharos through App Review

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

**Sign-In required:** Yes. A demo account is below; reviewers may also use Sign in with
Apple or Google.

> Demo account
> Username: `<create a Supabase email/password account and put it here>`
> Password: `<password>`

**Review notes:**
> Pharos is a Coptic Orthodox devotional companion — a daily rule of life, the Coptic
> calendar (fasts/feasts), an offline King James Bible with reading plans, a Coptic
> alphabet learning path, a journal, and highlights.
>
> Sign in with Apple, Google, or email/password to reach the app. All features are
> available immediately after sign-in; no special hardware or configuration is needed.
>
> Account deletion is in-app: You → Delete account (removes the account and all synced
> data). Data export is under You → Export my data.
>
> The app collects only what's needed to run the account (email, display name, and the
> user's own rule/journal/reading data for sync). No ads, no tracking, no analytics.

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
