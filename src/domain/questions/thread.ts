/**
 * Thread building — a flat list of answers into the two-level tree the thread
 * screen renders.
 *
 * Two safety properties matter more than elegance here, because a dropped answer
 * is someone's words disappearing:
 *   • ORPHAN SAFETY — a reply whose parent is missing or removed is re-parented
 *     to the top level, never discarded.
 *   • CYCLE SAFETY — a corrupt parent chain (a reply pointing at a reply, or at
 *     itself) is broken by the depth cap rather than looping forever.
 *
 * Pure TypeScript — no react/react-native/expo imports, no `new Date()`.
 */
import { isVisibleTo } from './moderation';
import { rankAnswers, type AnswerRanking } from './ranking';
import type { Answer, Question } from './types';

export interface ThreadNode {
  readonly answer: Answer;
  readonly replies: readonly ThreadNode[];
}

export interface QuestionThread {
  readonly question: Question;
  /** The asker-marked best answer, lifted out of the ranked list. */
  readonly best: ThreadNode | null;
  /** Top-level answers excluding `best`, in ranked order. */
  readonly answers: readonly ThreadNode[];
  /** Every visible post in the thread, replies included. */
  readonly visibleCount: number;
}

export interface ThreadOptions {
  readonly viewerAccountId: string | null;
  readonly ranking?: AnswerRanking;
}

/**
 * The top-level answer a new reply should attach to. Replying to a reply
 * collapses onto its parent, holding the tree at MAX_REPLY_DEPTH.
 */
export function replyParentFor(target: Answer): string {
  return target.parentAnswerId ?? target.id;
}

export function buildThread(
  question: Question,
  answers: readonly Answer[],
  opts: ThreadOptions,
): QuestionThread {
  const viewer = opts.viewerAccountId;
  const visible = answers.filter((a) => isVisibleTo(a.moderation, a.author.accountId, viewer));

  // Only genuine top-level answers can be parents — this is what breaks cycles
  // and reply-to-reply chains in one step.
  const topLevelIds = new Set(visible.filter((a) => a.parentAnswerId === null).map((a) => a.id));

  const repliesByParent = new Map<string, Answer[]>();
  const roots: Answer[] = [];

  for (const a of visible) {
    const parent = a.parentAnswerId;
    // Orphan safety: an unknown/removed/non-top-level parent promotes the reply.
    if (parent === null || parent === a.id || !topLevelIds.has(parent)) {
      roots.push(a);
      continue;
    }
    const bucket = repliesByParent.get(parent);
    if (bucket) bucket.push(a);
    else repliesByParent.set(parent, [a]);
  }

  const nodeFor = (a: Answer): ThreadNode => ({
    answer: a,
    // Replies are always oldest-first: a conversation reads in the order it happened.
    replies: (repliesByParent.get(a.id) ?? [])
      .slice()
      .sort((x, y) => x.createdAt - y.createdAt || (x.id < y.id ? -1 : 1))
      .map((r) => ({ answer: r, replies: [] })),
  });

  const nodes = roots.map(nodeFor);
  const bestId = question.bestAnswerId;
  const best = bestId ? (nodes.find((n) => n.answer.id === bestId) ?? null) : null;
  const rest = best ? nodes.filter((n) => n.answer.id !== best.answer.id) : nodes;

  return {
    question,
    best,
    answers: rankAnswers(rest, opts.ranking ?? 'top'),
    visibleCount: visible.length,
  };
}
