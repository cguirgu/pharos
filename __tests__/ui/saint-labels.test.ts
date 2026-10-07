/**
 * The engine→UI string path for the Saint-of-the-day screen, verified without a
 * renderer (see today-labels.test.ts for why). Exercises exactly the helpers
 * `app/saint/[date].tsx` calls: route-key parsing, day navigation, the folio and
 * Coptic date lines, and the commemoration list.
 *
 * Structure only — no bundled Synaxarium text is asserted or printed.
 */
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { getDayInfo, addDays } from '../../src/domain/coptic';
import { parseDateKey, dateKey } from '../../src/domain/rule';
import { folioDate } from '../../src/ui/format';
import { copy } from '../../src/ui/copy';
import { CONTENT_LICENSED, SYNAXARIUM_NAMES } from '../../src/content/flags';
import {
  setSynaxariumData,
  commemorationsOn,
  synaxariumDay,
  type SynaxariumDataset,
} from '../../src/domain/content/synaxarium';
import type { CivilDate } from '../../src/domain/coptic';

const D = (year: number, month: number, day: number): CivilDate => ({ year, month, day });
const FILE = join(__dirname, '..', '..', 'content', 'synaxarium', 'synaxarium.json');
const hasData = existsSync(FILE);

describe('route key parsing (the `[date]` param)', () => {
  test('round-trips through dateKey', () => {
    for (const d of [D(2026, 9, 11), D(2026, 1, 7), D(2027, 12, 31)]) {
      expect(parseDateKey(dateKey(d))).toEqual(d);
    }
  });

  test.each([
    ['garbage'],
    [''],
    ['2026-9-11'], // unpadded
    ['2026-13-01'], // no thirteenth Gregorian month
    ['2026-00-10'],
    ['2026-01-32'],
    ['2026-01-10T00:00:00Z'],
  ])('rejects %p so the screen can fall back to today', (key) => {
    expect(parseDateKey(key)).toBeNull();
  });
});

describe('day navigation', () => {
  test('steps across a month boundary', () => {
    expect(dateKey(addDays(D(2026, 9, 30), 1))).toBe('2026-10-01');
    expect(dateKey(addDays(D(2026, 10, 1), -1))).toBe('2026-09-30');
  });

  test('steps across a year boundary', () => {
    expect(dateKey(addDays(D(2026, 12, 31), 1))).toBe('2027-01-01');
  });
});

describe('the header lines', () => {
  test('2026-09-11 — Nayrouz, 1 Thout, Anno Martyrum 1743', () => {
    const info = getDayInfo(D(2026, 9, 11));
    expect(folioDate(D(2026, 9, 11))).toBe('Friday · the eleventh of September');
    expect(info.coptic.day).toBe(1);
    expect(info.coptic.monthName).toBe('Thout');
    expect(info.coptic.year).toBe(1743);
  });
});

describe('copy discipline', () => {
  test('no saint-screen string is a placeholder', () => {
    // Guideline 2.1: a reachable "⟨ … ⟩" stub is what got the last build held.
    for (const value of Object.values(copy.saint)) {
      expect(typeof value).toBe('string');
      expect(value as string).not.toContain('⟨');
    }
  });

  test('the source line names the translation', () => {
    expect(copy.saint.source).toMatch(/Synaxarium/);
    expect(copy.saint.source).toMatch(/St\. George/);
  });
});

(hasData && SYNAXARIUM_NAMES ? describe : describe.skip)('the commemoration list, on golden dates', () => {
  beforeAll(() => setSynaxariumData(JSON.parse(readFileSync(FILE, 'utf8')) as SynaxariumDataset));
  afterAll(() => setSynaxariumData(null));

  test.each([
    ['Nayrouz', D(2026, 9, 11)],
    ['Nativity', D(2027, 1, 7)],
    ['Pascha', D(2026, 4, 12)],
    ["Apostles' Fast", D(2026, 6, 10)],
    ['Nativity Fast', D(2026, 12, 25)],
  ])('%s renders at least one commemoration', (_name, civil) => {
    const info = getDayInfo(civil as CivilDate);
    const list = commemorationsOn(info.coptic);
    expect(list.length).toBeGreaterThan(0);
    expect(list.every((c) => c.trim().length > 0)).toBe(true);
  });

  test('a week of days each render, and the account follows the licence flag', () => {
    for (let i = -3; i <= 3; i++) {
      const info = getDayInfo(addDays(D(2026, 9, 11), i));
      const day = synaxariumDay(info.coptic);
      expect(day).not.toBeNull();
      // Tier 1 holds regardless of the flag — that is the whole point.
      expect(day!.commemorations.length).toBeGreaterThan(0);
      // Tier 2 is exactly as licensed: withheld while pending, present once granted.
      if (CONTENT_LICENSED) expect(day!.life.length).toBeGreaterThan(0);
      else expect(day!.life).toBe('');
    }
  });
});
