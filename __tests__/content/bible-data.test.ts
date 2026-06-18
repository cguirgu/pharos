/**
 * Validates the ingested public-domain KJV data + the ScriptureProvider contract
 * by wiring a filesystem loader to `content/bible/kjv/`. Asserts STRUCTURE only
 * (chapter/verse counts, non-empty text) — never prints scripture text.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { makeScriptureProvider, BOOKS, BOOK_DATA, parseScriptureRef, type BookId } from '../../src/domain/content/bible';

const DIR = join(__dirname, '..', '..', 'content', 'bible', 'kjv');
const hasData = existsSync(join(DIR, 'index.json'));

const load = (book: BookId) => {
  const file = join(DIR, `${book}.json`);
  if (!existsSync(file)) return null;
  return JSON.parse(readFileSync(file, 'utf8')) as { chapters: { chapter: number; verses: { n: number; text: string }[] }[] };
};

// The ingest is optional in CI; only run these when the data is present.
(hasData ? describe : describe.skip)('KJV ingested data', () => {
  const provider = makeScriptureProvider(load);

  test('the manifest lists 66 books', () => {
    const index = JSON.parse(readFileSync(join(DIR, 'index.json'), 'utf8'));
    expect(index.books).toHaveLength(66);
    expect(index.license).toBe('public-domain');
  });

  test('the canon table holds all 66 books, OT (39) then NT (27)', () => {
    expect(BOOK_DATA).toHaveLength(66);
    expect(BOOK_DATA.filter((b) => b.testament === 'ot')).toHaveLength(39);
    expect(BOOK_DATA.filter((b) => b.testament === 'nt')).toHaveLength(27);
    expect(BOOK_DATA.map((b) => b.order)).toEqual(Array.from({ length: 66 }, (_, i) => i + 1));
  });

  test('every bundled book is navigable and its chapter count matches the table', () => {
    for (const b of BOOK_DATA) {
      const book = load(b.id);
      expect(book).not.toBeNull();
      expect(book?.chapters.length).toBe(BOOKS[b.id].chapters);
    }
  });

  test('parseScriptureRef handles numbered and multi-word book names', () => {
    expect(parseScriptureRef('1 Corinthians 13:4-7')).toMatchObject({ book: '1corinthians', chapter: 13, fromVerse: 4, toVerse: 7 });
    expect(parseScriptureRef('Song of Solomon 2:1')).toMatchObject({ book: 'songofsolomon', chapter: 2, fromVerse: 1 });
    expect(parseScriptureRef('Psalm 50')).toMatchObject({ book: 'psalms', chapter: 50 });
    expect(parseScriptureRef('Revelation 22')).toMatchObject({ book: 'revelation', chapter: 22 });
  });

  test('the provider returns verse-numbered, non-empty text', () => {
    const ch = provider.getChapter({ book: 'john', chapter: 1 });
    expect(ch).not.toBeNull();
    expect(ch!.verses.length).toBeGreaterThan(40); // John 1 has 51 verses
    expect(ch!.verses[0]!.n).toBe(1);
    expect(ch!.verses[0]!.text.length).toBeGreaterThan(0);
  });

  test('out-of-range chapters yield the placeholder state', () => {
    expect(provider.getChapter({ book: 'john', chapter: 99 })).toBeNull();
  });
});
