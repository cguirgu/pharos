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
| **Synaxarium (lives of the saints)** | `content/synaxarium/` | English translation by St. George C.O.C., Chicago, via [randogoth/coptic-synaxarium](https://codeberg.org/randogoth/coptic-synaxarium) | **Draft — permission pending.** Entries are marked `draft: true`. Formal written permission has not yet been confirmed. Do not redistribute this text separately. |
| **Coptic alphabet & vocabulary** | `src/domain/learn/` | Compiled from public linguistic references | Structural linguistic facts (letter names, phonetic values), free to use. Pending final review by the project owner. |
| **App copy, design, and code** | everywhere else | This project | MIT — see [`LICENSE`](./LICENSE). |

Full provenance, the reasoning behind each choice, and the outstanding permission requests are
documented in [`docs/CONTENT-SOURCES.md`](./docs/CONTENT-SOURCES.md).

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
