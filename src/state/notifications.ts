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

const KEY = 'notifications.config';

interface NotifState {
  config: NotificationConfig;
  load: () => Promise<void>;
  setChannel: (id: NotificationChannel, patch: Partial<ChannelConfig>) => Promise<void>;
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

  load: async () => {
    let stored: unknown = null;
    try {
      const raw = await getRepo().getSetting(KEY);
      if (raw) stored = JSON.parse(raw);
    } catch {
      // no stored config — defaults apply
    }
    set({ config: normalizeConfig(stored as never) });
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
