/**
 * The Synaxarium (commemoration of the day) — SCHEMA + lookup only.
 *
 * ⚠️ CONTENT DISCIPLINE: saints' lives must come from a verified Synaxarium and
 * are NOT included here. The seeded entries are keyed to the calendar engine's
 * already-verified feast dates (so we never assert an unverified date), with
 * **placeholder lives** marked `draft: true`. The owner supplies the full,
 * verified Synaxarium. Most days return no entry until that text is provided.
 *
 * TODO(verify-content): supply verified Synaxarium entries (see TESTING.md).
 */
import type { CopticDate } from '../coptic';
import { CONTENT_LICENSED } from '../../content/flags';

export const LIFE_TBD = '⟨ life to be supplied from a verified Synaxarium ⟩';

/**
 * Withhold a draft (unlicensed) life until content is licensed: the feast `name`
 * and `title` are structural facts and stay; only the prose `life` is blanked.
 */
export function gateLife(entry: SynaxariumEntry, licensed: boolean): SynaxariumEntry {
  if (licensed || !entry.draft) return entry;
  return { ...entry, life: '' };
}

export interface SynaxariumEntry {
  /** Coptic month 1–13. */
  readonly copticMonth: number;
  readonly copticDay: number;
  readonly name: string;
  readonly title?: string;
  /** All commemorations of the day (when available). */
  readonly feasts?: readonly string[];
  /** Placeholder until verified. */
  readonly life: string;
  readonly draft: boolean;
}

/**
 * A loaded Synaxarium dataset, keyed "<month>-<day>" (1–13). The app injects one
 * read from `content/synaxarium/synaxarium.json` (see scripts/ingest-synaxarium.mjs);
 * tests inject a filesystem copy. Until set, only the seeded feasts below resolve.
 *
 * ⚠️ The ingested English text is `draft` pending confirmation of the underlying
 * translation's permission (St. George C.O.C., Chicago) — see TESTING.md.
 */
export interface SynaxariumDataset {
  readonly days: Readonly<Record<string, { feasts: string[]; life: string }>>;
}

let dataset: SynaxariumDataset | null = null;

export function setSynaxariumData(d: SynaxariumDataset | null): void {
  dataset = d;
}

/**
 * Seeds limited to commemorations tied to the engine's verified feast dates.
 * Names are the feasts themselves (structural facts), lives are placeholders.
 */
export const SYNAXARIUM: readonly SynaxariumEntry[] = [
  { copticMonth: 1, copticDay: 1, name: 'The Feast of Nayrouz', title: 'The Coptic New Year', life: LIFE_TBD, draft: true },
  { copticMonth: 1, copticDay: 17, name: 'The Feast of the Cross', life: LIFE_TBD, draft: true },
  { copticMonth: 4, copticDay: 29, name: 'The Nativity of our Lord', life: LIFE_TBD, draft: true },
  { copticMonth: 5, copticDay: 11, name: 'Theophany — the Baptism of our Lord', life: LIFE_TBD, draft: true },
  { copticMonth: 7, copticDay: 10, name: 'The Feast of the Cross', life: LIFE_TBD, draft: true },
  { copticMonth: 7, copticDay: 29, name: 'The Annunciation', life: LIFE_TBD, draft: true },
];

/** Commemorations on a given Coptic date. Uses the loaded dataset, else seeds. */
export function saintsOn(coptic: CopticDate): SynaxariumEntry[] {
  const entry = dataset?.days[`${coptic.month}-${coptic.day}`];
  const found: SynaxariumEntry[] =
    entry && entry.feasts.length > 0
      ? [
          {
            copticMonth: coptic.month,
            copticDay: coptic.day,
            name: entry.feasts[0] ?? '',
            feasts: entry.feasts,
            life: entry.life,
            draft: true,
          },
        ]
      : SYNAXARIUM.filter((e) => e.copticMonth === coptic.month && e.copticDay === coptic.day);
  // Withhold unlicensed draft lives until permission is confirmed.
  return found.map((e) => gateLife(e, CONTENT_LICENSED));
}

/** The primary commemoration of the day, or null. */
export function primarySaint(coptic: CopticDate): SynaxariumEntry | null {
  return saintsOn(coptic)[0] ?? null;
}
