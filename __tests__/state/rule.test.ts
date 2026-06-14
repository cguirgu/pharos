/**
 * Rule store integration test (MemoryRepo, account-scoped). Exercises the
 * create → check-in → streak flow through the persistence + state layer — the
 * same path the Today/Rule screens drive, minus the renderer.
 */
import { useRule } from '../../src/state/rule';
import { MemoryRepo, setRepo } from '../../src/db/repo';
import { practiceStreak, practiceStats, isDueOn, effectiveStatus, dateKey } from '../../src/domain/rule';
import type { Practice } from '../../src/domain/rule';
import type { CivilDate } from '../../src/domain/coptic';

const TODAY: CivilDate = { year: 2026, month: 10, day: 7 }; // ordinary-time Wednesday
const ACC = 'acct-1';

const binary = (id: string, name: string): Practice => ({
  id, createdAt: 0, name, category: 'prayer', kind: 'custom',
  cadence: { type: 'daily' }, measure: 'binary', state: 'active', sortOrder: 0,
});

beforeEach(async () => {
  setRepo(new MemoryRepo());
  await useRule.getState().load(ACC); // empty rule for a fresh account
});

test('an account starts with no practices (seeding now comes from onboarding)', () => {
  expect(useRule.getState().practices).toHaveLength(0);
  expect(useRule.getState().accountId).toBe(ACC);
});

test('count check-in records a partial then a kept, and the streak follows', async () => {
  const store = useRule.getState();
  const count: Practice = {
    id: 'jp', createdAt: 0, name: 'Jesus Prayer', category: 'prayer', kind: 'custom',
    cadence: { type: 'daily' }, measure: 'count', target: 50, state: 'active', sortOrder: 9,
  };
  await store.savePractice(count);

  await store.logValue(count, TODAY, 30); // 30/50 → part
  let log = useRule.getState().logsFor('jp').find((l) => dateKey(l.date) === dateKey(TODAY));
  expect(log).toMatchObject({ value: 30, status: 'part' });
  expect(effectiveStatus(log, TODAY, TODAY)).toBe('part');

  await store.logValue(count, TODAY, 50); // → kept
  log = useRule.getState().logsFor('jp').find((l) => dateKey(l.date) === dateKey(TODAY));
  expect(log?.status).toBe('kept');

  const logs = useRule.getState().logsFor('jp');
  expect(practiceStreak(count, logs, { today: TODAY, since: { year: 2026, month: 10, day: 1 } })).toBe(1);
  expect(practiceStats(count, logs, { today: TODAY, since: TODAY }).keptPercent).toBe(100);
});

test('binary toggle and rest-day persist', async () => {
  const store = useRule.getState();
  const p = binary('rw', 'Read the Word');
  await store.savePractice(p);
  expect(isDueOn(p, TODAY, [])).toBe(true);

  await store.toggle(p, TODAY);
  expect(useRule.getState().logsFor('rw').find((l) => dateKey(l.date) === dateKey(TODAY))?.status).toBe('kept');

  await store.setRestDay(TODAY, true);
  expect(useRule.getState().restDays.has(dateKey(TODAY))).toBe(true);
  await store.setRestDay(TODAY, false);
  expect(useRule.getState().restDays.has(dateKey(TODAY))).toBe(false);
});

test('persistence round-trips through the same repo', async () => {
  const repo = new MemoryRepo();
  setRepo(repo);
  await useRule.getState().load(ACC);
  await useRule.getState().savePractice(binary('p1', 'Agpeya'));
  // Re-read directly from the repo for the same account.
  expect(await repo.listPractices(ACC)).toHaveLength(1);
  // A different account sees nothing (isolation).
  expect(await repo.listPractices('other')).toHaveLength(0);
});

test('removePractice deletes its logs too', async () => {
  const store = useRule.getState();
  const p = binary('p1', 'Agpeya');
  await store.savePractice(p);
  await store.toggle(p, TODAY);
  await store.removePractice(p.id);
  expect(useRule.getState().practices.find((x) => x.id === p.id)).toBeUndefined();
  expect(useRule.getState().logsFor(p.id)).toHaveLength(0);
});
