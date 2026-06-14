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

Also at the repo root: `CLAUDE.md`/`handoff/CLAUDE.md` (working agreement),
`TESTING.md` (live gate checklist + open liturgical questions), `README.md`.

## For future agents — fast orientation
1. Skim `docs/APP-GOALS.md` and `docs/ARCHITECTURE.md`.
2. The engines are done and tested (`src/domain/**`, `__tests__/**`); reuse them,
   don't rewrite. `npm test` must stay green.
3. Built UI: Today + Rule tabs. Placeholder tabs: Hours, Word, You, onboarding —
   screens are mapped in `handoff/DESIGN-SPEC.md` §5 and the `handoff/design refs/`.
4. No iOS simulator in this environment — verify on Expo Go / web (see TESTING.md).
