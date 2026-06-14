# Pharos — Design system ("the codex")

*The living, implementation-accurate companion to `handoff/DESIGN-SPEC.md`.
Tokens live in `src/ui/theme.ts`; components in `src/ui/components/`.*

## Language
A page from an illuminated Book of Hours: ruled registers, rubricated (red)
section headers, engraved serif numerals, hairline gold frames, Coptic-script
ornament. Concretely:
- **Sharp corners everywhere** (`radius.none` = 0) — buttons, sheets, toggles.
- **Hairlines, not cards.** Content sits between 1px rules; no filled cards, no
  shadows except the check-in sheet.
- **The lozenge** (45°-rotated square) is the only icon motif — checks, dots,
  nav indicator, radio marks.
- **No emoji. No rounded iOS toggles** (rectangular rails + square thumb).
- Faint laid-paper texture + top vignette (`src/ui/Page.tsx`).

## Tokens (`src/ui/theme.ts`)
- Colours `K`: `bg #0C1020` · `bg2 #0E1426` · `gold #C9A84A` · `goldHi #E7CE84` ·
  `rubric #B8453A` · `rubricHi #C56A56` · `feast #7FBF9A` · `parch #ECE4D2` ·
  `ink2 #B7AE96` · `ink3 #7C745F` · `rule rgba(201,168,74,.22)` ·
  `ruleDim rgba(236,228,210,.10)` · `onGold #1A1303`.
- Fonts `font`: Cormorant Garamond (display/numerals), Spectral (body + ALL-CAPS),
  Noto Sans Coptic (ornament — currently falls back to display; **TODO: bundle ttf**).
  Each weight is a distinct loaded family (see `app/_layout.tsx` `useFonts`).
- `radius.none`, `space.page = 26`.

## Component inventory (`src/ui/components/`)
| Component | File | Notes |
|---|---|---|
| `Caps` | primitives | ALL-CAPS letterspaced label (workhorse). props: color/size/ls. |
| `Copt` | primitives | Coptic ornament glyph. |
| `Numeral` | primitives | Big engraved serif numeral (oldstyle figures). |
| `Tag` | primitives | Small caps in a hairline box. |
| `Folio` | primitives | Running head: caps-left (+glyph) · caps-right · gold rule. |
| `Rubric` | primitives | Section header: opt. Coptic numeral · red caps · gold leader rule. |
| `Register` | primitives | Ruled table row (13px pad, 14 gap, hairlines). |
| `Fleuron` | primitives | Cross-ornament divider. |
| `Plate` | primitives | Image placeholder. |
| `Mark` | marks | The lozenge: `open` outline · `part` half-gold · `kept` gold + center square. ≥44px tap target in parent. |
| `Tally` | marks | Thin-cell progress strip; opacity ramp 0.45→1; `today` outlined. |
| `Dots` | marks | Small lozenges for multi-part progress. |
| `Btn` | controls | Full-width letterpress; `solid` (gold/dark) · `line` · `rubric`. |
| `Chip` | controls | Weekday/option cell; selected = gold border + wash + goldHi. |
| `Segmented` | controls | Hairline-divided bar; active segment solid gold. |
| `Stepper` | controls | − / value+unit / + (58px; `big` sheet variant). |
| `Toggle` | controls | 46×22 rail + square 18px thumb (no iOS blue). |
| `NavLedger` | NavLedger | Bottom nav: gold top rule, 5 columns, lozenge indicator, caps labels, no icons. |
| `SheetBar` | SheetBar | Pushed-screen / sheet header: back · title · action · hairline. |
| `PharosSeal` | PharosSeal | The beacon seal (react-native-svg) — brand/icon/splash. |

Support: `Page` (chrome), `CheckinSheet`, `LightenSheet`, `DevDate`, `Placeholder`,
`format.ts` (date/label strings), `copy.ts` (all strings).

## Motion (when added)
Sheets slide up 250–300ms ease-out + backdrop dim; mark fills animate 150ms; no
springy/bouncy physics, no confetti. Haptics: light impact on mark-kept and count
increments. Respect reduced-motion. All hit targets ≥44×44pt.

## Open visual TODOs
- Bundle **Noto Sans Coptic** `.ttf` (ornament glyphs currently fall back).
- Final **app icon + splash** generated from `PharosSeal` (gold beacon on #0C1020).
