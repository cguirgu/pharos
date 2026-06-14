/**
 * The Katameros lectionary — REFERENCES only (which readings each Coptic day).
 *
 * References (book/chapter/verse spans) are factual and reusable; the verse TEXT
 * comes from the bundled KJV (or a licensed NKJV provider). The dataset is
 * ingested from coptic.io / katameros-api (open) and injected at runtime, keyed
 * by Coptic month/day. Until set, callers fall back to the structural reading
 * plan (`readingPlan.ts`).
 *
 * TODO(verify-content): ingest references to content/lectionary/katameros.json.
 */
import type { CopticDate } from '../coptic';
import type { BookId } from './bible';

/** A single reading: a span of one book/chapter (optionally verse-bounded). */
export interface ReadingRef {
  readonly book: BookId | string; // string until all books are modelled
  readonly chapter: number;
  readonly fromVerse?: number;
  readonly toVerse?: number;
  /** e.g. "Vespers Gospel", "Liturgy Gospel", "Pauline", "Catholic", "Praxis", "Psalm". */
  readonly slot?: string;
}

export interface DayReadings {
  readonly refs: readonly ReadingRef[];
}

export interface LectionaryDataset {
  /** Keyed "<copticMonth>-<copticDay>" (1–13). */
  readonly days: Readonly<Record<string, DayReadings>>;
}

let dataset: LectionaryDataset | null = null;

export function setLectionaryData(d: LectionaryDataset | null): void {
  dataset = d;
}

/** The Katameros readings for a Coptic date, or null if not yet ingested. */
export function readingsOn(coptic: CopticDate): DayReadings | null {
  return dataset?.days[`${coptic.month}-${coptic.day}`] ?? null;
}
