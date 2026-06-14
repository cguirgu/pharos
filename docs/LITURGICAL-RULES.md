# Pharos — Liturgical rules (as implemented)

*Source: `src/domain/coptic/` (pure TS). Spec: `handoff/PRD.md` §3. Tested in
`__tests__/coptic/` (44 assertions). **Religious rules are never guessed** — open
questions live in `TESTING.md`.*

## What the engine answers — `getDayInfo(date)`
For any Gregorian date: the **Coptic date** (AM era), **Orthodox Pascha**, the
**season/fast** in effect (with day-number/total), the **feast** of the day, and
the **fasting ruling** (level + human line + permitted/abstain food lists).

## Coptic calendar (`copticDate.ts`)
- 12 months × 30 days + Pi Kogi Enavot (5 days; 6 in a Coptic leap year,
  `year % 4 === 3`). Epoch: 1 Thout 1 AM = 29 Aug 284 (Julian), JDN 1825030.
- Verified: 1 Thout 1742 AM = 11 Sep 2025; 1741 AM = 11 Sep 2024; the New Year
  shifts to 12 Sep before a Gregorian leap year (e.g. → 12 Sep 2027).

## Pascha (`pascha.ts`)
Meeus **Julian computus** → Julian date → converted to Gregorian via JDN.
Verified: 2024 = 5 May · 2025 = 20 Apr · 2026 = 12 Apr · 2027 = 2 May.

## Seasons (`seasons.ts`) — movable anchored on Pascha P
- **Nineveh** — Mon–Wed, two weeks before Lent's Monday (P-69…P-67).
- **Great Lent** — 55 days [P-55 … P-1]; the last week is Holy Week.
- **Holy Fifty** — [P … P+49]; **no fasting at all** (suppresses Wed/Fri).
- **Apostles' Fast** — [P+50 … 11 Jul]; fish allowed.
- **Dormition Fast** — [7 Aug … 21 Aug]; fish by custom.
- **Nativity Fast** — [25 Nov … 6 Jan] (crosses the year); fish except Wed/Fri & Paramon.
- **Paramon** — eves of Nativity (6 Jan) & Theophany (18 Jan): strict.

## Feasts (`feasts.ts`)
- Fixed (by Coptic date): Nayrouz, the two Feasts of the Cross, Nativity (Koiak 29),
  Theophany (Tobi 11), Annunciation (Paremhat 29) + monthly commemorations (12th
  Michael, 21st St Mary, 29th Lordly — suppressed in Lent).
- Movable: Palm Sunday (P-7), Pascha (P), Ascension (P+39), Pentecost (P+49).
- The **Seven Major Feasts of the Lord** break the Wednesday/Friday fast.

## Fasting levels (`fasting.ts`)
`none | fast (vegan) | fast-fish | strict`, with a ruling line + permitted/abstain
lists. Precedence: Holy Fifty → Major Lord feast → Paramon → Lent/Nineveh (strict;
Lent Sat/Sun vegan) → fish-seasons (Wed/Fri vegan) → year-round Wed/Fri → none.

## ⚠️ Flagged for the owner (mirrors TESTING.md)
The PRD had two internal inconsistencies the engine corrected (Nayrouz date,
Nineveh anchoring), plus several nuances modelled with a safe default and flagged:
Lent Sat/Sun rigor, feast-within-Lent fish allowance, minor Lord feasts breaking
Wed/Fri, Paramon length, Apostles' end date, Dormition fish, day-29 suppression.
See **TESTING.md → "Open questions for the owner"** before shipping liturgical text.
