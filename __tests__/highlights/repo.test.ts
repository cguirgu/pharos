/**
 * Highlights persistence (MemoryRepo): round-trip with JSON anchor, update,
 * delete, per-account isolation, and filtering by source + location.
 */
import { MemoryRepo } from '../../src/db/repo';
import type { Highlight } from '../../src/domain/highlights';

let seq = 0;
function hl(over: Partial<Highlight> & Pick<Highlight, 'textSnapshot' | 'anchor'>): Highlight {
  seq += 1;
  return {
    id: `h${seq}`,
    referenceLabel: 'ref',
    createdAt: seq,
    updatedAt: seq,
    ...over,
  };
}

const scriptureHl = (id: string, book: 'john' | 'mark', chapter: number, verse: number) =>
  hl({
    id,
    textSnapshot: `snap ${id}`,
    anchor: { source: 'scripture', book, chapter, startVerse: verse, startOffset: 0, endVerse: verse, endOffset: 4 },
  });

const synaxHl = (id: string, month: number, day: number) =>
  hl({
    id,
    textSnapshot: `snap ${id}`,
    anchor: { source: 'synaxarium', copticMonth: month, copticDay: day, startOffset: 0, endOffset: 8 },
  });

beforeEach(() => {
  seq = 0;
});

test('upsert → list round-trips the JSON anchor and fields', async () => {
  const repo = new MemoryRepo();
  const h = scriptureHl('x', 'john', 6, 5);
  await repo.upsertHighlight('a', { ...h, note: 'a note', color: 'gold', label: 'tag' });
  const [got] = await repo.listHighlights('a');
  expect(got).toEqual({ ...h, note: 'a note', color: 'gold', label: 'tag' });
  expect(got!.anchor).toMatchObject({ source: 'scripture', book: 'john', chapter: 6, startVerse: 5 });
});

test('update by id replaces in place; list is newest-first', async () => {
  const repo = new MemoryRepo();
  await repo.upsertHighlight('a', scriptureHl('one', 'john', 6, 5));
  await repo.upsertHighlight('a', synaxHl('two', 1, 1));
  await repo.upsertHighlight('a', { ...scriptureHl('one', 'john', 6, 5), note: 'edited', createdAt: 1 });
  const list = await repo.listHighlights('a');
  expect(list.map((h) => h.id)).toEqual(['two', 'one']); // two has higher createdAt
  expect(list.find((h) => h.id === 'one')!.note).toBe('edited');
});

test('delete removes only the targeted highlight', async () => {
  const repo = new MemoryRepo();
  await repo.upsertHighlight('a', scriptureHl('one', 'john', 6, 5));
  await repo.upsertHighlight('a', synaxHl('two', 1, 1));
  await repo.deleteHighlight('a', 'one');
  expect((await repo.listHighlights('a')).map((h) => h.id)).toEqual(['two']);
});

test('highlights are isolated per account', async () => {
  const repo = new MemoryRepo();
  await repo.upsertHighlight('a', scriptureHl('one', 'john', 6, 5));
  expect(await repo.listHighlights('a')).toHaveLength(1);
  expect(await repo.listHighlights('b')).toHaveLength(0);
});

test('filter by source and by scripture location', async () => {
  const repo = new MemoryRepo();
  await repo.upsertHighlight('a', scriptureHl('j', 'john', 6, 5));
  await repo.upsertHighlight('a', scriptureHl('m', 'mark', 1, 2));
  await repo.upsertHighlight('a', synaxHl('s', 1, 1));

  expect((await repo.listHighlights('a', { source: 'synaxarium' })).map((h) => h.id)).toEqual(['s']);
  expect((await repo.listHighlights('a', { book: 'john' })).map((h) => h.id)).toEqual(['j']);
  expect((await repo.listHighlights('a', { book: 'john', chapter: 6 })).map((h) => h.id)).toEqual(['j']);
  expect((await repo.listHighlights('a', { book: 'john', chapter: 99 }))).toHaveLength(0);
  expect((await repo.listHighlights('a', { copticMonth: 1, copticDay: 1 })).map((h) => h.id)).toEqual(['s']);
});
