/**
 * Journal store — free-form reflection entries, scoped per account.
 * Thin glue over the repo (same pattern as useRule).
 */
import { create } from 'zustand';
import { getRepo, type JournalEntry } from '../db/repo';
import { id } from '../platform/id';
import type { CivilDate } from '../domain/coptic';

interface JournalState {
  accountId: string | null;
  entries: JournalEntry[];

  load: (accountId: string) => Promise<void>;
  clear: () => void;
  /** Create or update an entry; returns its id. */
  save: (input: { id?: string; date: CivilDate; title: string; body: string; passageRef?: string }) => Promise<string>;
  remove: (id: string) => Promise<void>;
  get: (id: string) => JournalEntry | undefined;
}

export const useJournal = create<JournalState>((set, get) => ({
  accountId: null,
  entries: [],

  load: async (accountId) => {
    const entries = await getRepo().listJournal(accountId);
    set({ accountId, entries });
  },

  clear: () => set({ accountId: null, entries: [] }),

  save: async ({ id: entryId, date, title, body, passageRef }) => {
    const accountId = get().accountId;
    if (!accountId) return '';
    const existing = entryId ? get().entries.find((e) => e.id === entryId) : undefined;
    const now = Date.now();
    const entry: JournalEntry = {
      id: existing?.id ?? entryId ?? id(),
      date,
      title,
      body,
      passageRef,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };
    await getRepo().upsertJournal(accountId, entry);
    set((st) => {
      const rest = st.entries.filter((e) => e.id !== entry.id);
      return { entries: [entry, ...rest].sort((a, b) => b.createdAt - a.createdAt) };
    });
    return entry.id;
  },

  remove: async (entryId) => {
    const accountId = get().accountId;
    if (!accountId) return;
    await getRepo().deleteJournal(accountId, entryId);
    set((st) => ({ entries: st.entries.filter((e) => e.id !== entryId) }));
  },

  get: (entryId) => get().entries.find((e) => e.id === entryId),
}));
