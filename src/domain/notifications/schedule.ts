/**
 * Notification scheduling — pure logic (PRD §5.7). Computes the next local
 * reminder triggers for enabled per-practice reminders, **on due days only**.
 * The actual OS scheduling/firing happens in the app layer
 * (`src/platform/notifications.ts`); this function is the tested core.
 */
import type { CivilDate } from '../coptic';
import { addDays, getDayInfo } from '../coptic';
import type { Practice, PracticeLog } from '../rule';
import { isDueOn } from '../rule';
import { primarySaint } from '../content/synaxarium';
import {
  CHANNEL_TEXT,
  type NotificationChannel,
  type NotificationConfig,
} from './types';

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

// NOTE: the `questions` channel is deliberately absent from this scheduler.
// Everything below is DATE-based — it plans the next N days from the calendar —
// whereas an answer is an EVENT, arriving when someone writes it. Forcing a case
// in here would mean guessing at a time for something that has not happened.
// Delivery to the asker needs a server (a push token per device and a trigger on
// insert); until then src/domain/questions/notify.ts drives an in-app count.
// --- multi-channel schedule (all configurable notification types) ----------

export interface ScheduleContext {
  readonly practices: readonly Practice[];
  readonly logsByPractice: Readonly<Record<string, readonly PracticeLog[]>>;
  /** Whether the user follows at least one reading plan (drives the `reading` channel). */
  readonly hasReadingPlan: boolean;
}

export interface ScheduledNotification {
  /** Stable id (channel + date [+ practice]) — lets the OS layer dedupe. */
  readonly key: string;
  readonly channel: NotificationChannel;
  readonly title: string;
  readonly body: string;
  readonly date: CivilDate;
  /** "HH:MM" local. */
  readonly time: string;
}

const dk = (d: CivilDate) => `${d.year}-${d.month}-${d.day}`;

/** A sortable minute-of-window key for date+time, for "soonest first" ordering. */
function sortKey(date: CivilDate, time: string): number {
  const [h, m] = time.split(':').map(Number);
  return (((date.year * 13 + date.month) * 32 + date.day) * 24 + (h ?? 0)) * 60 + (m ?? 0);
}

/**
 * Every notification to schedule across all enabled channels for the next
 * `days` days from `fromDate`, soonest first, capped to `cap` (the OS pending
 * limit). Calendar-aware (feasts/fasts/saint of the day) and pure/testable.
 */
export function buildSchedule(
  config: NotificationConfig,
  ctx: ScheduleContext,
  fromDate: CivilDate,
  days: number,
  cap = 60,
): ScheduledNotification[] {
  const out: ScheduledNotification[] = [];
  const push = (channel: NotificationChannel, date: CivilDate, title: string, body: string, time: string, extra = '') =>
    out.push({ key: `${channel}:${dk(date)}${extra}`, channel, title, body, date, time });

  // practices — per-practice, on due days, at each practice's own reminder time
  if (config.practices.enabled) {
    for (const t of nextTriggers(ctx.practices, ctx.logsByPractice, fromDate, days)) {
      push('practices', t.date, t.practiceName, CHANNEL_TEXT.practices.body, t.time, `:${t.practiceId}`);
    }
  }

  for (let i = 0; i < days; i++) {
    const date = addDays(fromDate, i);
    const info = getDayInfo(date);
    const txt = CHANNEL_TEXT;

    if (config.prayerHours.enabled) {
      push('prayerHours', date, txt.prayerHours.title, txt.prayerHours.body, config.prayerHours.time);
    }
    if (config.commemoration.enabled) {
      const saint = primarySaint(info.coptic);
      if (saint) push('commemoration', date, txt.commemoration.title, saint.name, config.commemoration.time);
    }
    if (config.reading.enabled && ctx.hasReadingPlan) {
      push('reading', date, txt.reading.title, txt.reading.body, config.reading.time);
    }
    if (config.learn.enabled) {
      push('learn', date, txt.learn.title, txt.learn.body, config.learn.time);
    }
    if (config.fast.enabled && info.fast.level !== 'none') {
      push('fast', date, txt.fast.title, info.fast.ruling ?? txt.fast.body, config.fast.time);
    }
    if (config.feast.enabled && info.feast) {
      push('feast', date, txt.feast.title, info.feast.name, config.feast.time);
    }
  }

  return out
    .sort((a, b) => sortKey(a.date, a.time) - sortKey(b.date, b.time))
    .slice(0, cap);
}
