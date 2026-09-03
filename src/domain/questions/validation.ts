/**
 * Draft validation and permissions — the predicates the composer and thread
 * screens use to enable or disable their controls.
 *
 * Validation returns CODES, never prose: all user-facing strings live in
 * src/ui/copy.ts (ARCHITECTURE.md), so this module stays pure and translatable.
 *
 * No react/react-native/expo imports; no `new Date()`.
 */
import { LIMITS } from '../limits';
import type { Citation } from '../citation';
import type { Answer, AuthorRef, Question, QuestionTopic } from './types';
import { MAX_TOPICS, isOwnPost } from './types';

export const MIN_QUESTION_TITLE = 8;
export const MIN_ANSWER_BODY = 2;

export type QuestionIssue =
  | 'title-too-short'
  | 'title-too-long'
  | 'body-too-long'
  | 'too-many-topics';

export type AnswerIssue = 'body-empty' | 'body-too-long';

export interface QuestionDraft {
  readonly title: string;
  readonly body: string;
  readonly topics: readonly QuestionTopic[];
  readonly citation: Citation | null;
  readonly anonymous: boolean;
}

export function validateQuestionDraft(d: QuestionDraft): readonly QuestionIssue[] {
  const issues: QuestionIssue[] = [];
  const title = d.title.trim();
  if (title.length < MIN_QUESTION_TITLE) issues.push('title-too-short');
  if (title.length > LIMITS.questionTitle) issues.push('title-too-long');
  if (d.body.length > LIMITS.questionBody) issues.push('body-too-long');
  if (d.topics.length > MAX_TOPICS) issues.push('too-many-topics');
  return issues;
}

export function validateAnswerDraft(body: string): readonly AnswerIssue[] {
  const issues: AnswerIssue[] = [];
  const trimmed = body.trim();
  if (trimmed.length < MIN_ANSWER_BODY) issues.push('body-empty');
  if (trimmed.length > LIMITS.answerBody) issues.push('body-too-long');
  return issues;
}

// --- permissions ----------------------------------------------------------

/** Only the asker marks a best answer, and not on a removed question. */
export function canMarkBest(q: Question, viewerAccountId: string | null): boolean {
  return q.moderation.status !== 'removed' && isOwnPost(q.author, viewerAccountId);
}

export function canEditPost(author: AuthorRef, viewerAccountId: string | null): boolean {
  return isOwnPost(author, viewerAccountId);
}

/** You cannot report yourself. */
export function canReport(author: AuthorRef, viewerAccountId: string | null): boolean {
  return viewerAccountId !== null && !isOwnPost(author, viewerAccountId);
}

/** You cannot affirm your own words. */
export function canAffirm(author: AuthorRef, viewerAccountId: string | null): boolean {
  return viewerAccountId !== null && !isOwnPost(author, viewerAccountId);
}

/**
 * Anonymity is IMMUTABLE once a post exists. Flipping it on an edit would
 * retroactively attach a name to words written in confidence — so the composer
 * disables the toggle when editing, and the store ignores the flag.
 */
export function anonymityLocked(existing: Question | Answer | undefined | null): boolean {
  return Boolean(existing);
}

/** A best answer must be a top-level answer on this question. */
export function isMarkableBest(a: Answer, questionId: string): boolean {
  return a.questionId === questionId && a.parentAnswerId === null;
}
