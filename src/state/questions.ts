/**
 * Questions store — the feed, the reader's affirmations, and every write path.
 * Thin glue over the repo (same pattern as useHighlights/useJournal), with all
 * ordering, filtering and search delegating to the pure domain in
 * @domain/questions.
 *
 * Two things differ from every other store in the app, both on purpose:
 *
 *  • The repo calls carry no `accountId`. Questions are written by one account
 *    and read by all; `accountId` here identifies the READER, for permissions
 *    and attribution, not the owner of the rows.
 *
 *  • Guests may read but never write. Guest content is promised never to leave
 *    the device (see GUEST_ACCOUNT_ID in src/db/repo.ts), and a guest has no
 *    stable identity to attribute a post to. Today the guest repo is local, so a
 *    write would technically succeed — refusing now keeps the rule from becoming
 *    a surprise the day a real backend is switched on.
 */
import { create } from 'zustand';
import { GUEST_ACCOUNT_ID, getRepo } from '../db/repo';
import { QUESTIONS_SEED_KEY, seedQuestions } from '../db/seedQuestions';
import { id } from '../platform/id';
import { LIMITS, clampText } from '../domain/limits';
import type { Citation } from '../domain/citation';
import {
  MAX_TOPICS,
  applyReport,
  authorRef,
  canAffirm,
  filterQuestions,
  initialModeration,
  noticesForAsker,
  searchQuestions,
  sortQuestions,
  totalNewAnswers,
  voteKey,
  type Answer,
  type FeedSort,
  type PostKind,
  type Question,
  type QuestionFilter,
  type QuestionNotice,
  type QuestionSearchHit,
  type QuestionTopic,
  type ReportReason,
} from '../domain/questions';

const ANON_DEFAULT_KEY = 'questions.anonymousDefault';
const LAST_SEEN_KEY = 'questions.lastSeenAt';

export interface AskInput {
  id?: string;
  title: string;
  body?: string;
  topics?: readonly QuestionTopic[];
  citation?: Citation | null;
  /** Per-post choice. IGNORED when editing — anonymity is immutable. */
  anonymous?: boolean;
}

interface QuestionsState {
  /** The READER, not an owner. */
  accountId: string | null;
  displayName: string | null;
  items: Question[];
  /** Every answer in the app — small in this phase, and the notices need them. */
  answers: Answer[];
  /** voteKey(kind, id) for everything this reader has affirmed. */
  myVotes: Set<string>;
  anonymousDefault: boolean;
  lastSeenAt: number;
  seeded: boolean;

  load: (accountId: string, displayName?: string | null) => Promise<void>;
  clear: () => void;

  ask: (input: AskInput) => Promise<string>;
  remove: (id: string) => Promise<void>;
  get: (id: string) => Question | undefined;

  toggleAffirm: (targetType: PostKind, targetId: string) => Promise<void>;
  report: (targetType: PostKind, targetId: string, reason: ReportReason, note?: string) => Promise<void>;
  setAnonymousDefault: (on: boolean) => Promise<void>;
  markFeedSeen: () => Promise<void>;
  /** Re-read one question + its answers after a thread write. */
  refresh: (questionId: string) => Promise<void>;

  // selectors — thin wrappers over the pure domain
  feed: (sort: FeedSort, filter?: QuestionFilter) => Question[];
  search: (query: string, filter?: QuestionFilter) => QuestionSearchHit[];
  hasAffirmed: (targetType: PostKind, targetId: string) => boolean;
  canAffirmPost: (authorAccountId: string) => boolean;
  notices: () => QuestionNotice[];
  unseenAnswerCount: () => number;
  isGuest: () => boolean;
}

/** Writes are refused for guests and when signed out. */
function writable(accountId: string | null): accountId is string {
  return accountId !== null && accountId !== GUEST_ACCOUNT_ID;
}

export const useQuestions = create<QuestionsState>((set, get) => ({
  accountId: null,
  displayName: null,
  items: [],
  answers: [],
  myVotes: new Set(),
  anonymousDefault: false,
  lastSeenAt: 0,
  seeded: false,

  load: async (accountId, displayName = null) => {
    const repo = getRepo(accountId);

    // Seed only for a real account: a guest should not have sample rows written
    // into the store they were told stays theirs.
    if (writable(accountId)) {
      await seedQuestions(repo, { accountId, displayName }, Date.now());
    }

    const items = await repo.listQuestions();
    const answers = (
      await Promise.all(items.map((q) => repo.listAnswers(q.id)))
    ).flat();
    const votes = await repo.listVotes(accountId);
    const anon = await repo.getSetting(ANON_DEFAULT_KEY);
    const seen = await repo.getSetting(LAST_SEEN_KEY);
    const seededAt = await repo.getSetting(QUESTIONS_SEED_KEY);

    set({
      accountId,
      displayName,
      items,
      answers,
      myVotes: new Set(votes.map((v) => voteKey(v.targetType, v.targetId))),
      anonymousDefault: anon === 'true',
      // 0 on a first run, so the seeded answers to the reader's own seeded
      // question surface as "new" — otherwise the notice path would have nothing
      // to show until someone else joined, which cannot happen in this phase.
      lastSeenAt: seen ? Number(seen) : 0,
      seeded: seededAt !== null,
    });
  },

  clear: () =>
    set({
      accountId: null,
      displayName: null,
      items: [],
      answers: [],
      myVotes: new Set(),
      anonymousDefault: false,
      lastSeenAt: 0,
      seeded: false,
    }),

  ask: async (input) => {
    const { accountId, displayName, items } = get();
    if (!writable(accountId)) return '';

    const repo = getRepo(accountId);
    const now = Date.now();
    const existing = input.id ? items.find((q) => q.id === input.id) : undefined;

    // Anonymity is fixed at first save — flipping it later would retroactively
    // attach a name to words written in confidence.
    const author = existing
      ? existing.author
      : authorRef(accountId, displayName, input.anonymous ?? get().anonymousDefault);

    const question: Question = {
      id: existing?.id ?? input.id ?? id(),
      author,
      title: clampText(input.title.trim(), LIMITS.questionTitle),
      body: clampText(input.body ?? '', LIMITS.questionBody),
      citation: input.citation ?? existing?.citation ?? null,
      topics: (input.topics ?? existing?.topics ?? []).slice(0, MAX_TOPICS),
      bestAnswerId: existing?.bestAnswerId ?? null,
      moderation: existing?.moderation ?? initialModeration(),
      affirmations: existing?.affirmations ?? 0,
      answerCount: existing?.answerCount ?? 0,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    await repo.upsertQuestion(question);
    set({
      items: existing
        ? items.map((q) => (q.id === question.id ? question : q))
        : [question, ...items],
    });
    return question.id;
  },

  remove: async (questionId) => {
    const { accountId, items, answers } = get();
    if (!writable(accountId)) return;
    await getRepo(accountId).deleteQuestion(questionId);
    set({
      items: items.filter((q) => q.id !== questionId),
      answers: answers.filter((a) => a.questionId !== questionId),
    });
  },

  get: (questionId) => get().items.find((q) => q.id === questionId),

  toggleAffirm: async (targetType, targetId) => {
    const { accountId, items, answers, myVotes } = get();
    if (!writable(accountId)) return;

    const key = voteKey(targetType, targetId);
    const on = !myVotes.has(key);
    const delta = on ? 1 : -1;

    const bump = <T extends { id: string; affirmations: number }>(rows: T[]): T[] =>
      rows.map((r) => (r.id === targetId ? { ...r, affirmations: Math.max(0, r.affirmations + delta) } : r));

    // Optimistic: the lozenge must respond instantly.
    const nextVotes = new Set(myVotes);
    if (on) nextVotes.add(key);
    else nextVotes.delete(key);
    const nextItems = targetType === 'question' ? bump(items) : items;
    const nextAnswers = targetType === 'answer' ? bump(answers) : answers;
    set({ myVotes: nextVotes, items: nextItems, answers: nextAnswers });

    try {
      const repo = getRepo(accountId);
      await repo.setVote(
        { targetType, targetId, voterAccountId: accountId, createdAt: Date.now() },
        on,
      );
      const changed =
        targetType === 'question'
          ? nextItems.find((q) => q.id === targetId)
          : nextAnswers.find((a) => a.id === targetId);
      if (changed) {
        if (targetType === 'question') await repo.upsertQuestion(changed as Question);
        else await repo.upsertAnswer(changed as Answer);
      }
    } catch {
      // Roll the whole optimistic change back — a count that drifts from the
      // store is worse than a vote that visibly did not take.
      set({ myVotes, items, answers });
    }
  },

  report: async (targetType, targetId, reason, note) => {
    const { accountId, items, answers } = get();
    if (!writable(accountId)) return;
    const repo = getRepo(accountId);
    const now = Date.now();

    // The audit row goes first: a failure here must not leave a post counted as
    // reported with no record of who reported it or why.
    await repo.addReport({
      id: id(),
      targetType,
      targetId,
      reporterAccountId: accountId,
      reason,
      note: note ? clampText(note, LIMITS.reportNote) : undefined,
      createdAt: now,
    });

    if (targetType === 'question') {
      const target = items.find((q) => q.id === targetId);
      if (!target) return;
      const updated: Question = { ...target, moderation: applyReport(target.moderation, reason, now) };
      await repo.upsertQuestion(updated);
      set({ items: items.map((q) => (q.id === targetId ? updated : q)) });
    } else {
      const target = answers.find((a) => a.id === targetId);
      if (!target) return;
      const updated: Answer = { ...target, moderation: applyReport(target.moderation, reason, now) };
      await repo.upsertAnswer(updated);
      set({ answers: answers.map((a) => (a.id === targetId ? updated : a)) });
    }
  },

  setAnonymousDefault: async (on) => {
    const { accountId } = get();
    set({ anonymousDefault: on });
    if (accountId) await getRepo(accountId).setSetting(ANON_DEFAULT_KEY, String(on));
  },

  markFeedSeen: async () => {
    const { accountId } = get();
    const now = Date.now();
    set({ lastSeenAt: now });
    if (accountId) await getRepo(accountId).setSetting(LAST_SEEN_KEY, String(now));
  },

  refresh: async (questionId) => {
    const { accountId, items, answers } = get();
    if (!accountId) return;
    const repo = getRepo(accountId);
    const question = await repo.getQuestion(questionId);
    const fresh = await repo.listAnswers(questionId);
    set({
      items: question ? items.map((q) => (q.id === questionId ? question : q)) : items,
      answers: [...answers.filter((a) => a.questionId !== questionId), ...fresh],
    });
  },

  feed: (sort, filter) => {
    const { items, accountId } = get();
    return sortQuestions(filterQuestions(items, { viewerAccountId: accountId, ...filter }), sort);
  },

  search: (query, filter) => {
    const { items, accountId } = get();
    return searchQuestions(items, query, { viewerAccountId: accountId, ...filter });
  },

  hasAffirmed: (targetType, targetId) => get().myVotes.has(voteKey(targetType, targetId)),

  canAffirmPost: (authorAccountId) => {
    const { accountId } = get();
    if (!writable(accountId)) return false;
    return canAffirm({ accountId: authorAccountId, isAnonymous: false, displayName: null }, accountId);
  },

  notices: () => {
    const { accountId, items, answers, lastSeenAt } = get();
    if (!accountId) return [];
    return noticesForAsker(items, answers, accountId, lastSeenAt);
  },

  unseenAnswerCount: () => totalNewAnswers(get().notices()),

  isGuest: () => get().accountId === GUEST_ACCOUNT_ID,
}));
