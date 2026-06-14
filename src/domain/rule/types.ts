/**
 * The Rule engine domain model (PRD §4).
 *
 * Pure TypeScript. A "practice" is one commitment in the user's rule of life;
 * a "log" is the record of how a due day went. All dates are `CivilDate`
 * (whole-day, timezone-free); timestamps are injected numbers, never `Date`.
 */
import type { CivilDate, SeasonKey } from '../coptic/types';

export type Category = 'prayer' | 'word' | 'fast' | 'devotion';
export type Kind = 'library' | 'custom';

/** How a practice is measured (PRD §4.1). */
export type Measure = 'binary' | 'count' | 'duration' | 'parts';

export type PracticeState = 'active' | 'paused' | 'archived';

/** The cadence palette — all six ship in MVP (PRD §4.2). */
export type Cadence =
  | { type: 'daily' }
  /** Chosen weekdays. `days`: 0 = Sun … 6 = Sat. */
  | { type: 'weekdays'; days: readonly number[] }
  /** N times per week (week = Sun–Sat); due until N are met. */
  | { type: 'timesPerWeek'; n: number }
  /** Due whenever the calendar says today is a fast day. */
  | { type: 'fastDays' }
  /** Once per period; due anytime within it. */
  | { type: 'perPeriod'; period: 'week' | 'month' }
  /** Bound to a liturgical season; dormant otherwise. */
  | { type: 'season'; season: SeasonKey };

export interface Reminder {
  /** Local time "HH:MM" (24h). */
  readonly time: string;
  readonly enabled: boolean;
}

export interface Practice {
  readonly id: string;
  readonly createdAt: number;
  readonly name: string;
  readonly category: Category;
  readonly kind: Kind;
  readonly cadence: Cadence;
  readonly measure: Measure;
  /** Target for count (reps) or duration (minutes). */
  readonly target?: number;
  /** Named sub-parts for the `parts` measure (e.g. Agpeya hours). */
  readonly parts?: readonly string[];
  readonly reminder?: Reminder;
  readonly intention?: string;
  readonly state: PracticeState;
  /** When a paused practice should reactivate. */
  readonly resumeOn?: CivilDate;
  readonly sortOrder: number;
}

/** Per-day outcome for a due practice (PRD §4.3). */
export type DayStatus = 'open' | 'part' | 'kept' | 'missed';

export interface PracticeLog {
  readonly practiceId: string;
  readonly date: CivilDate;
  readonly status: DayStatus;
  /** Count reached or minutes logged. */
  readonly value?: number;
  /** Completed part names (for the `parts` measure). */
  readonly parts?: readonly string[];
}

/** Lifetime / windowed statistics for one practice (PRD §4.4). */
export interface PracticeStats {
  readonly dueDays: number;
  readonly keptDays: number;
  readonly partDays: number;
  readonly missedDays: number;
  /** kept ÷ due, 0–100, rounded. Non-due days never counted. */
  readonly keptPercent: number;
}
