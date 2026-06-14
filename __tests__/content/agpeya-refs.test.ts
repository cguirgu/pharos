/**
 * Agpeya scripture-reference wiring: the reference parser, and that the ingested
 * coptic.io references resolve to scripture spans on each office's sections.
 * References only — no prayer prose is asserted or printed.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { parseScriptureRef } from '../../src/domain/content/bible';
import { officeReader, setAgpeyaReferences, type AgpeyaReferences } from '../../src/domain/content/agpeya';

describe('parseScriptureRef', () => {
  test.each([
    ['Psalm 50', { book: 'psalms', chapter: 50 }],
    ['John 1:1-17', { book: 'john', chapter: 1, fromVerse: 1, toVerse: 17 }],
    ['Matthew 5:3', { book: 'matthew', chapter: 5, fromVerse: 3 }],
  ])('%s', (label, expected) => {
    expect(parseScriptureRef(label)).toMatchObject(expected);
  });

  test('unparseable labels → null', () => {
    expect(parseScriptureRef('The Litanies')).toBeNull();
  });
});

const FILE = join(__dirname, '..', '..', 'content', 'agpeya', 'references.json');

(existsSync(FILE) ? describe : describe.skip)('Agpeya references (ingested)', () => {
  beforeAll(() => setAgpeyaReferences(JSON.parse(readFileSync(FILE, 'utf8')) as AgpeyaReferences));
  afterAll(() => setAgpeyaReferences(null));

  test('Prime carries Psalm 50, a list of Psalms, and a Gospel as scripture spans', () => {
    const { sections } = officeReader('prime');
    const psalm50 = sections.find((s) => s.kind === 'psalm50');
    const psalms = sections.find((s) => s.kind === 'psalms');
    const gospel = sections.find((s) => s.kind === 'gospel');
    expect(psalm50?.refs?.[0]).toMatchObject({ book: 'psalms', chapter: 50 });
    expect((psalms?.refs?.length ?? 0)).toBeGreaterThan(0);
    expect(gospel?.refs?.[0]?.book).toBe('john');
    // prose sections still have no refs (placeholder until permitted source)
    expect(sections.find((s) => s.kind === 'litanies')?.refs).toBeUndefined();
  });

  test('without references, sections fall back to placeholders', () => {
    setAgpeyaReferences(null);
    const { sections } = officeReader('prime');
    expect(sections.every((s) => s.refs === undefined)).toBe(true);
  });
});
