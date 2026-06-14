/**
 * Public types for the Coptic liturgical calendar engine.
 *
 * All dates here are *civil calendar dates* (no time, no timezone) — the
 * liturgical day is a whole-day concept. The UI layer converts to/from JS
 * `Date` at its boundary; the domain never touches `Date` directly
 * (see CLAUDE.md §2 and `clock.ts`).
 */

/** A Gregorian civil date. `month` is 1–12, `day` is 1–31. */
export interface CivilDate {
  readonly year: number;
  readonly month: number;
  readonly day: number;
}

/** A date in the Coptic (Anno Martyrum) calendar. `month` is 1–13. */
export interface CopticDate {
  readonly year: number;
  /** 1 = Thout … 12 = Mesori, 13 = Pi Kogi Enavot (the little month). */
  readonly month: number;
  readonly day: number;
  readonly monthName: string;
}

/** Liturgical seasons / fasts that own a contiguous span of days. */
export type SeasonKey =
  | 'nineveh' // Fast of Nineveh (Jonah) — 3 days
  | 'great-lent' // The Great Fast (incl. Holy Week)
  | 'holy-fifty' // Pascha → Pentecost; no fasting
  | 'apostles' // Apostles' Fast
  | 'dormition' // St Mary's (Dormition) Fast
  | 'nativity-fast'; // The Nativity (Advent) Fast

export interface SeasonInfo {
  readonly key: SeasonKey;
  readonly name: string;
  /** 1-based day number within the season. */
  readonly dayNumber: number;
  /** Total length of the season in days (null if variable & unbounded). */
  readonly total: number;
  /** True for the last week of Great Lent. */
  readonly inHolyWeek?: boolean;
}

/**
 * The fasting rigor in effect for a day.
 * - `none`          — no fast (free days, Holy Fifty, major feasts of the Lord)
 * - `fast`          — abstinence (vegan): no animal products
 * - `fast-fish`     — abstinence but fish permitted (Apostles'/Dormition/Nativity, non-Wed/Fri)
 * - `strict`        — the strict fast: nothing until sunset, then vegan
 */
export type FastLevel = 'none' | 'fast' | 'fast-fish' | 'strict';

export interface FastDay {
  readonly level: FastLevel;
  /** Short human ruling line, e.g. "Abstain from animal things · vegan fare". */
  readonly ruling: string;
  readonly permitted: readonly string[];
  readonly abstain: readonly string[];
  /** True when fish is allowed under this ruling. */
  readonly fishAllowed: boolean;
}

export interface Feast {
  readonly key: string;
  readonly name: string;
  /** A "Great Feast of the Lord" — breaks the Wednesday/Friday fast. */
  readonly lordFeast: boolean;
  /** One of the seven *Major* Feasts of the Lord. */
  readonly major: boolean;
}

/** The complete liturgical reading for a single civil day. */
export interface DayInfo {
  readonly gregorian: CivilDate;
  readonly coptic: CopticDate;
  /** 0 = Sunday … 6 = Saturday. */
  readonly weekday: number;
  /** Gregorian date of Orthodox Pascha governing this date's movable cycle. */
  readonly pascha: CivilDate;
  readonly season: SeasonInfo | null;
  readonly feast: Feast | null;
  readonly feasts: readonly Feast[];
  readonly fast: FastDay;
}
