/**
 * One open thread — the question being read, its answers, and the writes made
 * from inside it (answer, reply, mark best).
 *
 * Kept separate from `useQuestions` because the lifecycles differ: the feed
 * loads once per session and lives as long as the account does, while a thread
 * loads on navigation and clears on leaving. Affirmations and reports stay in
 * the feed store so there is exactly one owner of a vote (this store reads
 * across via `useQuestions.getState()`, the same way src/state/notifications.ts
 * reads useRule/useReading).
 */
import { create } from 'zustand';
import { GUEST_ACCOUNT_ID, getRepo } from '../db/repo';
import { id } from '../platform/id';
import { LIMITS, clampText } from '../domain/limits';
import {
  authorRef,
  buildThread,
  canMarkBest,
  initialModeration,
  isMarkableBest,
  replyParentFor,
  type Answer,
  type AnswerRanking,
  type Question,
  type QuestionThread,
} from '../domain/questions';
import { useQuestions } from './questions';

export interface PostAnswerInput {
  body: string;
  /** The answer being replied to, if this is a reply. */
  replyToAnswerId?: string | null;
  anonymous?: boolean;
}

interface ThreadState {
  questionId: string | null;
  question: Question | null;
  answers: Answer[];
  loading: boolean;

  load: (questionId: string) => Promise<void>;
  clear: () => void;

  post: (input: PostAnswerInput) => Promise<string>;
  removeAnswer: (answerId: string) => Promise<void>;
  /** Pass null to un-mark. */
  markBest: (answerId: string | null) => Promise<void>;

  thread: (ranking?: AnswerRanking) => QuestionThread | null;
}

function writable(accountId: string | null): accountId is string {
  return accountId !== null && accountId !== GUEST_ACCOUNT_ID;
}

export const useQuestionThread = create<ThreadState>((set, get) => ({
  questionId: null,
  question: null,
  answers: [],
  loading: false,

  load: async (questionId) => {
    const { accountId } = useQuestions.getState();
    set({ questionId, loading: true });
    const repo = getRepo(accountId ?? undefined);
    const question = await repo.getQuestion(questionId);
    const answers = await repo.listAnswers(questionId);
    set({ questionId, question, answers, loading: false });
  },

  clear: () => set({ questionId: null, question: null, answers: [], loading: false }),

  post: async (input) => {
    const { question, answers } = get();
    const { accountId, displayName, anonymousDefault } = useQuestions.getState();
    if (!question || !writable(accountId)) return '';

    const body = clampText(input.body.trim(), LIMITS.answerBody);
    if (!body) return '';

    // Replying to a reply attaches to its top-level ancestor: the thread stays
    // two levels deep, which keeps ranking honest and the layout readable.
    const target = input.replyToAnswerId ? answers.find((a) => a.id === input.replyToAnswerId) : undefined;
    const parentAnswerId = target ? replyParentFor(target) : null;

    const now = Date.now();
    const answer: Answer = {
      id: id(),
      questionId: question.id,
      parentAnswerId,
      author: authorRef(accountId, displayName, input.anonymous ?? anonymousDefault),
      body,
      affirmations: 0,
      moderation: initialModeration(),
      createdAt: now,
      updatedAt: now,
    };

    const repo = getRepo(accountId);
    await repo.upsertAnswer(answer);

    const nextAnswers = [...answers, answer];
    const updatedQuestion: Question = { ...question, answerCount: nextAnswers.length, updatedAt: now };
    await repo.upsertQuestion(updatedQuestion);

    set({ answers: nextAnswers, question: updatedQuestion });
    await useQuestions.getState().refresh(question.id);

    // TODO(questions/push): when a backend lands, notify the asker from here.
    // Local scheduling cannot reach another device, and in this phase the asker
    // and the answerer are always the same person — so there is nothing honest
    // to send yet. See src/domain/questions/notify.ts for the in-app path.

    return answer.id;
  },

  removeAnswer: async (answerId) => {
    const { question, answers } = get();
    const { accountId } = useQuestions.getState();
    if (!question || !writable(accountId)) return;

    const repo = getRepo(accountId);
    await repo.deleteAnswer(answerId);
    const nextAnswers = answers.filter((a) => a.id !== answerId);

    const updatedQuestion: Question = {
      ...question,
      answerCount: nextAnswers.length,
      // A removed answer cannot remain the best one.
      bestAnswerId: question.bestAnswerId === answerId ? null : question.bestAnswerId,
      updatedAt: Date.now(),
    };
    await repo.upsertQuestion(updatedQuestion);

    set({ answers: nextAnswers, question: updatedQuestion });
    await useQuestions.getState().refresh(question.id);
  },

  markBest: async (answerId) => {
    const { question, answers } = get();
    const { accountId } = useQuestions.getState();
    if (!question || !writable(accountId)) return;
    if (!canMarkBest(question, accountId)) return;

    if (answerId !== null) {
      const target = answers.find((a) => a.id === answerId);
      // Only a top-level answer on this question can be marked.
      if (!target || !isMarkableBest(target, question.id)) return;
    }

    const updated: Question = {
      ...question,
      bestAnswerId: question.bestAnswerId === answerId ? null : answerId,
      updatedAt: Date.now(),
    };
    await getRepo(accountId).upsertQuestion(updated);
    set({ question: updated });
    await useQuestions.getState().refresh(question.id);
  },

  thread: (ranking = 'top') => {
    const { question, answers } = get();
    if (!question) return null;
    const { accountId } = useQuestions.getState();
    return buildThread(question, answers, { viewerAccountId: accountId, ranking });
  },
}));
