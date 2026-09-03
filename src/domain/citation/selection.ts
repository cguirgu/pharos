/**
 * Selection → citation (PURE). The counterpart of
 * src/domain/highlights/selection.ts: it takes the same raw `{start, end}`
 * offsets emitted by `SelectableProse` and builds a whole `Citation` — anchor,
 * durable snapshot, and human label — ready to hand to the Questions composer.
 *
 * `officeAnchorFromSelection` is new (the Agpeya has no highlight anchor); the
 * scripture and Synaxarium paths reuse the existing highlight builders so the
 * two features can never disagree about what a selection means.
 *
 * No react/react-native/expo imports; no `new Date()`.
 */
import type { BookId } from '../content/bible';
import type { OfficeKey } from '../content/agpeya';
import {
  normalizeSelection,
  scriptureAnchorFromSelection,
  synaxariumAnchorFromSelection,
  type RawSelection,
} from '../highlights/selection';
import { LIMITS, clampText } from '../limits';
import { citationRefLabel, type LabelNames } from './label';
import type { Citation, CitationAnchor, OfficeAnchor } from './types';

/** An Agpeya block selection → anchor + snapshot, or null if empty. */
export function officeAnchorFromSelection(
  args: { officeKey: OfficeKey; sectionId: string; blockIndex: number },
  sel: RawSelection,
  blockText: string,
): { anchor: OfficeAnchor; snapshot: string } | null {
  const norm = normalizeSelection(sel, blockText.length);
  if (!norm) return null;
  return {
    anchor: {
      source: 'office',
      officeKey: args.officeKey,
      sectionId: args.sectionId,
      blockIndex: args.blockIndex,
      startOffset: norm.start,
      endOffset: norm.end,
    },
    snapshot: blockText.slice(norm.start, norm.end),
  };
}

/** Where a selection was made — one shape per readable corpus. */
export type CitationTarget =
  | { readonly source: 'scripture'; readonly book: BookId; readonly chapter: number; readonly verse: number }
  | { readonly source: 'synaxarium'; readonly copticMonth: number; readonly copticDay: number }
  | { readonly source: 'office'; readonly officeKey: OfficeKey; readonly sectionId: string; readonly blockIndex: number };

/**
 * The one call every reader makes: raw selection → a complete `Citation`.
 * Returns null for an empty selection. The snapshot is clamped here, at build
 * time, so an over-long citation can never reach the store or a route param.
 */
export function citationFromSelection(
  target: CitationTarget,
  sel: RawSelection,
  text: string,
  names: LabelNames = {},
): Citation | null {
  let built: { anchor: CitationAnchor; snapshot: string } | null = null;

  if (target.source === 'scripture') {
    built = scriptureAnchorFromSelection(
      { book: target.book, chapter: target.chapter, verse: target.verse },
      sel,
      text,
    );
  } else if (target.source === 'synaxarium') {
    built = synaxariumAnchorFromSelection(
      { copticMonth: target.copticMonth, copticDay: target.copticDay },
      sel,
      text,
    );
  } else {
    built = officeAnchorFromSelection(
      { officeKey: target.officeKey, sectionId: target.sectionId, blockIndex: target.blockIndex },
      sel,
      text,
    );
  }

  if (!built) return null;
  return {
    anchor: built.anchor,
    textSnapshot: clampText(built.snapshot, LIMITS.citationSnapshot),
    referenceLabel: citationRefLabel(built.anchor, names),
  };
}
