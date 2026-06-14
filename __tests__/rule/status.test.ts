import {
  statusFromValue,
  statusFromParts,
  toggleBinary,
  logFromValue,
  logFromParts,
  isEditable,
  effectiveStatus,
} from '../../src/domain/rule';
import type { Practice, PracticeLog } from '../../src/domain/rule';
import type { CivilDate } from '../../src/domain/coptic';

const D = (m: number, d: number): CivilDate => ({ year: 2026, month: m, day: d });

const base: Practice = {
  id: 'p1',
  createdAt: 0,
  name: 'Jesus Prayer',
  category: 'prayer',
  kind: 'custom',
  cadence: { type: 'daily' },
  measure: 'count',
  target: 50,
  state: 'active',
  sortOrder: 0,
};

describe('count / duration status', () => {
  test.each([
    [0, 'open'],
    [1, 'part'],
    [49, 'part'],
    [50, 'kept'],
    [73, 'kept'],
  ])('value %i → %s', (value, expected) => {
    expect(statusFromValue(base, value)).toBe(expected);
  });

  test('logFromValue records value and status', () => {
    expect(logFromValue(base, D(6, 10), 50)).toEqual({
      practiceId: 'p1',
      date: D(6, 10),
      value: 50,
      status: 'kept',
    });
  });
});

describe('parts status (Agpeya)', () => {
  const agpeya: Practice = {
    ...base,
    measure: 'parts',
    parts: ['Morning', 'Noon', 'Vespers'],
    target: undefined,
  };

  test('all → kept, some → part, none → open', () => {
    expect(statusFromParts(agpeya, ['Morning', 'Noon', 'Vespers'])).toBe('kept');
    expect(statusFromParts(agpeya, ['Morning'])).toBe('part');
    expect(statusFromParts(agpeya, [])).toBe('open');
  });

  test('logFromParts ignores unknown parts', () => {
    const log = logFromParts(agpeya, D(6, 10), ['Morning', 'Compline']);
    expect(log.parts).toEqual(['Morning']);
    expect(log.status).toBe('part');
  });
});

describe('binary toggle', () => {
  test('open ⇄ kept', () => {
    const a = toggleBinary(base, D(6, 10), undefined);
    expect(a.status).toBe('kept');
    const b = toggleBinary(base, D(6, 10), a);
    expect(b.status).toBe('open');
  });
});

describe('grace window (today & yesterday only)', () => {
  const today = D(6, 15);
  test.each([
    [D(6, 15), true],
    [D(6, 14), true],
    [D(6, 13), false],
    [D(6, 16), false], // future
  ])('isEditable(%o) = %s', (date, expected) => {
    expect(isEditable(date, today)).toBe(expected);
  });
});

describe('effectiveStatus', () => {
  const today = D(6, 15);
  const log = (status: PracticeLog['status']): PracticeLog => ({ practiceId: 'p1', date: D(6, 12), status });

  test('a logged completion shows through', () => {
    expect(effectiveStatus(log('kept'), D(6, 12), today)).toBe('kept');
    expect(effectiveStatus(log('part'), D(6, 12), today)).toBe('part');
  });
  test('a past due day with no completion is missed', () => {
    expect(effectiveStatus(undefined, D(6, 12), today)).toBe('missed');
  });
  test('today with no completion stays open (pending)', () => {
    expect(effectiveStatus(undefined, today, today)).toBe('open');
  });
});
