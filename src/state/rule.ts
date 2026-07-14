/**
 * Rule store — thin glue between the persistence repo and the domain engines.
 * It holds the active account's practices, logs, and rest days, and persists
 * every mutation. All computation (due-today, streaks, statuses) lives in
 * `src/domain`. The active account is set by the auth store via `load(accountId)`.
 */
import { create } from 'zustand';
import type { Practice, PracticeLog } from '../domain/rule';
import { dateKey, logFromValue, logFromParts, toggleBinary } from '../domain/rule';
import type { CivilDate } from '../domain/coptic';
import { getRepo } from '../db/repo';
import { starterPractices, DEFAULT_SELECTION } from '../db/seed';

interface RuleState {
  loaded: boolean;
  accountId: string | null;
  practices: Practice[];
  logs: PracticeLog[];
  restDays: Set<string>;

  /** Load (or switch to) an account's rule data. */
  load: (accountId: string) => Promise<void>;
  /** Clear all in-memory data (sign-out). */
  clear: () => void;
  /** Dev helper: replace the rule with the default starter set. */
  reseed: () => Promise<void>;

  savePractice: (p: Practice) => Promise<void>;
  removePractice: (id: string) => Promise<void>;

  logValue: (practice: Practice, date: CivilDate, value: number) => Promise<void>;
  logParts: (practice: Practice, date: CivilDate, completed: readonly string[]) => Promise<void>;
  toggle: (practice: Practice, date: CivilDate) => Promise<void>;

  setRestDay: (date: CivilDate, on: boolean) => Promise<void>;

  logsFor: (practiceId: string) => PracticeLog[];
  logsByPractice: () => Record<string, PracticeLog[]>;
}

function upsertLogLocal(logs: PracticeLog[], next: PracticeLog): PracticeLog[] {
  const k = (l: PracticeLog) => `${l.practiceId}|${dateKey(l.date)}`;
  const filtered = logs.filter((l) => k(l) !== k(next));
  return [...filtered, next];
}

export const useRule = create<RuleState>((set, get) => ({
  loaded: false,
  accountId: null,
  practices: [],
  logs: [],
  restDays: new Set(),

  load: async (accountId) => {
    const repo = getRepo(accountId);
    await repo.init();
    const [practices, logs, rest] = [
      await repo.listPractices(accountId),
      await repo.listLogs(accountId),
      await repo.listRestDays(accountId),
    ];
    set({ loaded: true, accountId, practices, logs, restDays: new Set(rest) });
  },

  clear: () => set({ loaded: true, accountId: null, practices: [], logs: [], restDays: new Set() }),

  reseed: async () => {
    const accountId = get().accountId;
    if (!accountId) return;
    const repo = getRepo(accountId);
    for (const p of get().practices) await repo.deletePractice(accountId, p.id);
    const seeded = starterPractices(Date.now(), DEFAULT_SELECTION);
    for (const p of seeded) await repo.upsertPractice(accountId, p);
    set({ practices: seeded, logs: [] });
  },

  savePractice: async (p) => {
    const accountId = get().accountId;
    if (!accountId) return;
    await getRepo(accountId).upsertPractice(accountId, p);
    set((st) => {
      const exists = st.practices.some((x) => x.id === p.id);
      const practices = exists ? st.practices.map((x) => (x.id === p.id ? p : x)) : [...st.practices, p];
      return { practices: practices.sort((a, b) => a.sortOrder - b.sortOrder) };
    });
  },

  removePractice: async (id) => {
    const accountId = get().accountId;
    if (!accountId) return;
    await getRepo(accountId).deletePractice(accountId, id);
    set((st) => ({
      practices: st.practices.filter((p) => p.id !== id),
      logs: st.logs.filter((l) => l.practiceId !== id),
    }));
  },

  logValue: async (practice, date, value) => {
    const accountId = get().accountId;
    if (!accountId) return;
    const log = logFromValue(practice, date, value);
    await getRepo(accountId).upsertLog(accountId, log);
    set((st) => ({ logs: upsertLogLocal(st.logs, log) }));
  },

  logParts: async (practice, date, completed) => {
    const accountId = get().accountId;
    if (!accountId) return;
    const log = logFromParts(practice, date, completed);
    await getRepo(accountId).upsertLog(accountId, log);
    set((st) => ({ logs: upsertLogLocal(st.logs, log) }));
  },

  toggle: async (practice, date) => {
    const accountId = get().accountId;
    if (!accountId) return;
    const current = get().logsFor(practice.id).find((l) => dateKey(l.date) === dateKey(date));
    const log = toggleBinary(practice, date, current);
    await getRepo(accountId).upsertLog(accountId, log);
    set((st) => ({ logs: upsertLogLocal(st.logs, log) }));
  },

  setRestDay: async (date, on) => {
    const accountId = get().accountId;
    if (!accountId) return;
    const key = dateKey(date);
    await getRepo(accountId).setRestDay(accountId, key, on);
    set((st) => {
      const next = new Set(st.restDays);
      if (on) next.add(key);
      else next.delete(key);
      return { restDays: next };
    });
  },

  logsFor: (practiceId) => get().logs.filter((l) => l.practiceId === practiceId),

  logsByPractice: () => {
    const out: Record<string, PracticeLog[]> = {};
    for (const l of get().logs) (out[l.practiceId] ??= []).push(l);
    return out;
  },
}));
