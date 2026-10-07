/**
 * Content gating — draft (unlicensed) Synaxarium lives are withheld until the
 * content is licensed; feast names (structural facts) always remain.
 */
import {
  gateLife,
  gateDayLife,
  hasLife,
  saintsOn,
  synaxariumDay,
  commemorationsOn,
  type SynaxariumEntry,
  type SynaxariumDay,
} from '../../src/domain/content/synaxarium';
import { CONTENT_LICENSED, SYNAXARIUM_NAMES } from '../../src/content/flags';
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

/**
 * The two tiers are independent: tier 1 (which saints fall on which day) is a
 * calendar of facts and always renders; tier 2 (the narrative account) is
 * copyrighted expression and is withheld until permission lands.
 */
describe('two-tier gating', () => {
  const nayrouz: CopticDate = { year: 1741, month: 1, day: 1, monthName: 'Thout' };
  const day: SynaxariumDay = {
    copticMonth: 1,
    copticDay: 1,
    commemorations: ['The Feast of Nayrouz', 'The Martyrdom of St. Anonymous'],
    life: 'a real account',
    draft: true,
  };

  test.each([
    [true, true],
    [true, false],
    [false, true],
    [false, false],
  ])('gateDayLife(draft=%s, licensed=%s) never touches the commemorations', (draft, licensed) => {
    const gated = gateDayLife({ ...day, draft }, licensed);
    expect(gated.commemorations).toEqual(day.commemorations);
  });

  test('the account survives only when licensed or already verified', () => {
    expect(gateDayLife(day, true).life).toBe('a real account');
    expect(gateDayLife(day, false).life).toBe('');
    expect(gateDayLife({ ...day, draft: false }, false).life).toBe('a real account');
  });

  test('hasLife is false for a withheld account, true for a granted one', () => {
    expect(hasLife(gateDayLife(day, false))).toBe(false);
    expect(hasLife(gateDayLife(day, true))).toBe(true);
    expect(hasLife(null)).toBe(false);
    expect(hasLife({ ...day, life: '   ' })).toBe(false); // whitespace is not an account
  });

  test('TIER 1 renders — a seeded feast resolves whatever the flags say', () => {
    // Nayrouz is seeded in-project, so it survives even the kill switch: the
    // app is never left with a blank commemoration surface.
    expect(commemorationsOn(nayrouz).length).toBeGreaterThan(0);
    expect(commemorationsOn(nayrouz).every((c) => c.length > 0)).toBe(true);
  });

  test('TIER 1 is on in the shipped configuration', () => {
    expect(SYNAXARIUM_NAMES).toBe(true);
  });

  test('TIER 2 is withheld in the DOMAIN, so no UI condition can leak it', () => {
    if (CONTENT_LICENSED) return;
    // The strongest claim in this suite: the prose is gone before any screen
    // sees it. A missing `CONTENT_LICENSED &&` in a component cannot expose it.
    expect(synaxariumDay(nayrouz)!.life).toBe('');
    expect(hasLife(synaxariumDay(nayrouz))).toBe(false);
    expect(saintsOn(nayrouz).every((s) => s.life === '')).toBe(true);
  });
});
