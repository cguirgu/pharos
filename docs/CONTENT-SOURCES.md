# Pharos — Content sources & licensing

How to populate the placeholder content (Agpeya, scripture, lectionary, Synaxarium)
from **verified, official Coptic Orthodox sources**, what each one's licensing allows,
where to download it, and how to store it efficiently in the app.

> **Golden rule (owner directive + PRD §6):** ship only verified, official text; never
> invent. An open-source MIT *code* license does **not** grant rights to the religious
> *text* inside it — check the text's own copyright. When unsure, get written permission
> or use a clearly public-domain source.

---

## How Coptic Reader works (reference model)

Coptic Reader (the de-facto standard app) is published by the **Coptic Orthodox Diocese
of the Southern United States** and ships the Diocese's **own official translation** of
the prayer books (Agpeya, Psalmody, Pascha, Liturgies, …). It **dynamically assembles**
each day's service from the **Katameros** (lectionary) + the **Coptic calendar** — i.e.
it stores *references* (which psalm/gospel/synaxarium for each day) and renders the text.
Its English scripture is the **NKJV**.

Two takeaways for us:
1. The day→readings mapping is **structure** (reusable); the **text** is the licensed part.
2. Their translations are **© the Diocese** — we cannot copy them without permission.

---

## Source-by-source plan

### 1. Bible (scripture text)
| Option | License | Use |
|---|---|---|
| **KJV** — `github.com/aruljohn/Bible-kjv` (66 per-book JSON, MIT) or `churchstudio-org/openbible` | **Public domain** | ✅ **Bundle now.** KJV is the *historically approved* Coptic English translation. Safe, free. |
| **Brenton's English Septuagint (1851)** — `ebible.org/eng-Brenton` | **Public domain** | ✅ Optional OT — the Coptic OT follows the **Septuagint**, so Brenton is the more faithful OT. (HTML/EPUB → convert to JSON.) |
| **NKJV** (Diocese's current preference) | © Thomas Nelson | ⚠️ **Cannot bundle.** Requires a license from Thomas Nelson, or fetch at runtime from a licensed API. KJV is the clean default. |

**Recommendation:** bundle **KJV** for the whole Bible now (legally clean, approved); offer
**Brenton LXX** as the OT later. Treat NKJV as a paid/owner decision.

### 2. Lectionary (Katameros — which readings each day)
| Source | License | Use |
|---|---|---|
| **katameros-api** — `github.com/pierresaid/katameros-api` (API + SQLite of **references**, MIT) | MIT code; references are factual | ✅ Use the **reference data** (day → book/chapter/verse spans); pair with our bundled KJV text. |
| **coptic.io** — `github.com/abanobmikaeel/coptic.io` (MIT, `@coptic/data` offline bundle) | MIT code; **its bundled NKJV text is ©** | ✅ Use calendar/reference logic; ❌ do **not** ship its NKJV text. |
| **katameros.app**, **reader.boulos.ca** | — | Reference implementations to study. |

This **replaces** our structural "Four Gospels in 90 days" placeholder with the real daily
Katameros (`src/domain/content/readingPlan.ts` `TODO(verify-content)`).

### 3. Agpeya (prayers of the hours)
All complete English Agpeya translations are **copyrighted** (the Diocese / agpeya.org /
St-Takla). But most of an hour is **scripture** we can fill from public domain:
- **Psalms & Gospel & Lord's Prayer** → bundle from **KJV / Brenton** (public domain). ✅
- **Litanies, absolutions, introductions, Trisagion, Creed** → need a licensed source. ⚠️

**Action:** (a) auto-fill the scripture sections from the bundled Bible now; (b) request
written permission for the litany text from a diocese — **agpeya.org**, **St-Takla.org**
(often grants church-use permission), or the **Southern US Diocese**. Until granted, those
sections stay `TEXT_TBD`.
- Read/verify against: `st-takla.org/Agpeya.html`, `agpeya.org`, Internet Archive
  `archive.org/details/CopticAGPEYA`.

### 4. Synaxarium (lives of the saints, per Coptic day)
| Source | Notes |
|---|---|
| **copticchurch.net/synaxarium/all/en** | Clean **per-day** structure (ideal for an app); confirm reuse permission. |
| **st-takla.org** Synaxarium (full + daily) | Complete; church-use permission usually grantable. |
| **Internet Archive** `copticsynaxarium0000anon` (full text) | Check the translation's copyright/date; older translations may be public domain. |

**Action:** request permission (copticchurch.net or St-Takla) for the English lives; key by
Coptic month/day into `src/domain/content/synaxarium.ts` (replacing `LIFE_TBD`, drop `draft`).

### 5. Calendar / fasting rules
Already implemented and tested in `src/domain/coptic/*` (no external content needed).
coptic.io / CopticChurch.net calendar can be used to **cross-verify** the open
`TODO(verify-liturgical)` items in `TESTING.md`.

---

## Storage architecture (efficient, like a Bible app)

Bible apps (YouVersion etc.) keep scripture in a **bundled SQLite DB** and load a chapter
at a time, with **FTS** for search. Recommended for Pharos:

```
content/
  bible/<version>/<Book>.json        # normalized: { book, chapters:[{chapter, verses:[{n,text}]}] }
  bible/<version>/index.json         # manifest: books + chapter counts
  lectionary/katameros.json          # copticMonth/day → [ {book,chapter,verses} ]  (references only)
  agpeya/<office>.json               # section bodies (scripture auto-filled; litanies when licensed)
  synaxarium/<m>-<d>.json            # per Coptic day: { name, title, life }
```

- **MVP loading:** per-book JSON read on demand (don't `import` the whole Bible into the JS
  bundle). On device, ship the files as **assets** and read via `expo-asset` + `expo-file-system`.
- **At scale / search:** build a **SQLite** DB (`bible.db` with an FTS5 verses table) at
  ingest time and open it with **expo-sqlite** (we already use it). One ~4.5 MB file, indexed.
- Wire the existing **`ScriptureProvider`** (`src/domain/content/bible.ts`) to the chosen
  backend; the reader UI already renders `{n, text}` verses.
- JSON compresses well in the bundle; lazy per-book/per-chapter loading keeps memory low.

### Presentation (how the reader should behave)
Book picker → chapter grid → verse-numbered reading view; swipe between chapters; highlight
the current plan/Katameros position; tap-and-hold to note/journal; FTS search box. Our
`app/word/[book]/[chapter].tsx` already does book→chapter→verses; add the navigator + search.

---

## Ingestion

`scripts/ingest-kjv.mjs` downloads the **public-domain KJV** and writes the normalized
`content/bible/kjv/*.json` + `index.json`. Run: `node scripts/ingest-kjv.mjs`.
(Brenton LXX, Katameros references, Agpeya scripture-fill, and Synaxarium have follow-up
scripts once their sources/permissions are settled.)

---

## Decisions made (this build)

### Bible — NKJV chosen, but it CANNOT be bundled (copyright)
The NKJV is **© Thomas Nelson** (1982). It may **not** be copied/bundled; fair use caps at
500 verses / 25% / not a whole book — a full Bible is far beyond that. So:
- **Offline default = KJV** (public domain, also the historically *approved* Coptic English
  translation) — **already ingested** to `content/bible/kjv/` and wired through
  `makeScriptureProvider`.
- **NKJV = online, licensed** via **API.Bible** (`scripture.api.bible`) — license individual
  translations for commercial use (~$10/mo each, subject to the publisher approving NKJV
  access). The app adds an **async, cached provider** that fetches NKJV chapters at runtime and
  falls back to the bundled KJV offline. Owner action: create an API.Bible account, request
  **NKJV** access, drop the key + NKJV bible-id into app config.
- ❌ **Do NOT** use unlicensed "NKJV API" scrapes on GitHub — that is copyright infringement.

### Synaxarium — ingested (draft)
Ingested from **randogoth/coptic-synaxarium** (Codeberg, "free to use") → 366 days keyed by
Coptic month/day in `content/synaxarium/synaxarium.json`, wired via `setSynaxariumData`.
⚠️ The English text is a translation by **St. George C.O.C., Chicago**; the repo's "free to
use" is not a formal license from that church. Entries are `draft: true` — **confirm written
permission** with St. George (Chicago) before release.

### Lectionary (Katameros) — adopted; references next
Use the **open Katameros references** (day → book/chapter/verse) from **coptic.io** /
**katameros-api**, paired with our bundled KJV (or licensed NKJV) text. References are factual,
not copyrightable. To ingest: call the coptic.io readings endpoint per Coptic day (or read
`katameros-api`'s `Core/KatamerosDatabase.db`) and store **references only** to
`content/lectionary/katameros.json` keyed by Coptic month/day. This replaces the structural
"90-day Gospels" plan.

### Agpeya — full content, used with permission
- ✅ The **full Agpeya** (all seven hours: introductions, thanksgiving, Psalm 50, the Psalms,
  Gospels, litanies, the Lord's Prayer, conclusions — and the midnight prayer's three watches)
  is ingested from **coptic.io** (`scripts/ingest-agpeya.mjs` → `content/agpeya/hours/*.json`)
  and bundled. The project owner has **confirmed permission** to use the coptic.io APIs.
- Normalized into an ordered section/block model (`AgpeyaHour` in `agpeya.ts`); the office reader
  renders it with **collapsible sections + a jump drawer**.
- The earlier references-only path (`references.json` + KJV) remains as a fallback if full content
  is absent.

## Ingest scripts
- `node scripts/ingest-kjv.mjs` → `content/bible/kjv/` (public domain). ✅ run
- `node scripts/ingest-synaxarium.mjs` → `content/synaxarium/synaxarium.json` (draft). ✅ run
- `node scripts/ingest-agpeya-refs.mjs` → `content/agpeya/references.json` (refs only). ✅ run

## Sources
- Coptic Reader (Diocese of the Southern US): https://wiki.suscopts.org/Coptic_Reader · https://copticreader.org/
- Agpeya: https://st-takla.org/Agpeya.html · https://agpeya.org/ · https://archive.org/details/CopticAGPEYA
- Synaxarium: https://www.copticchurch.net/synaxarium/all/en · https://st-takla.org/Full-Free-Coptic-Books/Coptic-Synaxarium-or-Synaxarion_English/Eng-Synexarium-or-Synexarion-index.html
- Bible (NKJV ref): https://copticchurch.org/bible/ · Translation note: https://www.lacopts.org/orthodoxy/our-faith/the-holy-bible/
- KJV JSON (public domain, MIT code): https://github.com/aruljohn/Bible-kjv · https://github.com/churchstudio-org/openbible
- Brenton Septuagint (public domain): https://ebible.org/eng-Brenton/
- Katameros lectionary (open source): https://github.com/pierresaid/katameros-api · https://github.com/abanobmikaeel/coptic.io · https://katameros.app/

## Learn — Coptic alphabet + words (Greco-Bohairic)
The Learn course encodes the 32-letter Bohairic alphabet (`src/domain/learn/alphabet.ts`)
and core liturgical words (`words.ts`) with the **Greco-Bohairic** pronunciation (the modern
Church standard). Letter forms, names, and phonetic values are structural linguistic facts
(safe to encode, like book names), but were cross-checked against authoritative references and
are pending final **owner (Coptic Orthodox) review**.

Cross-checked against: Wikipedia *Coptic alphabet* / *Bohairic Coptic* (Greco-Bohairic phoneme
tables), the Younan *So You Want to Learn Coptic* grammar, ekladious.com "Coptic Pronunciation
Rules", deaconclass.weebly alphabet packet, St. Mark Festival L101, suscopts servants-prep,
copticchurch.net. Corrections applied from that pass: Ϫ Janja = "j" (judge), not hard "g";
Ⲅ Gamma "gh" before ⲁ ⲟ ⲱ; Ⲭ Khi "sh"/"kh" split in Greek words; Ⲃ Vida "b" after consonants;
ⲁⲅⲓⲟⲥ marked as a sung "gh" exception.

**Open items for owner to adjudicate:** Ⲅ before front vowels (hard "g" per Sunday-school rule
vs the ⲁⲅⲓⲟⲥ "gh" reality); house spelling of names (Vida/Bita, Lavla/Lola, Cheema/Shima);
the position-6 glyph (Coptic Sou Ⲋ U+2C8A — used here — vs Greek stigma Ϛ U+03DA).

**Audio (pronunciation):** clips are owner-supplied VERIFIED recordings (never synthesized).
Drop files in `assets/audio/coptic/<key>.m4a` and register them in
`src/content/coptic-audio.gen.ts`; until then the player teaches pronunciation via the
transliteration + phonetic key and shows an "audio coming soon" state.

### Learn — expanded word units (5 new lessons)
Added units **Holy Names** (ⲫⲓⲱⲧ, ⲡϣⲏⲣⲓ, ⲡⲓⲡⲛⲉⲩⲙⲁ, ⲫⲛⲟⲩϯ, ⲡϭⲟⲓⲥ, ⲓⲏⲥⲟⲩⲥ),
**Words of the Liturgy** (ⲙⲁⲣⲓⲁ, ⲡⲓⲱⲟⲩ, ϯⲉⲕⲕⲗⲏⲥⲓⲁ, ⲡⲓⲉⲩⲁⲅⲅⲉⲗⲓⲟⲛ, ⲡⲓⲁⲅⲅⲉⲗⲟⲥ, ϯϩⲓⲣⲏⲛⲏ),
and **Words of Praise** (ⲭⲉⲣⲉ, ⲥⲙⲟⲩ, ⲧⲉⲛⲟⲩⲱϣⲧ). All 15 web-verified (Wiktionary Coptic,
tasbeha.org, st-takla, liturgy texts, coptic.academy). Corrections applied: the ⲅⲅ cluster in
ⲡⲓⲉⲩⲁⲅⲅⲉⲗⲓⲟⲛ/ⲡⲓⲁⲅⲅⲉⲗⲟⲥ is "ang-ge" (n + hard g, as in "angel"), not "an-ghe".
**Note:** divine titles use the WEAK article on purpose (ⲫⲓⲱⲧ / ⲡϣⲏⲣⲓ / ⲫⲛⲟⲩϯ) — do not change
to the strong ⲡⲓ- forms. Exact spellings are locked in `__tests__/learn/alphabet.test.ts`.
UI feedback sounds (`assets/audio/ui/correct.wav`, `wrong.wav`) are generic synthesized tones
(scripts/gen-sfx.mjs), NOT liturgical audio.

### Learn — the prayers of the Church (10 new levels · 9 units · 27 words)
The course now ends with units taken from the texts the Church actually prays, rather than
from a vocabulary list. Levels 29–38: **The Lord's Prayer** (2 levels), **The Trisagion**,
**The Creed**, **The Holy Offering**, **In the Church**, **Pascha & Resurrection**,
**Prayer & Repentance**, **Soul & Body**, **Words of the Hours**.

**Verification rule applied to every word — two independent witnesses:**
1. an **attestation** that the word stands in the prayer/liturgical text as spelled, and
2. the **Bohairic dictionary entry** for the word (dialect + gloss), so the gloss is not a guess.

| Unit | Words | Attestation | Lemma check |
|---|---|---|---|
| The Lord's Prayer | ⲡⲉⲛⲓⲱⲧ · ⲛⲓⲫⲏⲟⲩⲓ · ⲡⲉⲕⲣⲁⲛ · ⲧⲉⲕⲙⲉⲧⲟⲩⲣⲟ · ⲡⲉⲛⲱⲓⲕ · ⲡⲓⲕⲁϩⲓ | Bohairic Lord's Prayer, in Coptic script (WikiTranslate) **and** independently in the CS-font text quoted from Wikisource — the two agree letter for letter | Wiktionary Bohairic ⲓⲱⲧ "father", ⲣⲁⲛ (in ⲡⲉⲕⲣⲁⲛ), ⲱⲓⲕ "bread", ⲕⲁϩⲓ "earth, land" |
| The Trisagion | ⲁⲅⲓⲟⲥ ⲟ ⲑⲉⲟⲥ · ⲁⲅⲓⲟⲥ ⲓⲥⲭⲩⲣⲟⲥ · ⲁⲅⲓⲟⲥ ⲁⲑⲁⲛⲁⲧⲟⲥ | tasbeha.org hymn library (Ⲁ̀ⲅⲓⲟⲥ ⲟ̀ Ⲑⲉⲟⲥ), which also gives Ⲓⲥⲭⲩⲣⲟⲥ and Ⲁ̀ⲑⲁⲛⲁⲧⲟⲥ | Greek ἅγιος / ἰσχυρός / ἀθάνατος sung in Coptic letters |
| The Creed | ⲧⲉⲛⲛⲁϩϯ · ⲡⲓⲡⲁⲛⲧⲟⲕⲣⲁⲧⲱⲣ · ⲗⲟⲅⲟⲥ | tasbeha.org Orthodox Creed — it opens **Ⲧⲉⲛⲛⲁϩϯ ⲉ̀Ⲟⲩⲛⲟⲩϯ** ("*We* believe", not "I believe") and spells Ⲡⲓⲡⲁⲛⲧⲟⲕⲣⲁⲧⲱⲣ | Wiktionary Bohairic ⲛⲁϩϯ "to believe / faith"; ⲗⲟⲅⲟⲥ "the Word" (B/S/A) |
| The Holy Offering | ⲱⲓⲕ · ⲁⲫⲟⲧ · ⲥⲛⲟϥ | the bread, the cup and the blood of the Liturgy | Wiktionary Bohairic ⲱⲓⲕ "bread"; ⲁⲫⲟⲧ "cup" (Sahidic ⲁⲡⲟⲧ); ⲥⲛⲟϥ "blood" |
| In the Church | ⲟⲩⲏⲃ · ⲇⲓⲁⲕⲱⲛ · ⲗⲁⲟⲥ | the three who stand in every liturgy | Wiktionary Bohairic ⲟⲩⲏⲃ "priest"; ⲇⲓⲁⲕⲱⲛ "deacon, servant" (m.); ⲗⲁⲟⲥ "people" |
| Pascha & Resurrection | ⲡⲁⲥⲭⲁ · ⲁⲛⲁⲥⲧⲁⲥⲓⲥ · ϣⲁⲓ | the Pascha, the Resurrection, the feast | Wiktionary ⲡⲁⲥⲭⲁ "Pascha/Passover"; ⲁⲛⲁⲥⲧⲁⲥⲓⲥ "resurrection" (f., Bohairic); ϣⲁⲓ "feast" (Bohairic) |
| Prayer & Repentance | ϣⲗⲏⲗ · ⲙⲉⲧⲁⲛⲟⲓⲁ · ⲛⲟⲃⲓ | ϣⲗⲏⲗ is the deacon's call to pray ("Eshlil") in the Liturgy of St Basil | Wiktionary ϣⲗⲏⲗ "to pray"; ⲙⲉⲧⲁⲛⲟⲓⲁ "repentance, contrition" (f.); ⲛⲟⲃⲓ "sin" (Bohairic, /ˈnɔvi/) |
| Soul & Body | ⲣⲱⲙⲓ · ⲯⲩⲭⲏ · ⲥⲱⲙⲁ | soul and body as named in the prayers | Wiktionary Bohairic ⲣⲱⲙⲓ "man, human"; ⲯⲩⲭⲏ "soul"; ⲥⲱⲙⲁ "body" (m.) |
| Words of the Hours | ⲯⲁⲗⲙⲟⲥ · ⲧⲱⲃϩ · ⲟⲩⲛⲟⲩ | the vocabulary of the Agpeya; ⲧⲱⲃϩ is the liturgical "Tovh em-Ep̀chois" ("Pray to the Lord") | Wiktionary ⲯⲁⲗⲙⲟⲥ "psalm" (m.); Bohairic ⲧⲱⲃϩ "to pray, entreat"; ⲟⲩⲛⲟⲩ "hour" (f.) |

**Deliberately NOT added, and why:**
- **The Coptic month names.** The Bohairic tradition is genuinely split — Baramhat is given both
  as Ⲡⲁⲣⲉⲙϩⲁⲧ (Wikipedia's Bohairic column) and as ⲫⲁⲙⲉⲛⲱⲑ "Phamenoth" in Church usage, and
  Parmoute likewise (Ⲫⲁⲣⲙⲟⲩⲑⲓ / ⲫⲁⲣⲙⲟⲑⲓ). Encoding one form would teach a spelling the learner's
  own parish may not use. Revisit once the owner picks the house forms.
- **ⲛⲏⲥⲧⲓⲁ "fast"** and **ⲡⲣⲟⲥⲉⲩⲭⲏ "prayer"** — no dictionary entry found to serve as the second
  witness, so ϣⲗⲏⲗ / ⲧⲱⲃϩ are taught for "pray" instead.
- **ⲟⲩⲱⲧ "one, only"** (from the Creed's "one God") — no dictionary entry found; dropped.

**Notes on the data:** words are stored WITHOUT the djinkim (◌̀ U+0300), matching the existing
dataset — the published Trisagion is written Ⲁ̀ⲅⲓⲟⲥ ⲟ̀ Ⲑⲉⲟⲥ, and the mark is omitted here on
purpose so the spelling tiles stay one-glyph-per-tile. The word ϣⲁⲓ "feast" is keyed
`shai-feast`, because audio clips are keyed by letter id **and** word id in one namespace and
`shai` is the letter Ϣ (a regression test now guards that). Pronunciations follow the
Greco-Bohairic rules already encoded in `alphabet.ts` / `combinations.ts` — so ⲙⲉⲧⲁⲛⲟⲓⲁ is
"me-TA-nee-a" (Greek-loan ⲟⲓ = "ee"), ⲛⲟⲃⲓ is "NO-vi" (Ⲃ = v), ⲟⲩⲏⲃ is "oo-EEB" (Ⲃ = b closing
a syllable), and ⲓⲥⲭⲩⲣⲟⲥ is "ees-SHEE-ros" (Ⲭ = "sh" before ⲩ).

**TODO(verify-content):** owner (Coptic Orthodox) review of the 27 glosses + pronunciations.
Exact spellings are locked in `__tests__/learn/alphabet.test.ts`, so any correction is a single
guarded edit.

Sources for this pass: [WikiTranslate — Lord's Prayer/Coptic](https://wikitranslate.org/wiki/Lord's_Prayer/Coptic) ·
[tasbeha.org hymn library — Trisagion](https://tasbeha.org/hymn_library/view/1836) ·
[tasbeha.org hymn library — The Orthodox Creed](https://tasbeha.org/hymn_library/view/32) ·
[Liturgy of St Basil (CopticChurch.net)](https://www.copticchurch.net/pdf/liturgy/liturgy_of_st_basil.pdf) ·
[Wiktionary Coptic entries](https://en.wiktionary.org/wiki/Category:Coptic_lemmas) ·
[Wikipedia — Coptic calendar](https://en.wikipedia.org/wiki/Coptic_calendar) (months, not adopted) ·
[tasbeha.org — Coptic month pronunciation thread](https://tasbeha.org/community/discussion/12394/coptic-month-pronunciation) (months, not adopted)
