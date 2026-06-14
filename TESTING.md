# Pharos — TESTING.md (living checklist)

This file tracks phase-gate results, verified golden dates, and open questions
for the product owner, per the handoff (TECH-STACK.md §4, CLAUDE.md §3/§6).

## Environment note (why no simulator screenshots yet)

This machine has **Command Line Tools only — full Xcode is not installed**, and
the Expo CLI is not cached locally, so `npx expo run:ios`, the iOS simulator,
and `xcrun simctl` screenshots **cannot run here**. The handoff's visual gates
are therefore deferred to a machine with Xcode. What runs fully here is the
pure-TS domain layer under `npm test`.

> The domain layer was deliberately built first because it is the part that is
> 100% verifiable in this environment and is the irreplaceable core (calendar +
> rule + streak logic). It imports nothing from react/react-native/expo, so it
> drops directly into the Expo app once the UI is scaffolded.

Jest now uses the **`jest-expo`** preset (the Expo app has landed). The pure-TS
domain tests run unchanged under it. **RNTL component rendering is not yet wired**
for this RN 0.85 / React 19 new-architecture combo (`render` is a no-op stub in
jest); UI is verified at the string/logic layer (`__tests__/ui/today-labels.test.ts`)
and through the store (`__tests__/state/rule.test.ts`) until the renderer is fixed.

## Commands

```bash
npm test          # Jest — 95 tests across domain + state + UI labels, all green
npm run typecheck # tsc --noEmit (strict)
npm start         # Expo Go on iPhone — the real visual test (no Xcode)
npm run web       # Expo web preview
```

## How to test on device (you)
1. `npm start`, scan the QR with **Expo Go** on your iPhone.
2. **Auth + onboarding (first run):** Welcome → **Begin the journey** → sign up
   (email + password) → onboarding (journey stage + first name → starter-rule
   toggles → notifications pre-prompt) → land on **Today** with exactly the
   practices you toggled on. Greeting shows your name.
3. **Multi-account:** **You → Sign out** → **Sign in** with the same email → back
   on Today with the same rule. **You → Create another account** (different email)
   → onboarding again → an **empty, isolated** rule. Switch back via **You →
   Switch account**; the first account's data is intact. Relaunch stays signed in.
4. On **Today**, the `DEV` bar (debug only) jumps to golden dates / ±1 day to
   verify fasts & feasts.
5. Rule flow: Rule → Add a practice (count, target 50) → check in 30/50 (part) →
   mark kept → Today shows the count + mark → open the practice to see the streak
   & 4-week grid. Relaunch → data persists. Lighten → Rest today keeps the flame.

> Local accounts are **test-only**: the password hash (`src/platform/hash.ts`) is
> not secure and is the seam a real backend would replace. `useAuth` is the swap point.

## Phase gates

| Phase | Gate | Status |
|---|---|---|
| 0. Scaffold | Expo app boots; theme tokens; 5-tab nav ledger; fonts; smoke test | ✅ **Passed** — Expo **SDK 54** + Router, `src/ui/theme.ts`, custom `NavLedger`, codex components, dev date-override. Pinned to SDK 54 to match the user's App Store **Expo Go** (Expo Go runs exactly one SDK; theirs is 54). iOS bundle verified via `expo export`; visual boot via Expo Go on device. |
| 1. Coptic engine | Table-driven golden-date tests; ≥40 derived assertions; TODOs logged | ✅ **Passed** — `src/domain/coptic/*`, **44** assertions in `__tests__/coptic/`. |
| 2. Rule engine + DB | Cadence across scenarios; streak rules verbatim; DB round-trip | ✅ **Passed** — `src/domain/rule/*` (44 assertions) + Drizzle/SQLite (`src/db`) with `MemoryRepo` round-trip tested in `__tests__/state/`. |
| 3. Today + Rule tabs | Full Today; Rule overview/add/compose/history/check-in/lighten | ✅ **Built & logic-verified** — wired to engines + persistence; golden-date label test + store-flow test green. Pixel fidelity pending device screenshots (no simulator here). |
| +. Auth + onboarding | Local multi-account auth; 3-step onboarding; per-account data isolation; routing gate | ✅ **Built & logic-verified** — `useAuth` + account-scoped repo; Welcome/sign-up/sign-in, onboarding (journey/name → toggles → notifications), real You tab. **11** state tests incl. isolation in `__tests__/state/{auth,rule}.test.ts`. iOS bundle clean (1831 modules). Pixel fidelity pending device. Local password hashing is test-only. |
| 4. Hours | Agpeya offices + reader (×41 counter), Saint of day, Ordo month/day | ✅ **Built & logic-verified** — `content/agpeya` + `ordo` engines; office list/reader, Saint card, Ordo grid + day detail. Tests: `content/agpeya.test.ts`, `ordo.test.ts`. **All prayer/saint prose is placeholder pending verified sources.** Pixel fidelity pending device. |
| 5. Word | Reading-plan card, scripture reader, Journal | ✅ **Built & logic-verified** — `content/readingPlan` + `bible` provider; plan card, reader (placeholder "to be supplied" state), journal list/editor (persisted). Tests: `content/readingPlan.test.ts`, `state/devotion.test.ts`. **No scripture text bundled** (owner supplies approved translation + Katameros). |
| 6. You + Notifications | Stats ledger, the 6 Marks, streak detail, due-day scheduler | ✅ **Built & logic-verified** — `marks`, `stats`, `notifications/schedule` engines; expanded You tab + streak/about screens; `src/platform/notifications.ts` reschedules on app open. Tests: `marks.test.ts`, `stats.test.ts`, `notifications/schedule.test.ts`. Notification *firing* is device-verified. |
| 7. Polish | Empty states, edit grace, performance, icon/splash | ⬜ Not started. |

> As of this build: **150 tests** across domain + state + UI-labels, all green; iOS
> bundle clean (1850 modules); strict `tsc` clean. Many new screens are **not
> visually verified here** (no simulator) — review on device.

## Golden dates — verified by the engine

### Orthodox Pascha (Julian computus → Gregorian)
| Year | Expected | Engine | ✓ |
|---|---|---|---|
| 2024 | 5 May  | 5 May  | ✅ |
| 2025 | 20 Apr | 20 Apr | ✅ |
| 2026 | 12 Apr | 12 Apr | ✅ |
| 2027 | 2 May  | 2 May  | ✅ |

### Coptic New Year (1 Thout, Anno Martyrum)
| Gregorian | AM year | Engine | ✓ |
|---|---|---|---|
| 11 Sep 2024 | 1741 | 1 Thout 1741 | ✅ |
| 11 Sep 2025 | 1742 | 1 Thout 1742 | ✅ |
| 11 Sep 2026 | 1743 | 1 Thout 1743 | ✅ |
| 12 Sep 2027 | 1744 | 1 Thout 1744 (leap shift) | ✅ |

### Kickoff golden scenario dates (KICKOFF-PROMPT follow-ups)
| Date | Expectation | Engine | ✓ |
|---|---|---|---|
| 2026-06-10 | Apostles' Fast (Wed → vegan) | `apostles` day 10, fast=`fast` | ✅ |
| 2026-04-12 | Pascha | `holy-fifty` day 1, feast=`pascha`, no fast | ✅ |
| 2026-04-29 | Holy Fifty Wednesday — **NO fast** | fast=`none` | ✅ |
| 2026-12-25 | Nativity Fast (Fri → vegan) | `nativity-fast` day 31, fast=`fast` | ✅ |
| 2026-09-11 | Nayrouz | feast=`nayrouz`, 1 Thout 1743 | ✅ |

## ⚠️ Open questions for the owner / `TODO(verify-liturgical)`

These are points where the spec was ambiguous, internally inconsistent, or where
religious-practice nuance should be confirmed. Per CLAUDE.md §3 the engine uses
the **safest neutral behaviour** and flags rather than guesses.

1. **PRD Coptic-date example is inconsistent.** PRD §3 states "1 Thout 1741 AM =
   Sept 12, 2024," but that contradicts the rule stated alongside it (Sept 12
   only in the year *preceding* a Gregorian leap year). Standard computus gives
   **11 Sep 2024**, which the engine uses. → *Confirm the engine value is correct.*
2. **Fast of Nineveh anchoring.** PRD §3 says both "Mon–Wed" *and* "15 days
   before Great Lent begins" — but 15 days before Lent's Monday is a Sunday. The
   engine uses the Mon–Wed reality (two weeks before Lent, P-69…P-67). → *Confirm.*
3. **Great Lent daily rigor.** Modelled as `strict` (sunset fast) on weekdays and
   `fast` (vegan, non-strict) on Saturdays/Sundays; Holy Week all `strict`.
   → *Confirm the Sat/Sun relaxation and Holy Saturday handling.*
4. **Major feast falling within Lent** (e.g. Annunciation, Palm Sunday): relaxed
   to `fast-fish` rather than a full fast break. → *Confirm fish allowance.*
5. **Minor Feasts of the Lord** (incl. the two Feasts of the Cross) — do they
   break the Wed/Fri fast? Engine takes the stricter default and does **not**
   break the fast for them; only the Seven Major feasts break it. → *Confirm.*
6. **Paramon length.** Modelled as the single eve (Jan 6 Nativity, Jan 18
   Theophany). Some uses observe 1–2 days. → *Confirm.*
7. **Apostles' Fast end** fixed at 12 Jul (Sts Peter & Paul, Epip 5) for
   1900–2099. → *Confirm; supply a Synaxarium-accurate date source.*
8. **Dormition Fast fish allowance** modelled as a custom flag (fish permitted).
   → *Confirm house custom.*
9. **Day-29 monthly commemoration** suppressed during Great Lent (custom).
   → *Confirm.*

## Content placeholders still owed (PRD §6)

- Agpeya litany/prayer text (copyright-clear) — schema + reader to be built with
  visibly-marked placeholders; **do not scrape or fabricate**.
- Synaxarium entries (~14 seeded, `draft: true`).
- World English Bible JSON/SQLite bundle (public domain).
- Final fasting food lists to verify against house custom.

## ⚠️ Open content items — verified, official Coptic sources required

Per the owner directive, **all liturgical/scriptural prose must come from verified,
official Coptic Orthodox sources — never invented.** The app ships the *structure*
with clearly-marked placeholders; the following must be supplied before release:

See `docs/CONTENT-SOURCES.md` for the full sourcing/licensing plan. Status:

1. **Bible** — ✅ **KJV ingested + wired**. Public-domain KJV in `content/bible/kjv/`;
   the Gospels + Psalms are bundled and served through `getScriptureProvider()` so the
   **reader shows real text on device** (validated in `__tests__/content/bible-data.test.ts`).
   The chosen **NKJV is copyrighted** and **cannot be bundled** — owner licenses it via
   **API.Bible** (runtime async provider, KJV offline fallback). *(Verify the reader on device.)*
2. **Synaxarium** — ✅ **ingested + wired (draft)** from randogoth/coptic-synaxarium →
   `content/synaxarium/synaxarium.json`, loaded at startup via `initContent` so the
   **Saint card shows real lives** (`__tests__/content/synaxarium-data.test.ts`).
   ⚠️ Confirm permission for the **St. George C.O.C. (Chicago)** translation before release.
3. **Lectionary (Katameros)** — ✅ **parser + online fetch wired**. `parseKatameros`
   (references only, tested in `__tests__/content/katameros.test.ts`) + a best-effort
   `fetchTodaysReadings` from katameros.app populates the Word "day's readings" when online;
   the structural plan is the offline fallback. *(Optional next: bundle an annual snapshot
   for offline; resolve movable-feast days at runtime.)*
4. **Agpeya prayers** (`agpeya.ts`, `AGPEYA_DRAFT = true`): bodies are `TEXT_TBD`.
   Auto-fill scripture sections from KJV; **litanies need permission** (agpeya.org /
   St-Takla / Diocese). Confirm hour commemorations. `TODO(verify-content)`.
