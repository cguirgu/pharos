# Pharos — Publishing to the iOS App Store (EAS, no local Xcode)

Builds happen in the **EAS cloud**, so a full local Xcode is never required.
You test on-device with **Expo Go** (scan a QR); store builds are produced and
signed by EAS.

## Prerequisites
- **Expo account** — already set up; the EAS project exists:
  `eab8c3fa-f2dc-498b-a065-91f799b0930d` (wired into `app.config.ts`
  `extra.eas.projectId`).
- **Apple Developer Program** membership ($99/yr) — required for TestFlight and
  App Store submission. (Not needed just to test in Expo Go.)
- EAS CLI: `npm i -g eas-cli` and `eas login`.

## One-time setup
```bash
eas init --id eab8c3fa-f2dc-498b-a065-91f799b0930d   # link this repo to the project
```
`eas.json` already defines three profiles: **development** (dev client) ·
**preview** (internal/TestFlight) · **production** (store, auto-increments build #).
`app.config.ts` sets `ios.bundleIdentifier` = `com.pharosapp.app` and `version`.

> **Forking this project?** The EAS project id above belongs to the original app. Run
> `eas init` to create your own project, and change `ios.bundleIdentifier` /
> `android.package` in `app.config.ts` to your own reverse-DNS id before building. You do
> not need any of this to run the app in Expo Go.

## Day-to-day testing (no build)
```bash
npm start          # then scan the QR with Expo Go on your iPhone
```
Use the hidden **dev date-override** (the DEV bar on Today) to verify fasts/feasts
on any date.

## When a dev build is needed
Expo Go covers most of the MVP (expo-sqlite + local expo-notifications work).
Once a native module outside Expo Go is added, build a dev client once:
```bash
eas build -p ios --profile development   # install the resulting build on your device
```

## Production build → TestFlight → App Store

### 0. Before every build
```bash
npx expo-doctor        # must be 18/18
npm run typecheck      # clean
npm test               # green
```
Check what is already live before choosing a version:
```bash
npx eas-cli submit:status         # prints the live App Store version + TestFlight uploads
```
Every version bump needs a matching entry in `src/content/releases.ts` — the
"what's new" sheet reads it, and `__tests__/content/releases.test.ts` fails the
build if `app.config.ts`'s version has no release notes, or if an item links to
a route that does not exist.

Bump `version` in `app.config.ts` if the current one is already **released** on
the App Store — App Store Connect will not take a new TestFlight build under a
version string that has already shipped. The build *number* auto-increments on
its own (`eas.json` → `appVersionSource: "remote"` + `autoIncrement: true`), so
only the marketing version is a manual decision.

### 1. Authenticate
```bash
npx eas-cli login                        # or export EXPO_TOKEN=…
npx eas-cli whoami                       # confirm
```

### 2. Apple credentials — App Store Connect API key (preferred)
Create in App Store Connect → **Users and Access → Integrations → App Store
Connect API**, role **App Manager**. The `.p8` downloads **once**.

Upload it to EAS so it is stored server-side and neither the file nor its ids
ever live in this repo:
```bash
npx eas-cli credentials -p ios           # → App Store Connect API Key → set up
```
`.gitignore` blocks `*.p8` / `AuthKey_*.p8` as a backstop. **Never commit the key.**

### 3. Build and submit
```bash
npx eas-cli build -p ios --profile production      # cloud build, EAS signs it
npx eas-cli submit -p ios --latest                 # upload to App Store Connect
```
Processing on Apple's side takes ~5–20 min. Then in App Store Connect →
**TestFlight**: answer the export-compliance question (the answer is **no**, see
`ITSAppUsesNonExemptEncryption` in `app.config.ts`), add testers, and distribute.

### Useful while waiting
```bash
npx eas-cli build:list --platform ios --limit 5
npx eas-cli build:view <build-id>
npx eas-cli env:list                     # what secrets the build will bake in
```

---

## ⚠️ Release gate — the Faith course

**Status: cleared.** All 156 cards were reviewed and approved by the project
owner on 2026-09-04, and `FAITH_SHOW_UNREVIEWED` is now **`false`** — the course
ships on the cards' own `reviewed` flags, as intended.

The rest of this section stands as the rule for any future card.

That is correct for **TestFlight**: every card in the theology course ships
`reviewed: false`, and the point of the beta is for the project owner to read
the content in situ and sign it off. It is **not** correct for the App Store.

**Before submitting for App Store review**, the cards must be reviewed and
flipped to `reviewed: true` in `src/domain/faith/units/*.ts`.

> ⚠️ **Setting `FAITH_SHOW_UNREVIEWED = false` is NOT a safe alternative while
> zero cards are reviewed.** Measured, not assumed: with the gate closed and no
> card approved, the course has **0 ready lessons and 0 of 9 units showing any
> content** — the Faith tab renders as an empty screen with a rank card and a
> ledger of zeros. That is an App Review **guideline 2.1 (App Completeness)**
> rejection risk and a poor experience besides. There are only two safe states
> for a public release: review the content, or remove the Faith tab from
> `app/(tabs)/_layout.tsx` for that build.

Shipping to the public with the flag `true` and cards unreviewed would put
unvetted doctrinal text in front of users. See `docs/CONTENT-SOURCES.md` →
*Faith — the theology course*. Review **Unit IV (Chalcedon)** and **Unit IX
(What We Hold in Silence)** first.

## Store assets / checklist (before review)
- [ ] Final `ios.bundleIdentifier`, app name, `version`.
- [ ] App icon + splash (generate from `PharosSeal`, gold beacon on `#0C1020`).
- [x] Bundle **Noto Sans Coptic** `.ttf` — ships via `@expo-google-fonts/noto-sans-coptic`, loaded in `app/_layout.tsx`.
- [ ] Screenshots (6.7"/6.5"/5.5" or current required sizes).
- [ ] Description, keywords, support URL, **privacy policy URL**.
- [ ] App Privacy: no tracking and no analytics SDK. The app is local-first, but it
      **does** offer optional accounts (Supabase — Sign in with Apple / email+password)
      and optional "Support the app" in-app purchases, so declare the account data it
      stores. (`ITSAppUsesNonExemptEncryption: false` already set.) See
      `docs/APP_STORE_PRIVACY.md` for the filed answers.
- [ ] Age rating; category (Lifestyle / Reference).
- [ ] Resolve any open `TODO(verify-liturgical)` items + supply licensed Agpeya /
      Synaxarium text (see `TESTING.md`).

---

## Announcing a release

Two channels, and they read from the same source of truth
(`src/content/releases.ts`), so the push and the in-app sheet can never drift.

### 1. The in-app "what's new" sheet — automatic
Add the release entry, ship the build, done. Anyone who updates sees it once on
their next launch; a brand-new install never sees it (a changelog for an app you
have never opened is noise). No permissions, nothing to declare.

### 2. The push notification — manual, and opt-in only
```bash
SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… npm run announce -- --version 1.2.0 --dry-run
SUPABASE_URL=… SUPABASE_SERVICE_ROLE_KEY=… npm run announce -- --version 1.2.0
```
The title and body come from the release entry; the script only picks which one.
It skips devices already on that version, prompts before sending, and prunes
tokens Expo reports as dead.

**Send it a day or two AFTER the App Store release goes live.** A push the moment
you submit reaches people whose App Store has not offered them the update yet,
so the notification lands with nothing to show for it.

> ⚠️ `SUPABASE_SERVICE_ROLE_KEY` bypasses RLS completely. It belongs in your
> shell for the minute the script runs — never in the repo, `app.config.ts`, or
> EAS build env. The `push_tokens` table deliberately has **no select policy**,
> so the shipped anon key cannot read it: a leaked anon key cannot harvest the
> userbase's push tokens.

### Why this is opt-in
App Store guideline **4.5.4**: push "should not be used for promotions or direct
marketing purposes unless customers have explicitly opted in to receive them via
consent language displayed in your app's UI, and you provide a method in your app
for a user to opt out". A feature announcement is promotional, so:

- the switch ships **off** (`src/domain/notifications/announcements.ts`),
- the consent text sits **above** the switch on the Reminders screen and says
  what is sent and how often, before it is touched,
- the same switch is the opt-out, and turning it off deletes the stored token.

Do not repurpose this channel for anything else. It is the one remote channel in
an app of otherwise entirely local notifications, and the consent language is a
promise about what it carries.

## Regenerating App Store screenshots
```bash
npx expo export --platform web --output-dir /tmp/web
node scripts/screenshots/serve.cjs /tmp/web &
node scripts/screenshots/capture.cjs          # real screens, 1320x2868
node scripts/screenshots/compose.cjs <captures> <out>   # adds captions
```
These are captures of the actual running app (web build), framed under a caption
— not mockups. Requires `.wasm` in `metro.config.js` `assetExts`, without which
the web bundle cannot resolve expo-sqlite and the export fails.
