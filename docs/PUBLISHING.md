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
```bash
eas build -p ios --profile production    # cloud build; EAS manages certs/signing
eas submit -p ios --latest               # upload to App Store Connect
```
Then in App Store Connect: distribute to **TestFlight** (beta), and when ready,
**submit for review**.

## Store assets / checklist (before review)
- [ ] Final `ios.bundleIdentifier`, app name, `version`.
- [ ] App icon + splash (generate from `PharosSeal`, gold beacon on `#0C1020`).
- [ ] Bundle **Noto Sans Coptic** `.ttf` (ornament glyphs).
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
