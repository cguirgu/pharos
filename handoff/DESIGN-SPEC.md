# Pharos — Design specification (hi-fi)

**Fidelity: HIGH.** The HTML files in `design refs/` are pixel-level references for layout, type, color and spacing. Recreate them faithfully in React Native. Where a screen exists in both v2 ("Book of Hours" codex set) and v3 ("Rule of Life" set), **v3 wins** (nav, Today, all Rule screens); v2 supplies everything else (onboarding, hours, fasting, calendar, word, journal, you) in the same language.

## 1. Design language — "the codex"
The app is set like a page from an illuminated Book of Hours: ruled registers, rubricated (red) section headers, engraved serif numerals, hairline gold frames, Coptic-script ornament glyphs. Concretely:
- **Sharp corners everywhere.** `borderRadius: 0` on every element, including buttons, toggles, sheets.
- **Hairlines, not cards.** Content sits between 1px rules; no filled cards, no shadows except the check-in sheet (`0 -16px 40px rgba(0,0,0,0.5)`).
- **Lozenge (45°-rotated square) is the only "icon" motif** for checks, dots, nav indicator, radio marks.
- **No emoji. No rounded iOS toggles** — toggles are rectangular rails with a square thumb.
- Roman numerals (vi, xii) and oldstyle figures used as flavor in folios, times, counts.
- Faint texture: horizontal laid-paper stripes (`repeating-linear-gradient`, white @ 1.2% opacity, 1px line / 4px gap) + top radial vignette.

## 2. Tokens (`theme.ts`)
```ts
export const K = {
  bg:      '#0C1020',  // oxford ink — app background
  bg2:     '#0E1426',  // sheet background
  panel:   'rgba(201,168,74,0.04)',
  gold:    '#C9A84A',  // primary accent
  goldHi:  '#E7CE84',  // gold highlight (active text, big numerals)
  rubric:  '#B8453A',  // liturgical vermilion (fast banners)
  rubricHi:'#C56A56',  // ≈ oklch(0.66 0.15 30) — rubricated headers
  feast:   '#7FBF9A',  // ≈ oklch(0.74 0.10 150) — feast accents
  parch:   '#ECE4D2',  // warm parchment — primary text
  ink2:    '#B7AE96',  // secondary text (warm taupe)
  ink3:    '#7C745F',  // dim text
  rule:    'rgba(201,168,74,0.22)',  // ornamental gold hairline
  ruleDim: 'rgba(236,228,210,0.10)', // structural hairline
};
```
Selected-row wash: `rgba(201,168,74,0.05–0.12)`. Solid button text on gold: `#1A1303`.

## 3. Typography
| Role | Font | Usage |
|---|---|---|
| Display | **Cormorant Garamond** 500/600/700 (+italics) | Headlines (34–46px, line-height 0.95–1.02), row titles (19–25px/600), big numerals (with oldstyle figures where supported), italic subtitles (15–18px) |
| Text | **Spectral** 400/500/600 (+italics) | Body (12.5–14.5px, lh 1.5–1.7), ALL-CAPS labels |
| Coptic ornament | **Noto Sans Coptic** | Glyphs ⲡⲓⲫⲁⲣⲟⲥ, section letters Ⲁ Ⲃ Ⲅ Ⲇ Ⲉ |
- **Caps label** (workhorse): Spectral, uppercase, 8.5–10.5px, letter-spacing 1.4–3.5, weight 600, color ink2/ink3/gold/rubricHi by role.
- Note: RN font scale ≈ the HTML refs at 390×844 (iPhone-sized artboards) — sizes transfer 1:1. Respect Dynamic Type by scaling the whole ramp.

## 4. Component inventory (build once in `src/ui/components/`, reuse everywhere)
| Component | Spec |
|---|---|
| `Folio` | Running head: caps-left (+ small Coptic glyph), caps-right, 1px gold rule beneath. Page padding 26px. |
| `Rubric` | Section header: optional Coptic numeral glyph (gold) + red caps label + gold leader rule filling the row. |
| `Register` | Row between `ruleDim` hairlines, 13px vertical padding, 14px gap. |
| `Mark` | 22px lozenge: open = `rule` outline; part = left-half gold fill; kept = gold fill + small bg square center. Tap target ≥ 44px. |
| `Tally` | Strip of thin rect cells, filled = gold (opacity ramps 0.45→1 across the strip), today = outlined. |
| `Dots` | 6px lozenges for multi-part progress. |
| `Btn` | Full-width letterpress: 14px pad, Spectral caps 11.5px / ls 2.5. Variants: solid (gold bg, `#1A1303` text), line (transparent, gold hairline border, goldHi text), rubric (red-tinted border/text). |
| `Chip` | Weekday cell: hairline box, selected = gold border + 12% gold wash + goldHi text. |
| `Segmented` | Hairline-divided bar; active segment solid gold with dark text. |
| `Stepper` | 58px-tall hairline box: − / value+unit / +. Check-in sheet uses big 54px square ± buttons around an 84px numeral. |
| `Toggle` | 46×22 rectangle rail, square 18px thumb; on = gold border, 12% wash, gold thumb right. |
| `NavLedger` | Bottom nav: 1px gold rule on top, 5 equal columns divided by `ruleDim` hairlines, lozenge indicator above active label, caps labels 9px/ls 1.6 (active goldHi w700, inactive ink3 w600). No icons. |
| `SheetBar` | Back chevron + caps label left, caps title center, action right; hairline below. |
| `Fleuron` | Cross ornament between two hairlines (divider). |
| `Cross` | Thin-stroke Coptic cross used as "kept" flourish. |
| `Plate` | Image placeholder: 135° gold-striped box, hairline border, centered caps label on bg patch. |

## 5. Screen-by-screen
For exact layouts open the design refs (each function = one artboard). Canonical map:

**v3 — `Pharos - Rule of Life.html` / `screens3_rule.jsx` (authoritative):**
- `NavMap3` — IA rationale (read, don't build)
- `Today3` — Today tab
- `RuleOverview3`, `PracticeHistory3`, `AddPractice3`, `ComposePractice3`, `ComposeCount3`, `CadencePalette3`, `CountCheckin3` (bottom sheet over dimmed Today), `LightenRule3`

**v2 — `Pharos MVP Wireframes v2.html` (same language, build these for the rest):**
- `OnbWelcome2/OnbPersonalize2/OnbRhythm2` — onboarding (diamond-and-rule step indicator)
- `Home2A/B/C` — superseded by Today3, but `Home2B` ("illuminated hour") is the **office reader intro** layout, and the office list pattern in `Home2A` is the **Hours tab** list
- `FastOverview2`, `FastCheckin2` — fasting detail (permitted/abstain two-column ledger)
- `Ordo2`, `CalendarDay2` — calendar month + day detail
- `BiblePlans/BibleReader` & `LearnPaths/LearnLesson` (in growth file; Learn screens are OUT of MVP scope)
- `StreakDetail2`, `SaintOfDay2`, `JournalList2`, `JournalEntry2`, `Profile2` — You tab + misc
- `screens2_foundations.jsx` — brand board, Pharos seal mark, palette reference

## 6. Motion & interaction
- Minimal, considered motion: sheet slides up 250–300ms ease-out with backdrop dim to 32% content opacity; mark state changes animate fill 150ms; tally cells fade in. No springy/bouncy physics, no confetti — when a mark is earned, a quiet single gold-line glint at most.
- Standard iOS back-swipe on pushed screens; sheets dismiss by drag or scrim tap.
- Haptics: light impact on mark-kept and count increments.
- All hit targets ≥ 44×44pt even where visuals are smaller (lozenges, steppers, nav).
- Respect reduced-motion: disable nonessential animation.

## 7. Assets
- No raster assets required. The Pharos seal / beacon mark exists as inline SVG in `screens2_foundations.jsx` (`PharosMark`, `PharosSeal`) — port to `react-native-svg`.
- App icon & splash: gold beacon mark on `#0C1020` (generate simple versions; owner may replace).
- Fonts as listed in TECH-STACK.md.
