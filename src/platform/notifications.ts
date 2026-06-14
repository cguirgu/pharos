/**
 * Local notification scheduling (app layer). The *which/when* is decided by the
 * tested pure `nextTriggers` (due days only); this module just talks to the OS.
 * Runs on app open (PRD §5.7). Silently no-ops if permission isn't granted.
 */
import * as Notifications from 'expo-notifications';
import type { Practice, PracticeLog } from '../domain/rule';
import type { CivilDate } from '../domain/coptic';
import { nextTriggers } from '../domain/notifications/schedule';

const WINDOW_DAYS = 7;

/** Reschedule the next week of due-day reminders for enabled practices. */
export async function rescheduleReminders(
  practices: readonly Practice[],
  logsByPractice: Readonly<Record<string, readonly PracticeLog[]>>,
  today: CivilDate,
): Promise<void> {
  let granted = false;
  try {
    granted = (await Notifications.getPermissionsAsync()).granted;
  } catch {
    return;
  }
  if (!granted) return;

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    const triggers = nextTriggers(practices, logsByPractice, today, WINDOW_DAYS);
    for (const t of triggers) {
      const [h, m] = t.time.split(':').map(Number);
      const when = new Date(t.date.year, t.date.month - 1, t.date.day, h ?? 9, m ?? 0, 0);
      if (when.getTime() <= Date.now()) continue; // don't schedule in the past
      await Notifications.scheduleNotificationAsync({
        content: { title: t.practiceName, body: 'The lamp is tended, not stormed.' },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: when },
      });
    }
  } catch {
    // scheduling is best-effort; never block the app
  }
}
