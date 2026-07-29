/**
 * Feedback — the pure shape of an in-app feedback submission and the logic that
 * maps it onto a Linear issue. Kept free of React/DB/Expo so it is fully testable
 * and can be shared by the client form and (mirrored) by the Edge Function.
 *
 * The user picks a Type and a Priority; the app captures which screen they were
 * on and their message. The Edge Function turns that into a Linear issue: Type →
 * an issue label, Priority → Linear's numeric priority.
 */

/** What kind of feedback this is. Drives the Linear label + a little triage. */
export type FeedbackType = 'bug' | 'content' | 'idea' | 'other';

/** How urgent the user feels it is. Maps to Linear's priority scale. */
export type FeedbackPriority = 'urgent' | 'high' | 'normal';

export const FEEDBACK_TYPES: readonly FeedbackType[] = ['bug', 'content', 'idea', 'other'];
export const FEEDBACK_PRIORITIES: readonly FeedbackPriority[] = ['urgent', 'high', 'normal'];

/** A complete submission from the client (before server-side enrichment). */
export interface FeedbackSubmission {
  readonly type: FeedbackType;
  readonly priority: FeedbackPriority;
  /** The route/screen the user was on when they opened the form (e.g. "/(tabs)/today"). */
  readonly screen: string | null;
  readonly message: string;
}

/**
 * Type → the Linear label name we tag the issue with. The Edge Function resolves
 * these names to ids against the target team (case-insensitive), skipping any it
 * can't find, so the mapping stays resilient if labels are renamed. `other` adds
 * no type label (every ticket still gets the shared "Community feedback" label).
 */
export const LINEAR_LABEL_FOR_TYPE: Record<FeedbackType, string | null> = {
  bug: 'Bug',
  content: 'Enhancement',
  idea: 'Feature',
  other: null,
};

/** The label attached to every in-app submission so they're filterable in Linear. */
export const COMMUNITY_FEEDBACK_LABEL = 'Community feedback';

/**
 * Priority → Linear's numeric priority. Linear uses 0 = none, 1 = urgent,
 * 2 = high, 3 = medium/normal, 4 = low.
 */
export const LINEAR_PRIORITY_FOR: Record<FeedbackPriority, number> = {
  urgent: 1,
  high: 2,
  normal: 3,
};

/** Max message length we accept (guards the ticket body; enforced client + server). */
export const MAX_FEEDBACK_LENGTH = 2000;

/** True when a submission is well-formed enough to send. */
export function isValidFeedback(input: {
  type?: unknown;
  priority?: unknown;
  message?: unknown;
}): boolean {
  const typeOk = FEEDBACK_TYPES.includes(input.type as FeedbackType);
  const prioOk = FEEDBACK_PRIORITIES.includes(input.priority as FeedbackPriority);
  const msgOk =
    typeof input.message === 'string' &&
    input.message.trim().length > 0 &&
    input.message.length <= MAX_FEEDBACK_LENGTH;
  return typeOk && prioOk && msgOk;
}

/** The Linear issue title for a submission — "[Feedback] <Type> — <first line>". */
export function feedbackTitle(input: FeedbackSubmission): string {
  const label = TYPE_TITLE[input.type];
  const firstLine = input.message.trim().split('\n')[0]!.trim();
  const snippet = firstLine.length > 80 ? `${firstLine.slice(0, 79)}…` : firstLine;
  return `[Feedback] ${label} — ${snippet}`;
}

/** Human titles for each type (UI + issue title). */
export const TYPE_TITLE: Record<FeedbackType, string> = {
  bug: 'Bug',
  content: 'Content',
  idea: 'Idea',
  other: 'Other',
};
