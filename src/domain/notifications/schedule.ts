/**
 * Notification scheduling — pure logic (PRD §5.7). Computes the next local
 * reminder triggers for enabled per-practice reminders, **on due days only**.
 * The actual OS scheduling/firing happens in the app layer
 * (`src/platform/notifications.ts`); this function is the tested core.
 */
import type { CivilDate } from '../coptic';
import { addDays } from '../coptic';
import type { Practice, PracticeLog } from '../rule';
import { isDueOn } from '../rule';

export interface Trigger {
  readonly practiceId: string;
  readonly practiceName: string;
  readonly date: CivilDate;
  /** "HH:MM" local. */
  readonly time: string;
}

/**
 * Triggers for the next `days` days starting at `fromDate` (inclusive), for
 * every active practice with an enabled reminder, only on days the practice is
 * due. Paused/archived practices and disabled reminders are excluded.
 */
export function nextTriggers(
  practices: readonly Practice[],
  logsByPractice: Readonly<Record<string, readonly PracticeLog[]>>,
  fromDate: CivilDate,
  days: number,
): Trigger[] {
  const out: Trigger[] = [];
  const withReminder = practices.filter((p) => p.state === 'active' && p.reminder?.enabled);
  for (let i = 0; i < days; i++) {
    const date = addDays(fromDate, i);
    for (const p of withReminder) {
      const logs = logsByPractice[p.id] ?? [];
      if (isDueOn(p, date, logs)) {
        out.push({ practiceId: p.id, practiceName: p.name, date, time: p.reminder!.time });
      }
    }
  }
  return out;
}
