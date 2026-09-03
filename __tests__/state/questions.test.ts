/**
 * The questions stores: clamping, the anonymity invariant, optimistic
 * affirmation with rollback, reporting, guest read-but-not-write, seeding
 * idempotency, and the thread's answer/reply/best-answer writes.
 */
import { MemoryRepo, setRepo, getRepo, GUEST_ACCOUNT_ID, type Repo } from '../../src/db/repo';
import { useQuestions } from '../../src/state/questions';
import { useQuestionThread } from '../../src/state/questionThread';
import { QUESTIONS_SEED_KEY } from '../../src/db/seedQuestions';
import { LIMITS } from '../../src/domain/limits';

const ME = 'me';

async function freshStore(accountId: string = ME, displayName: string | null = 'Mina') {
  setRepo(new MemoryRepo());
  useQuestions.getState().clear();
  useQuestionThread.getState().clear();
  await useQuestions.getState().load(accountId, displayName);
}

beforeEach(async () => {
  await freshStore();
});

describe('seeding', () => {
  it('seeds sample conversations for a real account', async () => {
    expect(useQuestions.getState().items.length).toBeGreaterThan(0);
    expect(useQuestions.getState().seeded).toBe(true);
  });

  it('is idempotent across reloads', async () => {
    const first = useQuestions.getState().items.length;
    await useQuestions.getState().load(ME, 'Mina');
    expect(useQuestions.getState().items).toHaveLength(first);
  });

  it('does not seed for a guest', async () => {
    setRepo(new MemoryRepo());
    useQuestions.getState().clear();
    await useQuestions.getState().load(GUEST_ACCOUNT_ID, null);
    expect(await getRepo(GUEST_ACCOUNT_ID).getSetting(QUESTIONS_SEED_KEY)).toBeNull();
  });

  it('includes one question by the reader, so best-answer is reachable', () => {
    const mine = useQuestions.getState().items.filter((q) => q.author.accountId === ME && !q.author.isAnonymous);
    expect(mine.length).toBeGreaterThan(0);
  });

  it('includes an unanswered question and a citation of each kind', () => {
    const items = useQuestions.getState().items;
    expect(items.some((q) => q.answerCount === 0)).toBe(true);
    const sources = items.map((q) => q.citation?.anchor.source).filter(Boolean);
    expect(new Set(sources)).toEqual(new Set(['scripture', 'synaxarium', 'office']));
  });
});

describe('ask', () => {
  it('clamps the title and body at the limits', async () => {
    const id = await useQuestions.getState().ask({
      title: 'T'.repeat(LIMITS.questionTitle + 50),
      body: 'B'.repeat(LIMITS.questionBody + 50),
    });
    const q = useQuestions.getState().get(id)!;
    expect(q.title).toHaveLength(LIMITS.questionTitle);
    expect(q.body).toHaveLength(LIMITS.questionBody);
  });

  it('caps the topics', async () => {
    const id = await useQuestions.getState().ask({
      title: 'A question about several things at once',
      topics: ['scripture', 'liturgy', 'prayer', 'fasting', 'saints'],
    });
    expect(useQuestions.getState().get(id)!.topics).toHaveLength(3);
  });

  it('signs a question with the reader’s name by default', async () => {
    const id = await useQuestions.getState().ask({ title: 'A signed question here' });
    expect(useQuestions.getState().get(id)!.author).toMatchObject({ accountId: ME, isAnonymous: false, displayName: 'Mina' });
  });

  it('stores no name when asked anonymously', async () => {
    const id = await useQuestions.getState().ask({ title: 'An anonymous question here', anonymous: true });
    const q = useQuestions.getState().get(id)!;
    expect(q.author.isAnonymous).toBe(true);
    expect(q.author.displayName).toBeNull();
    // Persisted that way too, not merely hidden at render.
    expect((await getRepo(ME).getQuestion(id))!.author.displayName).toBeNull();
  });

  it('cannot flip anonymity on an edit', async () => {
    const id = await useQuestions.getState().ask({ title: 'Asked in confidence here', anonymous: true });
    await useQuestions.getState().ask({ id, title: 'Asked in confidence here', anonymous: false });
    const q = useQuestions.getState().get(id)!;
    expect(q.author.isAnonymous).toBe(true);
    expect(q.author.displayName).toBeNull();
  });

  it('honours the sticky anonymous default', async () => {
    await useQuestions.getState().setAnonymousDefault(true);
    const id = await useQuestions.getState().ask({ title: 'Follows the default here' });
    expect(useQuestions.getState().get(id)!.author.isAnonymous).toBe(true);
  });
});

describe('guests', () => {
  beforeEach(async () => {
    setRepo(new MemoryRepo());
    useQuestions.getState().clear();
    await useQuestions.getState().load(GUEST_ACCOUNT_ID, null);
  });

  it('may read the feed', () => {
    expect(useQuestions.getState().isGuest()).toBe(true);
    expect(() => useQuestions.getState().feed('recent')).not.toThrow();
  });

  it('may not ask, affirm or report', async () => {
    expect(await useQuestions.getState().ask({ title: 'A guest tries to ask this' })).toBe('');
    expect(useQuestions.getState().items).toHaveLength(0);

    await useQuestions.getState().toggleAffirm('question', 'anything');
    expect(useQuestions.getState().myVotes.size).toBe(0);

    await useQuestions.getState().report('question', 'anything', 'spam');
    expect(await getRepo(GUEST_ACCOUNT_ID).listReports('anything')).toHaveLength(0);
  });
});

describe('affirmations', () => {
  it('toggles the vote and the count together', async () => {
    const id = await useQuestions.getState().ask({ title: 'Something to affirm here' });
    await useQuestions.getState().toggleAffirm('question', id);
    expect(useQuestions.getState().hasAffirmed('question', id)).toBe(true);
    expect(useQuestions.getState().get(id)!.affirmations).toBe(1);

    await useQuestions.getState().toggleAffirm('question', id);
    expect(useQuestions.getState().hasAffirmed('question', id)).toBe(false);
    expect(useQuestions.getState().get(id)!.affirmations).toBe(0);
  });

  it('never drives a count below zero', async () => {
    const id = await useQuestions.getState().ask({ title: 'Nothing affirmed yet here' });
    // Un-affirming something never affirmed must not produce -1.
    await useQuestions.getState().toggleAffirm('question', id);
    await useQuestions.getState().toggleAffirm('question', id);
    await useQuestions.getState().toggleAffirm('question', id);
    expect(useQuestions.getState().get(id)!.affirmations).toBeGreaterThanOrEqual(0);
  });

  it('rolls the whole optimistic change back when the write fails', async () => {
    const id = await useQuestions.getState().ask({ title: 'A question that fails to save' });
    const before = useQuestions.getState().get(id)!.affirmations;

    const repo = getRepo(ME) as Repo;
    const original = repo.setVote.bind(repo);
    repo.setVote = async () => {
      throw new Error('offline');
    };

    await useQuestions.getState().toggleAffirm('question', id);

    // A count that drifts from the store is worse than a vote that visibly
    // did not take, so both halves revert.
    expect(useQuestions.getState().hasAffirmed('question', id)).toBe(false);
    expect(useQuestions.getState().get(id)!.affirmations).toBe(before);
    repo.setVote = original;
  });
});

describe('reporting', () => {
  it('writes the audit row and escalates the post', async () => {
    const id = await useQuestions.getState().ask({ title: 'A question to report here' });
    await useQuestions.getState().report('question', id, 'off-topic', 'a note');

    expect(await getRepo(ME).listReports(id)).toHaveLength(1);
    const q = useQuestions.getState().get(id)!;
    expect(q.moderation.status).toBe('flagged');
    expect(q.moderation.reasons).toEqual(['off-topic']);
  });

  it('clamps a long report note', async () => {
    const id = await useQuestions.getState().ask({ title: 'Another question to report' });
    await useQuestions.getState().report('question', id, 'other', 'x'.repeat(LIMITS.reportNote + 100));
    const [row] = await getRepo(ME).listReports(id);
    expect(row!.note).toHaveLength(LIMITS.reportNote);
  });
});

describe('the thread', () => {
  let questionId: string;

  beforeEach(async () => {
    questionId = await useQuestions.getState().ask({ title: 'A question with a thread here' });
    await useQuestionThread.getState().load(questionId);
  });

  it('posts an answer and keeps answerCount in step', async () => {
    await useQuestionThread.getState().post({ body: 'An answer.' });
    expect(useQuestionThread.getState().answers).toHaveLength(1);
    expect(useQuestions.getState().get(questionId)!.answerCount).toBe(1);
  });

  it('refuses an empty answer', async () => {
    expect(await useQuestionThread.getState().post({ body: '   ' })).toBe('');
    expect(useQuestionThread.getState().answers).toHaveLength(0);
  });

  it('clamps a long answer', async () => {
    const id = await useQuestionThread.getState().post({ body: 'x'.repeat(LIMITS.answerBody + 100) });
    expect(useQuestionThread.getState().answers.find((a) => a.id === id)!.body).toHaveLength(LIMITS.answerBody);
  });

  it('attaches a reply-to-a-reply to the top-level ancestor', async () => {
    const top = await useQuestionThread.getState().post({ body: 'Top level.' });
    const reply = await useQuestionThread.getState().post({ body: 'A reply.', replyToAnswerId: top });
    const deeper = await useQuestionThread.getState().post({ body: 'Deeper.', replyToAnswerId: reply });

    const answers = useQuestionThread.getState().answers;
    expect(answers.find((a) => a.id === reply)!.parentAnswerId).toBe(top);
    // Collapsed onto the ancestor rather than nesting a third level.
    expect(answers.find((a) => a.id === deeper)!.parentAnswerId).toBe(top);
  });

  it('lets the asker mark and unmark a best answer', async () => {
    const answerId = await useQuestionThread.getState().post({ body: 'The best answer.' });
    await useQuestionThread.getState().markBest(answerId);
    expect(useQuestionThread.getState().question!.bestAnswerId).toBe(answerId);

    await useQuestionThread.getState().markBest(answerId);
    expect(useQuestionThread.getState().question!.bestAnswerId).toBeNull();
  });

  it('refuses to mark a reply as best', async () => {
    const top = await useQuestionThread.getState().post({ body: 'Top.' });
    const reply = await useQuestionThread.getState().post({ body: 'Reply.', replyToAnswerId: top });
    await useQuestionThread.getState().markBest(reply);
    expect(useQuestionThread.getState().question!.bestAnswerId).toBeNull();
  });

  it('refuses to let a non-asker mark best', async () => {
    const answerId = await useQuestionThread.getState().post({ body: 'An answer.' });
    // Same rows, a different reader.
    useQuestions.setState({ accountId: 'someone-else' });
    await useQuestionThread.getState().markBest(answerId);
    expect(useQuestionThread.getState().question!.bestAnswerId).toBeNull();
  });

  it('clears the best answer when that answer is removed', async () => {
    const answerId = await useQuestionThread.getState().post({ body: 'To be removed.' });
    await useQuestionThread.getState().markBest(answerId);
    await useQuestionThread.getState().removeAnswer(answerId);
    expect(useQuestionThread.getState().question!.bestAnswerId).toBeNull();
    expect(useQuestions.getState().get(questionId)!.answerCount).toBe(0);
  });

  it('builds a thread with the best answer pinned out of the list', async () => {
    const a1 = await useQuestionThread.getState().post({ body: 'First.' });
    await useQuestionThread.getState().post({ body: 'Second.' });
    await useQuestionThread.getState().markBest(a1);

    const thread = useQuestionThread.getState().thread()!;
    expect(thread.best!.answer.id).toBe(a1);
    expect(thread.answers.map((n) => n.answer.id)).not.toContain(a1);
  });
});

describe('notices', () => {
  it('counts answers to my question written by someone else since I last looked', async () => {
    const questionId = await useQuestions.getState().ask({ title: 'A question others answer' });
    await useQuestionThread.getState().load(questionId);
    // Seeded answers to the reader's own seeded question legitimately count as
    // new on a first run, so measure the delta rather than an absolute.
    const baseline = useQuestions.getState().unseenAnswerCount();

    await useQuestionThread.getState().post({ body: 'My own answer.' });
    // My own answer must never notify me.
    expect(useQuestions.getState().unseenAnswerCount()).toBe(baseline);

    const repo = getRepo(ME);
    await repo.upsertAnswer({
      id: 'theirs',
      questionId,
      parentAnswerId: null,
      author: { accountId: 'someone', isAnonymous: false, displayName: 'Someone' },
      body: 'Their answer.',
      affirmations: 0,
      moderation: { status: 'visible', reportCount: 0, reasons: [], reviewedAt: null },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    await useQuestions.getState().refresh(questionId);

    expect(useQuestions.getState().unseenAnswerCount()).toBe(baseline + 1);

    await useQuestions.getState().markFeedSeen();
    expect(useQuestions.getState().unseenAnswerCount()).toBe(0);
  });
});
