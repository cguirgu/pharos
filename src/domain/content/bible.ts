/**
 * Scripture — TYPES + PROVIDER interface only.
 *
 * ⚠️ CONTENT DISCIPLINE: no scripture text is bundled. The Coptic Church uses
 * specific approved readings/translations; the verified translation is supplied
 * by the owner through a `ScriptureProvider`. Until then the reader renders a
 * clear "to be supplied" state. Book names + chapter counts are universal
 * structural facts (not content) and are safe to encode.
 *
 * TODO(verify-content): supply an approved English scripture text + the
 * authoritative Coptic Katameros lectionary (see TESTING.md).
 */

import { BOOK_DATA, BOOK_IDS, type BookId, type BookMeta, type Testament } from './bible.gen';

export { BOOK_DATA, BOOK_IDS };
export type { BookId, BookMeta, Testament };

/** Full 66-book structural metadata, keyed by id (chapter counts are universal, not content). */
export const BOOKS: Readonly<Record<BookId, BookMeta>> = Object.fromEntries(
  BOOK_DATA.map((b) => [b.id, b]),
) as Record<BookId, BookMeta>;

/** Books grouped by testament, in canonical order — for the book picker. */
export function booksByTestament(testament: Testament): readonly BookMeta[] {
  return BOOK_DATA.filter((b) => b.testament === testament);
}

export interface ScriptureRef {
  readonly book: BookId;
  readonly chapter: number;
}

export interface Verse {
  readonly n: number;
  readonly text: string;
}

export interface Chapter {
  readonly ref: ScriptureRef;
  readonly heading?: string;
  readonly verses: readonly Verse[];
}

/** Source of verified scripture text. Returns null when text isn't available yet. */
export interface ScriptureProvider {
  getChapter(ref: ScriptureRef): Chapter | null;
}

/**
 * Default provider — no text yet; the reader shows the placeholder state.
 *
 * Bundled offline text = **KJV** (public domain) via `makeScriptureProvider` +
 * the ingested `content/bible/kjv/`. The **NKJV** (Diocese preference) is
 * copyrighted and CANNOT be bundled — it is served at runtime from a *licensed*
 * API.Bible account (async + cached, app layer) with KJV as the offline
 * fallback. See docs/CONTENT-SOURCES.md.
 */
export const placeholderProvider: ScriptureProvider = {
  getChapter: () => null,
};

/**
 * A loader resolves a whole book to its chapters. The app injects one that reads
 * the bundled content (e.g. KJV from `content/bible/<version>/<id>.json` via
 * expo-asset, or a SQLite query); tests inject a filesystem loader. Returning
 * null/undefined yields the placeholder state. See docs/CONTENT-SOURCES.md.
 */
export type BookLoader = (book: BookId) => { chapters: { chapter: number; verses: Verse[] }[] } | null;

/** Build a `ScriptureProvider` from a book loader. */
export function makeScriptureProvider(load: BookLoader): ScriptureProvider {
  return {
    getChapter(ref) {
      const book = load(ref.book);
      const chapter = book?.chapters.find((c) => c.chapter === ref.chapter);
      return chapter ? { ref, verses: chapter.verses } : null;
    },
  };
}

/** Human label for a reference, e.g. "John 6". Uses oldstyle book names only. */
export function refLabel(ref: ScriptureRef): string {
  return `${BOOKS[ref.book].name} ${ref.chapter}`;
}

/** Lookup of squashed lowercase book names → id (built from the canon, plus aliases). */
const NAME_TO_ID: Record<string, BookId> = (() => {
  const map: Record<string, BookId> = {};
  for (const b of BOOK_DATA) map[b.id] = b.id; // id already equals the squashed name
  map.psalm = 'psalms'; // common singular alias
  return map;
})();

/**
 * Parse a reference label like "Psalm 50", "1 Corinthians 13:4-7", or
 * "Song of Solomon 2:1" → ScriptureRef. The book name may contain internal
 * spaces (multi-word / numbered books); it is squashed before lookup.
 */
export function parseScriptureRef(label: string): (ScriptureRef & { fromVerse?: number; toVerse?: number }) | null {
  const m = label.trim().match(/^([1-3]?\s?[A-Za-z][A-Za-z\s]*?)\s+(\d+)(?::(\d+)(?:[-–](\d+))?)?$/);
  if (!m) return null;
  const id = NAME_TO_ID[m[1]!.toLowerCase().replace(/\s+/g, '')];
  if (!id) return null;
  const ref: ScriptureRef & { fromVerse?: number; toVerse?: number } = { book: id, chapter: Number(m[2]) };
  if (m[3]) ref.fromVerse = Number(m[3]);
  if (m[4]) ref.toVerse = Number(m[4]);
  return ref;
}
