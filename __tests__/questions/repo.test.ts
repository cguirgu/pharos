/**
 * Questions persistence (MemoryRepo): round-trip, cross-account reads, vote
 * toggling, reports, and account deletion.
 *
 * The load-bearing test here is "reads are not keyed by an account" — that is
 * the property which lets the eventual move to a shared backend be an RLS policy
 * rather than a re-keying of every row.
 */
import { MemoryRepo } from '../../src/db/repo';
import {
  authorRef,
  initialModeration,
  type Answer,
  type Question,
  type Report,
  type Vote,
} from '../../src/domain/questions';

let seq = 0;

function question(over: Partial<Question> = {}): Question {
  seq += 1;
  return {
    id: `q${seq}`,
    author: authorRef('alice', 'Alice', false),
    title: `title ${seq}`,
    body: 'body',
    citation: null,
    topics: [],
    bestAnswerId: null,
    moderation: initialModeration(),
    affirmations: 0,
    answerCount: 0,
    createdAt: seq,
    updatedAt: seq,
    ...over,
  };
}

function answer(questionId: string, over: Partial<Answer> = {}): Answer {
  seq += 1;
  return {
    id: `a${seq}`,
    questionId,
    parentAnswerId: null,
    author: authorRef('bob', 'Bob', false),
    body: `answer ${seq}`,
    affirmations: 0,
    moderation: initialModeration(),
    createdAt: seq,
    updatedAt: seq,
    ...over,
  };
}

let repo: MemoryRepo;
beforeEach(() => {
  repo = new MemoryRepo();
  seq = 0;
});

describe('the key shape', () => {
  it('returns a question written by one account to a reader who is not named', async () => {
    // listQuestions takes NO accountId. This is the whole point of the design.
    await repo.upsertQuestion(question({ id: 'q-alice', author: authorRef('alice', 'Alice', false) }));
    const all = await repo.listQuestions();
    expect(all.map((q) => q.id)).toEqual(['q-alice']);
  });

  it('returns questions from several authors together', async () => {
    await repo.upsertQuestion(question({ id: 'q1', author: authorRef('alice', 'Alice', false), createdAt: 1 }));
    await repo.upsertQuestion(question({ id: 'q2', author: authorRef('bob', 'Bob', false), createdAt: 2 }));
    const all = await repo.listQuestions();
    // Newest first.
    expect(all.map((q) => q.id)).toEqual(['q2', 'q1']);
  });
});

describe('round-trip', () => {
  it('preserves the citation and the moderation state', async () => {
    const q = question({
      citation: {
        anchor: { source: 'office', officeKey: 'matins', sectionId: 'psalm50', blockIndex: 0, startOffset: 0, endOffset: 5 },
        textSnapshot: 'Have mercy',
        referenceLabel: 'Matins · Psalm 50',
      },
      topics: ['prayer', 'liturgy'],
      moderation: { status: 'flagged', reportCount: 1, reasons: ['spam'], reviewedAt: 42 },
    });
    await repo.upsertQuestion(q);
    expect(await repo.getQuestion(q.id)).toEqual(q);
  });

  it('never stores a name on an anonymous question', async () => {
    const q = question({ author: authorRef('alice', 'Alice', true) });
    await repo.upsertQuestion(q);
    const back = await repo.getQuestion(q.id);
    expect(back!.author.isAnonymous).toBe(true);
    expect(back!.author.displayName).toBeNull();
    // …but the account is still known, which is what permissions depend on.
    expect(back!.author.accountId).toBe('alice');
  });

  it('updates in place rather than duplicating', async () => {
    const q = question();
    await repo.upsertQuestion(q);
    await repo.upsertQuestion({ ...q, title: 'reworded' });
    const all = await repo.listQuestions();
    expect(all).toHaveLength(1);
    expect(all[0]!.title).toBe('reworded');
  });
});

describe('answers', () => {
  it('lists a question’s answers oldest-first and ignores other questions', async () => {
    await repo.upsertAnswer(answer('q1', { id: 'a2', createdAt: 20 }));
    await repo.upsertAnswer(answer('q1', { id: 'a1', createdAt: 10 }));
    await repo.upsertAnswer(answer('q2', { id: 'other' }));
    expect((await repo.listAnswers('q1')).map((a) => a.id)).toEqual(['a1', 'a2']);
  });

  it('lists answers by author, across questions', async () => {
    await repo.upsertAnswer(answer('q1', { id: 'a1', author: authorRef('bob', 'Bob', false) }));
    await repo.upsertAnswer(answer('q2', { id: 'a2', author: authorRef('bob', 'Bob', false) }));
    await repo.upsertAnswer(answer('q1', { id: 'a3', author: authorRef('carol', 'Carol', false) }));
    expect((await repo.listAnswersByAuthor('bob')).map((a) => a.id).sort()).toEqual(['a1', 'a2']);
  });

  it('deleting a question takes its answers with it', async () => {
    const q = question({ id: 'q1' });
    await repo.upsertQuestion(q);
    await repo.upsertAnswer(answer('q1'));
    await repo.deleteQuestion('q1');
    expect(await repo.getQuestion('q1')).toBeNull();
    expect(await repo.listAnswers('q1')).toHaveLength(0);
  });
});

describe('filters', () => {
  it('hides removed questions unless asked for', async () => {
    await repo.upsertQuestion(question({ id: 'live' }));
    await repo.upsertQuestion(
      question({ id: 'gone', moderation: { status: 'removed', reportCount: 5, reasons: [], reviewedAt: 1 } }),
    );
    expect((await repo.listQuestions()).map((q) => q.id)).toEqual(['live']);
    expect((await repo.listQuestions({ includeHidden: true })).map((q) => q.id).sort()).toEqual(['gone', 'live']);
  });

  it('narrows by author and by citation source', async () => {
    await repo.upsertQuestion(question({ id: 'mine', author: authorRef('alice', 'Alice', false) }));
    await repo.upsertQuestion(
      question({
        id: 'cited',
        author: authorRef('bob', 'Bob', false),
        citation: {
          anchor: { source: 'scripture', book: 'john', chapter: 6, startVerse: 1, startOffset: 0, endVerse: 1, endOffset: 3 },
          textSnapshot: 'x',
          referenceLabel: 'John 6:1',
        },
      }),
    );
    expect((await repo.listQuestions({ authorAccountId: 'alice' })).map((q) => q.id)).toEqual(['mine']);
    expect((await repo.listQuestions({ citationSource: 'scripture' })).map((q) => q.id)).toEqual(['cited']);
  });
});

describe('votes', () => {
  const vote = (targetId: string, voter: string): Vote => ({
    targetType: 'answer',
    targetId,
    voterAccountId: voter,
    createdAt: 1,
  });

  it('toggles on and off idempotently', async () => {
    await repo.setVote(vote('a1', 'me'), true);
    await repo.setVote(vote('a1', 'me'), true);
    expect(await repo.listVotes('me')).toHaveLength(1);

    await repo.setVote(vote('a1', 'me'), false);
    expect(await repo.listVotes('me')).toHaveLength(0);
    // Removing a vote that is not there is harmless.
    await repo.setVote(vote('a1', 'me'), false);
    expect(await repo.listVotes('me')).toHaveLength(0);
  });

  it('keeps different voters and targets apart', async () => {
    await repo.setVote(vote('a1', 'me'), true);
    await repo.setVote(vote('a2', 'me'), true);
    await repo.setVote(vote('a1', 'you'), true);
    expect(await repo.listVotes('me')).toHaveLength(2);
    expect(await repo.listVotes('you')).toHaveLength(1);
  });
});

describe('reports', () => {
  const report = (id: string, targetId: string): Report => ({
    id,
    targetType: 'question',
    targetId,
    reporterAccountId: 'me',
    reason: 'spam',
    createdAt: 1,
  });

  it('records an audit row per target', async () => {
    await repo.addReport(report('r1', 'q1'));
    await repo.addReport(report('r2', 'q1'));
    await repo.addReport(report('r3', 'q2'));
    expect(await repo.listReports('q1')).toHaveLength(2);
    expect(await repo.listReports('q2')).toHaveLength(1);
  });
});

describe('account deletion and export', () => {
  it('removes the account’s questions, answers, votes and reports, leaving others intact', async () => {
    await repo.upsertQuestion(question({ id: 'mine', author: authorRef('alice', 'Alice', false) }));
    await repo.upsertQuestion(question({ id: 'theirs', author: authorRef('bob', 'Bob', false) }));
    await repo.upsertAnswer(answer('theirs', { id: 'my-answer', author: authorRef('alice', 'Alice', false) }));
    await repo.upsertAnswer(answer('mine', { id: 'their-answer', author: authorRef('bob', 'Bob', false) }));
    await repo.setVote({ targetType: 'answer', targetId: 'x', voterAccountId: 'alice', createdAt: 1 }, true);
    await repo.addReport({ id: 'r', targetType: 'question', targetId: 'theirs', reporterAccountId: 'alice', reason: 'spam', createdAt: 1 });

    await repo.deleteAccount('alice');

    expect((await repo.listQuestions({ includeHidden: true })).map((q) => q.id)).toEqual(['theirs']);
    expect((await repo.listAnswersByAuthor('alice'))).toHaveLength(0);
    expect((await repo.listAnswersByAuthor('bob')).map((a) => a.id)).toEqual(['their-answer']);
    expect(await repo.listVotes('alice')).toHaveLength(0);
    expect(await repo.listReports('theirs')).toHaveLength(0);
  });

  it('includes the account’s own questions and answers in its export', async () => {
    await repo.upsertQuestion(question({ id: 'mine', author: authorRef('alice', 'Alice', false) }));
    await repo.upsertQuestion(question({ id: 'theirs', author: authorRef('bob', 'Bob', false) }));
    await repo.upsertAnswer(answer('theirs', { id: 'my-answer', author: authorRef('alice', 'Alice', false) }));

    const dump = await repo.exportAccountData('alice');
    expect(dump.questions.map((q) => q.id)).toEqual(['mine']);
    expect(dump.answers.map((a) => a.id)).toEqual(['my-answer']);
  });
});
