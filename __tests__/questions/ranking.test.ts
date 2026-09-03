/**
 * Ordering, filtering and search. The comparators must be TOTAL — ties fall
 * through to id — so a feed never reshuffles between renders.
 */
import {
  filterQuestions,
  initialModeration,
  rankAnswers,
  searchQuestions,
  sortQuestions,
  unansweredQuestions,
  type Answer,
  type ModerationState,
  type Question,
  type ThreadNode,
} from '../../src/domain/questions';

const mod = (over: Partial<ModerationState> = {}): ModerationState => ({ ...initialModeration(), ...over });

function q(id: string, over: Partial<Question> = {}): Question {
  return {
    id,
    author: { accountId: 'a', isAnonymous: false, displayName: 'A' },
    title: `title ${id}`,
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

function node(id: string, affirmations: number, createdAt: number): ThreadNode {
  const answer: Answer = {
    id,
    questionId: 'q',
    parentAnswerId: null,
    author: { accountId: 'a', isAnonymous: false, displayName: 'A' },
    body: '',
    affirmations,
    moderation: mod(),
    createdAt,
    updatedAt: createdAt,
  };
  return { answer, replies: [] };
}

describe('rankAnswers', () => {
  it('ranks by affirmations, then the earliest answer', () => {
    const ranked = rankAnswers([node('c', 1, 1), node('a', 5, 9), node('b', 5, 2)], 'top');
    expect(ranked.map((n) => n.answer.id)).toEqual(['b', 'a', 'c']);
  });

  it('is deterministic when everything ties', () => {
    const input = [node('z', 2, 5), node('m', 2, 5), node('a', 2, 5)];
    const once = rankAnswers(input, 'top').map((n) => n.answer.id);
    const twice = rankAnswers(input.slice().reverse(), 'top').map((n) => n.answer.id);
    expect(once).toEqual(['a', 'm', 'z']);
    expect(twice).toEqual(once);
  });

  it('supports newest and oldest', () => {
    const input = [node('a', 0, 1), node('b', 0, 3), node('c', 0, 2)];
    expect(rankAnswers(input, 'newest').map((n) => n.answer.id)).toEqual(['b', 'c', 'a']);
    expect(rankAnswers(input, 'oldest').map((n) => n.answer.id)).toEqual(['a', 'c', 'b']);
  });

  it('does not mutate its input', () => {
    const input = [node('b', 1, 1), node('a', 9, 1)];
    rankAnswers(input, 'top');
    expect(input.map((n) => n.answer.id)).toEqual(['b', 'a']);
  });
});

describe('sortQuestions', () => {
  const items = [
    q('old', { createdAt: 1, affirmations: 9, answerCount: 3 }),
    q('new', { createdAt: 5, affirmations: 1, answerCount: 0 }),
    q('mid', { createdAt: 3, affirmations: 4, answerCount: 0 }),
  ];

  it('recent is newest first', () => {
    expect(sortQuestions(items, 'recent').map((x) => x.id)).toEqual(['new', 'mid', 'old']);
  });

  it('top is most affirmed first', () => {
    expect(sortQuestions(items, 'top').map((x) => x.id)).toEqual(['old', 'mid', 'new']);
  });

  it('unanswered puts the longest-waiting unanswered question first', () => {
    expect(sortQuestions(items, 'unanswered').map((x) => x.id)).toEqual(['mid', 'new', 'old']);
  });
});

describe('filterQuestions', () => {
  const mine = q('mine', { author: { accountId: 'me', isAnonymous: false, displayName: 'Me' } });
  const cited = q('cited', {
    citation: {
      anchor: { source: 'office', officeKey: 'matins', sectionId: 's', blockIndex: 0, startOffset: 0, endOffset: 1 },
      textSnapshot: 'x',
      referenceLabel: 'Matins',
    },
  });
  const answered = q('answered', { answerCount: 2 });
  const topical = q('topical', { topics: ['fasting'] });
  const all = [mine, cited, answered, topical];

  it('narrows by author, topic, citation source and answered state', () => {
    expect(filterQuestions(all, { authorAccountId: 'me' }).map((x) => x.id)).toEqual(['mine']);
    expect(filterQuestions(all, { topic: 'fasting' }).map((x) => x.id)).toEqual(['topical']);
    expect(filterQuestions(all, { citationSource: 'office' }).map((x) => x.id)).toEqual(['cited']);
    expect(filterQuestions(all, { unansweredOnly: true }).map((x) => x.id)).not.toContain('answered');
    expect(filterQuestions(all, { answeredOnly: true }).map((x) => x.id)).toEqual(['answered']);
  });

  it('hides another author’s hidden question but shows the viewer their own', () => {
    const hiddenMine = q('hm', {
      author: { accountId: 'me', isAnonymous: false, displayName: 'Me' },
      moderation: mod({ status: 'hidden' }),
    });
    const hiddenTheirs = q('ht', { moderation: mod({ status: 'hidden' }) });
    const ids = filterQuestions([hiddenMine, hiddenTheirs], { viewerAccountId: 'me' }).map((x) => x.id);
    expect(ids).toEqual(['hm']);
  });

  it('never returns removed content', () => {
    const removed = q('gone', { moderation: mod({ status: 'removed' }) });
    expect(filterQuestions([removed], { viewerAccountId: 'a' })).toHaveLength(0);
  });
});

describe('searchQuestions', () => {
  const items = [
    q('title-hit', { title: 'Why do we fast on Wednesday' }),
    q('body-hit', { title: 'Something else', body: 'a note about fasting on Wednesday' }),
    q('ref-hit', {
      title: 'Unrelated',
      citation: {
        anchor: { source: 'scripture', book: 'john', chapter: 6, startVerse: 1, startOffset: 0, endVerse: 1, endOffset: 1 },
        textSnapshot: 'x',
        referenceLabel: 'John 6:1',
      },
    }),
  ];

  it('ranks a title hit above a body hit', () => {
    const hits = searchQuestions(items, 'wednesday');
    expect(hits[0]!.question.id).toBe('title-hit');
    expect(hits.map((h) => h.question.id)).toContain('body-hit');
  });

  it('matches the citation reference', () => {
    expect(searchQuestions(items, 'john').map((h) => h.question.id)).toEqual(['ref-hit']);
  });

  it('requires every term to match somewhere', () => {
    expect(searchQuestions(items, 'wednesday elephant')).toHaveLength(0);
  });

  it('returns everything for an empty query', () => {
    expect(searchQuestions(items, '   ')).toHaveLength(items.length);
  });
});

describe('unansweredQuestions', () => {
  it('returns only visible questions with no answers', () => {
    const items = [
      q('open'),
      q('answered', { answerCount: 1 }),
      q('hidden', { moderation: mod({ status: 'hidden' }) }),
    ];
    expect(unansweredQuestions(items).map((x) => x.id)).toEqual(['open']);
  });
});
