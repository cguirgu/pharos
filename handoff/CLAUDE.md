# CLAUDE.md — Pharos working agreement
*(Copy this file into the root of the new `pharos` repo before the first prompt.)*

## What this project is
Pharos: an iOS-first Expo/React Native app for Coptic Orthodox daily practice, built around a flexible "Rule of Life". Full requirements live in `handoff/PRD.md`; stack & phase plan in `handoff/TECH-STACK.md`; visual language in `handoff/DESIGN-SPEC.md`; pixel references in `handoff/design refs/` (open the `.html` files in a browser — they are design mockups, NOT code to copy).

## Commands
```bash
npm test                 # Jest — domain layer; must always be green
npx expo run:ios         # build & launch iOS simulator
xcrun simctl io booted screenshot shots/x.png   # capture what you built — then LOOK at it
maestro test .maestro/<flow>.yml                # E2E flows
npm run lint
```

## Hard rules
1. **`src/domain` is pure TypeScript.** No react/react-native/expo imports there, ever. All calendar/cadence/streak logic lives there with unit tests.
2. **Never call `new Date()` in domain code.** Today's date is always injected (`todayProvider`) so liturgical behavior is testable on any date. A hidden dev screen overrides the date in-app.
3. **Never invent liturgical or scriptural content.** Psalms/Gospels come from the bundled World English Bible. Agpeya litanies & Synaxarium lives are placeholder-marked (`⟨… to be supplied⟩`, `draft: true`) until the product owner provides text. Uncertain calendar rules get a `TODO(verify-liturgical)` comment AND a line in TESTING.md.
4. **Design tokens only.** All colors/type/spacing from `src/ui/theme.ts` (values in DESIGN-SPEC.md). No inline hex in screens. Sharp corners everywhere (`borderRadius: 0`), no emoji, no system-blue defaults.
5. **Phase gates.** Follow TECH-STACK.md §3 order; don't begin a phase until the previous gate passes; commit at each gate.
6. **Test yourself after every change:** `npm test` → run simulator → screenshot → compare with design refs → update `TESTING.md`.

## Voice
Copy is warm, literary, liturgical: "Peace to you", "the lamp is tended, not stormed", "rest days never break the streak". Never gamified-aggressive, never guilt-driven. All user-facing strings in `src/ui/copy.ts`.

## When unsure
Religious-practice questions (fasting nuances, feast precedence, translation choice) → do not guess; record the question in TESTING.md under "Open questions for the owner" and use the safest neutral behavior.
