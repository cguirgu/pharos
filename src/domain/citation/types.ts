/**
 * Citation — a durable reference into the three readable corpora: scripture,
 * the Synaxarium, and the Agpeya hours.
 *
 * This is a SUPERSET of `HighlightAnchor`, not a replacement for it. The two
 * highlight anchors are reused verbatim so there is one anchoring vocabulary in
 * the app, and `OfficeAnchor` is added for the Agpeya (whose hours ARE bundled —
 * see content/agpeya/hours/*.json, wired by src/state/content.ts).
 *
 * Deliberately NOT done by widening `HighlightAnchor` itself: that union is
 * closed at two members and three call sites assume it — `normalizeAnchor`,
 * `matchesHighlightFilter` and `fallbackAnchor` all treat "not scripture" as
 * "synaxarium", so a third member would be silently coerced. Widening would also
 * force a local schema bump, discarding the reader's existing marks. When Agpeya
 * *highlighting* eventually lands, `HighlightAnchor` can become `CitationAnchor`
 * in one line — after those three branches are audited.
 *
 * Same anchoring discipline as highlights: scripture and Synaxarium text are
 * injected at boot rather than bundled, and content may be re-sourced later, so
 * offsets and section ids are a RE-LOCATING HINT only. `textSnapshot` is the
 * durable citation text.
 *
 * Pure TypeScript — no react/react-native/expo imports, and no `new Date()`
 * (ARCHITECTURE.md; enforced by __tests__/architecture/domain-purity.test.ts).
 */
import type { ScriptureAnchor, SynaxariumAnchor } from '../highlights/highlight';
import type { OfficeKey } from '../content/agpeya';

/** The Agpeya: anchor by hour → section → block → character offsets. */
export interface OfficeAnchor {
  readonly source: 'office';
  readonly officeKey: OfficeKey;
  /** `HourSection.id` from the bundled hour, e.g. "psalm50-3". */
  readonly sectionId: string;
  /** Index into that section's `blocks`. */
  readonly blockIndex: number;
  /** Char index into the block's text. */
  readonly startOffset: number;
  /** Exclusive. */
  readonly endOffset: number;
}

export type CitationAnchor = ScriptureAnchor | SynaxariumAnchor | OfficeAnchor;

export type CitationSource = CitationAnchor['source'];

export const CITATION_SOURCES: readonly CitationSource[] = ['scripture', 'synaxarium', 'office'];

/**
 * A citation as carried on a question: the anchor (a hint for re-locating the
 * passage), the durable text, and a precomputed human label.
 */
export interface Citation {
  readonly anchor: CitationAnchor;
  /** Exact text at cite time — the source of truth for display. */
  readonly textSnapshot: string;
  /** e.g. "John 6:53–56" / "Thout 1 · St Verena" / "Matins · Psalm 50". */
  readonly referenceLabel: string;
}

export function isOfficeAnchor(a: CitationAnchor): a is OfficeAnchor {
  return a.source === 'office';
}

/** Whether an arbitrary value is a usable anchor (used when decoding params). */
export function isCitationAnchor(value: unknown): value is CitationAnchor {
  if (typeof value !== 'object' || value === null) return false;
  const src = (value as { source?: unknown }).source;
  return src === 'scripture' || src === 'synaxarium' || src === 'office';
}
