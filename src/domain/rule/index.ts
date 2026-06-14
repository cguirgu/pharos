/**
 * The Rule engine — public surface (PRD §4).
 *
 * Pure TypeScript: practice model, the six cadences, check-in/status logic,
 * streaks, statistics, and the global flame. No UI or Expo imports.
 */
export * from './types';
export { isDueOn, cadenceSummary, indexLogs } from './cadence';
export {
  statusFromValue,
  statusFromParts,
  toggleBinary,
  logFromValue,
  logFromParts,
  isEditable,
  effectiveStatus,
} from './status';
export {
  practiceStreak,
  practiceStats,
  historyGrid,
  globalFlame,
} from './streaks';
export type { StreakOptions, FlameOptions, HistoryCell } from './streaks';
export { dateKey, weekStart, monthStart, sameWeek, sameMonth } from './dates';
