/**
 * App-layer clock wiring. This is the ONE place a system `new Date()` is read;
 * the domain never reads the clock itself (CLAUDE.md §2).
 */
import type { CivilDate } from '../domain/coptic';
import { setTodayProvider } from '../domain/coptic';

/** Convert a JS `Date` (local time) to a domain `CivilDate` (month 1–12). */
export function civilFromJsDate(d: Date): CivilDate {
  return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
}

/** Install the system clock as the domain's today-provider. */
export function installSystemClock(): void {
  setTodayProvider(() => civilFromJsDate(new Date()));
}

/** The current local hour (0–23). Used to pick the current/next office. */
export function nowHour(): number {
  return new Date().getHours();
}
