/**
 * Notification channels + per-device config (pure). Each channel is one gentle
 * daily cue at a configurable time (practices are special — see schedule.ts).
 * Copy is warm and never shaming (CLAUDE.md voice). Config persists locally
 * (device), driving the OS scheduling in src/platform/notifications.ts.
 */

export type NotificationChannel =
  | 'practices' // per-practice reminders, on due days, at each practice's own time
  | 'prayerHours' // a daily nudge to keep the Agpeya hours
  | 'commemoration' // the saint of the day
  | 'reading' // the day's reading, when following a plan
  | 'learn' // a little Coptic each day
  | 'fast' // gentle note on fast days
  | 'feast'; // a feast of the Lord

export interface ChannelConfig {
  readonly enabled: boolean;
  /** "HH:MM" (24h), local. Ignored for `practices` (each practice carries its own). */
  readonly time: string;
}

export type NotificationConfig = Readonly<Record<NotificationChannel, ChannelConfig>>;

/** Channel metadata for the settings screen, in display order. */
export interface ChannelMeta {
  readonly id: NotificationChannel;
  readonly title: string;
  readonly description: string;
  /** Whether this channel exposes a time picker (practices don't — per-practice). */
  readonly hasTime: boolean;
}

export const CHANNELS: readonly ChannelMeta[] = [
  { id: 'practices', title: 'Your rule', description: 'A quiet word when a practice is due.', hasTime: false },
  { id: 'prayerHours', title: 'The hours', description: 'A daily call to keep the Agpeya.', hasTime: true },
  { id: 'commemoration', title: 'Commemoration', description: 'The saint remembered today.', hasTime: true },
  { id: 'reading', title: 'The Word', description: "The day's reading, while you follow a plan.", hasTime: true },
  { id: 'learn', title: 'Learn Coptic', description: 'A small lesson to keep the streak.', hasTime: true },
  { id: 'fast', title: 'The fast', description: 'A gentle note on the fasting days.', hasTime: true },
  { id: 'feast', title: 'Feasts', description: 'A word of joy on the feasts of the Lord.', hasTime: true },
];

/** Title + body text for a channel (commemoration fills in the saint name). */
export const CHANNEL_TEXT: Record<NotificationChannel, { title: string; body: string }> = {
  practices: { title: '', body: 'The lamp is tended, not stormed.' },
  prayerHours: { title: 'The hours', body: 'Seven times a day I praise You.' },
  commemoration: { title: 'Commemoration of the day', body: '' },
  reading: { title: 'The Word', body: "Today's reading awaits." },
  learn: { title: 'Learn Coptic', body: 'A few minutes keeps the tongue alive.' },
  fast: { title: 'A fast day', body: 'Keep the fast in gladness.' },
  feast: { title: 'A feast of the Lord', body: 'Rejoice — today is a feast.' },
};

/** Sensible defaults: only practice reminders on by default; the rest opt-in. */
export const DEFAULT_CONFIG: NotificationConfig = {
  practices: { enabled: true, time: '07:00' },
  prayerHours: { enabled: false, time: '06:00' },
  commemoration: { enabled: false, time: '08:00' },
  reading: { enabled: false, time: '20:00' },
  learn: { enabled: false, time: '19:00' },
  fast: { enabled: false, time: '07:00' },
  feast: { enabled: false, time: '08:00' },
};

/** Merge a stored (possibly partial/old) config onto the defaults. */
export function normalizeConfig(stored: Partial<Record<NotificationChannel, Partial<ChannelConfig>>> | null): NotificationConfig {
  const out = {} as Record<NotificationChannel, ChannelConfig>;
  for (const { id } of CHANNELS) {
    out[id] = { ...DEFAULT_CONFIG[id], ...(stored?.[id] ?? {}) };
  }
  return out;
}
