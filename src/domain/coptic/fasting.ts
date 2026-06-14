/**
 * Resolve the fasting rigor for a civil day from its season, weekday, feast,
 * and Paramon status. Encodes PRD §3.5.
 *
 * Precedence (highest first):
 *   1. Holy Fifty                              → none
 *   2. Major Feast of the Lord                 → none (relaxed to fish in Lent)
 *   3. Paramon (eve of Nativity / Theophany)   → strict
 *   4. Great Lent / Nineveh                    → strict (Lent Sat/Sun → vegan)
 *   5. Fish-allowed fasts (Apostles'/Dormition/Nativity) → fish, but Wed/Fri vegan
 *   6. Wednesday / Friday                      → vegan fast
 *   7. otherwise                               → none
 *
 * TODO(verify-liturgical): Lent Saturdays/Sundays are modelled as vegan (not the
 * strict sunset fast); a major feast within Lent is relaxed to fish-allowed.
 * Both are reasonable common practice but the owner should confirm. See TESTING.md.
 */
import type { CivilDate, FastDay, FastLevel } from './types';
import { weekday } from './julian';
import { seasonOn, isParamon } from './seasons';
import { isMajorLordFeast } from './feasts';

const VEGAN_PERMITTED = [
  'Vegetables & grains',
  'Legumes, bread & oil',
  'Fruit & nuts',
  'Black coffee & tea',
] as const;
const FISH = 'Fish' as const;
const ANIMAL = ['Meat & poultry', 'Dairy & eggs'] as const;
const WINE = 'Wine' as const;

const RULINGS: Record<FastLevel, string> = {
  none: 'A day of gladness — no fast',
  fast: 'Abstain from animal things · vegan fare',
  'fast-fish': 'Abstain from animal things · fish permitted',
  strict: 'The strict fast — nothing until sunset, then vegan fare',
};

function fastDay(level: FastLevel, rulingOverride?: string): FastDay {
  if (level === 'none') {
    return {
      level,
      ruling: rulingOverride ?? RULINGS.none,
      permitted: ['All foods'],
      abstain: [],
      fishAllowed: true,
    };
  }
  const fishAllowed = level === 'fast-fish';
  return {
    level,
    ruling: rulingOverride ?? RULINGS[level],
    permitted: fishAllowed ? [...VEGAN_PERMITTED, FISH] : [...VEGAN_PERMITTED],
    abstain: fishAllowed ? [...ANIMAL, WINE] : [...ANIMAL, FISH, WINE],
    fishAllowed,
  };
}

/** The fasting ruling in effect on `date`. */
export function fastingOn(date: CivilDate): FastDay {
  const season = seasonOn(date);
  const wd = weekday(date);
  const isWedFri = wd === 3 || wd === 5;
  const major = isMajorLordFeast(date);

  // 1. Holy Fifty — joyful season, no fasting at all.
  if (season?.key === 'holy-fifty') return fastDay('none');

  // 2. Major Feast of the Lord.
  if (major) {
    if (season?.key === 'great-lent') return fastDay('fast-fish', 'A feast within the Fast · fish permitted');
    return fastDay('none', 'A Great Feast of the Lord — no fast');
  }

  // 3. Paramon — strict eve.
  if (isParamon(date)) return fastDay('strict', 'Paramon — the strict eve');

  // 4. Great Lent & Nineveh.
  if (season?.key === 'great-lent') {
    if (season.inHolyWeek) return fastDay('strict', 'Holy Week — the strict fast');
    if (wd === 0 || wd === 6) return fastDay('fast'); // Sat/Sun within Lent
    return fastDay('strict');
  }
  if (season?.key === 'nineveh') return fastDay('strict');

  // 5. Fish-allowed seasons.
  if (season?.key === 'apostles' || season?.key === 'dormition' || season?.key === 'nativity-fast') {
    return isWedFri ? fastDay('fast') : fastDay('fast-fish');
  }

  // 6. Year-round Wednesday / Friday fast.
  if (isWedFri) return fastDay('fast');

  // 7. Ordinary day.
  return fastDay('none');
}
