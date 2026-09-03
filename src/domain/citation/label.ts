/**
 * Human labels for a citation, and anchor normalization across all three
 * corpora. Delegates the two highlight anchors to `highlightRefLabel` /
 * `normalizeAnchor` so scripture and Synaxarium citations read EXACTLY as the
 * equivalent highlight does — one vocabulary, no drift.
 *
 * Content names are passed IN by the caller: the domain never resolves content
 * (see src/domain/highlights/highlight.ts for the same discipline).
 *
 * Pure TypeScript — no react/react-native/expo imports, no `new Date()`.
 */
import { highlightRefLabel, normalizeAnchor } from '../highlights/highlight';
import type { HighlightAnchor } from '../highlights/highlight';
import { isOfficeAnchor, type CitationAnchor, type OfficeAnchor } from './types';

/** Content-resolved names the domain cannot look up for itself. */
export interface LabelNames {
  /** Synaxarium: the saint commemorated on that Coptic day. */
  readonly saintName?: string;
  /** Office: the hour's display name, e.g. "Matins". */
  readonly officeName?: string;
  /** Office: the section title, e.g. "Psalm 50". */
  readonly sectionTitle?: string;
}

/**
 * Human label for any citation anchor.
 *   scripture  → "John 6:5" / "John 6:5–7"
 *   synaxarium → "Thout 1" + optional " · {saintName}"
 *   office     → "Matins" + optional " · {sectionTitle}"
 */
export function citationRefLabel(anchor: CitationAnchor, names: LabelNames = {}): string {
  if (isOfficeAnchor(anchor)) {
    const head = names.officeName ?? anchor.officeKey;
    return names.sectionTitle ? `${head} · ${names.sectionTitle}` : head;
  }
  return highlightRefLabel(anchor as HighlightAnchor, names.saintName);
}

/** Order start/end and clamp negative offsets, for any of the three anchors. */
export function normalizeCitationAnchor(anchor: CitationAnchor): CitationAnchor {
  if (isOfficeAnchor(anchor)) {
    const start = Math.max(0, Math.min(anchor.startOffset, anchor.endOffset));
    const end = Math.max(0, Math.max(anchor.startOffset, anchor.endOffset));
    const normalized: OfficeAnchor = {
      source: 'office',
      officeKey: anchor.officeKey,
      sectionId: anchor.sectionId,
      blockIndex: Math.max(0, anchor.blockIndex),
      startOffset: start,
      endOffset: end,
    };
    return normalized;
  }
  return normalizeAnchor(anchor as HighlightAnchor);
}
