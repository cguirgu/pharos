/**
 * Check-in logic: turning a measured value into a day status (PRD §4.3).
 *
 * - binary:   tap toggles kept.
 * - count:    reaching target auto-marks kept; 0 < value < target may be "part".
 * - duration: same as count, but value is minutes.
 * - parts:    all parts → kept, some → part, none → open.
 *
 * Logs are editable for today and yesterday only (the grace window).
 */
import type { CivilDate } from '../coptic/types';
import { diffDays } from '../coptic/julian';
import type { Practice, PracticeLog, DayStatus } from './types';

/** Status implied by a numeric value against the practice target. */
export function statusFromValue(practice: Practice, value: number): DayStatus {
  const target = practice.target ?? 1;
  if (value <= 0) return 'open';
  if (value >= target) return 'kept';
  return 'part';
}

/** Status implied by which named parts are complete. */
export function statusFromParts(
  practice: Practice,
  completed: readonly string[],
): DayStatus {
  const all = practice.parts ?? [];
  const done = completed.filter((p) => all.includes(p));
  if (done.length === 0) return 'open';
  if (done.length >= all.length && all.length > 0) return 'kept';
  return 'part';
}

/** Build/replace a log for a binary practice (toggle kept ⇄ open). */
export function toggleBinary(
  practice: Practice,
  date: CivilDate,
  current: PracticeLog | undefined,
): PracticeLog {
  const kept = current?.status === 'kept';
  return { practiceId: practice.id, date, status: kept ? 'open' : 'kept' };
}

/** Build a log from a count/duration check-in. */
export function logFromValue(
  practice: Practice,
  date: CivilDate,
  value: number,
): PracticeLog {
  return { practiceId: practice.id, date, value, status: statusFromValue(practice, value) };
}

/** Build a log from a parts check-in. */
export function logFromParts(
  practice: Practice,
  date: CivilDate,
  completed: readonly string[],
): PracticeLog {
  const parts = completed.filter((p) => (practice.parts ?? []).includes(p));
  return { practiceId: practice.id, date, parts, status: statusFromParts(practice, completed) };
}

/**
 * May this log still be edited on `today`? Only today and yesterday are open;
 * older history is read-only (PRD §4.3).
 */
export function isEditable(logDate: CivilDate, today: CivilDate): boolean {
  const delta = diffDays(today, logDate);
  return delta === 0 || delta === 1;
}

/**
 * Resolve the effective status of a due day for display, accounting for the
 * day not being over yet. A due day in the past with no completion is `missed`;
 * `today` with no completion stays `open` (still pending).
 */
export function effectiveStatus(
  log: PracticeLog | undefined,
  date: CivilDate,
  today: CivilDate,
): DayStatus {
  if (log && log.status !== 'open') return log.status;
  const isPast = diffDays(today, date) > 0;
  return isPast ? 'missed' : 'open';
}
