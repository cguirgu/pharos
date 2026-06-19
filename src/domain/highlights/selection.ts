/**
 * Selection → anchor mapping (PURE). Turns a raw character selection captured
 * from the UI (a `{start, end}` offset pair, e.g. from a read-only TextInput's
 * onSelectionChange) into a highlight anchor + the exact selected substring.
 *
 * No react/react-native/expo imports (CLAUDE.md §1) — this is the testable core
 * of the native drag-to-select feature; the RN capture component is dumb and
 * only emits the raw {start, end}.
 */
import type { BookId } from '../content/bible';
import type { ScriptureAnchor, SynaxariumAnchor } from './highlight';

/** A raw character selection: offsets into the rendered unit's text. */
export interface RawSelection {
  readonly start: number;
  readonly end: number;
}

/** True when nothing is actually selected (caret only). */
export function isEmptySelection(sel: RawSelection): boolean {
  return sel.start === sel.end;
}

/** Order and clamp a raw selection to [0, len]; returns null if empty. */
export function normalizeSelection(sel: RawSelection, len: number): RawSelection | null {
  const lo = Math.max(0, Math.min(sel.start, sel.end));
  const hi = Math.min(len, Math.max(sel.start, sel.end));
  if (hi <= lo) return null;
  return { start: lo, end: hi };
}

/** The selected substring of `text`, or '' if the selection is empty/invalid. */
export function selectedSnapshot(text: string, sel: RawSelection): string {
  const norm = normalizeSelection(sel, text.length);
  return norm ? text.slice(norm.start, norm.end) : '';
}

/** A single-verse scripture selection → anchor + snapshot, or null if empty. */
export function scriptureAnchorFromSelection(
  args: { book: BookId; chapter: number; verse: number },
  sel: RawSelection,
  verseText: string,
): { anchor: ScriptureAnchor; snapshot: string } | null {
  const norm = normalizeSelection(sel, verseText.length);
  if (!norm) return null;
  return {
    anchor: {
      source: 'scripture',
      book: args.book,
      chapter: args.chapter,
      startVerse: args.verse,
      startOffset: norm.start,
      endVerse: args.verse,
      endOffset: norm.end,
    },
    snapshot: verseText.slice(norm.start, norm.end),
  };
}

/** A Synaxarium prose selection → anchor + snapshot, or null if empty. */
export function synaxariumAnchorFromSelection(
  args: { copticMonth: number; copticDay: number },
  sel: RawSelection,
  lifeText: string,
): { anchor: SynaxariumAnchor; snapshot: string } | null {
  const norm = normalizeSelection(sel, lifeText.length);
  if (!norm) return null;
  return {
    anchor: {
      source: 'synaxarium',
      copticMonth: args.copticMonth,
      copticDay: args.copticDay,
      startOffset: norm.start,
      endOffset: norm.end,
    },
    snapshot: lifeText.slice(norm.start, norm.end),
  };
}
