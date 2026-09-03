/**
 * Moderation — an explicit state machine over a post's visibility.
 *
 * Two principles shape it:
 *   1. Content never silently vanishes on its author. A hidden post stays
 *      visible to whoever wrote it, marked as under review, so no one is left
 *      wondering whether their question posted.
 *   2. `removed` is a TOMBSTONE, not a delete. The row is kept and the body
 *      suppressed at render, so a thread that referenced it keeps its shape.
 *
 * In the local-only phase only auto-escalation from reports fires — there is no
 * moderator role on an account yet, so `moderate()` has no caller in the app but
 * is the seam a review tool will use.
 *
 * Pure TypeScript — no react/react-native/expo imports, no `new Date()`.
 */
import type { ModerationState, ModerationStatus, ReportReason } from './types';

/** Reports needed before a post auto-flags, and before it auto-hides. */
export const AUTO_FLAG_REPORTS = 1;
export const AUTO_HIDE_REPORTS = 3;

export function initialModeration(): ModerationState {
  return { status: 'visible', reportCount: 0, reasons: [], reviewedAt: null };
}

/** Legal transitions. `removed` is terminal. */
export const MODERATION_TRANSITIONS: Readonly<Record<ModerationStatus, readonly ModerationStatus[]>> = {
  visible: ['flagged', 'hidden', 'removed'],
  flagged: ['visible', 'hidden', 'removed'],
  hidden: ['visible', 'flagged', 'removed'],
  removed: [],
};

export function canTransition(from: ModerationStatus, to: ModerationStatus): boolean {
  return MODERATION_TRANSITIONS[from].includes(to);
}

/**
 * Record one report. Escalates automatically at the thresholds; reasons are
 * deduped but keep first-seen order. A removed post is left alone — there is
 * nothing further to escalate to.
 */
export function applyReport(state: ModerationState, reason: ReportReason, now: number): ModerationState {
  if (state.status === 'removed') return state;

  const reportCount = state.reportCount + 1;
  const reasons = state.reasons.includes(reason) ? state.reasons : [...state.reasons, reason];

  let status: ModerationStatus = state.status;
  if (reportCount >= AUTO_HIDE_REPORTS) status = 'hidden';
  else if (reportCount >= AUTO_FLAG_REPORTS && state.status === 'visible') status = 'flagged';

  return {
    status,
    reportCount,
    reasons,
    reviewedAt: status === state.status ? state.reviewedAt : now,
  };
}

export type ModerationAction = 'dismiss' | 'hide' | 'restore' | 'remove';

const ACTION_TARGET: Readonly<Record<ModerationAction, ModerationStatus>> = {
  dismiss: 'visible',
  restore: 'visible',
  hide: 'hidden',
  remove: 'removed',
};

/**
 * Apply an explicit decision. Returns `state` UNCHANGED when the transition is
 * illegal, so a stale review screen can never corrupt a post's status.
 */
export function moderate(state: ModerationState, action: ModerationAction, now: number): ModerationState {
  const to = ACTION_TARGET[action];
  if (!canTransition(state.status, to)) return state;
  return { ...state, status: to, reviewedAt: now };
}

/** Visible to any reader. Flagged content stays up pending review. */
export function isPubliclyVisible(state: ModerationState): boolean {
  return state.status === 'visible' || state.status === 'flagged';
}

/**
 * Visible to THIS viewer. The author keeps seeing their own hidden post (the UI
 * marks it as under review); `removed` is hidden from everyone, author included.
 */
export function isVisibleTo(
  state: ModerationState,
  authorAccountId: string,
  viewerAccountId: string | null,
): boolean {
  if (state.status === 'removed') return false;
  if (isPubliclyVisible(state)) return true;
  return viewerAccountId !== null && viewerAccountId === authorAccountId;
}
