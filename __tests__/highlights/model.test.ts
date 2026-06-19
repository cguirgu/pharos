/**
 * Highlight domain model — label building, anchor normalization, verse coverage,
 * and type guards. Pure; no repo.
 */
import {
  anchorCoversVerse,
  highlightRefLabel,
  isScripture,
  isSynaxarium,
  normalizeAnchor,
  type ScriptureAnchor,
  type SynaxariumAnchor,
} from '../../src/domain/highlights';

const scripture = (over: Partial<ScriptureAnchor> = {}): ScriptureAnchor => ({
  source: 'scripture',
  book: 'john',
  chapter: 6,
  startVerse: 5,
  startOffset: 0,
  endVerse: 5,
  endOffset: 10,
  ...over,
});

const synax = (over: Partial<SynaxariumAnchor> = {}): SynaxariumAnchor => ({
  source: 'synaxarium',
  copticMonth: 1,
  copticDay: 1,
  startOffset: 0,
  endOffset: 20,
  ...over,
});

describe('highlightRefLabel', () => {
  test('single scripture verse', () => {
    expect(highlightRefLabel(scripture())).toBe('John 6:5');
  });
  test('scripture verse range uses en-dash', () => {
    expect(highlightRefLabel(scripture({ endVerse: 7 }))).toBe('John 6:5–7');
  });
  test('synaxarium uses coptic month name + day', () => {
    expect(highlightRefLabel(synax())).toBe('Thout 1');
  });
  test('synaxarium appends saint name when provided', () => {
    expect(highlightRefLabel(synax(), 'Feast of Nayrouz')).toBe('Thout 1 · Feast of Nayrouz');
  });
});

describe('normalizeAnchor', () => {
  test('reorders an inverted scripture span', () => {
    const a = normalizeAnchor(scripture({ startVerse: 7, startOffset: 3, endVerse: 5, endOffset: 1 }));
    expect(a).toMatchObject({ startVerse: 5, startOffset: 1, endVerse: 7, endOffset: 3 });
  });
  test('reorders offsets within the same scripture verse', () => {
    const a = normalizeAnchor(scripture({ startOffset: 9, endOffset: 2 }));
    expect(a).toMatchObject({ startOffset: 2, endOffset: 9 });
  });
  test('clamps negative scripture coordinates', () => {
    const a = normalizeAnchor(scripture({ startVerse: -3, startOffset: -10 }));
    expect(a).toMatchObject({ startVerse: 1, startOffset: 0 });
  });
  test('reorders and clamps synaxarium offsets', () => {
    const a = normalizeAnchor(synax({ startOffset: 30, endOffset: -5 }));
    expect(a).toMatchObject({ startOffset: 0, endOffset: 30 });
  });
});

describe('anchorCoversVerse', () => {
  const a = scripture({ startVerse: 5, endVerse: 7 });
  test('true at the range edges', () => {
    expect(anchorCoversVerse(a, 'john', 6, 5)).toBe(true);
    expect(anchorCoversVerse(a, 'john', 6, 7)).toBe(true);
  });
  test('false just outside the range / wrong book / wrong chapter', () => {
    expect(anchorCoversVerse(a, 'john', 6, 4)).toBe(false);
    expect(anchorCoversVerse(a, 'john', 6, 8)).toBe(false);
    expect(anchorCoversVerse(a, 'mark', 6, 6)).toBe(false);
    expect(anchorCoversVerse(a, 'john', 7, 6)).toBe(false);
  });
  test('synaxarium anchors never cover a verse', () => {
    expect(anchorCoversVerse(synax(), 'john', 6, 5)).toBe(false);
  });
});

describe('type guards', () => {
  test('discriminate on source', () => {
    expect(isScripture(scripture())).toBe(true);
    expect(isSynaxarium(scripture())).toBe(false);
    expect(isSynaxarium(synax())).toBe(true);
    expect(isScripture(synax())).toBe(false);
  });
});
