# Pharos — App goals & principles

*Distilled from `handoff/PRD.md` §1–2. This is the "why" future contributors and
agents should hold in mind.*

## One-liner
A daily companion for Coptic Orthodox practice — prayer, fasting, and the Word —
built around a personal, flexible **Rule of Life**. iOS-first, local-first, no
accounts, no backend in the MVP.

**Audience:** Coptic Orthodox youth & young adults (~16–35), English-speaking
diaspora — some raised in the Church, some returning, some exploring.

## Product principles (these resolve design disputes)
1. **Gentle, never guilt-driven.** Partial effort counts ("partial days still
   tend the flame"). Rest days never break a streak. Copy is warm, liturgical,
   literary — never gamified-aggressive. "Don't lose your streak!!" is forbidden.
2. **The calendar is the spine.** Every screen knows the liturgical day
   (fast/feast/season) and adapts.
3. **The Rule bends so it never breaks.** Cadence flexibility, pausing, and
   "lighten the rule" are first-class features, not settings debris.
4. **Honest tracking.** Only days a practice is *due* are counted. Three states:
   kept · kept-in-part · missed.
5. **Reverent aesthetic.** A "Book of Hours / codex" visual language — navy ink,
   gold, parchment, serif type, hairline rules, sharp corners, zero emoji.

## Information architecture — five tabs
| Tab | Glyph | Purpose | Status |
|---|---|---|---|
| **Today** | Ⲁ | The day's account: every practice due today, fast status, the flame. | ✅ built |
| **Hours** | Ⲃ | The Agpeya offices, the Ordo (calendar), saint of the day. | ✅ built (prose placeholder) |
| **Word** | Ⲅ | Scripture reader, one reading plan, journal. | ✅ built (scripture placeholder) |
| **Rule** | Ⲇ | Create/edit/measure practices; per-practice history; lighten the rule. | ✅ built |
| **You** | Ⲉ | Streak detail, marks (badges), reminders & preferences. | ✅ built |

> **Content discipline:** all liturgical/scriptural prose (Agpeya prayers, scripture
> text, Synaxarium lives, the lectionary) must come from **verified official Coptic
> Orthodox sources** and ships as clearly-marked placeholders until supplied — never
> invented. See `docs/LITURGICAL-RULES.md` and `TESTING.md` open content items.

Key IA decisions (final, from design v3):
- Today (the account of your rule) and Hours (where you pray an office) do not overlap.
- The Rule has its own tab — not buried in onboarding or settings.
- The Journal is not a tab; it is a practice type + a section inside Word.

## Voice
Warm, literary, liturgical: "Peace to you", "the lamp is tended, not stormed",
"rest days never break the streak". All user-facing strings live in
`src/ui/copy.ts`. Religious-practice uncertainties are never guessed — they are
logged in `TESTING.md` ("Open questions for the owner") and use the safest
neutral behaviour.

## Out of scope for the MVP
Accounts & sync · backend · Android · social/sharing · audio prayers (Tasbeha) ·
Coptic-language learning · catechism/learning paths · widgets/watch · multiple
Bible translations · paid features.
