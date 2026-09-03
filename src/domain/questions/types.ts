/**
 * The Questions model — questions asked of the community, their answers, one
 * level of replies, affirmations (upvotes), an asker-marked best answer, and
 * moderation state.
 *
 * ⚠️ Unlike every other entity in this app, a question is NOT single-owner
 * private data: it is written by one account and read by all. So the types carry
 * an explicit `AuthorRef` instead of leaning on an ambient `accountId`, and the
 * repo methods for these entities deliberately take no `accountId` parameter
 * (see src/db/repo.ts). That asymmetry is the whole point — it is what lets the
 * eventual move to Supabase be an RLS policy rather than a re-keying of rows.
 *
 * Pure TypeScript — no react/react-native/expo imports, no `new Date()`
 * (enforced by __tests__/architecture/domain-purity.test.ts).
 */
import type { Citation } from '../citation';

// --- identity -------------------------------------------------------------

/**
 * Who wrote a post.
 *
 * `accountId` is ALWAYS retained, even when anonymous — it is needed for
 * best-answer permissions, for "your questions", and to stop you affirming
 * yourself. Anonymity here means "not shown to other readers", not "unknown to
 * the store": it is pseudonymity, and the privacy copy should say so.
 *
 * When `isAnonymous` is true, `displayName` MUST be null and is never persisted.
 * `displayName` is a SNAPSHOT taken at write time, not a live join — a reader
 * cannot read the author's account row in a multi-user world.
 */
export interface AuthorRef {
  readonly accountId: string;
  readonly isAnonymous: boolean;
  readonly displayName: string | null;
}

/** Build an AuthorRef, enforcing the "no name when anonymous" invariant. */
export function authorRef(accountId: string, displayName: string | null, isAnonymous: boolean): AuthorRef {
  return { accountId, isAnonymous, displayName: isAnonymous ? null : (displayName ?? null) };
}

/** Whether `viewerAccountId` wrote this post — works for anonymous posts too. */
export function isOwnPost(author: AuthorRef, viewerAccountId: string | null): boolean {
  return viewerAccountId !== null && author.accountId === viewerAccountId;
}

/** The name to show for an author. Callers supply the "Anonymous" label. */
export function authorLabel(author: AuthorRef, anonymousLabel: string): string {
  return author.isAnonymous || !author.displayName ? anonymousLabel : author.displayName;
}

// --- topics ---------------------------------------------------------------

/** Fixed vocabulary — ids only; the labels live in src/ui/copy.ts. */
export type QuestionTopic =
  | 'scripture'
  | 'liturgy'
  | 'fasting'
  | 'prayer'
  | 'saints'
  | 'doctrine'
  | 'sacraments'
  | 'church-life'
  | 'practical';

export const QUESTION_TOPICS: readonly QuestionTopic[] = [
  'scripture',
  'liturgy',
  'prayer',
  'fasting',
  'saints',
  'doctrine',
  'sacraments',
  'church-life',
  'practical',
];

/** At most this many topics on one question. */
export const MAX_TOPICS = 3;

// --- moderation -----------------------------------------------------------

export type ReportReason = 'off-topic' | 'disrespectful' | 'doctrinal-error' | 'spam' | 'private-info' | 'other';

export const REPORT_REASONS: readonly ReportReason[] = [
  'off-topic',
  'disrespectful',
  'doctrinal-error',
  'spam',
  'private-info',
  'other',
];

export type ModerationStatus = 'visible' | 'flagged' | 'hidden' | 'removed';

export interface ModerationState {
  readonly status: ModerationStatus;
  readonly reportCount: number;
  /** Distinct reasons, in first-seen order. */
  readonly reasons: readonly ReportReason[];
  /** When a decision was last applied; null while untouched. */
  readonly reviewedAt: number | null;
}

export type PostKind = 'question' | 'answer';

export interface Report {
  readonly id: string;
  readonly targetType: PostKind;
  readonly targetId: string;
  readonly reporterAccountId: string;
  readonly reason: ReportReason;
  readonly note?: string;
  readonly createdAt: number;
}

// --- posts ----------------------------------------------------------------

export interface Question {
  readonly id: string;
  readonly author: AuthorRef;
  readonly title: string;
  readonly body: string;
  /** Zero or one citation — the passage this was asked about. */
  readonly citation: Citation | null;
  readonly topics: readonly QuestionTopic[];
  /** The asker's chosen answer. Always references a TOP-LEVEL answer. */
  readonly bestAnswerId: string | null;
  readonly moderation: ModerationState;
  /** Denormalized counters — kept in step by the store; a DB trigger later. */
  readonly affirmations: number;
  readonly answerCount: number;
  readonly createdAt: number;
  readonly updatedAt: number;
}

export interface Answer {
  readonly id: string;
  readonly questionId: string;
  /** null = a top-level answer; otherwise the top-level answer replied to. */
  readonly parentAnswerId: string | null;
  readonly author: AuthorRef;
  readonly body: string;
  readonly affirmations: number;
  readonly moderation: ModerationState;
  readonly createdAt: number;
  readonly updatedAt: number;
}

export interface Vote {
  readonly targetType: PostKind;
  readonly targetId: string;
  readonly voterAccountId: string;
  readonly createdAt: number;
}

/** Stable key for a vote held in an in-memory Set. */
export function voteKey(targetType: PostKind, targetId: string): string {
  return `${targetType}:${targetId}`;
}

/**
 * The thread is two levels deep: answers, and replies to answers. A reply to a
 * reply is re-parented onto its top-level ancestor rather than nesting further —
 * deep nesting makes the ranking dishonest and the hairline layout unreadable.
 */
export const MAX_REPLY_DEPTH = 2;
