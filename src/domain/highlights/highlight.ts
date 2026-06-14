/**
 * Highlights — a user-selected span of text saved for later, optionally with a
 * note. Two surfaces can be highlighted: the scripture reader and the Synaxarium.
 *
 * Pure TypeScript. No react/react-native/expo imports (CLAUDE.md §1).
 *
 * ⚠️ ANCHORING & RESILIENCE: neither scripture nor Synaxarium text is bundled —
 * it is injected at boot (see content/bible.ts, content/synaxarium.ts), and the
 * verified text may be swapped later. So a highlight stores both:
 *   - structural offsets (a best-effort hint for re-locating the span in the
 *     reader overlay), and
 *   - `textSnapshot`: the exact selected text at save time — the DURABLE source
 *     of truth for the list + search. If offsets drift, the snapshot still shows
 *     and searches correctly.
 */
import { refLabel, type BookId } from '../content/bible';
import { COPTIC_MONTHS } from '../coptic';

export type HighlightSource = 'scripture' | 'synaxarium';
export type HighlightColor = 'gold' | 'rubric' | 'sky' | 'sage';

/** Bible: a free character span that may run across verses within one chapter. */
export interface ScriptureAnchor {
  readonly source: 'scripture';
  readonly book: BookId;
  readonly chapter: number;
  readonly startVerse: number;
  readonly startOffset: number; // char index into startVerse text
  readonly endVerse: number; // === startVerse for a single-verse span
  readonly endOffset: number; // exclusive, into endVerse text
}

/** Synaxarium prose: no verse numbers, so anchor by coptic date + char offsets. */
export interface SynaxariumAnchor {
  readonly source: 'synaxarium';
  readonly copticMonth: number; // 1–13
  readonly copticDay: number; // 1–31
  readonly startOffset: number; // char index into the `life` prose
  readonly endOffset: number; // exclusive
}

export type HighlightAnchor = ScriptureAnchor | SynaxariumAnchor;

export interface Highlight {
  readonly id: string;
  readonly anchor: HighlightAnchor;
  /** Exact selected text at save time — resilient to source changes; powers search. */
  readonly textSnapshot: string;
  /** Precomputed human ref, e.g. "John 6:5–7" or "Thout 1 · Feast of Nayrouz". */
  readonly referenceLabel: string;
  readonly note?: string;
  readonly color?: HighlightColor;
  /** Optional user tag. */
  readonly label?: string;
  readonly createdAt: number;
  readonly updatedAt: number;
}

export function isScripture(a: HighlightAnchor): a is ScriptureAnchor {
  return a.source === 'scripture';
}

export function isSynaxarium(a: HighlightAnchor): a is SynaxariumAnchor {
  return a.source === 'synaxarium';
}

/** Coptic month name (1–13), or '' if out of range. */
function copticMonthName(month: number): string {
  return COPTIC_MONTHS[month - 1] ?? '';
}

/**
 * Human label for an anchor.
 *   scripture  → "John 6:5" (single) or "John 6:5–7" (range)
 *   synaxarium → "Thout 1" + optional " · {saintName}"
 *
 * `saintName` is passed IN by the caller (store/UI) — the domain never resolves
 * content (keeps it pure / content-injection-free).
 */
export function highlightRefLabel(anchor: HighlightAnchor, saintName?: string): string {
  if (isScripture(anchor)) {
    const base = refLabel({ book: anchor.book, chapter: anchor.chapter }); // "John 6"
    return anchor.startVerse === anchor.endVerse
      ? `${base}:${anchor.startVerse}`
      : `${base}:${anchor.startVerse}–${anchor.endVerse}`;
  }
  const base = `${copticMonthName(anchor.copticMonth)} ${anchor.copticDay}`.trim();
  return saintName ? `${base} · ${saintName}` : base;
}

/** Order start/end and clamp negative offsets/coordinates. */
export function normalizeAnchor(anchor: HighlightAnchor): HighlightAnchor {
  if (isScripture(anchor)) {
    const a: [number, number] = [Math.max(1, anchor.startVerse), Math.max(0, anchor.startOffset)];
    const b: [number, number] = [Math.max(1, anchor.endVerse), Math.max(0, anchor.endOffset)];
    const [lo, hi] = a[0] < b[0] || (a[0] === b[0] && a[1] <= b[1]) ? [a, b] : [b, a];
    return {
      source: 'scripture',
      book: anchor.book,
      chapter: anchor.chapter,
      startVerse: lo[0],
      startOffset: lo[1],
      endVerse: hi[0],
      endOffset: hi[1],
    };
  }
  const start = Math.max(0, Math.min(anchor.startOffset, anchor.endOffset));
  const end = Math.max(0, Math.max(anchor.startOffset, anchor.endOffset));
  return { source: 'synaxarium', copticMonth: anchor.copticMonth, copticDay: anchor.copticDay, startOffset: start, endOffset: end };
}

/** Whether a scripture anchor covers a given verse — used by the reader overlay. */
export function anchorCoversVerse(anchor: HighlightAnchor, book: BookId, chapter: number, verse: number): boolean {
  if (!isScripture(anchor)) return false;
  return anchor.book === book && anchor.chapter === chapter && verse >= anchor.startVerse && verse <= anchor.endVerse;
}

/** All highlight colors, in display order. */
export const HIGHLIGHT_COLORS: readonly HighlightColor[] = ['gold', 'rubric', 'sky', 'sage'];
