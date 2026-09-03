/**
 * Thread building: two-level nesting, the best answer lifted out and pinned,
 * and the two safety properties that matter most — an orphaned reply is
 * re-parented rather than dropped, and a corrupt parent chain cannot loop.
 */
import {
  buildThread,
  initialModeration,
  replyParentFor,
  type Answer,
  type ModerationState,
  type Question,
} from '../../src/domain/questions';

const mod = (over: Partial<ModerationState> = {}): ModerationState => ({ ...initialModeration(), ...over });

function question(over: Partial<Question> = {}): Question {
  return {
    id: 'q1',
    author: { accountId: 'asker', isAnonymous: false, displayName: 'Asker' },
    title: 'A question',
    body: '',
    citation: null,
    topics: [],
    bestAnswerId: null,
    moderation: mod(),
    affirmations: 0,
    answerCount: 0,
    createdAt: 0,
    updatedAt: 0,
    ...over,
  };
}

function answer(id: string, over: Partial<Answer> = {}): Answer {
  return {
    id,
    questionId: 'q1',
    parentAnswerId: null,
    author: { accountId: `author-${id}`, isAnonymous: false, displayName: id },
    body: `body ${id}`,
    affirmations: 0,
    moderation: mod(),
    createdAt: 1,
    updatedAt: 1,
    ...over,
  };
}

const viewer = { viewerAccountId: 'reader' as string | null };

describe('nesting', () => {
  it('groups replies under their top-level answer, oldest first', () => {
    const t = buildThread(
      question(),
      [
        answer('a1', { createdAt: 1 }),
        answer('r2', { parentAnswerId: 'a1', createdAt: 3 }),
        answer('r1', { parentAnswerId: 'a1', createdAt: 2 }),
      ],
      viewer,
    );
    expect(t.answers).toHaveLength(1);
    expect(t.answers[0]!.replies.map((r) => r.answer.id)).toEqual(['r1', 'r2']);
    expect(t.visibleCount).toBe(3);
  });

  it('collapses a reply-to-a-reply onto its top-level ancestor', () => {
    const top = answer('a1');
    const reply = answer('r1', { parentAnswerId: 'a1' });
    expect(replyParentFor(top)).toBe('a1');
    expect(replyParentFor(reply)).toBe('a1');
  });
});

describe('safety', () => {
  it('re-parents an orphaned reply instead of dropping it', () => {
    // The parent was removed; the reply must still be readable.
    const t = buildThread(question(), [answer('r1', { parentAnswerId: 'gone' })], viewer);
    expect(t.answers.map((n) => n.answer.id)).toEqual(['r1']);
    expect(t.visibleCount).toBe(1);
  });

  it('promotes a reply whose parent is itself a reply', () => {
    const t = buildThread(
      question(),
      [answer('a1'), answer('r1', { parentAnswerId: 'a1' }), answer('r2', { parentAnswerId: 'r1' })],
      viewer,
    );
    const ids = t.answers.map((n) => n.answer.id).sort();
    // r2 could not nest under r1, so it stands on its own rather than vanishing.
    expect(ids).toEqual(['a1', 'r2']);
    expect(t.visibleCount).toBe(3);
  });

  it('survives a self-referencing parent', () => {
    const t = buildThread(question(), [answer('a1', { parentAnswerId: 'a1' })], viewer);
    expect(t.answers.map((n) => n.answer.id)).toEqual(['a1']);
  });

  it('re-parents a reply whose parent is hidden from this viewer', () => {
    const t = buildThread(
      question(),
      [
        answer('a1', { moderation: mod({ status: 'hidden' }) }),
        answer('r1', { parentAnswerId: 'a1' }),
      ],
      viewer,
    );
    // a1 is invisible to a stranger, so r1 is promoted rather than orphaned away.
    expect(t.answers.map((n) => n.answer.id)).toEqual(['r1']);
  });
});

describe('best answer', () => {
  it('lifts the best answer out of the ranked list', () => {
    const t = buildThread(
      question({ bestAnswerId: 'a2' }),
      [answer('a1', { affirmations: 9 }), answer('a2', { affirmations: 1 })],
      viewer,
    );
    expect(t.best?.answer.id).toBe('a2');
    expect(t.answers.map((n) => n.answer.id)).toEqual(['a1']);
  });

  it('leaves best null when the marked answer is not visible', () => {
    const t = buildThread(
      question({ bestAnswerId: 'a2' }),
      [answer('a1'), answer('a2', { moderation: mod({ status: 'removed' }) })],
      viewer,
    );
    expect(t.best).toBeNull();
    expect(t.answers.map((n) => n.answer.id)).toEqual(['a1']);
  });
});

describe('visibility', () => {
  it('hides another author’s hidden answer but shows the viewer their own', () => {
    const answers = [
      answer('mine', { author: { accountId: 'reader', isAnonymous: false, displayName: 'Me' }, moderation: mod({ status: 'hidden' }) }),
      answer('theirs', { moderation: mod({ status: 'hidden' }) }),
    ];
    const t = buildThread(question(), answers, viewer);
    expect(t.answers.map((n) => n.answer.id)).toEqual(['mine']);
  });

  it('shows nothing hidden to a signed-out reader', () => {
    const t = buildThread(question(), [answer('a1', { moderation: mod({ status: 'hidden' }) })], {
      viewerAccountId: null,
    });
    expect(t.answers).toHaveLength(0);
    expect(t.visibleCount).toBe(0);
  });
});
