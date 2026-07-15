/**
 * Local notification scheduling (app layer). The *which/when* is decided by the
 * tested pure `buildSchedule` (all configurable channels); this module just
 * talks to the OS. Runs on app open + whenever the config changes. Silently
 * no-ops if permission isn't granted.
 */
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import type { CivilDate } from '../domain/coptic';
import { buildSchedule, type ScheduleContext } from '../domain/notifications/schedule';
import type { NotificationConfig } from '../domain/notifications/types';

const WINDOW_DAYS = 14;
const MAX_PENDING = 60; // stay under the iOS ~64 pending limit

/** Ask for notification permission (returns whether granted). */
export async function ensurePermission(): Promise<boolean> {
  try {
    const cur = await Notifications.getPermissionsAsync();
    if (cur.granted) return true;
    const req = await Notifications.requestPermissionsAsync();
    return req.granted;
  } catch {
    return false;
  }
}

/** Cancel everything and reschedule the coming window from the config. Best-effort. */
export async function rescheduleAll(
  config: NotificationConfig,
  ctx: ScheduleContext,
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
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Reminders',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }
    await Notifications.cancelAllScheduledNotificationsAsync();
    const items = buildSchedule(config, ctx, today, WINDOW_DAYS, MAX_PENDING);
    for (const n of items) {
      const [h, m] = n.time.split(':').map(Number);
      const when = new Date(n.date.year, n.date.month - 1, n.date.day, h ?? 9, m ?? 0, 0);
      if (when.getTime() <= Date.now()) continue; // never schedule in the past
      await Notifications.scheduleNotificationAsync({
        content: { title: n.title || 'Coptic Daily Companion', body: n.body },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: when },
      });
    }
  } catch {
    // scheduling is best-effort; never block the app
  }
}
