/**
 * "Someone answered you" — computed, not pushed.
 *
 * A real cross-device notification needs a server: a push token per device and a
 * trigger on `insert into answers` that reaches the asker. That cannot exist in
 * the local-only phase, and faking it would mean notifying you about your own
 * answer to your own question. So this module powers the honest thing instead —
 * an in-app count, derived from a persisted `lastSeenAt`, shown on the feed.
 *
 * Pure: `lastSeenAt` and `now` are passed in, never read from a clock.
 */
import { isVisibleTo } from './moderation';
import type { Answer, Question } from './types';

export interface QuestionNotice {
  readonly questionId: string;
  readonly questionTitle: string;
  readonly newAnswerCount: number;
  /** createdAt of the most recent qualifying answer — drives ordering. */
  readonly latestAt: number;
}

/**
 * New answers to MY questions since `lastSeenAt`. Excludes anything I wrote
 * myself and anything not visible to me. Newest first.
 */
export function noticesForAsker(
  questions: readonly Question[],
  answers: readonly Answer[],
  viewerAccountId: string,
  lastSeenAt: number,
): QuestionNotice[] {
  const mine = new Map<string, Question>();
  for (const q of questions) {
    if (q.author.accountId === viewerAccountId && q.moderation.status !== 'removed') mine.set(q.id, q);
  }
  if (mine.size === 0) return [];

  const tally = new Map<string, { count: number; latestAt: number }>();
  for (const a of answers) {
    if (!mine.has(a.questionId)) continue;
    if (a.author.accountId === viewerAccountId) continue;
    if (a.createdAt <= lastSeenAt) continue;
    if (!isVisibleTo(a.moderation, a.author.accountId, viewerAccountId)) continue;

    const entry = tally.get(a.questionId);
    if (entry) {
      entry.count += 1;
      entry.latestAt = Math.max(entry.latestAt, a.createdAt);
    } else {
      tally.set(a.questionId, { count: 1, latestAt: a.createdAt });
    }
  }

  const out: QuestionNotice[] = [];
  for (const [questionId, { count, latestAt }] of tally) {
    out.push({
      questionId,
      questionTitle: mine.get(questionId)!.title,
      newAnswerCount: count,
      latestAt,
    });
  }
  out.sort((a, b) => b.latestAt - a.latestAt || (a.questionId < b.questionId ? -1 : 1));
  return out;
}

/** Total new answers across every question I asked — the tab badge. */
export function totalNewAnswers(notices: readonly QuestionNotice[]): number {
  return notices.reduce((sum, n) => sum + n.newAnswerCount, 0);
}
