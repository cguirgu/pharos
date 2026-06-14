/**
 * useHighlights store (MemoryRepo): CRUD newest-first, label computation,
 * per-account isolation, search/forVerse selectors, and clear().
 */
import { useHighlights } from '../../src/state/highlights';
import { MemoryRepo, setRepo } from '../../src/db/repo';
import type { HighlightAnchor } from '../../src/domain/highlights';

const verse = (v: number): HighlightAnchor => ({
  source: 'scripture',
  book: 'john',
  chapter: 6,
  startVerse: v,
  startOffset: 0,
  endVerse: v,
  endOffset: 4,
});

beforeEach(() => {
  setRepo(new MemoryRepo());
  useHighlights.getState().clear();
});

test('create, update, list newest-first, and remove', async () => {
  const h = useHighlights.getState();
  await h.load('a');
  const id1 = await h.save({ anchor: verse(5), textSnapshot: 'first' });
  await h.save({ anchor: verse(6), textSnapshot: 'second' });
  expect(useHighlights.getState().items.map((x) => x.textSnapshot)).toEqual(['second', 'first']);

  await h.save({ id: id1, anchor: verse(5), textSnapshot: 'first', note: 'edited' });
  expect(useHighlights.getState().get(id1)?.note).toBe('edited');

  await h.remove(id1);
  expect(useHighlights.getState().items.map((x) => x.textSnapshot)).toEqual(['second']);
});

test('save returns an id and computes the reference label', async () => {
  await useHighlights.getState().load('a');
  const id = await useHighlights.getState().save({ anchor: verse(5), textSnapshot: 'x' });
  expect(id).toBeTruthy();
  expect(useHighlights.getState().get(id)?.referenceLabel).toBe('John 6:5');
});

test('an explicit referenceLabel is preserved (e.g. with a saint name)', async () => {
  await useHighlights.getState().load('a');
  const anchor: HighlightAnchor = { source: 'synaxarium', copticMonth: 1, copticDay: 1, startOffset: 0, endOffset: 5 };
  const id = await useHighlights.getState().save({ anchor, textSnapshot: 'x', referenceLabel: 'Thout 1 · Nayrouz' });
  expect(useHighlights.getState().get(id)?.referenceLabel).toBe('Thout 1 · Nayrouz');
});

test('highlights are isolated per account', async () => {
  const repo = new MemoryRepo();
  setRepo(repo);
  await useHighlights.getState().load('a');
  await useHighlights.getState().save({ anchor: verse(5), textSnapshot: 'mine' });
  expect(await repo.listHighlights('a')).toHaveLength(1);
  expect(await repo.listHighlights('b')).toHaveLength(0);
  await useHighlights.getState().load('b');
  expect(useHighlights.getState().items).toHaveLength(0);
});

test('search and forVerse selectors', async () => {
  const h = useHighlights.getState();
  await h.load('a');
  const span7to9: HighlightAnchor = {
    source: 'scripture',
    book: 'john',
    chapter: 6,
    startVerse: 7,
    startOffset: 0,
    endVerse: 9,
    endOffset: 4,
  };
  await h.save({ anchor: verse(5), textSnapshot: 'living bread', note: 'manna' });
  await h.save({ anchor: span7to9, textSnapshot: 'loaves and fishes' });

  expect(useHighlights.getState().search('bread').map((hit) => hit.highlight.textSnapshot)).toEqual(['living bread']);
  // verse(7) span covers 7–9, so verse 8 is covered
  expect(useHighlights.getState().forVerse('john', 6, 8).map((x) => x.textSnapshot)).toEqual(['loaves and fishes']);
  expect(useHighlights.getState().forVerse('john', 6, 5).map((x) => x.textSnapshot)).toEqual(['living bread']);
});

test('clear empties state', async () => {
  await useHighlights.getState().load('a');
  await useHighlights.getState().save({ anchor: verse(5), textSnapshot: 'x' });
  useHighlights.getState().clear();
  expect(useHighlights.getState().items).toEqual([]);
  expect(useHighlights.getState().accountId).toBeNull();
});
