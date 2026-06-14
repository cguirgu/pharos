/**
 * Validates the ingested public-domain KJV data + the ScriptureProvider contract
 * by wiring a filesystem loader to `content/bible/kjv/`. Asserts STRUCTURE only
 * (chapter/verse counts, non-empty text) — never prints scripture text.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { makeScriptureProvider, BOOKS, type BookId } from '../../src/domain/content/bible';

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

  test('book chapter counts match the structural metadata', () => {
    for (const id of ['matthew', 'mark', 'luke', 'john', 'psalms'] as BookId[]) {
      const book = load(id);
      expect(book?.chapters.length).toBe(BOOKS[id].chapters);
    }
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
