/**
 * Selection → anchor mapping (pure). This is the only layer of the native
 * drag-to-select feature that is verifiable without a device — the RN capture
 * (SelectableProse) is exercised manually in Expo Go.
 */
import {
  isEmptySelection,
  normalizeSelection,
  selectedSnapshot,
  scriptureAnchorFromSelection,
  synaxariumAnchorFromSelection,
} from '../../src/domain/highlights/selection';
import { normalizeAnchor, isScripture, isSynaxarium } from '../../src/domain/highlights/highlight';

const VERSE = 'In the beginning was the Word'; // length 29

describe('raw selection helpers', () => {
  test('isEmptySelection flags a caret (start === end)', () => {
    expect(isEmptySelection({ start: 5, end: 5 })).toBe(true);
    expect(isEmptySelection({ start: 0, end: 3 })).toBe(false);
  });

  test('normalizeSelection orders and clamps to [0, len]', () => {
    expect(normalizeSelection({ start: 9, end: 2 }, 20)).toEqual({ start: 2, end: 9 });
    expect(normalizeSelection({ start: -4, end: 100 }, 10)).toEqual({ start: 0, end: 10 });
    expect(normalizeSelection({ start: 5, end: 5 }, 10)).toBeNull(); // empty
  });

  test('selectedSnapshot slices the chosen substring', () => {
    expect(selectedSnapshot(VERSE, { start: 7, end: 16 })).toBe('beginning');
    expect(selectedSnapshot(VERSE, { start: 3, end: 3 })).toBe('');
  });
});

describe('scriptureAnchorFromSelection', () => {
  test('maps a sub-verse selection to a single-verse anchor + substring', () => {
    const built = scriptureAnchorFromSelection({ book: 'john', chapter: 1, verse: 1 }, { start: 7, end: 16 }, VERSE)!;
    expect(built.snapshot).toBe('beginning');
    expect(isScripture(built.anchor) && built.anchor).toMatchObject({
      source: 'scripture',
      book: 'john',
      chapter: 1,
      startVerse: 1,
      startOffset: 7,
      endVerse: 1,
      endOffset: 16,
    });
  });

  test('an inverted selection still yields an ordered anchor', () => {
    const built = scriptureAnchorFromSelection({ book: 'john', chapter: 1, verse: 1 }, { start: 16, end: 7 }, VERSE)!;
    const norm = normalizeAnchor(built.anchor);
    expect(isScripture(norm) && norm.startOffset).toBe(7);
    expect(isScripture(norm) && norm.endOffset).toBe(16);
    expect(built.snapshot).toBe('beginning');
  });

  test('a full-verse selection reproduces the whole-verse save', () => {
    const built = scriptureAnchorFromSelection({ book: 'john', chapter: 1, verse: 1 }, { start: 0, end: VERSE.length }, VERSE)!;
    expect(built.snapshot).toBe(VERSE);
    expect(isScripture(built.anchor) && built.anchor.endOffset).toBe(VERSE.length);
  });

  test('an empty selection returns null (Save disabled)', () => {
    expect(scriptureAnchorFromSelection({ book: 'john', chapter: 1, verse: 1 }, { start: 4, end: 4 }, VERSE)).toBeNull();
  });
});

describe('synaxariumAnchorFromSelection', () => {
  const LIFE = 'On this day the great martyr was crowned.'; // length 41

  test('maps a prose selection to a synaxarium anchor + substring', () => {
    const built = synaxariumAnchorFromSelection({ copticMonth: 1, copticDay: 1 }, { start: 12, end: 23 }, LIFE)!;
    expect(built.snapshot).toBe(LIFE.slice(12, 23));
    expect(isSynaxarium(built.anchor) && built.anchor).toMatchObject({
      source: 'synaxarium',
      copticMonth: 1,
      copticDay: 1,
      startOffset: 12,
      endOffset: 23,
    });
  });

  test('out-of-range offsets clamp into the life string', () => {
    const built = synaxariumAnchorFromSelection({ copticMonth: 2, copticDay: 5 }, { start: -3, end: 999 }, LIFE)!;
    expect(built.snapshot).toBe(LIFE);
    expect(isSynaxarium(built.anchor) && built.anchor.endOffset).toBe(LIFE.length);
  });

  test('an empty selection returns null', () => {
    expect(synaxariumAnchorFromSelection({ copticMonth: 1, copticDay: 1 }, { start: 2, end: 2 }, LIFE)).toBeNull();
  });
});
