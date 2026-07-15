/**
 * Offices store — which Agpeya hours have been prayed, per account, per day.
 * Loaded lazily per viewed date; `total` feeds the "total prayers" stat.
 */
import { create } from 'zustand';
import { getRepo } from '../db/repo';
import type { CivilDate } from '../domain/coptic';
import { dateKey } from '../domain/rule';
import type { OfficeKey } from '../domain/content/agpeya';

interface OfficesState {
  accountId: string | null;
  total: number;
  /** dateKey → office keys prayed that day. */
  prayed: Record<string, string[]>;

  load: (accountId: string) => Promise<void>;
  clear: () => void;
  ensureDate: (date: CivilDate) => Promise<void>;
  toggle: (date: CivilDate, office: OfficeKey, on: boolean) => Promise<void>;
  prayedOn: (date: CivilDate) => string[];
};

export const useOffices = create<OfficesState>((set, get) => ({
  accountId: null,
  total: 0,
  prayed: {},

  load: async (accountId) => {
    const total = await getRepo(accountId).countOfficeLogs(accountId);
    set({ accountId, total, prayed: {} });
  },

  clear: () => set({ accountId: null, total: 0, prayed: {} }),

  ensureDate: async (date) => {
    const accountId = get().accountId;
    const key = dateKey(date);
    if (!accountId || get().prayed[key]) return;
    const keys = await getRepo(accountId).listOfficeLogs(accountId, key);
    set((st) => ({ prayed: { ...st.prayed, [key]: keys } }));
  },

  toggle: async (date, office, on) => {
    const accountId = get().accountId;
    if (!accountId) return;
    const key = dateKey(date);
    await getRepo(accountId).setOfficeLog(accountId, key, office, on);
    set((st) => {
      const cur = new Set(st.prayed[key] ?? []);
      const had = cur.has(office);
      if (on) cur.add(office);
      else cur.delete(office);
      const delta = on && !had ? 1 : !on && had ? -1 : 0;
      return { prayed: { ...st.prayed, [key]: [...cur] }, total: Math.max(0, st.total + delta) };
    });
  },

  prayedOn: (date) => get().prayed[dateKey(date)] ?? [],
}));
