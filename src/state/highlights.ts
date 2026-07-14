/**
 * Highlights store — saved text selections from scripture + the Synaxarium,
 * optionally with a note. Scoped per account. Thin glue over the repo (same
 * pattern as useJournal), with search/overlay selectors delegating to the pure
 * domain functions in @domain/highlights.
 */
import { create } from 'zustand';
import { getRepo } from '../db/repo';
import { id } from '../platform/id';
import { LIMITS, clampText } from '../domain/limits';
import {
  anchorCoversVerse,
  highlightRefLabel,
  normalizeAnchor,
  searchHighlights,
  type Highlight,
  type HighlightAnchor,
  type HighlightColor,
  type HighlightSearchHit,
  type SearchOptions,
} from '../domain/highlights';
import type { BookId } from '../domain/content/bible';

interface SaveInput {
  id?: string;
  anchor: HighlightAnchor;
  textSnapshot: string;
  /** Computed via highlightRefLabel when omitted (pass it to include a saint name). */
  referenceLabel?: string;
  note?: string;
  color?: HighlightColor;
  label?: string;
}

interface HighlightsState {
  accountId: string | null;
  items: Highlight[];

  load: (accountId: string) => Promise<void>;
  clear: () => void;
  /** Create or update a highlight; returns its id. */
  save: (input: SaveInput) => Promise<string>;
  remove: (id: string) => Promise<void>;
  get: (id: string) => Highlight | undefined;

  // selectors (thin wrappers over the pure domain fns; keep components dumb)
  search: (query: string, opts?: SearchOptions) => HighlightSearchHit[];
  forVerse: (book: BookId, chapter: number, verse: number) => Highlight[];
}

export const useHighlights = create<HighlightsState>((set, get) => ({
  accountId: null,
  items: [],

  load: async (accountId) => {
    const items = await getRepo(accountId).listHighlights(accountId);
    set({ accountId, items });
  },

  clear: () => set({ accountId: null, items: [] }),

  save: async ({ id: hId, anchor, textSnapshot, referenceLabel, note, color, label }) => {
    const accountId = get().accountId;
    if (!accountId) return '';
    const existing = hId ? get().items.find((h) => h.id === hId) : undefined;
    const now = Date.now();
    const normalized = normalizeAnchor(anchor);
    const highlight: Highlight = {
      id: existing?.id ?? hId ?? id(),
      anchor: normalized,
      textSnapshot,
      referenceLabel: referenceLabel ?? highlightRefLabel(normalized),
      note: note ? clampText(note, LIMITS.highlightNote) : undefined,
      color,
      label: label ? clampText(label, LIMITS.highlightLabel) : undefined,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    await getRepo(accountId).upsertHighlight(accountId, highlight);
    set((st) => {
      const rest = st.items.filter((h) => h.id !== highlight.id);
      return { items: [highlight, ...rest].sort((a, b) => b.createdAt - a.createdAt) };
    });
    return highlight.id;
  },

  remove: async (hId) => {
    const accountId = get().accountId;
    if (!accountId) return;
    await getRepo(accountId).deleteHighlight(accountId, hId);
    set((st) => ({ items: st.items.filter((h) => h.id !== hId) }));
  },

  get: (hId) => get().items.find((h) => h.id === hId),

  search: (query, opts) => searchHighlights(get().items, query, opts),
  forVerse: (book, chapter, verse) =>
    get().items.filter((h) => anchorCoversVerse(h.anchor, book, chapter, verse)),
}));
