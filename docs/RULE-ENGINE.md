# Pharos — Rule engine

*Source: `src/domain/rule/` (pure TS). Spec: `handoff/PRD.md` §4. Tested in
`__tests__/rule/`.*

## Practice model (`types.ts`)
A **practice** is one commitment in the rule.
- `category`: `prayer | word | fast | devotion` (drives grouping + glyphs)
- `kind`: `library | custom`
- `measure`: `binary | count | duration | parts`
  - binary = mark it kept · count = N reps · duration = N minutes · parts = named sub-parts (e.g. Agpeya: Morning · Noon · Vespers)
- `target` (count/duration), `parts` (parts), `reminder`, `intention`
- `state`: `active | paused | archived` (paused has optional `resumeOn`)
- `sortOrder`

## The six cadences (`cadence.ts` → `isDueOn`)
1. **daily** — every day
2. **weekdays** — chosen weekdays (`days`: 0=Sun…6=Sat)
3. **timesPerWeek** — N times/week (week = Sun–Sat); due until N met (uses logs)
4. **fastDays** — due whenever the calendar says today is a fast day (auto-follows seasons)
5. **perPeriod** — once a `week` or `month`; due until done in the period (uses logs)
6. **season** — bound to a liturgical season; dormant otherwise

Inactive (paused/archived) practices are never due. `cadenceSummary()` renders a
short human label.

## Statuses & check-in (`status.ts`)
- Per due day: `open → part → kept` (or `missed` once a past day closes).
- `statusFromValue` (count/duration): ≥target → kept; 0<v<target → part; else open.
- `statusFromParts`: all → kept; some → part; none → open.
- `effectiveStatus(log, date, today)`: a logged completion shows through; a past
  due day with no completion is **missed**; **today** with no completion stays
  **open** (pending — never counts against you).
- `isEditable(date, today)`: only today & yesterday (the grace window).

## Streaks & stats (`streaks.ts`) — the gentle rules
- **`practiceStreak`** — consecutive *due* days with kept or part, counting back
  from today. Non-due days skipped; `part` preserves; a missed due day ends it;
  today-open is pending (neither counts nor breaks).
- **`practiceStats`** — `dueDays / keptDays / partDays / missedDays / keptPercent`
  over a window; today-open is excluded (not yet resolved).
- **`historyGrid`** — last 4 weeks × 7 (Sun–Sat); only due days carry a status.
- **`globalFlame`** — consecutive days where **every** due practice was kept/part,
  **or** the day was a declared **Rest Day**. A day with nothing due counts
  (vacuously). Today incomplete is pending, not a break. Paused practices, being
  never-due, can't drag it down.

## Flexibility (PRD §4.5)
- **Rest Day** — pauses the whole rule for a day; the flame stays lit.
- **Pause one practice** — frozen, not reset (UI partial — see TESTING.md).
- **Lighter rule** — a saved reduced subset (planned).

> All of the above is verified in `__tests__/rule/{cadence,status,streaks}.test.ts`
> and exercised through the store in `__tests__/state/rule.test.ts`.
