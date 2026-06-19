/**
 * Highlight search — a pure, ranked, in-memory filter over saved highlights.
 *
 * Why in-memory (not SQLite FTS): at this scale (tens–low-hundreds per account)
 * the store already holds the full array in memory, exactly like the journal.
 * FTS5 would add a virtual table + triggers + schema-version churn AND a code
 * path that can't run under jest/MemoryRepo — defeating the "verify headless"
 * mandate. Ranking must live in the pure domain to be unit-testable anyway.
 *
 * Pure TypeScript. No react/react-native/expo imports.
 */
import { isScripture, type Highlight, type HighlightColor, type HighlightSource } from './highlight';
import type { BookId } from '../content/bible';

export type HighlightField = 'snapshot' | 'note' | 'reference';

export interface HighlightSearchHit {
  readonly highlight: Highlight;
  readonly score: number;
  /** The best-matching field — lets the UI emphasise where the match landed. */
  readonly field: HighlightField;
}

export interface SearchOptions {
  readonly source?: HighlightSource;
  readonly book?: BookId; // scripture sub-filter
  readonly color?: HighlightColor;
}

/** Field weights — a hit in the reference label outranks the note outranks the body. */
const WEIGHT: Record<HighlightField, number> = { reference: 3, note: 2, snapshot: 1 };

/** lowercase, strip diacritics (NFD + drop combining marks), collapse whitespace. */
export function normalizeText(s: string): string {
  return s
    .normalize('NFD')
    .replace(/\p{M}/gu, '') // drop combining diacritical marks
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/** Score one term against one field's normalized text. 0 = no match. */
function scoreTerm(term: string, text: string, weight: number): number {
  if (!text) return 0;
  // Word-boundary / prefix match scores above a bare substring.
  const boundary = new RegExp(`(?:^|[^a-z0-9])${escapeRegExp(term)}`);
  if (boundary.test(text)) return weight * 2;
  if (text.includes(term)) return weight;
  return 0;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function passesFilters(h: Highlight, opts?: SearchOptions): boolean {
  if (!opts) return true;
  if (opts.source && h.anchor.source !== opts.source) return false;
  if (opts.color && h.color !== opts.color) return false;
  if (opts.book && !(isScripture(h.anchor) && h.anchor.book === opts.book)) return false;
  return true;
}

/**
 * Ranked search. Empty query → all (filtered), newest-first. Multi-term queries
 * use AND semantics (every term must match some field). Ordering is deterministic
 * (score desc, then createdAt desc) — no `Date.now()` in the domain.
 */
export function searchHighlights(
  items: readonly Highlight[],
  query: string,
  opts?: SearchOptions,
): HighlightSearchHit[] {
  const filtered = items.filter((h) => passesFilters(h, opts));
  const terms = normalizeText(query).split(' ').filter(Boolean);

  if (terms.length === 0) {
    return filtered
      .slice()
      .sort((a, b) => b.createdAt - a.createdAt)
      .map((h) => ({ highlight: h, score: 0, field: 'reference' as const }));
  }

  const hits: HighlightSearchHit[] = [];
  for (const h of filtered) {
    const fields: Record<HighlightField, string> = {
      reference: normalizeText(h.referenceLabel),
      note: normalizeText(h.note ?? ''),
      snapshot: normalizeText(h.textSnapshot),
    };

    let total = 0;
    let best: HighlightField = 'snapshot';
    let bestScore = -1;
    let allTermsMatch = true;

    for (const term of terms) {
      let termBest = 0;
      for (const field of ['reference', 'note', 'snapshot'] as const) {
        const s = scoreTerm(term, fields[field], WEIGHT[field]);
        if (s > termBest) termBest = s;
        if (s > bestScore) {
          bestScore = s;
          best = field;
        }
      }
      if (termBest === 0) {
        allTermsMatch = false;
        break;
      }
      total += termBest;
    }

    if (allTermsMatch) hits.push({ highlight: h, score: total, field: best });
  }

  return hits.sort((a, b) => b.score - a.score || b.highlight.createdAt - a.highlight.createdAt);
}
