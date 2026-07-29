/**
 * Feedback domain — validation + Linear mappings (pure). Mirrors the constants
 * duplicated in supabase/functions/submit-feedback/index.ts; if these change,
 * update the Edge Function too.
 */
import {
  FEEDBACK_TYPES,
  FEEDBACK_PRIORITIES,
  LINEAR_LABEL_FOR_TYPE,
  LINEAR_PRIORITY_FOR,
  COMMUNITY_FEEDBACK_LABEL,
  MAX_FEEDBACK_LENGTH,
  isValidFeedback,
  feedbackTitle,
  TYPE_TITLE,
  type FeedbackSubmission,
} from '../../src/domain/feedback';

describe('feedback enums', () => {
  test('four types and three priorities', () => {
    expect(FEEDBACK_TYPES).toEqual(['bug', 'content', 'idea', 'other']);
    expect(FEEDBACK_PRIORITIES).toEqual(['urgent', 'high', 'normal']);
  });
});

describe('LINEAR_PRIORITY_FOR', () => {
  test('maps to Linear numeric priority (1=urgent … 3=normal)', () => {
    expect(LINEAR_PRIORITY_FOR.urgent).toBe(1);
    expect(LINEAR_PRIORITY_FOR.high).toBe(2);
    expect(LINEAR_PRIORITY_FOR.normal).toBe(3);
  });
});

describe('LINEAR_LABEL_FOR_TYPE', () => {
  test('bug/content/idea carry a label; other carries none', () => {
    expect(LINEAR_LABEL_FOR_TYPE.bug).toBe('Bug');
    expect(LINEAR_LABEL_FOR_TYPE.content).toBe('Enhancement');
    expect(LINEAR_LABEL_FOR_TYPE.idea).toBe('Feature');
    expect(LINEAR_LABEL_FOR_TYPE.other).toBeNull();
  });

  test('every type has an entry', () => {
    for (const t of FEEDBACK_TYPES) expect(t in LINEAR_LABEL_FOR_TYPE).toBe(true);
  });

  test('the shared community label is defined', () => {
    expect(COMMUNITY_FEEDBACK_LABEL).toBe('Community feedback');
  });
});

describe('isValidFeedback', () => {
  test('accepts a well-formed submission', () => {
    expect(isValidFeedback({ type: 'bug', priority: 'high', message: 'It crashed.' })).toBe(true);
  });

  test('rejects unknown type or priority', () => {
    expect(isValidFeedback({ type: 'nope', priority: 'high', message: 'x' })).toBe(false);
    expect(isValidFeedback({ type: 'bug', priority: 'meh', message: 'x' })).toBe(false);
  });

  test('rejects empty / whitespace / over-long messages', () => {
    expect(isValidFeedback({ type: 'bug', priority: 'high', message: '' })).toBe(false);
    expect(isValidFeedback({ type: 'bug', priority: 'high', message: '   ' })).toBe(false);
    expect(isValidFeedback({ type: 'bug', priority: 'high', message: 'a'.repeat(MAX_FEEDBACK_LENGTH + 1) })).toBe(false);
  });
});

describe('feedbackTitle', () => {
  const base: FeedbackSubmission = { type: 'bug', priority: 'high', screen: null, message: '' };

  test('prefixes with type title and the first line', () => {
    expect(feedbackTitle({ ...base, message: 'The Today screen is blank' }))
      .toBe('[Feedback] Bug — The Today screen is blank');
  });

  test('uses only the first line and truncates long ones', () => {
    const long = `${'x'.repeat(200)}\nsecond line`;
    const title = feedbackTitle({ ...base, type: 'idea', message: long });
    expect(title.startsWith('[Feedback] Idea — ')).toBe(true);
    expect(title).not.toContain('second line');
    expect(title.length).toBeLessThan(120);
  });

  test('TYPE_TITLE covers every type', () => {
    for (const t of FEEDBACK_TYPES) expect(typeof TYPE_TITLE[t]).toBe('string');
  });
});
