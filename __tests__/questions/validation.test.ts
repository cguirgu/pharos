/**
 * Draft validation and permissions — including the invariant that matters most
 * for trust: an anonymous post never carries a name, and anonymity cannot be
 * flipped after the fact.
 */
import { LIMITS } from '../../src/domain/limits';
import {
  MIN_QUESTION_TITLE,
  anonymityLocked,
  authorLabel,
  authorRef,
  canAffirm,
  canEditPost,
  canMarkBest,
  canReport,
  initialModeration,
  isMarkableBest,
  isOwnPost,
  validateAnswerDraft,
  validateQuestionDraft,
  type Answer,
  type Question,
  type QuestionDraft,
} from '../../src/domain/questions';

const draft = (over: Partial<QuestionDraft> = {}): QuestionDraft => ({
  title: 'A perfectly reasonable question',
  body: '',
  topics: [],
  citation: null,
  anonymous: false,
  ...over,
});

const question = (over: Partial<Question> = {}): Question => ({
  id: 'q1',
  author: { accountId: 'asker', isAnonymous: false, displayName: 'Asker' },
  title: 't',
  body: '',
  citation: null,
  topics: [],
  bestAnswerId: null,
  moderation: initialModeration(),
  affirmations: 0,
  answerCount: 0,
  createdAt: 0,
  updatedAt: 0,
  ...over,
});

const answer = (over: Partial<Answer> = {}): Answer => ({
  id: 'a1',
  questionId: 'q1',
  parentAnswerId: null,
  author: { accountId: 'other', isAnonymous: false, displayName: 'Other' },
  body: 'b',
  affirmations: 0,
  moderation: initialModeration(),
  createdAt: 0,
  updatedAt: 0,
  ...over,
});

describe('authorRef', () => {
  it('drops the name whenever the post is anonymous', () => {
    expect(authorRef('me', 'Mina', true)).toEqual({ accountId: 'me', isAnonymous: true, displayName: null });
  });

  it('keeps the account id even when anonymous — anonymity is pseudonymity', () => {
    // Retained because best-answer permissions and "your questions" need it.
    expect(authorRef('me', 'Mina', true).accountId).toBe('me');
  });

  it('keeps the name when signed', () => {
    expect(authorRef('me', 'Mina', false).displayName).toBe('Mina');
  });

  it('labels an unnamed or anonymous author with the caller’s word', () => {
    expect(authorLabel(authorRef('me', 'Mina', true), 'Anonymous')).toBe('Anonymous');
    expect(authorLabel(authorRef('me', null, false), 'Anonymous')).toBe('Anonymous');
    expect(authorLabel(authorRef('me', 'Mina', false), 'Anonymous')).toBe('Mina');
  });

  it('still recognises an anonymous post as your own', () => {
    expect(isOwnPost(authorRef('me', 'Mina', true), 'me')).toBe(true);
    expect(isOwnPost(authorRef('me', 'Mina', true), 'someone')).toBe(false);
    expect(isOwnPost(authorRef('me', 'Mina', true), null)).toBe(false);
  });
});

describe('validateQuestionDraft', () => {
  it('accepts a reasonable draft', () => {
    expect(validateQuestionDraft(draft())).toEqual([]);
  });

  it('rejects a title that is too short or too long', () => {
    expect(validateQuestionDraft(draft({ title: 'a'.repeat(MIN_QUESTION_TITLE - 1) }))).toContain('title-too-short');
    expect(validateQuestionDraft(draft({ title: 'a'.repeat(LIMITS.questionTitle + 1) }))).toContain('title-too-long');
  });

  it('ignores surrounding whitespace when measuring the title', () => {
    expect(validateQuestionDraft(draft({ title: '   short   ' }))).toContain('title-too-short');
  });

  it('rejects an over-long body and too many topics', () => {
    expect(validateQuestionDraft(draft({ body: 'x'.repeat(LIMITS.questionBody + 1) }))).toContain('body-too-long');
    expect(
      validateQuestionDraft(draft({ topics: ['scripture', 'liturgy', 'prayer', 'fasting'] })),
    ).toContain('too-many-topics');
  });
});

describe('validateAnswerDraft', () => {
  it('rejects an empty or whitespace-only answer', () => {
    expect(validateAnswerDraft('')).toContain('body-empty');
    expect(validateAnswerDraft('   ')).toContain('body-empty');
  });

  it('rejects an over-long answer and accepts an ordinary one', () => {
    expect(validateAnswerDraft('x'.repeat(LIMITS.answerBody + 1))).toContain('body-too-long');
    expect(validateAnswerDraft('Because it is so.')).toEqual([]);
  });
});

describe('permissions', () => {
  it('lets only the asker mark a best answer', () => {
    expect(canMarkBest(question(), 'asker')).toBe(true);
    expect(canMarkBest(question(), 'someone')).toBe(false);
    expect(canMarkBest(question(), null)).toBe(false);
  });

  it('refuses marking on a removed question', () => {
    expect(canMarkBest(question({ moderation: { ...initialModeration(), status: 'removed' } }), 'asker')).toBe(false);
  });

  it('only allows a top-level answer on this question to be marked', () => {
    expect(isMarkableBest(answer(), 'q1')).toBe(true);
    expect(isMarkableBest(answer({ parentAnswerId: 'a0' }), 'q1')).toBe(false);
    expect(isMarkableBest(answer({ questionId: 'other' }), 'q1')).toBe(false);
  });

  it('refuses self-report and self-affirmation', () => {
    const mine = authorRef('me', 'Me', false);
    expect(canReport(mine, 'me')).toBe(false);
    expect(canAffirm(mine, 'me')).toBe(false);
    expect(canReport(mine, 'other')).toBe(true);
    expect(canAffirm(mine, 'other')).toBe(true);
  });

  it('refuses both when signed out', () => {
    const theirs = authorRef('them', 'Them', false);
    expect(canReport(theirs, null)).toBe(false);
    expect(canAffirm(theirs, null)).toBe(false);
  });

  it('lets you edit only your own post', () => {
    expect(canEditPost(authorRef('me', 'Me', false), 'me')).toBe(true);
    expect(canEditPost(authorRef('me', 'Me', false), 'other')).toBe(false);
  });

  it('locks anonymity once a post exists', () => {
    expect(anonymityLocked(undefined)).toBe(false);
    expect(anonymityLocked(null)).toBe(false);
    expect(anonymityLocked(question())).toBe(true);
    expect(anonymityLocked(answer())).toBe(true);
  });
});
