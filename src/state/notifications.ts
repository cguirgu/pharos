/**
 * Notification settings store — the per-device config (which channels, at what
 * times) persisted in the local settings k/v, plus rescheduling. Device-scoped
 * (notifications fire on this device); never synced to the backend.
 */
import { create } from 'zustand';
import { getRepo } from '../db/repo';
import { useClock } from './clock';
import { useRule } from './rule';
import { useReading } from './reading';
import {
  DEFAULT_CONFIG,
  normalizeConfig,
  type ChannelConfig,
  type NotificationChannel,
  type NotificationConfig,
} from '../domain/notifications/types';
import type { ScheduleContext } from '../domain/notifications/schedule';
import { ensurePermission, rescheduleAll } from '../platform/notifications';
import { registerPushToken, unregisterPushToken } from '../platform/pushToken';
import {
  DEFAULT_ANNOUNCEMENTS,
  needsSync,
  normalizeAnnouncements,
  shouldRegister,
  type AnnouncementConfig,
} from '../domain/notifications/announcements';

const KEY = 'notifications.config';
const ANNOUNCE_KEY = 'notifications.announcements';

/**
 * Guards the announcement opt-in against its own latency.
 *
 * Registering takes a permission prompt, a round trip to Expo for a token, and
 * a write to Supabase. A user can easily toggle off inside that window — and
 * without this counter, the in-flight registration would then resolve and set
 * `enabled: true` back over their opt-out, having ALSO created a remote row
 * that the opt-out could not delete (it only knew the previous token). The
 * result was a device that had opted out and still received pushes, which is
 * exactly what guideline 4.5.4 forbids.
 *
 * Every mutation bumps this. After each await, a task that finds the value
 * changed abandons its result — and deletes any token it managed to create.
 */
let announceGeneration = 0;

interface NotifState {
  config: NotificationConfig;
  /** Release announcements — the one REMOTE channel. Off until opted in. */
  announcements: AnnouncementConfig;
  load: () => Promise<void>;
  setChannel: (id: NotificationChannel, patch: Partial<ChannelConfig>) => Promise<void>;
  /**
   * Opt in or out of release announcements. Opting in asks for permission and
   * registers a push token; opting out deletes it. Returns the resulting state,
   * which may be `false` even when `true` was asked for — permission can be
   * refused, or the build may have no backend — so the UI reflects reality
   * rather than the request.
   */
  setAnnouncements: (enabled: boolean, accountId: string | null) => Promise<boolean>;
  reschedule: () => Promise<void>;
}

/** Snapshot the live domain state the schedule needs (practices + reading-plan flag). */
function gatherContext(): ScheduleContext {
  const rule = useRule.getState();
  const reading = useReading.getState();
  return {
    practices: rule.practices,
    logsByPractice: rule.logsByPractice(),
    hasReadingPlan: Object.keys(reading.plans).length > 0,
  };
}

export const useNotifications = create<NotifState>((set, get) => ({
  config: DEFAULT_CONFIG,
  announcements: DEFAULT_ANNOUNCEMENTS,

  load: async () => {
    let stored: unknown = null;
    try {
      const raw = await getRepo().getSetting(KEY);
      if (raw) stored = JSON.parse(raw);
    } catch {
      // no stored config — defaults apply
    }
    let storedAnnounce: unknown = null;
    try {
      const raw = await getRepo().getSetting(ANNOUNCE_KEY);
      if (raw) storedAnnounce = JSON.parse(raw);
    } catch {
      // never opted in — the default (off) applies
    }
    const announcements = normalizeAnnouncements(storedAnnounce as never);
    set({ config: normalizeConfig(stored as never), announcements });

    // Refresh the registration in the background for anyone already opted in.
    // Expo push tokens can rotate (reinstall, restore from backup, OS refresh),
    // and the row also carries the app version the send script filters on — so
    // without this, an opted-in device would quietly stop being reachable, or
    // keep being told about a version it already has. Never blocks startup.
    if (shouldRegister(announcements)) {
      const generation = announceGeneration;
      void (async () => {
        const token = await registerPushToken(null);
        if (generation !== announceGeneration) {
          // Opted out while this was in flight — undo whatever it registered.
          await unregisterPushToken(token);
          return;
        }
        if (token && needsSync(announcements, token)) {
          const next = { enabled: true, token };
          set({ announcements: next });
          try {
            await getRepo().setSetting(ANNOUNCE_KEY, JSON.stringify(next));
          } catch {
            // in-memory state stands
          }
        }
      })();
    }
  },

  setAnnouncements: async (enabled, accountId) => {
    const generation = ++announceGeneration;
    const previous = get().announcements;
    if (!enabled) {
      // Opt out first, locally, so the switch responds even if the network does
      // not. The remote row is then best-effort deleted.
      const next = { enabled: false, token: null };
      set({ announcements: next });
      try {
        await getRepo().setSetting(ANNOUNCE_KEY, JSON.stringify(next));
      } catch {
        // keep going — the in-memory state is already correct
      }
      await unregisterPushToken(previous.token);
      return false;
    }
    // From here on the user has asked to opt IN. Any later toggle bumps the
    // generation and invalidates this attempt.
    // Opting in: permission and a token are both required. If either is
    // unavailable the switch stays off rather than claiming a subscription
    // that would never deliver.
    const token = await registerPushToken(accountId);
    if (generation !== announceGeneration) {
      // Superseded — the user toggled again while this was registering. Leave
      // the newer decision alone and remove the row this attempt created.
      await unregisterPushToken(token);
      return get().announcements.enabled;
    }
    const next = normalizeAnnouncements({ enabled: token !== null, token });
    set({ announcements: next });
    try {
      await getRepo().setSetting(ANNOUNCE_KEY, JSON.stringify(next));
    } catch {
      // in-memory state stands
    }
    return next.enabled;
  },

  setChannel: async (id, patch) => {
    const config = normalizeConfig({ ...get().config, [id]: { ...get().config[id], ...patch } });
    set({ config });
    try {
      await getRepo().setSetting(KEY, JSON.stringify(config));
    } catch {
      // persistence best-effort
    }
    if (patch.enabled) await ensurePermission();
    await get().reschedule();
  },

  reschedule: async () => {
    await rescheduleAll(get().config, gatherContext(), useClock.getState().today);
  },
}));
