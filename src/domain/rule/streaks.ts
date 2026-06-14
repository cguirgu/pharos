/**
 * Streaks, statistics, and the history grid (PRD §4.4) — the gentle rules.
 *
 * Principles encoded here:
 *  - Only *due* days count; non-due days are skipped, never break a streak.
 *  - `part` (kept-in-part) preserves a streak.
 *  - Today, still open, is pending — it neither breaks nor extends a streak.
 *  - A past due day with no completion is `missed` and breaks the streak.
 *  - Rest Days keep the global flame lit (PRD §4.5).
 */
import type { CivilDate } from '../coptic/types';
import { addDays, sameDay, gregorianToJDN } from '../coptic/julian';
import type { Practice, PracticeLog, PracticeStats, DayStatus } from './types';
import { dateKey } from './dates';
import { isDueOn, indexLogs } from './cadence';
import { effectiveStatus } from './status';

/** Safety bound on backward scans when no explicit `since` is given. */
const MAX_LOOKBACK_DAYS = 800;

export interface StreakOptions {
  /** The current day (injected, never `new Date()`). */
  readonly today: CivilDate;
  /** Earliest day to scan; defaults to MAX_LOOKBACK_DAYS before today. */
  readonly since?: CivilDate;
  /** Compute the streak as of this day (defaults to `today`). */
  readonly asOf?: CivilDate;
}

function lowerBoundJDN(opts: StreakOptions): number {
  return opts.since
    ? gregorianToJDN(opts.since)
    : gregorianToJDN(opts.today) - MAX_LOOKBACK_DAYS;
}

/**
 * Per-practice streak: consecutive due days with status kept or part, counting
 * backward from `asOf`. Non-due days are skipped; a missed due day ends it.
 */
export function practiceStreak(
  practice: Practice,
  logs: readonly PracticeLog[],
  opts: StreakOptions,
): number {
  const idx = indexLogs(logs);
  const floor = lowerBoundJDN(opts);
  let streak = 0;
  let cursor = opts.asOf ?? opts.today;

  while (gregorianToJDN(cursor) >= floor) {
    if (isDueOn(practice, cursor, logs)) {
      const status = effectiveStatus(idx.get(dateKey(cursor)), cursor, opts.today);
      if (status === 'kept' || status === 'part') {
        streak++;
      } else if (status === 'missed') {
        break;
      } else {
        // 'open' only occurs for today (pending): don't count, don't break.
        if (!sameDay(cursor, opts.today)) break;
      }
    }
    cursor = addDays(cursor, -1);
  }
  return streak;
}

/**
 * Statistics over [since … today]. Today, if still open, is excluded (not yet
 * resolved, so it neither helps nor hurts the percentage).
 */
export function practiceStats(
  practice: Practice,
  logs: readonly PracticeLog[],
  opts: StreakOptions,
): PracticeStats {
  const idx = indexLogs(logs);
  const floor = lowerBoundJDN(opts);
  let dueDays = 0;
  let keptDays = 0;
  let partDays = 0;
  let missedDays = 0;

  let cursor = opts.asOf ?? opts.today;
  while (gregorianToJDN(cursor) >= floor) {
    if (isDueOn(practice, cursor, logs)) {
      const status = effectiveStatus(idx.get(dateKey(cursor)), cursor, opts.today);
      if (status !== 'open') {
        dueDays++;
        if (status === 'kept') keptDays++;
        else if (status === 'part') partDays++;
        else missedDays++;
      }
    }
    cursor = addDays(cursor, -1);
  }

  const keptPercent = dueDays === 0 ? 0 : Math.round((keptDays / dueDays) * 100);
  return { dueDays, keptDays, partDays, missedDays, keptPercent };
}

export interface HistoryCell {
  readonly date: CivilDate;
  readonly due: boolean;
  /** null on non-due days (rendered blank). */
  readonly status: DayStatus | null;
  readonly isToday: boolean;
}

/**
 * The last 4 weeks as a 7-column (Sun–Sat) grid. Only due days carry a status;
 * non-due days are blank (PRD §4.4 history view).
 */
export function historyGrid(
  practice: Practice,
  logs: readonly PracticeLog[],
  today: CivilDate,
): HistoryCell[][] {
  const idx = indexLogs(logs);
  // Start on the Sunday of the week 3 weeks before this week → 4 rows of 7.
  const startOfThisWeek = addDays(today, -((gregorianToJDN(today) + 1) % 7));
  const gridStart = addDays(startOfThisWeek, -21);

  const weeks: HistoryCell[][] = [];
  for (let w = 0; w < 4; w++) {
    const row: HistoryCell[] = [];
    for (let d = 0; d < 7; d++) {
      const date = addDays(gridStart, w * 7 + d);
      const due = isDueOn(practice, date, logs);
      const isToday = sameDay(date, today);
      row.push({
        date,
        due,
        isToday,
        status: due ? effectiveStatus(idx.get(dateKey(date)), date, today) : null,
      });
    }
    weeks.push(row);
  }
  return weeks;
}

export interface FlameOptions extends StreakOptions {
  /** Declared Rest Days, as date keys (PRD §4.5). */
  readonly restDays?: ReadonlySet<string>;
}

/**
 * The global day-streak ("the flame"): consecutive days where every practice
 * due that day was kept or part — or the day was a declared Rest Day. A day
 * with nothing due counts (vacuously complete). Today, if incomplete, is
 * pending and does not break the flame.
 */
export function globalFlame(
  practices: readonly Practice[],
  logsByPractice: Readonly<Record<string, readonly PracticeLog[]>>,
  opts: FlameOptions,
): number {
  const floor = lowerBoundJDN(opts);
  const restDays = opts.restDays ?? new Set<string>();
  const indices = new Map<string, Map<string, PracticeLog>>();
  for (const p of practices) indices.set(p.id, indexLogs(logsByPractice[p.id] ?? []));

  const dayComplete = (date: CivilDate): boolean => {
    if (restDays.has(dateKey(date))) return true;
    for (const p of practices) {
      const logs = logsByPractice[p.id] ?? [];
      if (!isDueOn(p, date, logs)) continue;
      const status = effectiveStatus(indices.get(p.id)?.get(dateKey(date)), date, opts.today);
      if (status !== 'kept' && status !== 'part') return false;
    }
    return true;
  };

  let streak = 0;
  let cursor = opts.asOf ?? opts.today;
  while (gregorianToJDN(cursor) >= floor) {
    if (dayComplete(cursor)) {
      streak++;
    } else if (!sameDay(cursor, opts.today)) {
      break; // a past incomplete day breaks the flame
    }
    cursor = addDays(cursor, -1);
  }
  return streak;
}
