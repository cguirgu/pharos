/**
 * Onboarding domain — screen sequencing + goal→starter mapping (pure).
 */
import {
  buildSequence,
  startersForGoals,
  progressFraction,
  isProgressScreen,
  MAX_PREVIEWS,
  GOAL_TO_STARTER,
  ALL_GOALS,
  PART_OF_DAY_TIME,
  type OnboardingAnswers,
  type GoalKey,
  type Screen,
} from '../../src/domain/onboarding';

const answers = (goals: GoalKey[]): OnboardingAnswers => ({ goals, experience: null, reminder: null });

describe('startersForGoals', () => {
  test('maps goals to their starter practices, in order, deduped', () => {
    expect(startersForGoals(['prayer', 'word', 'fasts'])).toEqual(['agpeya', 'word', 'fasts']);
  });

  test('"coptic" maps to no practice (it is the Learn tab)', () => {
    expect(GOAL_TO_STARTER.coptic).toBeUndefined();
    expect(startersForGoals(['coptic'])).toEqual([]);
    expect(startersForGoals(['coptic', 'journal'])).toEqual(['journal']);
  });

  test('empty goals yield no starters', () => {
    expect(startersForGoals([])).toEqual([]);
  });
});

describe('buildSequence', () => {
  test('orders name → feedback → goals → experience → previews → rule → reminder → notify', () => {
    const seq = buildSequence(answers(['coptic']));
    expect(seq.map((s) => s.kind)).toEqual([
      'name-journey', 'feedback', 'goals', 'experience', 'preview', 'rule', 'reminder', 'notify',
    ]);
    expect(seq.find((s) => s.kind === 'preview')).toEqual({ kind: 'preview', goal: 'coptic' });
  });

  test('the feedback step sits second — right after name/journey', () => {
    for (const goals of [[], ['coptic'], ALL_GOALS] as GoalKey[][]) {
      expect(buildSequence(answers(goals))[1]!.kind).toBe('feedback');
    }
  });

  test('a preview per chosen goal, capped at MAX_PREVIEWS', () => {
    const seq = buildSequence(answers(['fasts', 'prayer', 'word', 'coptic', 'saints', 'journal']));
    const previews = seq.filter((s) => s.kind === 'preview');
    expect(previews).toHaveLength(MAX_PREVIEWS);
    // previews follow the chosen-goal order
    expect(previews.map((p) => (p as { goal: GoalKey }).goal)).toEqual(['fasts', 'prayer', 'word']);
  });

  test('no goals → no previews', () => {
    const seq = buildSequence(answers([]));
    expect(seq.some((s) => s.kind === 'preview')).toBe(false);
  });
});

describe('progressFraction', () => {
  test('previews do not advance the progress bar; questions do', () => {
    const seq = buildSequence(answers(['coptic'])); // 7 question screens + 1 preview
    // name-journey, feedback, goals, experience, [preview], rule, reminder, notify
    // cursor 0 = nothing done
    expect(progressFraction(seq, 0)).toBe(0);
    // at the end, all question screens are behind us
    expect(progressFraction(seq, seq.length)).toBe(1);
    // the preview screen (index 4) does not bump the fraction past the 4 questions before it
    expect(progressFraction(seq, 4)).toBeCloseTo(4 / 7);
    expect(progressFraction(seq, 5)).toBeCloseTo(4 / 7); // crossing the preview adds nothing
  });

  test('is clamped to [0,1] for out-of-range cursors', () => {
    const seq = buildSequence(answers([]));
    expect(progressFraction(seq, -5)).toBe(0);
    expect(progressFraction(seq, 999)).toBe(1);
  });

  test('no-goals flow has 7 question screens and even sevenths', () => {
    const seq = buildSequence(answers([]));
    expect(seq.filter(isProgressScreen)).toHaveLength(7);
    expect(progressFraction(seq, 1)).toBeCloseTo(1 / 7);
  });

  test('an empty sequence never divides by zero', () => {
    expect(progressFraction([], 0)).toBe(0);
    expect(progressFraction([], 3)).toBe(0);
  });
});

describe('isProgressScreen', () => {
  test('only preview screens are excluded from progress', () => {
    const kinds: Screen['kind'][] = ['name-journey', 'feedback', 'goals', 'experience', 'rule', 'reminder', 'notify'];
    for (const kind of kinds) expect(isProgressScreen({ kind } as Screen)).toBe(true);
    expect(isProgressScreen({ kind: 'preview', goal: 'coptic' })).toBe(false);
  });
});

describe('startersForGoals — edge cases', () => {
  test('duplicate goals collapse to a single starter, preserving first-seen order', () => {
    expect(startersForGoals(['prayer', 'prayer', 'word', 'prayer'])).toEqual(['agpeya', 'word']);
  });

  test('all goals → all five starter practices (coptic contributes none)', () => {
    const all = startersForGoals(ALL_GOALS);
    expect(all).toEqual(['fasts', 'agpeya', 'word', 'saint', 'journal']);
    expect(all).not.toContain(undefined);
  });

  test('every goal except "coptic" maps to a defined starter', () => {
    for (const g of ALL_GOALS) {
      const expectStarter = g !== 'coptic';
      expect(GOAL_TO_STARTER[g] !== undefined).toBe(expectStarter);
    }
  });
});

describe('buildSequence — invariants', () => {
  test('always opens on name-journey and ends on notify, for any goal selection', () => {
    for (const goals of [[], ['coptic'], ALL_GOALS] as GoalKey[][]) {
      const seq = buildSequence(answers(goals));
      expect(seq[0]!.kind).toBe('name-journey');
      expect(seq[seq.length - 1]!.kind).toBe('notify');
      // the question backbone is always present and in order
      const questionKinds = seq.filter(isProgressScreen).map((s) => s.kind);
      expect(questionKinds).toEqual(['name-journey', 'feedback', 'goals', 'experience', 'rule', 'reminder', 'notify']);
    }
  });

  test('previews are the FIRST MAX_PREVIEWS goals in chosen order', () => {
    const chosen: GoalKey[] = ['journal', 'coptic', 'fasts', 'word'];
    const previews = buildSequence(answers(chosen)).filter((s) => s.kind === 'preview') as Extract<Screen, { kind: 'preview' }>[];
    expect(previews.map((p) => p.goal)).toEqual(['journal', 'coptic', 'fasts']); // first 3, order preserved
    expect(previews.length).toBeLessThanOrEqual(MAX_PREVIEWS);
  });
});

describe('PART_OF_DAY_TIME', () => {
  test('every part of day has a valid HH:MM default', () => {
    for (const t of Object.values(PART_OF_DAY_TIME)) expect(t).toMatch(/^\d{2}:\d{2}$/);
  });
});
