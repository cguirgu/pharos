# Kickoff prompt — paste this into Claude Code

*(Setup: create an empty folder, e.g. `~/dev/pharos`. Copy this whole handoff bundle into it as `handoff/`, and copy `handoff/CLAUDE.md` to the folder root. Open Claude Code in that folder and paste the prompt below.)*

---

You are building **Pharos**, an iOS-first mobile app for Coptic Orthodox daily practice. This folder contains a complete handoff package. Before writing any code, read these in order:

1. `handoff/PRD.md` — full product requirements (features, the liturgical calendar engine, the Rule engine, exact streak rules, content cautions)
2. `handoff/TECH-STACK.md` — the chosen stack (Expo + React Native + TypeScript), repository layout, setup commands, the 8-phase build order with verification gates, and how to test yourself
3. `handoff/DESIGN-SPEC.md` — design tokens, typography, component inventory, screen map
4. `CLAUDE.md` (repo root) — your working agreement; follow its hard rules at all times
5. Skim `handoff/design refs/` — these `.html`/`.jsx` files are **design mockups, not production code**. Open `Pharos - Rule of Life.html` and `Pharos MVP Wireframes v2.html` in a browser to see the target UI. Recreate them in React Native; do not copy the HTML/JSX implementation.

Then:

1. **Scaffold the project** exactly per TECH-STACK.md §1–2 (Expo app at the repo root, `src/domain` pure-TS architecture, Jest, fonts, theme tokens).
2. **Work through the phases in TECH-STACK.md §3 strictly in order.** Each phase has a verification gate — do not proceed until it passes. Commit at every gate with a conventional-commit message.
3. **Verify your own work continuously**: run `npm test` after every change to domain code; build to the iOS simulator with `npx expo run:ios`; take screenshots with `xcrun simctl io booted screenshot` and visually compare against the design refs; drive flows with Maestro once screens exist. Maintain `TESTING.md` as a living checklist of gate results, golden-date verifications, and open questions.
4. **Make "today" injectable everywhere** (no `new Date()` in domain code) and add a hidden dev date-override so you and I can test fast/feast behavior on any date.
5. **Never invent liturgical or scriptural content.** Use the bundled public-domain World English Bible for scripture; mark all Agpeya litany text and Synaxarium entries as clearly-labelled placeholders for me to supply; record every uncertain calendar/fasting rule as `TODO(verify-liturgical)` plus a line in TESTING.md under "Open questions for the owner".

Start now with Phase 0. When Phase 0's gate passes (app boots on the simulator with the 5-tab typographic nav ledger, fonts loaded, tests green), show me screenshots of all five tab placeholders and your plan for Phase 1 before continuing.

---

## Follow-up prompts you'll likely use later

- "Show me screenshots of every screen at simulated dates: 2026-06-10 (Apostles' Fast), 2026-04-12 (Pascha), 2026-04-29 (Holy Fifty Wednesday — must show NO fast), 2026-12-25 (Nativity Fast), 2026-09-11 (Nayrouz)."
- "Run the full Maestro suite and the Jest suite; paste the summary and update TESTING.md."
- "List all open `TODO(verify-liturgical)` items and 'Open questions for the owner' so I can answer them."
- "Here is the licensed Agpeya text for Prime: … — wire it into the content schema."
