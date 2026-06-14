# Pharos — Tech stack & project setup (instructions for Claude Code)

## 0. Stack decision

**Expo (React Native) + TypeScript, iOS-first.** Rationale:
- The UI is 100% custom-drawn typography (hairlines, serif type, lozenge marks) — it gains nothing from native UIKit components, and React Native renders it 1:1 from the HTML design references.
- Fastest self-testing loop for an AI agent: pure-TS domain engines unit-testable with Jest in milliseconds, components testable with React Native Testing Library, E2E with Maestro on the iOS simulator, and `xcrun simctl` screenshots for visual checks.
- Local-first needs (SQLite, local notifications, fonts) are all first-class in Expo.
- Free path to Android later.

(If the product owner later mandates native Swift, the domain layer specs in PRD.md §3–4 port directly to Swift packages — but do not start there.)

### Pinned choices
| Concern | Choice |
|---|---|
| Framework | Expo SDK (latest stable), React Native, **TypeScript strict** |
| Navigation | Expo Router (file-based; native bottom tabs hidden — we render our own typographic nav ledger) |
| Persistence | `expo-sqlite` + **Drizzle ORM** (typed schema + migrations) |
| State | Zustand (thin; most logic lives in the domain layer) |
| Dates | Plain `Date` + own pure helpers. **No moment/dayjs.** The Coptic engine is hand-written (PRD §3). |
| Notifications | `expo-notifications` (local only) |
| Fonts | `@expo-google-fonts/cormorant-garamond`, `@expo-google-fonts/spectral`, Noto Sans Coptic bundled `.ttf` |
| Unit tests | Jest via `jest-expo` |
| Component tests | React Native Testing Library |
| E2E | Maestro (`.maestro/*.yml` flows) |
| Lint/format | ESLint + Prettier, default Expo config |

## 1. Repository layout

```
pharos/
  app/                      # Expo Router routes only — thin files
    (tabs)/today.tsx | hours.tsx | word.tsx | rule.tsx | you.tsx
    onboarding/…  office/[hour].tsx  practice/[id].tsx  compose.tsx …
  src/
    domain/                 # ★ PURE TS. No imports from react/react-native/expo. 100% unit-tested.
      coptic/               # calendar conversion, pascha computus, seasons, fasting levels
      rule/                 # practice model, cadence, due-today, statuses, streaks, stats
      content/              # content schemas + loaders (agpeya, synaxarium, bible, plans)
    db/                     # drizzle schema, migrations, repositories
    state/                  # zustand stores (thin glue over domain + db)
    ui/
      theme.ts              # design tokens (from DESIGN-SPEC.md — single source of truth)
      components/           # Caps, Folio, Rubric, Mark, Tally, Btn, Register, NavLedger, …
      …screens broken into small files
    notifications/          # scheduling due-day reminders
  content/                  # JSON content files (agpeya hours, synaxarium, WEB bible, plan)
  __tests__/                # mirrors src/domain
  .maestro/                 # E2E flows
  CLAUDE.md                 # working agreement (provided in this handoff)
  TESTING.md                # live manual-test checklist (agent maintains it)
```

**The golden rule: `src/domain` never imports UI or Expo.** Everything interesting (calendar, cadence, streaks) must be provable with `npm test` alone.

## 2. Setup commands (run these, in order)

```bash
npx create-expo-app@latest pharos --template default   # TypeScript by default
cd pharos
npx expo install expo-sqlite expo-notifications expo-font expo-splash-screen
npm i drizzle-orm zustand
npm i -D drizzle-kit jest jest-expo @testing-library/react-native @types/jest ts-node
npx expo install @expo-google-fonts/cormorant-garamond @expo-google-fonts/spectral
# verify it boots:
npx expo run:ios            # builds & launches iOS simulator (first run is slow)
```

Configure `jest-expo` in package.json, add scripts:
```json
"scripts": { "test": "jest", "test:watch": "jest --watch", "ios": "expo run:ios", "lint": "eslint ." }
```

Install Maestro CLI (`curl -Ls https://get.maestro.mobile.dev | bash`) for E2E once screens exist.

## 3. Build order (phases with hard verification gates)

Work strictly in this order. **Do not start a phase until the previous phase's gate passes.** Commit at every gate.

| Phase | Deliverable | Verification gate |
|---|---|---|
| **0. Scaffold** | Expo app boots; fonts loaded; `theme.ts` tokens; 5-tab shell with custom nav ledger; placeholder screens | `expo run:ios` boots, screenshot of each tab matches DESIGN-SPEC nav; `npm test` green (1 smoke test) |
| **1. Coptic engine** | `src/domain/coptic`: gregorian↔coptic, pascha, seasons, feast/fast-level per day | Table-driven Jest tests: golden dates in PRD §3 + ≥40 derived assertions (season boundaries, Wed/Fri suppression during Holy Fifty, paramon, leap years). All `TODO(verify-liturgical)` items listed in TESTING.md |
| **2. Rule engine + DB** | `src/domain/rule` (cadence, due-today, statuses, streaks, rest days, pause) + Drizzle schema + repositories | Jest: each cadence type across a simulated 3-week scenario; streak rules from PRD §4.4 verbatim; partial/rest-day cases. DB round-trip tests |
| **3. Today + Rule tabs** | Full Today screen; Rule overview, add/compose, practice history, check-in sheet, lighten flows | RNTL render tests + Maestro flow: create count practice → check in 8/12 → mark part → appears in history. Simulator screenshots vs design refs |
| **4. Hours** | Office list, office reader (content schema + placeholders), Saint of day, Ordo month + day detail | Maestro: open Sext → complete → Agpeya practice shows 1 more part on Today. Ordo spot-checked against engine for 3 months |
| **5. Word + Journal** | WEB bible bundled, reader, 90-day Gospels plan, journal list/editor | Maestro: read today's chapter from Today → plan advances. Journal entry persists across relaunch |
| **6. You + notifications + onboarding** | Streaks/marks/settings; due-day-only scheduling; 3-step onboarding | Jest on scheduling logic (pure function: practices → next 7 days of triggers); manual notification fire on simulator; fresh-install Maestro onboarding flow |
| **7. Polish** | Empty states, edit-yesterday grace, performance, app icon/splash | Full Maestro suite green; TESTING.md checklist 100%; cold start < 2s |

## 4. How to manually test yourself (agent loop)

After every meaningful change:
1. `npm test` — domain must stay green.
2. `npx expo run:ios` (or reload if running) — boot the simulator.
3. Screenshot: `xcrun simctl io booted screenshot shots/<phase>-<screen>.png` and **look at it**; compare against the design reference HTML (open `design refs/Pharos - Rule of Life.html` in a browser) and DESIGN-SPEC.md tokens.
4. Time travel: test liturgical behavior by injecting dates — make "today" an injectable parameter throughout the domain layer (`todayProvider`), with a hidden dev setting to override the date in-app. Never call `new Date()` directly inside domain code.
5. Drive flows with Maestro: `maestro test .maestro/<flow>.yml`.
6. Record outcomes in `TESTING.md` (a living checklist: phase gates, golden dates verified, open `TODO(verify-liturgical)` questions).

## 5. Conventions
- TypeScript strict; no `any` in `src/domain`.
- Files < 300 lines; split screens into composable components.
- Every domain function: JSDoc + unit tests in the mirrored `__tests__` path.
- All copy strings centralised in `src/ui/copy.ts` (voice consistency; future i18n).
- All colors/spacing/type from `theme.ts` — never inline hex values in screens.
- Conventional commits; commit at every phase gate at minimum.
- **Never invent liturgical/scriptural content.** Placeholder text must be visibly placeholder ("⟨litany text — to be supplied⟩").
