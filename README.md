# Coptic Daily Companion

[![CI](https://github.com/cguirgu/pharos/actions/workflows/ci.yml/badge.svg)](https://github.com/cguirgu/pharos/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

A daily companion for Coptic Orthodox practice — prayer, fasting, and the Word —
built around a personal, flexible **Rule of Life**. iOS-first, local-first.

Available on the App Store as **Coptic Daily Companion**. The repository and much of the
codebase still use the original project codename **Pharos** — same app.

> **This project is open to contributors.** If you have never contributed to open source
> before, [`CONTRIBUTING.md`](./CONTRIBUTING.md) walks through every step, from forking to
> your first merged pull request. Start with an issue labeled
> [`good first issue`](https://github.com/cguirgu/pharos/labels/good%20first%20issue).

## Run it (no Xcode needed)

```bash
npm install
npm start          # press i, or scan the QR with Expo Go on your iPhone
```

The app loads in **Expo Go** over wifi and hot-reloads. No Mac, no Xcode, and no API keys are
required — without backend keys it runs fully on-device. On the **Today** screen, the small
`DEV` bar (debug builds only) lets you jump to any date — including the liturgical golden
dates — to see fasts and feasts change.

```bash
npm test           # Jest — domain + state + UI-label suites (must stay green)
npm run typecheck  # tsc --noEmit, strict
npm run web        # Expo web preview in a browser
```

## Status

| Layer | State |
|---|---|
| Coptic calendar engine (`src/domain/coptic`) | ✅ built + tested |
| Rule / streak engine (`src/domain/rule`) | ✅ built + tested |
| Design system + app shell (tab nav ledger, fonts, theme) | ✅ built |
| **Today · Rule · Hours · Word · Coptic · Faith · Saved · You** tabs | ✅ built |
| Onboarding, journal, highlights, ordo, office reader | ✅ built |
| Accounts + sync (Supabase, Sign in with Apple) | ✅ built — optional; the app runs local-only without keys |
| Verified liturgical content (Agpeya litanies, Synaxarium) | ⬜ partly draft — see [`CONTENT-LICENSE.md`](./CONTENT-LICENSE.md) |

The iOS app is built and submitted via **EAS cloud builds** and tested in **Expo Go** — full
Xcode is not required. See [`docs/PUBLISHING.md`](./docs/PUBLISHING.md).

## Documentation

Start with [`docs/`](./docs) — the living, implementation-accurate reference:

- [docs/APP-GOALS.md](./docs/APP-GOALS.md) — vision, principles, IA, voice
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) — layout, domain-purity rule, clock, db/state
- [docs/DESIGN-SYSTEM.md](./docs/DESIGN-SYSTEM.md) — tokens, type, the codex components
- [docs/LITURGICAL-RULES.md](./docs/LITURGICAL-RULES.md) — calendar/fasting/feasts as implemented
- [docs/RULE-ENGINE.md](./docs/RULE-ENGINE.md) — practices, cadences, statuses, streaks
- [docs/CONTENT-SOURCES.md](./docs/CONTENT-SOURCES.md) — where the liturgical text comes from
- [docs/BACKEND-SETUP.md](./docs/BACKEND-SETUP.md) — the optional Supabase backend
- [docs/PUBLISHING.md](./docs/PUBLISHING.md) — EAS → App Store

The original design package is in [`handoff/`](./handoff); live test status and the
open liturgical questions are in [`TESTING.md`](./TESTING.md).

## Architecture rule

`src/domain` is **pure TypeScript** — no react/react-native/expo imports, and it
never calls `new Date()` (today is injected via `src/domain/coptic/clock.ts`).
Everything liturgical and rule-related is provable with `npm test` alone.

## Contributing

Contributions are welcome — bug fixes, tests, documentation, accessibility, and especially
**liturgical corrections** (you don't need to be a programmer to file one).

- [`CONTRIBUTING.md`](./CONTRIBUTING.md) — setup, the three house rules, and how to open a pull request
- [`CODE_OF_CONDUCT.md`](./CODE_OF_CONDUCT.md) — how we treat each other here
- [`SECURITY.md`](./SECURITY.md) — report a vulnerability privately

Pull requests are reviewed within a week, usually sooner.

## License

The **code** is MIT — see [`LICENSE`](./LICENSE).

The **liturgical content** bundled with it (Agpeya prayers, Synaxarium entries, scripture) is
**not** covered by MIT and carries its own permissions. Read
[`CONTENT-LICENSE.md`](./CONTENT-LICENSE.md) before forking or reusing that text.
