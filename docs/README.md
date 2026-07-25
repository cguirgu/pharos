# Pharos documentation map

The living, implementation-accurate reference. (`handoff/` holds the original
design package; these docs track what is actually built.)

| Doc | Read it for |
|---|---|
| [APP-GOALS.md](./APP-GOALS.md) | Vision, principles, IA, voice. The "why". |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Repo layout, the domain-purity rule, clock injection, db/state, testing. |
| [DESIGN-SYSTEM.md](./DESIGN-SYSTEM.md) | Tokens, type, the codex component inventory (with file map), motion. |
| [LITURGICAL-RULES.md](./LITURGICAL-RULES.md) | Coptic calendar / Pascha / seasons / feasts / fasting — as implemented. |
| [RULE-ENGINE.md](./RULE-ENGINE.md) | Practice model, the six cadences, statuses, streaks & the flame. |
| [PUBLISHING.md](./PUBLISHING.md) | EAS build/submit to the App Store + asset checklist. |
| [CONTENT-SOURCES.md](./CONTENT-SOURCES.md) | Verified Coptic sources (Agpeya, Bible, lectionary, Synaxarium), licensing, downloads, storage. |
| [BACKEND-SETUP.md](./BACKEND-SETUP.md) | Optional Supabase backend, Sign in with Apple, RLS. |

Also at the repo root:

| File | Read it for |
|---|---|
| [CONTRIBUTING.md](../CONTRIBUTING.md) | How to set up, the three house rules, and how to open a pull request. |
| [CONTENT-LICENSE.md](../CONTENT-LICENSE.md) | What the MIT license does **not** cover — the liturgical text. |
| [CODE_OF_CONDUCT.md](../CODE_OF_CONDUCT.md) · [SECURITY.md](../SECURITY.md) | Community standards; private vulnerability reporting. |
| [TESTING.md](../TESTING.md) | Live gate checklist + open liturgical questions. |
| [handoff/CLAUDE.md](../handoff/CLAUDE.md) | The original working agreement from the build handoff. |

## For future agents — fast orientation
1. Skim `docs/APP-GOALS.md` and `docs/ARCHITECTURE.md`.
2. The engines are done and tested (`src/domain/**`, `__tests__/**`); reuse them,
   don't rewrite. `npm test` must stay green.
3. Built UI: Today + Rule tabs. Placeholder tabs: Hours, Word, You, onboarding —
   screens are mapped in `handoff/DESIGN-SPEC.md` §5 and the `handoff/design refs/`.
4. No iOS simulator in this environment — verify on Expo Go / web (see TESTING.md).
