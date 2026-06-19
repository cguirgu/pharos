/**
 * Highlight search — ranking, AND semantics, diacritic-insensitivity, filters,
 * and deterministic ordering. Pure.
 */
import { searchHighlights, normalizeText, type Highlight } from '../../src/domain/highlights';

let seq = 0;
function hl(over: Partial<Highlight> & Pick<Highlight, 'textSnapshot'>): Highlight {
  seq += 1;
  return {
    id: `h${seq}`,
    anchor: { source: 'scripture', book: 'john', chapter: 6, startVerse: seq, startOffset: 0, endVerse: seq, endOffset: 5 },
    referenceLabel: `John 6:${seq}`,
    createdAt: seq, // ascending mint order; newest = highest
    updatedAt: seq,
    ...over,
  };
}

beforeEach(() => {
  seq = 0;
});

describe('normalizeText', () => {
  test('strips diacritics and lowercases', () => {
    expect(normalizeText('Nayroûz')).toBe('nayrouz');
  });
});

describe('searchHighlights', () => {
  test('empty query returns all, newest-first', () => {
    const a = hl({ textSnapshot: 'first' });
    const b = hl({ textSnapshot: 'second' });
    const hits = searchHighlights([a, b], '');
    expect(hits.map((h) => h.highlight.id)).toEqual([b.id, a.id]);
  });

  test('reference match outranks note match outranks snapshot match', () => {
    const inRef = hl({ textSnapshot: 'nothing here', referenceLabel: 'bread of life', note: 'x' });
    const inNote = hl({ textSnapshot: 'nothing here', referenceLabel: 'John 6:2', note: 'bread basket' });
    const inSnap = hl({ textSnapshot: 'give us bread', referenceLabel: 'John 6:3', note: 'x' });
    const hits = searchHighlights([inSnap, inNote, inRef], 'bread');
    expect(hits.map((h) => h.highlight.id)).toEqual([inRef.id, inNote.id, inSnap.id]);
    expect(hits[0]!.field).toBe('reference');
    expect(hits[1]!.field).toBe('note');
    expect(hits[2]!.field).toBe('snapshot');
  });

  test('multi-term uses AND semantics', () => {
    const both = hl({ textSnapshot: 'the living bread came down' });
    const one = hl({ textSnapshot: 'bread alone' });
    const hits = searchHighlights([both, one], 'living bread');
    expect(hits.map((h) => h.highlight.id)).toEqual([both.id]);
  });

  test('diacritic-insensitive match', () => {
    const item = hl({ textSnapshot: 'x', referenceLabel: 'Thout 1 · Feast of Nayroûz' });
    const hits = searchHighlights([item], 'nayrouz');
    expect(hits).toHaveLength(1);
  });

  test('source / book / color filters', () => {
    const sJohn = hl({ textSnapshot: 'a', color: 'gold' });
    const sMark = hl({
      textSnapshot: 'a',
      anchor: { source: 'scripture', book: 'mark', chapter: 1, startVerse: 1, startOffset: 0, endVerse: 1, endOffset: 1 },
      color: 'sky',
    });
    const syn = hl({
      textSnapshot: 'a',
      anchor: { source: 'synaxarium', copticMonth: 1, copticDay: 1, startOffset: 0, endOffset: 3 },
      color: 'gold',
    });
    const all = [sJohn, sMark, syn];
    expect(searchHighlights(all, '', { source: 'synaxarium' }).map((h) => h.highlight.id)).toEqual([syn.id]);
    expect(searchHighlights(all, '', { book: 'mark' }).map((h) => h.highlight.id)).toEqual([sMark.id]);
    expect(
      searchHighlights(all, '', { color: 'gold' }).map((h) => h.highlight.id).sort(),
    ).toEqual([sJohn.id, syn.id].sort());
  });

  test('equal scores break ties by createdAt desc (deterministic)', () => {
    const older = hl({ textSnapshot: 'bread', createdAt: 1 });
    const newer = hl({ textSnapshot: 'bread', createdAt: 2 });
    const hits = searchHighlights([older, newer], 'bread');
    expect(hits.map((h) => h.highlight.id)).toEqual([newer.id, older.id]);
  });
});
