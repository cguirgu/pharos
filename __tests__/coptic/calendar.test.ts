import {
  getDayInfo,
  orthodoxPascha,
  toCoptic,
  fromCoptic,
  isCopticLeapYear,
  copticMonthLength,
  seasonOn,
  fastingOn,
  primaryFeast,
  isMajorLordFeast,
  isFastDay,
  addDays,
  weekday,
} from '../../src/domain/coptic';
import type { CivilDate } from '../../src/domain/coptic';

const D = (year: number, month: number, day: number): CivilDate => ({ year, month, day });
const PASCHA_2026 = D(2026, 4, 12);

describe('Orthodox Pascha — golden anchors (PRD §3)', () => {
  test.each([
    [2024, D(2024, 5, 5)],
    [2025, D(2025, 4, 20)],
    [2026, D(2026, 4, 12)],
    [2027, D(2027, 5, 2)],
  ])('Pascha %i', (year, expected) => {
    expect(orthodoxPascha(year)).toEqual(expected);
    expect(weekday(orthodoxPascha(year))).toBe(0); // always a Sunday
  });
});

describe('Coptic conversion — Anno Martyrum anchors', () => {
  // NB: PRD §3 example says 1 Thout 1741 AM = Sept 12, 2024, but that contradicts
  // the rule it states (Sept 12 only in the year *preceding* a Gregorian leap year).
  // Standard computus gives Sept 11, 2024. Flagged in TESTING.md.
  test.each([
    [D(2024, 9, 11), 1741],
    [D(2025, 9, 11), 1742],
    [D(2026, 9, 11), 1743],
    [D(2027, 9, 12), 1744], // shifts to the 12th: 1743 AM is a Coptic leap year
  ])('1 Thout on %o is AM %i', (greg, am) => {
    const c = toCoptic(greg);
    expect([c.month, c.day]).toEqual([1, 1]);
    expect(c.year).toBe(am);
    expect(c.monthName).toBe('Thout');
  });

  test('fixed Coptic feast dates (2026)', () => {
    expect(toCoptic(D(2026, 1, 7))).toMatchObject({ month: 4, day: 29 }); // Nativity = Koiak 29
    expect(toCoptic(D(2026, 1, 19))).toMatchObject({ month: 5, day: 11 }); // Theophany = Tobi 11
    expect(toCoptic(D(2026, 4, 7))).toMatchObject({ month: 7, day: 29 }); // Annunciation = Paremhat 29
  });

  test('Gregorian ↔ Coptic round-trips every day across 2024–2027', () => {
    for (let j = 0; j < 1461; j++) {
      const g = addDays(D(2024, 1, 1), j);
      const c = toCoptic(g);
      expect(fromCoptic(c.year, c.month, c.day)).toEqual(g);
    }
  });

  test('Coptic leap years (year % 4 === 3) and the little month', () => {
    expect(isCopticLeapYear(1743)).toBe(true); // 1743 % 4 === 3
    expect(isCopticLeapYear(1742)).toBe(false);
    expect(isCopticLeapYear(1741)).toBe(false);
    expect(copticMonthLength(1743, 13)).toBe(6); // Pi Kogi Enavot, leap
    expect(copticMonthLength(1742, 13)).toBe(5); // common
    expect(copticMonthLength(1742, 4)).toBe(30); // ordinary month
  });
});

describe('Season boundaries — 2026 (Pascha = 12 Apr)', () => {
  const expectSeason = (date: CivilDate, key: string | null) =>
    expect(seasonOn(date)?.key ?? null).toBe(key);

  test('Fast of Nineveh is Mon–Wed, two weeks before Lent', () => {
    expectSeason(D(2026, 2, 1), null);
    expectSeason(D(2026, 2, 2), 'nineveh'); // Mon
    expectSeason(D(2026, 2, 4), 'nineveh'); // Wed
    expectSeason(D(2026, 2, 5), null);
    expect(seasonOn(D(2026, 2, 2))).toMatchObject({ dayNumber: 1, total: 3 });
  });

  test('Great Lent: 55 days [Feb 16 … Apr 11], begins on a Monday', () => {
    expectSeason(D(2026, 2, 15), null);
    expectSeason(D(2026, 2, 16), 'great-lent');
    expect(weekday(D(2026, 2, 16))).toBe(1); // Monday
    expect(seasonOn(D(2026, 2, 16))).toMatchObject({ dayNumber: 1, total: 55 });
    expect(seasonOn(D(2026, 4, 11))).toMatchObject({ dayNumber: 55, total: 55 });
    expect(seasonOn(D(2026, 4, 11))?.inHolyWeek).toBe(true);
    expectSeason(D(2026, 4, 12), 'holy-fifty'); // Pascha — Lent has ended
  });

  test('Holy Fifty: [Apr 12 … May 31]', () => {
    expect(seasonOn(PASCHA_2026)).toMatchObject({ key: 'holy-fifty', dayNumber: 1, total: 50 });
    expect(seasonOn(D(2026, 5, 31))).toMatchObject({ key: 'holy-fifty', dayNumber: 50 });
    expectSeason(D(2026, 6, 1), 'apostles');
  });

  test("Apostles' Fast: [Jun 1 … Jul 11], fish allowed", () => {
    expect(seasonOn(D(2026, 6, 1))).toMatchObject({ key: 'apostles', dayNumber: 1 });
    expect(seasonOn(D(2026, 7, 11))).toMatchObject({ key: 'apostles' });
    expectSeason(D(2026, 7, 12), null); // Feast of Sts Peter & Paul
  });

  test("St Mary's (Dormition) Fast: [Aug 7 … Aug 21]", () => {
    expectSeason(D(2026, 8, 6), null);
    expect(seasonOn(D(2026, 8, 7))).toMatchObject({ key: 'dormition', dayNumber: 1, total: 15 });
    expect(seasonOn(D(2026, 8, 21))).toMatchObject({ dayNumber: 15 });
    expectSeason(D(2026, 8, 22), null);
  });

  test('Nativity Fast spans the year boundary [Nov 25 … Jan 6]', () => {
    expectSeason(D(2026, 11, 24), null);
    expect(seasonOn(D(2026, 11, 25))).toMatchObject({ key: 'nativity-fast', dayNumber: 1, total: 43 });
    expect(seasonOn(D(2026, 12, 31))).toMatchObject({ key: 'nativity-fast' });
    expect(seasonOn(D(2027, 1, 6))).toMatchObject({ key: 'nativity-fast', dayNumber: 43 });
    expectSeason(D(2027, 1, 7), null); // the Nativity
  });
});

describe('Fasting rules', () => {
  test('Holy Fifty suppresses every Wednesday & Friday fast', () => {
    let suppressed = 0;
    for (let i = 0; i <= 49; i++) {
      const day = addDays(PASCHA_2026, i);
      const wd = weekday(day);
      if (wd === 3 || wd === 5) {
        expect(fastingOn(day).level).toBe('none');
        suppressed++;
      }
    }
    expect(suppressed).toBeGreaterThanOrEqual(13); // ~7 weeks × 2
  });

  test('Holy Fifty Wednesday 2026-04-29 shows NO fast (kickoff golden date)', () => {
    expect(fastingOn(D(2026, 4, 29)).level).toBe('none');
    expect(isFastDay(D(2026, 4, 29))).toBe(false);
  });

  test('year-round Wednesday/Friday is a vegan fast in ordinary time', () => {
    // October 2026 is ordinary time (no season, no Feast of the Lord).
    for (let d = 1; d <= 31; d++) {
      const date = D(2026, 10, d);
      const wd = weekday(date);
      const level = fastingOn(date).level;
      if (wd === 3 || wd === 5) {
        expect(level).toBe('fast');
        expect(fastingOn(date).fishAllowed).toBe(false);
      } else {
        expect(level).toBe('none');
      }
    }
  });

  test("Apostles' Fast: fish on weekdays, vegan on Wed/Fri", () => {
    // 2026-06-10 (Wed) — kickoff golden date.
    expect(getDayInfo(D(2026, 6, 10))).toMatchObject({
      season: { key: 'apostles' },
      fast: { level: 'fast', fishAllowed: false },
    });
    // 2026-06-11 (Thu) — fish allowed.
    expect(fastingOn(D(2026, 6, 11))).toMatchObject({ level: 'fast-fish', fishAllowed: true });
  });

  test('Great Lent: strict on weekdays, vegan on Sat/Sun, strict in Holy Week', () => {
    expect(fastingOn(D(2026, 2, 16)).level).toBe('strict'); // Mon
    expect(fastingOn(D(2026, 2, 21)).level).toBe('fast'); // Sat
    expect(fastingOn(D(2026, 2, 22)).level).toBe('fast'); // Sun
    // Holy Week (Good Friday 2026 = Apr 10) is strict.
    expect(fastingOn(D(2026, 4, 10)).level).toBe('strict');
    expect(seasonOn(D(2026, 4, 10))?.inHolyWeek).toBe(true);
  });

  test('Nativity Fast: Christmas Day 2026-12-25 (Fri) is a vegan fast', () => {
    expect(getDayInfo(D(2026, 12, 25))).toMatchObject({
      season: { key: 'nativity-fast' },
      fast: { level: 'fast', fishAllowed: false },
    });
  });

  test('Paramon eves are strict', () => {
    expect(fastingOn(D(2027, 1, 6)).level).toBe('strict'); // eve of Nativity
    expect(fastingOn(D(2026, 1, 18)).level).toBe('strict'); // eve of Theophany
  });

  test('food lists reflect the ruling', () => {
    const lent = fastingOn(D(2026, 2, 16)); // strict / vegan
    expect(lent.abstain).toContain('Fish');
    expect(lent.permitted).not.toContain('Fish');
    const ap = fastingOn(D(2026, 6, 11)); // fish allowed
    expect(ap.permitted).toContain('Fish');
    expect(ap.abstain).not.toContain('Fish');
  });
});

describe('Feasts', () => {
  test('Seven Major Feasts of the Lord break the Wed/Fri fast', () => {
    expect(isMajorLordFeast(D(2026, 1, 7))).toBe(true); // Nativity
    expect(isMajorLordFeast(D(2026, 1, 19))).toBe(true); // Theophany
    expect(isMajorLordFeast(PASCHA_2026)).toBe(true);
    expect(isMajorLordFeast(addDays(PASCHA_2026, -7))).toBe(true); // Palm Sunday
    expect(isMajorLordFeast(addDays(PASCHA_2026, 39))).toBe(true); // Ascension
    expect(isMajorLordFeast(addDays(PASCHA_2026, 49))).toBe(true); // Pentecost
  });

  test('primary feast names', () => {
    expect(primaryFeast(D(2026, 9, 11))?.key).toBe('nayrouz');
    expect(primaryFeast(PASCHA_2026)?.key).toBe('pascha');
    expect(primaryFeast(D(2026, 1, 7))?.key).toBe('nativity');
  });

  test('Annunciation within Lent relaxes the fast to fish (not full feast)', () => {
    const info = getDayInfo(D(2026, 4, 7)); // Paremhat 29, within Lent
    expect(info.feast?.key).toBe('annunciation');
    expect(info.season?.key).toBe('great-lent');
    expect(info.fast.level).toBe('fast-fish');
  });

  test('day-29 monthly commemoration is suppressed during Great Lent', () => {
    // Meshir 29 falls within Lent in 2026; should NOT surface as a feast.
    const lentDay29 = fromCoptic(1742, 6, 29);
    expect(seasonOn(lentDay29)?.key).toBe('great-lent');
    expect(primaryFeast(lentDay29)).toBeNull();
  });
});
