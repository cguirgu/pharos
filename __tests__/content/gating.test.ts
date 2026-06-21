/**
 * Content gating — draft (unlicensed) Synaxarium lives are withheld until the
 * content is licensed; feast names (structural facts) always remain.
 */
import { gateLife, saintsOn, type SynaxariumEntry } from '../../src/domain/content/synaxarium';
import { CONTENT_LICENSED } from '../../src/content/flags';
import type { CopticDate } from '../../src/domain/coptic';

const entry: SynaxariumEntry = { copticMonth: 1, copticDay: 1, name: 'The Feast of Nayrouz', life: 'a real life', draft: true };

describe('gateLife', () => {
  test('blanks a draft life only when unlicensed; keeps the name', () => {
    const gated = gateLife(entry, false);
    expect(gated.life).toBe('');
    expect(gated.name).toBe('The Feast of Nayrouz');
  });

  test('licensed content passes through unchanged', () => {
    expect(gateLife(entry, true).life).toBe('a real life');
  });

  test('non-draft (verified) content is never blanked', () => {
    expect(gateLife({ ...entry, draft: false }, false).life).toBe('a real life');
  });
});

describe('saintsOn (shipped flag state)', () => {
  const nayrouz: CopticDate = { year: 1741, month: 1, day: 1, monthName: 'Thout' };

  test('a seeded draft commemoration keeps its name but withholds the life while unlicensed', () => {
    const got = saintsOn(nayrouz);
    expect(got.length).toBeGreaterThan(0);
    expect(got.some((s) => s.name.length > 0)).toBe(true);
    if (!CONTENT_LICENSED) {
      for (const s of got) expect(s.life).toBe('');
    }
  });
});
