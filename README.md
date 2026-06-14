# Pharos

A daily companion for Coptic Orthodox practice — prayer, fasting, and the Word —
built around a personal, flexible **Rule of Life**. iOS-first, local-first.

## Run it (no Xcode needed)

```bash
npm install
npm start          # press i, or scan the QR with Expo Go on your iPhone
```

The app loads in **Expo Go** over wifi and hot-reloads. On the **Today** screen,
the small `DEV` bar (debug builds only) lets you jump to any date — including the
liturgical golden dates — to see fasts and feasts change.

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
| Design system + app shell (5-tab nav ledger, fonts, theme) | ✅ built |
| **Today** and **Rule** tabs (wired to the engines, local persistence) | ✅ built |
| Hours · Word · You · onboarding | ⬜ placeholder (mapped for next phases) |

The iOS app is built and run via **EAS cloud builds** + **Expo Go** — full Xcode
is not required. See [`docs/PUBLISHING.md`](./docs/PUBLISHING.md).

## Documentation

Start with [`docs/`](./docs) — the living, implementation-accurate reference:

- [docs/APP-GOALS.md](./docs/APP-GOALS.md) — vision, principles, IA, voice
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) — layout, domain-purity rule, clock, db/state
- [docs/DESIGN-SYSTEM.md](./docs/DESIGN-SYSTEM.md) — tokens, type, the codex components
- [docs/LITURGICAL-RULES.md](./docs/LITURGICAL-RULES.md) — calendar/fasting/feasts as implemented
- [docs/RULE-ENGINE.md](./docs/RULE-ENGINE.md) — practices, cadences, statuses, streaks
- [docs/PUBLISHING.md](./docs/PUBLISHING.md) — EAS → App Store

The original design package is in [`handoff/`](./handoff); live test status and the
open liturgical questions are in [`TESTING.md`](./TESTING.md).

## Architecture rule

`src/domain` is **pure TypeScript** — no react/react-native/expo imports, and it
never calls `new Date()` (today is injected via `src/domain/coptic/clock.ts`).
Everything liturgical and rule-related is provable with `npm test` alone.
