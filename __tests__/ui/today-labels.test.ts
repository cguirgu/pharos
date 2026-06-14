/**
 * Golden-date UI-string test for the Today screen. Asserts the exact strings the
 * screen renders — the folio liturgical label, the fast banner name, and the
 * ruling line — by calling the same helpers Today uses. This verifies the
 * engine→UI text path deterministically (the RNTL renderer is not yet wired for
 * RN 0.85 / React 19 new-arch in jest — see TESTING.md).
 */
import { getDayInfo } from '../../src/domain/coptic';
import { liturgicalLabel, folioDate, practiceSubtitle } from '../../src/ui/format';
import type { CivilDate } from '../../src/domain/coptic';
import type { Practice } from '../../src/domain/rule';

const D = (year: number, month: number, day: number): CivilDate => ({ year, month, day });

describe('Today labels — kickoff golden dates', () => {
  test("2026-06-10 — Apostles' Fast, vegan ruling", () => {
    const info = getDayInfo(D(2026, 6, 10));
    expect(liturgicalLabel(info)).toBe("Day 10 · Apostles' Fast");
    expect(info.season?.name).toBe("Apostles' Fast");
    expect(info.fast.level).toBe('fast');
    expect(info.fast.ruling).toMatch(/vegan fare/);
  });

  test('2026-04-12 — the Resurrection (Pascha), no fast', () => {
    const info = getDayInfo(D(2026, 4, 12));
    expect(liturgicalLabel(info)).toMatch(/Resurrection|Pascha/);
    expect(info.fast.level).toBe('none');
  });

  test('2026-04-29 — Holy Fifty Wednesday shows NO fast', () => {
    const info = getDayInfo(D(2026, 4, 29));
    expect(info.season?.key).toBe('holy-fifty');
    expect(info.fast.level).toBe('none');
    expect(info.fast.ruling).not.toMatch(/vegan fare|strict fast/);
  });

  test('2026-12-25 — the Nativity Fast', () => {
    const info = getDayInfo(D(2026, 12, 25));
    expect(liturgicalLabel(info)).toBe('Day 31 · The Nativity Fast');
    expect(info.fast.level).toBe('fast');
  });

  test('2026-09-11 — Nayrouz', () => {
    const info = getDayInfo(D(2026, 9, 11));
    expect(liturgicalLabel(info)).toMatch(/Nayrouz/);
  });
});

describe('formatting helpers', () => {
  test('folioDate reads in the codex voice', () => {
    expect(folioDate(D(2026, 6, 10))).toBe('Wednesday · the tenth of June');
  });

  test('practiceSubtitle summarises cadence + measure', () => {
    const count: Practice = {
      id: 'p', createdAt: 0, name: 'Jesus Prayer', category: 'prayer', kind: 'custom',
      cadence: { type: 'daily' }, measure: 'count', target: 50, state: 'active', sortOrder: 0,
    };
    expect(practiceSubtitle(count)).toBe('Every day · 50');
  });
});
