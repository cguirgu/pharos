# Content licensing

**The MIT license in [`LICENSE`](./LICENSE) covers the _code_ in this repository. It does not
cover the religious texts bundled with it.**

Scripture, prayers, and saints' lives each carry their own copyright and permissions. An open
-source code license cannot grant rights the project does not hold. This file records where
each piece of bundled content came from and what may be done with it.

## Bundled content

| Content | Location | Source | Status |
|---|---|---|---|
| **Bible (KJV)** | `content/bible/kjv/` | King James Version | **Public domain.** Free to use, modify, redistribute. |
| **Agpeya — the seven hours** | `content/agpeya/` | [coptic.io](https://github.com/abanobmikaeel/coptic.io) | **Used with permission granted to this project.** Not relicensed by MIT — do not assume a fork inherits this permission. |
| **Synaxarium — commemorations** | `content/synaxarium/` (`days[*].feasts`) | English translation by St. George C.O.C., Chicago, via [randogoth/coptic-synaxarium](https://codeberg.org/randogoth/coptic-synaxarium) | **Shipped.** *Which* saints and feasts fall on which Coptic day is a calendar of facts, not creative expression. Displayed with attribution; `SYNAXARIUM_NAMES = false` withdraws them entirely (see below). |
| **Synaxarium — lives (prose)** | `content/synaxarium/` (`days[*].life`) | as above | **Withheld — permission pending.** `CONTENT_LICENSED = false`; the prose is blanked in the domain layer before it reaches any screen. Formal written permission has not been confirmed. Do not redistribute this text separately. |
| **Coptic alphabet & vocabulary** | `src/domain/learn/` | Compiled from public linguistic references | Structural linguistic facts (letter names, phonetic values), free to use. Pending final review by the project owner. |
| **App copy, design, and code** | everywhere else | This project | MIT — see [`LICENSE`](./LICENSE). |

Full provenance, the reasoning behind each choice, and the outstanding permission requests are
documented in [`docs/CONTENT-SOURCES.md`](./docs/CONTENT-SOURCES.md). The requests themselves are
in [`docs/permissions/`](./docs/permissions/).

## Why the Synaxarium ships in two halves

The same file holds two different kinds of thing, and only one of them needs anyone's permission.

**Which saint is commemorated on which Coptic day is a fact about the Church's calendar.** Facts
are not copyrightable, and neither is an arrangement of them dictated by an external system — here,
the liturgical calendar, which no one owns. Short titles are also below the threshold of
originality. So the commemorations ship, credited.

**The written life is a translation**, and a translation is authored work. It stays off until its
author says otherwise. `gateDayLife` blanks it in `src/domain/content/synaxarium.ts`, so it is
withheld in the domain rather than merely hidden by a UI condition — a missing `CONTENT_LICENSED &&`
in a component cannot leak it, and a test asserts exactly that.

Being candid about the residual risk: the commemoration lines are reproduced in the wording of the
St. George Chicago translation, and 700-odd short phrases is a lot of short phrases. We think that
is fair — every parish bulletin prints these — but it is a judgement, not a certainty. Hence the
kill switch: set `SYNAXARIUM_NAMES = false` in `src/content/flags.ts` and the app falls back to six
project-authored feasts, with no third-party wording anywhere. One line, one release. That path is
exercised by tests in `__tests__/content/synaxarium-day.test.ts`, not merely asserted here.

**We did not paraphrase the titles to dodge the question.** Rewriting hagiographic headings without
a verified source would mean inventing unsourced claims about saints, which the rules below forbid
for good reason. Better to ask, and to be able to withdraw.

## Notable exclusion

The **NKJV** is © Thomas Nelson and **is not bundled** and must not be added. Any NKJV support
must be fetched at runtime through a properly licensed API. Unlicensed "NKJV API" scrapes found
on GitHub are copyright infringement — do not use them.

## If you fork this project

The MIT license lets you fork, modify, and ship the code. It does **not** transfer the content
permissions above. Before publishing a fork that includes the Agpeya or Synaxarium text, obtain
your own permission from the rights holders, or remove that content.

## If you contribute content

Any pull request that adds or edits scripture, prayers, saints' lives, or translations must:

1. **Cite an authoritative source** — a diocese, a published translation, or a clearly
   public-domain text.
2. **State its license or permission** in the pull request description.
3. **Never be invented, paraphrased, or machine-translated.**

Corrections to existing text are very welcome — please cite the authority you are correcting
it against. Use the **Liturgical correction** issue template.
