/**
 * Validates the ingested full Agpeya hours + the registry. STRUCTURE only
 * (section kinds, block shapes, verse numbering) — never asserts/prints prose.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { setAgpeyaHour, getAgpeyaHour, type AgpeyaHour } from '../../src/domain/content/agpeya';

const DIR = join(__dirname, '..', '..', 'content', 'agpeya', 'hours');
const has = existsSync(join(DIR, 'prime.json'));

(has ? describe : describe.skip)('Agpeya full hours', () => {
  beforeAll(() => {
    const prime = JSON.parse(readFileSync(join(DIR, 'prime.json'), 'utf8')) as AgpeyaHour;
    setAgpeyaHour('prime', prime);
  });

  test('Prime has the expected ordered sections', () => {
    const hour = getAgpeyaHour('prime')!;
    expect(hour.name).toBeTruthy();
    const kinds = hour.sections.map((s) => s.kind);
    for (const k of ['introduction', 'thanksgiving', 'psalm50', 'psalms', 'gospel', 'litanies', 'conclusion']) {
      expect(kinds).toContain(k);
    }
  });

  test('every section has a title and at least one block', () => {
    const hour = getAgpeyaHour('prime')!;
    for (const s of hour.sections) {
      expect(s.title.length).toBeGreaterThan(0);
      expect(s.blocks.length).toBeGreaterThan(0);
      for (const b of s.blocks) expect(['text', 'rubric', 'verses']).toContain(b.type);
    }
  });

  test('scripture sections carry verse-numbered text', () => {
    const hour = getAgpeyaHour('prime')!;
    const psalm50 = hour.sections.find((s) => s.kind === 'psalm50')!;
    const verses = psalm50.blocks.find((b) => b.type === 'verses');
    expect(verses && verses.type === 'verses' && verses.verses.length).toBeGreaterThan(0);
    if (verses && verses.type === 'verses') {
      expect(typeof verses.verses[0]!.n).toBe('number');
      expect(verses.verses[0]!.text.length).toBeGreaterThan(0);
    }
  });

  test('the midnight prayer (Matins) carries its three watches, each with its own Litanies', () => {
    const matins = JSON.parse(readFileSync(join(DIR, 'matins.json'), 'utf8')) as AgpeyaHour;
    expect(matins.sections.filter((s) => s.kind === 'litanies')).toHaveLength(3);
    expect(matins.sections.filter((s) => s.kind === 'gospel').length).toBeGreaterThanOrEqual(3);
  });

  test('every day hour presents the Litanies as its own labelled section', () => {
    for (const key of ['prime', 'terce', 'sext', 'none', 'vespers', 'compline']) {
      const hour = JSON.parse(readFileSync(join(DIR, `${key}.json`), 'utf8')) as AgpeyaHour;
      const lit = hour.sections.find((s) => s.kind === 'litanies');
      expect(lit?.title.toLowerCase()).toContain('litan');
      expect((lit?.blocks.length ?? 0)).toBeGreaterThan(0);
    }
  });
});
