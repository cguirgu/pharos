# Pharos — Product Requirements Document (iOS MVP)

**Working title:** Pharos (ⲡⲓⲫⲁⲣⲟⲥ — the lighthouse of Alexandria)
**One-liner:** A daily companion for Coptic Orthodox practice — prayer, fasting, and the Word — built around a personal, flexible **Rule of Life**.
**Platform:** iOS (iPhone) first. Local-first, no accounts, no backend in MVP.
**Audience:** Coptic Orthodox youth & young adults (roughly 16–35), English-speaking diaspora. Some grew up in the Church, some are returning, some are exploring.

---

## 1. Vision & product principles

Pharos turns the ancient "rule of life" (a personal set of spiritual practices) into a living, gentle, trackable companion. It is **not** a generic habit tracker with a cross painted on it — it is liturgically aware: it knows the Coptic calendar, the fasts, the feasts, and the canonical hours, and shapes each day around them.

**Principles (these resolve design disputes):**
1. **Gentle, never guilt-driven.** Partial effort counts ("partial days still tend the flame"). Rest days never break a streak. Copy is warm, liturgical, literary — never gamified-aggressive ("Don't lose your streak!!" is forbidden).
2. **The calendar is the spine.** Every screen knows what liturgical day it is (fast/feast/season) and adapts.
3. **The Rule bends so it never breaks.** Cadence flexibility, pausing, and "lighten the rule" are first-class features, not settings debris.
4. **Honest tracking.** Only days a practice is *due* are counted. Three states: kept / kept-in-part / missed.
5. **Reverent aesthetic.** A "Book of Hours / codex" visual language: navy ink, gold, parchment, serif type, hairline rules, sharp corners, zero emoji. See DESIGN-SPEC.md.

---

## 2. Information architecture

Five tabs (bottom nav, typographic ledger style):

| Tab | Glyph | Purpose |
|---|---|---|
| **Today** | Ⲁ | The day's account: every practice due today, fast status, streak. The single daily home. |
| **Hours** | Ⲃ | The Agpeya (Book of Hours) offices, the liturgical calendar (Ordo), saint of the day. |
| **Word** | Ⲅ | Scripture reader, one reading plan, journal entries (reflection opens beside the Word). |
| **Rule** | Ⲇ | The user's rule of life: create / edit / reorder / measure practices; per-practice history; lighten the rule. |
| **You** | Ⲉ | Streak detail, marks (badges), reminders & preferences. |

Key IA decisions (from design iteration v3 — these are final):
- "Today" and "Hours" do not overlap: Today is the account of your rule; Hours is where you go to actually pray an office.
- The Rule has its own tab (it is not buried in onboarding or settings).
- The Journal is not a tab; it is a practice type + a section inside Word.

---

## 3. Core domain: the liturgical calendar engine

A pure, dependency-free module (no UI imports) that answers, for any Gregorian date:

1. **Coptic date** — Anno Martyrum era (year 1 = AD 284). 13 months: 12 × 30 days + Pi Kogi Enavot (5 days, 6 in Coptic leap years). Coptic New Year (1 Thout) falls on Gregorian **Sept 11** (Sept 12 in the year preceding a Gregorian leap year, through 2099).
2. **Pascha (Resurrection feast)** — computed with the **Julian computus** (same date as Eastern Orthodox Easter), then converted to Gregorian. All movable seasons derive from it.
3. **Season / fast in effect**, with day-number and total (e.g. "Apostles' Fast · day 9"):
   - **Great Lent** — 55 days, beginning Monday 8 weeks before Pascha (incl. preparation week + Holy Week), ending at Pascha. Strictest fast.
   - **Fast of Nineveh** — 3 days (Mon–Wed), starting 15 days before Great Lent begins.
   - **Holy Fifty** — Pascha → Pentecost (Pascha + 49): a joyful season, **no fasting at all**, including Wednesdays/Fridays.
   - **Apostles' Fast** — day after Pentecost (Pascha + 50) → July 12 (Feast of Sts. Peter & Paul; Epip 5). Variable length. Fish permitted.
   - **St. Mary's (Dormition) Fast** — Aug 7 → Aug 21. Fish permitted by widespread custom (make this a content flag, not hardcoded dogma).
   - **Nativity Fast** — Nov 25 → Jan 6 (43 days). Fish permitted except Wed/Fri (and the final Paramon days).
   - **Paramon** — day(s) immediately before Nativity (Jan 7) and Theophany (Jan 19): strict.
   - **Wednesdays & Fridays** — fast days year-round, **except** during the Holy Fifty and when a major feast of the Lord falls on them.
4. **Feast of the day**, if any — the 7 Major feasts of the Lord (Annunciation Mar 25/Baramhat 29, Nativity Jan 7, Theophany Jan 19, Palm Sunday, Pascha, Ascension Pascha+39, Pentecost Pascha+49), Nayrouz (1 Thout), the two Feasts of the Cross (Tout 17 ≈ Sep 27, Baramhat 10 ≈ Mar 19), and the monthly commemorations (12th of each Coptic month — Archangel Michael; 21st — St. Mary; 29th — Annunciation/Nativity/Resurrection, except during Lent per custom — flag, don't hardcode).
5. **Fasting level for the day** — one of: `none | fast (vegan) | fast-fish-allowed | strict (no food/water until sunset, then vegan)` plus a short human ruling line (e.g. "abstain from animal things · vegan fare") and permitted/abstain food lists.

**Quality bar:** This engine MUST be built with table-driven unit tests against golden dates (see TECH-STACK.md §Testing). Known anchors to verify: Orthodox Pascha 2024 = May 5, 2025 = Apr 20, 2026 = Apr 12, 2027 = May 2; 1 Thout 1741 AM = Sept 12, 2024; 1 Thout 1742 AM = Sept 11, 2025. ⚠️ The implementing agent must verify all derived season boundaries against a published Coptic calendar source and surface any rule it is unsure about as a `TODO(verify-liturgical)` comment + open question for the product owner — **never silently guess religious rules.**

---

## 4. Core domain: the Rule engine

### 4.1 Practice model
A **practice** is one commitment in the user's rule.

| Field | Type / values | Notes |
|---|---|---|
| `id`, `createdAt` | uuid, timestamp | |
| `name` | string | e.g. "The Agpeya", "Pray for my family" |
| `category` | `prayer \| word \| fast \| devotion` | drives grouping + section glyphs |
| `kind` | `library \| custom` | library practices carry template metadata (e.g. Agpeya links to Hours content) |
| `cadence` | see below | |
| `measure` | `binary \| count \| duration \| parts` | binary = "mark it kept"; count = N repetitions (e.g. 12 prostrations, 50 Jesus Prayers); duration = N minutes; parts = named sub-parts (e.g. Agpeya: Morning · Noon · Vespers) |
| `target` | number / part-list | for count/duration/parts |
| `reminder` | time + enabled flag | local notification, only fires on due days |
| `intention` | string, optional | "Why you keep it" — shown in editor & practice detail |
| `state` | `active \| paused \| archived` | paused has optional `resumeOn` date |
| `sortOrder` | int | user can reorder within category |

### 4.2 Cadence (the full palette — all six ship in MVP)
1. **Every day**
2. **Certain weekdays** — chosen set (e.g. Wed & Fri)
3. **N times per week** — any days; due "today" until N met that week (week = Sun–Sat)
4. **On fast days** — due whenever the calendar engine says today is a fast day (auto-follows seasons)
5. **Once a week / once a month** — due anytime in the period; surfaces gently near period end
6. **During a season only** — bound to a liturgical season (Lent, Apostles' Fast, Kiahk, …); dormant otherwise

### 4.3 Daily statuses & check-in
- Per due practice per day: `open → part → kept` (or `missed` once the day closes). Stored as a `practice_log` row: `(practiceId, date, status, value)` where value = count reached / minutes / parts completed.
- Binary: single tap on the lozenge mark toggles kept.
- Count: a check-in sheet with big − / + steppers, tally strip, and "Mark kept / Kept in part" actions. Reaching the target auto-marks kept; below target the user may mark "kept in part".
- Parts (Agpeya): each part checked off independently; all parts = kept, some = part.
- Logs are editable for **today and yesterday only** (grace window); older history is read-only.

### 4.4 Streaks & stats (exact rules)
- **Per-practice streak:** consecutive *due* days with status kept or part. Non-due days are skipped, never break it. `part` preserves the streak (gentleness principle) but renders differently.
- **Global day-streak** ("the flame"): a day counts when **every** practice due that day is kept or part, OR the day was a declared Rest Day. Computed, not stored.
- **% of due days kept:** per practice, over its lifetime and over trailing 4 weeks.
- **History view:** per practice, last 4 weeks as a 7-column grid; only due days are drawn as cells (✓ kept, / part, × missed, ◆ today); non-due days are blank.

### 4.5 Flexibility ("Tend, don't storm")
- **Rest Day:** pause the whole rule for today; the flame stays lit. Limited to (configurable, default) 2 per month, surfaced gently.
- **Pause one practice:** for a week or a season; hidden from Today while paused, streak frozen not reset.
- **Lighter rule:** a saved reduced subset (e.g. "morning Agpeya + one Gospel chapter") the user can switch to "until I return"; the app suggests one.

---

## 5. Features by tab

### 5.1 Onboarding (first launch, 3 steps)
1. **Welcome** — Pharos seal, name in Coptic script, one-line promise, "Begin the journey". (No account; "I already keep an account" link is hidden in MVP.)
2. **Where are you on the journey?** — single-select: grew up in the Church / returning / exploring. Stored; tailors the suggested starter rule and copy tone. Asks for first name (one field).
3. **Set your rule** — toggle list of 5 starter practices (Agpeya 3 hours ON, Read the Word ON, Keep the fasts ON, Saint a day OFF, Journal OFF). "Light the lamp →" creates the practices and lands on Today.
- Also: notification permission prompt (pre-permission explainer in-style, then system dialog), defaulting reminders off if denied.

### 5.2 Today
- Folio header: weekday + date (left), liturgical season + day number (right, e.g. "Day 9 · Apostles' Fast").
- Greeting ("Peace to you, {name}") + global streak numeral.
- Fast banner when applicable (rubricated): fast name + ruling line; taps through to Fasting detail.
- "Kept n / m" tally strip for today.
- **Your rule today:** list of due practices with lozenge marks, subtitle (cadence summary), and per-measure affordances: parts → 3-dot progress; count → "30 / 50" + opens check-in sheet; actionable practices → "Read" / "Write" / "Pray" buttons deep-linking into Hours/Word.
- **Resting today:** one dim line listing practices not due today.
- Empty state (no practices): invitation to the Rule tab.

### 5.3 Hours
- List of the 7 Agpeya offices for today with their hour, theme (e.g. "Sext — the Crucifixion"), and kept-state; "Pray" on the current/next office.
- **Office reader:** full-screen, sequential reader for one hour: Introduction → Thanksgiving → Psalm 50 → selected Psalms → Gospel → Litanies → Lord Have Mercy (×41 counter) → Conclusion. Large serif type, scroll or paged; "Mark this hour kept" at the end (writes to the Agpeya practice's parts log).
- **Saint of the day** (Synaxarium): name + short life for today's Coptic date.
- **The Ordo** (calendar): month grid where each day shows fast/feast marking; day detail sheet with Coptic date, season, fast level, feast, readings reference.

### 5.4 Word
- **Reader:** one public-domain English translation bundled (World English Bible). Book → chapter navigation, large serif reading view, current plan position highlighted.
- **One reading plan in MVP:** "The Four Gospels in 90 days." Progress %, day N, "today's chapter" deep-linked from Today.
- **Journal:** list of entries (date, title, excerpt) + entry editor (ruled-paper writing view, optional passage tag). "Three thanksgivings" practice deep-links here.

### 5.5 Rule
- **Overview:** practices grouped by category with rubricated headers (Prayer Ⲡ / The Word Ⲱ / The Fast Ⲛ / Devotion Ⲇ), each row: drag handle, name, cadence summary, today's progress dots, chevron → practice detail. "＋ Add a practice" (primary). Footer link: "Lighten the rule for a season."
- **Add a practice:** curated library grouped by category (see design file for the exact list) + "Write your own practice."
- **Compose / edit:** name, category, §i How often (6 cadence options, weekday chips revealed for "certain days"), §ii The measure (Mark it kept / A count [stepper + presets 3·12·40·100] / A span), §iii A reminder (time + toggle), §iv Why you keep it (ruled-line text). Save → returns to overview.
- **Practice detail / history:** streak, % kept, 4-week due-day grid, tags (cadence, reminder), Edit + pause actions.
- **Lighten the rule:** Rest Day / Pause one practice / Keep a lighter rule + suggested lighter rule card.

### 5.6 You
- Streak detail (weeks grid of the global flame), stats ledger (streak / total prayers / % Wed-Fri kept).
- **Marks** (badges), MVP set of 6: First light (first day all kept) · Flame of xiv (14-day streak) · First fast (first Wed/Fri kept) · Gospel reader (7 plan days) · Seven reflections (7 journal entries) · A full week (7-day streak). Earned marks render gold; unearned ghost outline. No popups; a quiet "a mark was earned" line on Today.
- Settings: name, reminders overview (all practice reminders in one list), fasting preference (show fish-allowed nuance y/n), about page (translation/content attributions).

### 5.7 Notifications (local only)
- Per-practice reminders at the chosen time, **scheduled only for due days** (re-scheduled daily/weekly in background or on app open).
- Optional daily "the day's account" summary (off by default).
- Copy in voice: e.g. "Vespers — the lamp is lit at sunset." Never shame-based.

---

## 6. Content requirements (⚠️ flagged for the product owner)

| Content | MVP source | Notes |
|---|---|---|
| Agpeya texts | **Structured JSON schema + placeholder text** | Many published English Agpeya translations are copyrighted. Build the full content pipeline (schema, reader, per-hour files) with clearly-marked placeholder text for litanies/prayers; psalms & gospels from WEB. Product owner supplies/licenses final text. **Do not scrape or fabricate liturgical text.** |
| Bible | World English Bible (public domain) | Bundle as JSON/SQLite, offline. |
| Synaxarium (saint of day) | Schema + ~14 seeded entries marked `draft: true` | Same caution: owner to provide/verify lives of saints. |
| Fasting food lists | From research notes; owner to verify | Permitted: vegetables & grains, legumes/bread/oil, fruit & nuts, black coffee/tea. Abstain: meat & poultry, dairy & eggs, fish (when not permitted), wine. |
| Calendar rules | §3 above; owner to verify against published Coptic calendar | All uncertainties surfaced as `TODO(verify-liturgical)`. |

---

## 7. Out of scope for MVP
Accounts & sync · any backend · Android · social/sharing · audio prayers & hymns (Tasbeha) · Coptic-language learning · learning paths/catechism (designed in wireframes; defer) · widgets & watch · multiple Bible translations · server push · paid features.

---

## 8. Success criteria for the MVP build
1. Fresh install → onboarding → a working rule on Today in under 90 seconds.
2. Calendar engine passes all golden-date tests; Today correctly shows season/fast for any device date (test by changing simulator date).
3. A count practice, a parts practice (Agpeya), and a weekday practice can each be created, checked in, and show correct history & streaks across a simulated week.
4. Rest Day and pause demonstrably preserve streaks.
5. Reminders fire on due days only.
6. All 5 tabs match DESIGN-SPEC.md fidelity; no system-default-looking UI anywhere.
7. App fully usable offline & cold-start < 2s on an iPhone 12.
