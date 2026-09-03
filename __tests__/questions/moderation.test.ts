/**
 * Moderation state machine: every legal transition accepted, every illegal one
 * refused, auto-escalation at the report thresholds, and the visibility rule
 * that keeps a hidden post readable by its own author.
 */
import {
  AUTO_FLAG_REPORTS,
  AUTO_HIDE_REPORTS,
  MODERATION_TRANSITIONS,
  applyReport,
  canTransition,
  initialModeration,
  isPubliclyVisible,
  isVisibleTo,
  moderate,
  type ModerationState,
  type ModerationStatus,
} from '../../src/domain/questions';

const ALL: ModerationStatus[] = ['visible', 'flagged', 'hidden', 'removed'];
const at = (status: ModerationStatus, reportCount = 0): ModerationState => ({
  status,
  reportCount,
  reasons: [],
  reviewedAt: null,
});

describe('transitions', () => {
  it('accepts exactly the transitions in the table', () => {
    for (const from of ALL) {
      for (const to of ALL) {
        expect(canTransition(from, to)).toBe(MODERATION_TRANSITIONS[from].includes(to));
      }
    }
  });

  it('treats removed as terminal', () => {
    expect(MODERATION_TRANSITIONS.removed).toHaveLength(0);
    for (const to of ALL) expect(canTransition('removed', to)).toBe(false);
  });

  it('returns the state unchanged when an action is illegal', () => {
    const removed = at('removed');
    // A stale review screen must not be able to resurrect removed content.
    expect(moderate(removed, 'restore', 100)).toBe(removed);
    expect(moderate(removed, 'hide', 100)).toBe(removed);
  });

  it('applies a legal decision and stamps the review time', () => {
    const next = moderate(at('flagged'), 'dismiss', 500);
    expect(next.status).toBe('visible');
    expect(next.reviewedAt).toBe(500);
  });
});

describe('applyReport', () => {
  it('flags on the first report and hides at the threshold', () => {
    let state = initialModeration();
    expect(state.status).toBe('visible');

    state = applyReport(state, 'off-topic', 1);
    expect(state.reportCount).toBe(AUTO_FLAG_REPORTS);
    expect(state.status).toBe('flagged');

    state = applyReport(state, 'spam', 2);
    expect(state.status).toBe('flagged');

    state = applyReport(state, 'disrespectful', 3);
    expect(state.reportCount).toBe(AUTO_HIDE_REPORTS);
    expect(state.status).toBe('hidden');
  });

  it('dedupes reasons but keeps first-seen order', () => {
    let state = initialModeration();
    state = applyReport(state, 'spam', 1);
    state = applyReport(state, 'off-topic', 2);
    state = applyReport(state, 'spam', 3);
    expect(state.reasons).toEqual(['spam', 'off-topic']);
    // Deduping the reason must not swallow the count.
    expect(state.reportCount).toBe(3);
  });

  it('leaves a removed post alone', () => {
    const removed = at('removed', 9);
    expect(applyReport(removed, 'spam', 10)).toBe(removed);
  });
});

describe('visibility', () => {
  it('shows visible and flagged posts to everyone', () => {
    expect(isPubliclyVisible(at('visible'))).toBe(true);
    expect(isPubliclyVisible(at('flagged'))).toBe(true);
    expect(isPubliclyVisible(at('hidden'))).toBe(false);
    expect(isPubliclyVisible(at('removed'))).toBe(false);
  });

  it('keeps a hidden post visible to its author but no one else', () => {
    const hidden = at('hidden', 3);
    expect(isVisibleTo(hidden, 'author', 'author')).toBe(true);
    expect(isVisibleTo(hidden, 'author', 'stranger')).toBe(false);
    expect(isVisibleTo(hidden, 'author', null)).toBe(false);
  });

  it('hides a removed post from everyone, author included', () => {
    const removed = at('removed');
    expect(isVisibleTo(removed, 'author', 'author')).toBe(false);
    expect(isVisibleTo(removed, 'author', 'stranger')).toBe(false);
  });
});
