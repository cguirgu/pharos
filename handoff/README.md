# Handoff: Pharos — iOS MVP build package

## Overview
Everything Claude Code needs to build the MVP of **Pharos**, a Coptic Orthodox daily-practice app (Rule of Life, Agpeya hours, fasting calendar, Word & journal), from these designs.

## How to use this package
1. Create an empty project folder (e.g. `~/dev/pharos`).
2. Copy this whole bundle into it as `handoff/`.
3. Copy `handoff/CLAUDE.md` to the folder root (so Claude Code picks it up automatically).
4. Open Claude Code in that folder and paste the prompt from **KICKOFF-PROMPT.md**.

## Contents
| File | Purpose |
|---|---|
| `PRD.md` | Full product requirements: vision, IA, the liturgical calendar engine, the Rule engine (cadence/measures/streak rules, exact), features per tab, content cautions, success criteria |
| `TECH-STACK.md` | Stack decision (Expo + RN + TypeScript) with rationale, repo layout, setup commands, 8-phase build order with verification gates, agent self-testing loop |
| `DESIGN-SPEC.md` | Hi-fi design language: tokens, typography, component inventory, screen map, motion |
| `CLAUDE.md` | Working-agreement seed for the new repo's root |
| `KICKOFF-PROMPT.md` | The exact first prompt (and useful follow-ups) for Claude Code |
| `design refs/` | The HTML design mockups + their `.jsx` source and research notes |

## About the design files
The files in `design refs/` are **design references created in HTML/React for prototyping** — they show intended look and behavior but are *not* production code. The task is to **recreate these designs in React Native** (per TECH-STACK.md) using its idioms. Open the two `.html` files in a browser to view them (they need network access for fonts/CDN React).

- `Pharos - Rule of Life.html` + `screens3_rule.jsx` — **v3, authoritative** for navigation (5 tabs: Today · Hours · Word · Rule · You), the Today screen, and the whole Rule feature.
- `Pharos MVP Wireframes v2.html` + `screens2_*.jsx` + `ds2.jsx` — v2 codex set, authoritative for onboarding, hours, fasting, calendar, word/journal, You/profile, and the shared component language (`ds2.jsx` is the design-system source: tokens `K` + components).
- `research/coptic-content.md` — domain research notes (Agpeya, fasts, feasts, Synaxarium).
- `design-canvas.jsx`, `app2.jsx`, `app3.jsx` — canvas scaffolding for the mockups; ignore beyond opening the HTML.

## Fidelity
**High-fidelity.** Recreate the UI pixel-faithfully: exact hex values, font families/sizes/letterspacing, hairline weights and sharp-corner language are specified in DESIGN-SPEC.md and visible in the refs. Screens that exist only as v2 wireframe-level layouts (e.g. Bible reader) should keep the same codex language and tokens.

## Open items for the product owner (you)
- Supply/license final **Agpeya texts** and **Synaxarium entries** (the app ships with clearly-marked placeholders + public-domain WEB scripture).
- Answer `TODO(verify-liturgical)` questions Claude Code logs in `TESTING.md` (fasting nuances, feast precedence).
- App icon final art (a generated gold beacon on navy is the placeholder).
