/**
 * Citations across all three corpora: labels, the new office anchor, and the
 * route-param codec — which must never throw, since a malformed link should
 * mean "an uncited question", not a crashed composer.
 */
import {
  citationFromSelection,
  citationRefLabel,
  decodeCitation,
  encodeCitation,
  isCitationAnchor,
  isOfficeAnchor,
  normalizeCitationAnchor,
  officeAnchorFromSelection,
  type Citation,
  type OfficeAnchor,
} from '../../src/domain/citation';
import { LIMITS } from '../../src/domain/limits';

const VERSE = 'Except ye eat the flesh of the Son of man, ye have no life in you.';
const LIFE = 'She left her home and followed the Theban legion.';
const PRAYER = 'Have mercy upon me, O God, according to thy lovingkindness.';

describe('labels', () => {
  it('labels a scripture citation as the highlights feature does', () => {
    const c = citationFromSelection({ source: 'scripture', book: 'john', chapter: 6, verse: 53 }, { start: 0, end: 6 }, VERSE);
    expect(c?.referenceLabel).toBe('John 6:53');
  });

  it('labels a synaxarium citation, with and without the saint', () => {
    const anchor = { source: 'synaxarium', copticMonth: 1, copticDay: 12, startOffset: 0, endOffset: 3 } as const;
    expect(citationRefLabel(anchor)).toBe('Thout 12');
    expect(citationRefLabel(anchor, { saintName: 'St Verena' })).toBe('Thout 12 · St Verena');
  });

  it('labels an office citation by hour and section', () => {
    const anchor: OfficeAnchor = {
      source: 'office',
      officeKey: 'matins',
      sectionId: 'psalm50',
      blockIndex: 0,
      startOffset: 0,
      endOffset: 5,
    };
    expect(citationRefLabel(anchor, { officeName: 'Matins', sectionTitle: 'Psalm 50' })).toBe('Matins · Psalm 50');
    // Falls back to the key rather than rendering "undefined".
    expect(citationRefLabel(anchor)).toBe('matins');
  });
});

describe('office selection', () => {
  it('builds an anchor and the exact snapshot', () => {
    const built = officeAnchorFromSelection(
      { officeKey: 'prime', sectionId: 'psalm50-3', blockIndex: 2 },
      { start: 0, end: 10 },
      PRAYER,
    );
    expect(built?.snapshot).toBe('Have mercy');
    expect(built?.anchor.sectionId).toBe('psalm50-3');
    expect(built?.anchor.blockIndex).toBe(2);
    expect(isOfficeAnchor(built!.anchor)).toBe(true);
  });

  it('returns null for an empty selection, and clamps a reversed one', () => {
    expect(officeAnchorFromSelection({ officeKey: 'sext', sectionId: 's', blockIndex: 0 }, { start: 4, end: 4 }, PRAYER)).toBeNull();
    const reversed = officeAnchorFromSelection({ officeKey: 'sext', sectionId: 's', blockIndex: 0 }, { start: 10, end: 0 }, PRAYER);
    expect(reversed?.snapshot).toBe('Have mercy');
  });

  it('clamps a selection running past the end of the text', () => {
    const built = officeAnchorFromSelection({ officeKey: 'none', sectionId: 's', blockIndex: 0 }, { start: 0, end: 9_999 }, PRAYER);
    expect(built?.snapshot).toBe(PRAYER);
    expect(built?.anchor.endOffset).toBe(PRAYER.length);
  });
});

describe('citationFromSelection', () => {
  it('handles all three corpora', () => {
    expect(citationFromSelection({ source: 'scripture', book: 'john', chapter: 6, verse: 53 }, { start: 0, end: 6 }, VERSE)?.anchor.source).toBe('scripture');
    expect(citationFromSelection({ source: 'synaxarium', copticMonth: 1, copticDay: 12 }, { start: 0, end: 3 }, LIFE)?.anchor.source).toBe('synaxarium');
    expect(citationFromSelection({ source: 'office', officeKey: 'matins', sectionId: 's', blockIndex: 0 }, { start: 0, end: 4 }, PRAYER)?.anchor.source).toBe('office');
  });

  it('clamps an over-long snapshot at build time', () => {
    const long = 'x'.repeat(LIMITS.citationSnapshot + 500);
    const c = citationFromSelection({ source: 'office', officeKey: 'matins', sectionId: 's', blockIndex: 0 }, { start: 0, end: long.length }, long);
    expect(c?.textSnapshot).toHaveLength(LIMITS.citationSnapshot);
  });

  it('returns null when nothing is selected', () => {
    expect(citationFromSelection({ source: 'scripture', book: 'john', chapter: 6, verse: 1 }, { start: 2, end: 2 }, VERSE)).toBeNull();
  });
});

describe('normalizeCitationAnchor', () => {
  it('orders and clamps an office anchor', () => {
    const messy: OfficeAnchor = {
      source: 'office',
      officeKey: 'terce',
      sectionId: 's',
      blockIndex: -3,
      startOffset: 40,
      endOffset: 10,
    };
    const n = normalizeCitationAnchor(messy) as OfficeAnchor;
    expect([n.startOffset, n.endOffset]).toEqual([10, 40]);
    expect(n.blockIndex).toBe(0);
  });

  it('leaves the two highlight anchors behaving exactly as before', () => {
    const scripture = {
      source: 'scripture',
      book: 'john',
      chapter: 6,
      startVerse: 7,
      startOffset: 0,
      endVerse: 5,
      endOffset: 3,
    } as const;
    const n = normalizeCitationAnchor(scripture);
    expect(n).toMatchObject({ source: 'scripture', startVerse: 5, endVerse: 7 });
  });
});

describe('codec', () => {
  const citation: Citation = {
    anchor: { source: 'office', officeKey: 'matins', sectionId: 'psalm50', blockIndex: 0, startOffset: 0, endOffset: 10 },
    textSnapshot: 'Have mercy',
    referenceLabel: 'Matins · Psalm 50',
  };

  it('round-trips', () => {
    expect(decodeCitation(encodeCitation(citation))).toEqual(citation);
  });

  it('round-trips a snapshot full of URL-hostile characters', () => {
    const awkward: Citation = { ...citation, textSnapshot: 'a & b # c ? d + e /f' };
    expect(decodeCitation(encodeCitation(awkward))?.textSnapshot).toBe(awkward.textSnapshot);
  });

  it('tolerates a double-encoded param', () => {
    expect(decodeCitation(encodeURIComponent(encodeCitation(citation)))).toEqual(citation);
  });

  it('never throws — it returns null for anything unusable', () => {
    for (const bad of [undefined, null, '', 'not json', '{', '[]', '{"anchor":{"source":"nope"}}', '{"anchor":{"source":"office"}}', '"a string"', '42']) {
      expect(() => decodeCitation(bad as string | undefined)).not.toThrow();
      expect(decodeCitation(bad as string | undefined)).toBeNull();
    }
  });

  it('clamps an over-long snapshot arriving from a link', () => {
    const raw = JSON.stringify({ ...citation, textSnapshot: 'y'.repeat(LIMITS.citationSnapshot + 100) });
    expect(decodeCitation(raw)?.textSnapshot).toHaveLength(LIMITS.citationSnapshot);
  });

  it('recognises all three anchor kinds and nothing else', () => {
    expect(isCitationAnchor({ source: 'scripture' })).toBe(true);
    expect(isCitationAnchor({ source: 'synaxarium' })).toBe(true);
    expect(isCitationAnchor({ source: 'office' })).toBe(true);
    expect(isCitationAnchor({ source: 'journal' })).toBe(false);
    expect(isCitationAnchor(null)).toBe(false);
  });
});
