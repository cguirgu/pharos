/**
 * Sample questions for the local-only phase.
 *
 * A Questions feed is inherently multi-user, but on the local repo an account
 * only ever sees its own rows — so without seed content the feature would look
 * broken rather than new. These samples give the feed a plausible shape and,
 * between them, exercise every path the UI has: all three citation kinds, an
 * anonymous ask, an unanswered question, a flagged answer, a marked best answer,
 * and one question authored by the signed-in reader (which is the only way the
 * "mark best" and "new answers" paths can be demonstrated by a single user).
 *
 * ⚠️ CONTENT DISCIPLINE. These answers are illustrative prose written to shape
 * the UI — they are NOT verified catechesis, and this project is deliberately
 * strict about that (see docs/CONTENT-SOURCES.md and the TEXT_TBD convention).
 * The feed shows a "sample content" notice for as long as the seed flag is set,
 * and the whole seed should be deleted the moment real questions exist.
 *
 * Seeding is idempotent: it writes nothing once QUESTIONS_SEED_KEY is set.
 */
import { id } from '../platform/id';
import { initialModeration, type Answer, type Question, type QuestionTopic } from '../domain/questions';
import type { Citation } from '../domain/citation';
import type { Repo } from './repo';

export const QUESTIONS_SEED_KEY = 'questions.seeded.v1';

/** A stand-in name, marked so seeded voices are never mistaken for real ones. */
const VOICES = ['A servant', 'A reader', 'A deacon', 'A friend'] as const;

const DAY = 86_400_000;

interface SampleReply {
  readonly voice: string;
  readonly body: string;
  readonly ageDays: number;
}

interface SampleAnswer {
  readonly voice: string;
  readonly body: string;
  readonly affirmations: number;
  readonly ageDays: number;
  readonly best?: boolean;
  readonly reported?: boolean;
  readonly replies?: readonly SampleReply[];
}

interface SampleQuestion {
  readonly title: string;
  readonly body: string;
  readonly topics: readonly QuestionTopic[];
  readonly ageDays: number;
  readonly affirmations: number;
  readonly anonymous?: boolean;
  /** Authored by the signed-in reader rather than a sample voice. */
  readonly byViewer?: boolean;
  readonly voice?: string;
  readonly citation?: Citation;
  readonly answers?: readonly SampleAnswer[];
}

const JOHN_6: Citation = {
  anchor: {
    source: 'scripture',
    book: 'john',
    chapter: 6,
    startVerse: 53,
    startOffset: 0,
    endVerse: 56,
    endOffset: 60,
  },
  textSnapshot:
    'Except ye eat the flesh of the Son of man, and drink his blood, ye have no life in you.',
  referenceLabel: 'John 6:53–56',
};

const PSALM_50: Citation = {
  anchor: {
    source: 'office',
    officeKey: 'matins',
    sectionId: 'psalm50',
    blockIndex: 0,
    startOffset: 0,
    endOffset: 52,
  },
  textSnapshot: 'Have mercy upon me, O God, according to thy lovingkindness.',
  referenceLabel: 'Matins · Psalm 50',
};

const COMMEMORATION: Citation = {
  anchor: { source: 'synaxarium', copticMonth: 1, copticDay: 12, startOffset: 0, endOffset: 48 },
  textSnapshot: 'She left her home and followed the Theban legion into a strange country.',
  referenceLabel: 'Thout 12 · St Verena',
};

export const SAMPLE_QUESTIONS: readonly SampleQuestion[] = [
  {
    title: 'Why do we fast on Wednesdays and Fridays?',
    body: 'I have kept these days since I was small but I have never been taught what they mean. What am I remembering?',
    topics: ['fasting', 'church-life'],
    ageDays: 9,
    affirmations: 4,
    voice: VOICES[0],
    answers: [
      {
        voice: VOICES[2],
        body: 'Wednesday remembers the counsel taken against the Lord, and Friday remembers the Cross. Keeping them turns an ordinary week into a small Holy Week.',
        affirmations: 6,
        ageDays: 8,
        best: true,
      },
      {
        voice: VOICES[1],
        body: 'It also keeps the fast from becoming only a season. Twice a week the body is reminded of something the mind might otherwise forget.',
        affirmations: 2,
        ageDays: 7,
      },
    ],
  },
  {
    title: 'Why is Psalm 50 prayed at every hour of the Agpeya?',
    body: 'It returns in every hour. Is that repetition the point, or am I missing something?',
    topics: ['prayer', 'liturgy'],
    ageDays: 6,
    affirmations: 5,
    voice: VOICES[1],
    citation: PSALM_50,
    answers: [
      {
        voice: VOICES[2],
        body: 'Repetition is the point. The hours are not a reading plan; they are a returning. Each time you come back you begin again with mercy, and never on the strength of the last hour.',
        affirmations: 7,
        ageDays: 5,
        best: true,
      },
    ],
  },
  {
    title: 'In John 6, is "eat my flesh" meant literally?',
    body: 'The crowd clearly hears it literally and many walk away. He does not soften it for them. How has the Church read this?',
    topics: ['scripture', 'sacraments'],
    ageDays: 4,
    affirmations: 11,
    voice: VOICES[3],
    citation: JOHN_6,
    answers: [
      {
        voice: VOICES[2],
        body: 'The Church has always read it of the Eucharist. The strongest evidence is in the passage itself: when they take offence, He repeats it more sharply rather than explaining it away.',
        affirmations: 9,
        ageDays: 3,
        replies: [
          {
            voice: VOICES[0],
            body: 'That detail settled it for me. A figure of speech would have been clarified, not intensified.',
            ageDays: 3,
          },
        ],
      },
      {
        voice: VOICES[1],
        body: 'Worth reading alongside the Institution at the Last Supper — John gives the teaching, the other Gospels give the act.',
        affirmations: 4,
        ageDays: 2,
      },
      {
        voice: VOICES[0],
        body: 'Our teacher pointed out that "abide" in verse 56 is the same word used of the vine. The union is meant to be ordinary and continuous, not occasional.',
        affirmations: 3,
        ageDays: 2,
      },
    ],
  },
  {
    title: 'How do I keep the hours when I work nights?',
    body: 'I sleep through most of the daylight hours. I do not want to keep failing at a rule that was not written for my week.',
    topics: ['prayer', 'practical'],
    ageDays: 3,
    affirmations: 6,
    anonymous: true,
    answers: [
      {
        voice: VOICES[2],
        body: 'Pray the hours by their meaning rather than the clock. Matins when you wake, Compline when you sleep. The hours sanctify your day, not someone else’s.',
        affirmations: 8,
        ageDays: 2,
      },
    ],
  },
  {
    title: 'Who was St Verena, and why is she commemorated with the Theban legion?',
    body: 'Her name came up in the commemoration today and I had never heard it before.',
    topics: ['saints'],
    ageDays: 2,
    affirmations: 1,
    voice: VOICES[0],
    citation: COMMEMORATION,
    // Deliberately unanswered — this is what the "unanswered" filter is for.
  },
  {
    title: 'What does Ⲁⲗⲗⲏⲗⲟⲩⲓⲁ actually mean in the Liturgy?',
    body: 'I sing it constantly without knowing what I am saying.',
    topics: ['liturgy'],
    ageDays: 2,
    affirmations: 2,
    voice: VOICES[1],
    answers: [
      {
        voice: VOICES[3],
        body: 'It is Hebrew carried untranslated through Greek and Coptic into our use: "praise the Lord". Some words the Church chose to keep in their own tongue rather than render.',
        affirmations: 3,
        ageDays: 1,
        reported: true,
      },
    ],
  },
  {
    title: 'How should I begin the Great Fast if I have never kept it before?',
    body: 'I do not want to start with something I cannot finish, but I also do not want to make it meaningless.',
    topics: ['fasting', 'practical'],
    ageDays: 1,
    affirmations: 3,
    byViewer: true,
    answers: [
      {
        voice: VOICES[2],
        body: 'Speak to your father of confession before you set the measure. A rule agreed with someone who knows you is worth more than a strict one you chose alone.',
        affirmations: 5,
        ageDays: 0,
      },
      {
        voice: VOICES[0],
        body: 'Begin with what you can keep every day for the whole fast, and let it be dull. Consistency teaches more than intensity.',
        affirmations: 4,
        ageDays: 0,
      },
    ],
  },
];

interface Viewer {
  readonly accountId: string;
  readonly displayName: string | null;
}

/** A sample author — a fixed pseudo-account, never a real one. */
function sampleAuthor(voice: string) {
  return { accountId: `sample:${voice}`, isAnonymous: false, displayName: voice };
}

/**
 * Write the samples, once. `now` is passed in so the caller owns the clock and
 * the ages stay deterministic in tests.
 */
export async function seedQuestions(repo: Repo, viewer: Viewer, now: number): Promise<boolean> {
  const already = await repo.getSetting(QUESTIONS_SEED_KEY);
  if (already) return false;

  for (const sample of SAMPLE_QUESTIONS) {
    const questionId = id();
    const createdAt = now - sample.ageDays * DAY;

    const author = sample.anonymous
      ? { accountId: viewer.accountId, isAnonymous: true, displayName: null }
      : sample.byViewer
        ? { accountId: viewer.accountId, isAnonymous: false, displayName: viewer.displayName }
        : sampleAuthor(sample.voice ?? VOICES[0]);

    const answers: Answer[] = [];
    let bestAnswerId: string | null = null;

    for (const sa of sample.answers ?? []) {
      const answerId = id();
      if (sa.best) bestAnswerId = answerId;
      const moderation = sa.reported
        ? { status: 'flagged' as const, reportCount: 1, reasons: ['doctrinal-error' as const], reviewedAt: now - DAY }
        : initialModeration();

      answers.push({
        id: answerId,
        questionId,
        parentAnswerId: null,
        author: sampleAuthor(sa.voice),
        body: sa.body,
        affirmations: sa.affirmations,
        moderation,
        createdAt: now - sa.ageDays * DAY,
        updatedAt: now - sa.ageDays * DAY,
      });

      for (const r of sa.replies ?? []) {
        answers.push({
          id: id(),
          questionId,
          parentAnswerId: answerId,
          author: sampleAuthor(r.voice),
          body: r.body,
          affirmations: 0,
          moderation: initialModeration(),
          createdAt: now - r.ageDays * DAY,
          updatedAt: now - r.ageDays * DAY,
        });
      }
    }

    const question: Question = {
      id: questionId,
      author,
      title: sample.title,
      body: sample.body,
      citation: sample.citation ?? null,
      topics: sample.topics,
      bestAnswerId,
      moderation: initialModeration(),
      affirmations: sample.affirmations,
      answerCount: answers.length,
      createdAt,
      updatedAt: createdAt,
    };

    await repo.upsertQuestion(question);
    for (const a of answers) await repo.upsertAnswer(a);
  }

  await repo.setSetting(QUESTIONS_SEED_KEY, String(now));
  return true;
}

/** Whether the sample content is still in place (drives the feed's notice). */
export async function questionsAreSeeded(repo: Repo): Promise<boolean> {
  return (await repo.getSetting(QUESTIONS_SEED_KEY)) !== null;
}
