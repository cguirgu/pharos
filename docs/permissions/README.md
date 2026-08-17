# Permission requests

Written permission requests for bundled content, kept in version control next to
[`CONTENT-LICENSE.md`](../../CONTENT-LICENSE.md) so that what we asked, whom we asked, and when
is part of the record rather than someone's inbox.

## Open requests

| # | Rights holder | For | Sent | Reply |
|---|---|---|---|---|
| [01](./01-st-george-chicago.md) | St. George C.O.C., Monee/Chicago IL | The English Synaxarium lives currently bundled as `draft` | — | — |
| [02](./02-copticchurch-net.md) | CopticChurch.net / St. Mark's, Jersey City NJ | Their English Synaxarium, as an alternate source | — | — |
| [03](./03-sus-diocese.md) | Coptic Orthodox Diocese of the Southern US | The Diocese's English Synaxarium (Coptic Reader) | — | — |

Fill in the **Sent** and **Reply** columns as they happen. When a request is granted, record the
grant here, update the row in `CONTENT-LICENSE.md`, and flip `CONTENT_LICENSED` in
`src/content/flags.ts`.

## Why three

Request 01 is the real ask: St. George's translation is the text already in
`content/synaxarium/synaxarium.json`, so a grant costs us no data work at all. 02 and 03 are
fallbacks against a no or a silence — both would mean re-ingesting a different English text.

## Standing terms we offer

Every request commits to the same four things, and any grant should be read against them:

1. **In-app display only.** One day's account at a time. No bulk export, no separate
   redistribution, no resale of the text.
2. **Attribution in their words.** We carry whatever wording they specify, on the screen itself
   and on the About screen.
3. **Removal on request, no argument.** One flag, one release.
4. **Corrections welcome.** The
   [liturgical correction](../../.github/ISSUE_TEMPLATE/liturgical_correction.yml) issue template
   is open to them.

## What ships while these are open

The **commemorations** — which saints and feasts fall on which Coptic day — ship now under
`SYNAXARIUM_NAMES`. That is a calendar of facts. The **written lives** are withheld by
`CONTENT_LICENSED = false`, blanked in the domain layer before they can reach any screen. See
[`docs/CONTENT-SOURCES.md`](../CONTENT-SOURCES.md) for the full reasoning.
