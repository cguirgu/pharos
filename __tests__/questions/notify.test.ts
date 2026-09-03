/**
 * "Someone answered you" — the in-app count. It must never notify you about
 * your own answer, never surface an answer you have already seen, and never
 * count something the moderation layer has taken down.
 */
import {
  initialModeration,
  noticesForAsker,
  totalNewAnswers,
  type Answer,
  type ModerationState,
  type Question,
} from '../../src/domain/questions';

const ME = 'me';
const mod = (over: Partial<ModerationState> = {}): ModerationState => ({ ...initialModeration(), ...over });

const question = (id: string, accountId: string, over: Partial<Question> = {}): Question => ({
  id,
  author: { accountId, isAnonymous: false, displayName: accountId },
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
});

const answer = (id: string, questionId: string, accountId: string, createdAt: number, over: Partial<Answer> = {}): Answer => ({
  id,
  questionId,
  parentAnswerId: null,
  author: { accountId, isAnonymous: false, displayName: accountId },
  body: '',
  affirmations: 0,
  moderation: mod(),
  createdAt,
  updatedAt: createdAt,
  ...over,
});

describe('noticesForAsker', () => {
  const mine = question('q-mine', ME);
  const theirs = question('q-theirs', 'someone');

  it('counts new answers to my questions', () => {
    const notices = noticesForAsker(
      [mine],
      [answer('a1', 'q-mine', 'other', 10), answer('a2', 'q-mine', 'other2', 20)],
      ME,
      5,
    );
    expect(notices).toHaveLength(1);
    expect(notices[0]).toMatchObject({ questionId: 'q-mine', newAnswerCount: 2, latestAt: 20 });
    expect(notices[0]!.questionTitle).toBe('title q-mine');
  });

  it('ignores answers to other people’s questions', () => {
    expect(noticesForAsker([mine, theirs], [answer('a1', 'q-theirs', 'other', 10)], ME, 0)).toHaveLength(0);
  });

  it('ignores my own answers — you are not notified about yourself', () => {
    expect(noticesForAsker([mine], [answer('a1', 'q-mine', ME, 10)], ME, 0)).toHaveLength(0);
  });

  it('ignores anything at or before lastSeenAt', () => {
    const answers = [answer('old', 'q-mine', 'other', 5), answer('new', 'q-mine', 'other', 15)];
    const notices = noticesForAsker([mine], answers, ME, 5);
    expect(notices[0]!.newAnswerCount).toBe(1);
    expect(notices[0]!.latestAt).toBe(15);
  });

  it('ignores answers hidden from me', () => {
    const hidden = answer('h', 'q-mine', 'other', 10, { moderation: mod({ status: 'hidden' }) });
    const removed = answer('r', 'q-mine', 'other', 11, { moderation: mod({ status: 'removed' }) });
    expect(noticesForAsker([mine], [hidden, removed], ME, 0)).toHaveLength(0);
  });

  it('still counts a flagged answer — flagged content stays up pending review', () => {
    const flagged = answer('f', 'q-mine', 'other', 10, { moderation: mod({ status: 'flagged', reportCount: 1 }) });
    expect(noticesForAsker([mine], [flagged], ME, 0)).toHaveLength(1);
  });

  it('drops notices for a question I removed', () => {
    const gone = question('q-gone', ME, { moderation: mod({ status: 'removed' }) });
    expect(noticesForAsker([gone], [answer('a', 'q-gone', 'other', 10)], ME, 0)).toHaveLength(0);
  });

  it('orders newest first', () => {
    const a = question('qa', ME);
    const b = question('qb', ME);
    const notices = noticesForAsker(
      [a, b],
      [answer('1', 'qa', 'x', 10), answer('2', 'qb', 'x', 30)],
      ME,
      0,
    );
    expect(notices.map((n) => n.questionId)).toEqual(['qb', 'qa']);
  });

  it('returns nothing when I have asked nothing', () => {
    expect(noticesForAsker([theirs], [answer('a', 'q-theirs', 'x', 10)], ME, 0)).toEqual([]);
  });
});

describe('totalNewAnswers', () => {
  it('sums across questions', () => {
    expect(
      totalNewAnswers([
        { questionId: 'a', questionTitle: 'a', newAnswerCount: 2, latestAt: 1 },
        { questionId: 'b', questionTitle: 'b', newAnswerCount: 3, latestAt: 2 },
      ]),
    ).toBe(5);
    expect(totalNewAnswers([])).toBe(0);
  });
});
