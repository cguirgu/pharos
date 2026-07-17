/**
 * Account deletion — the repo wipes every per-account table (and the account
 * row), with per-account isolation; the auth store's local-path deleteAccount
 * clears the session, the per-account stores, and the account.
 */
import { MemoryRepo, setRepo, getRepo, type Account, type Repo } from '../../src/db/repo';
import { useAuth } from '../../src/state/auth';
import { useRule } from '../../src/state/rule';
import type { CivilDate } from '../../src/domain/coptic';
import type { OnboardingAnswers } from '../../src/domain/onboarding';

const D: CivilDate = { year: 2026, month: 1, day: 1 };
const answers: OnboardingAnswers = { goals: ['prayer'], experience: 'some', reminder: null };

const account = (id: string): Account => ({
  id, email: `${id}@example.com`, passwordHash: 'h', salt: 's',
  createdAt: 1, displayName: 'N', journeyStage: 'returning', onboardingComplete: true,
});

async function seed(repo: Repo, id: string): Promise<void> {
  await repo.createAccount(account(id));
  await repo.upsertPractice(id, { id: 'p1', createdAt: 0, name: 'Pray', category: 'prayer', kind: 'custom', cadence: { type: 'daily' }, measure: 'binary', state: 'active', sortOrder: 0 });
  await repo.upsertLog(id, { practiceId: 'p1', date: D, status: 'kept' });
  await repo.setRestDay(id, '2026-01-02', true);
  await repo.upsertJournal(id, { id: 'j1', date: D, title: 't', body: 'b', createdAt: 1, updatedAt: 1 });
  await repo.upsertHighlight(id, { id: 'h1', textSnapshot: 'snap', referenceLabel: 'ref', createdAt: 1, updatedAt: 1, anchor: { source: 'synaxarium', copticMonth: 1, copticDay: 1, startOffset: 0, endOffset: 4 } });
  await repo.enroll(id, { planId: 'plan', startDate: D, createdAt: 1 });
  await repo.markReadDay(id, 'plan', 1, '2026-01-01');
  await repo.setOfficeLog(id, '2026-01-01', 'matins', true);
  await repo.completeLesson(id, 'alphabet-1', 5, 9, '2026-01-01');
  await repo.saveOnboarding(id, answers, 1);
}

test('deleteAccount wipes every per-account table and the account row; other accounts are untouched', async () => {
  const repo: Repo = new MemoryRepo();
  await seed(repo, 'a');
  await seed(repo, 'b');

  await repo.deleteAccount('a');

  expect(await repo.getAccount('a')).toBeNull();
  expect(await repo.listPractices('a')).toEqual([]);
  expect(await repo.listLogs('a')).toEqual([]);
  expect(await repo.listRestDays('a')).toEqual([]);
  expect(await repo.listJournal('a')).toEqual([]);
  expect(await repo.listHighlights('a')).toEqual([]);
  expect(await repo.getEnrollment('a', 'plan')).toBeNull();
  expect(await repo.listReadDays('a', 'plan')).toEqual([]);
  expect(await repo.listOfficeLogs('a', '2026-01-01')).toEqual([]);
  expect(await repo.listLearn('a')).toEqual([]);
  expect(await repo.getOnboarding('a')).toBeNull();

  // account b is fully intact
  expect(await repo.getAccount('b')).not.toBeNull();
  expect(await repo.listPractices('b')).toHaveLength(1);
  expect(await repo.getOnboarding('b')).toEqual(answers);
});

test('auth.deleteAccount (local path) clears the account, stores, and repo row', async () => {
  setRepo(new MemoryRepo());
  useRule.getState().clear();
  await useAuth.getState().load();
  await useAuth.getState().signUpWithPassword('mina@example.com', 'pa55word');
  await useAuth.getState().completeOnboarding({ displayName: 'Mina', journeyStage: 'returning', selection: ['agpeya'], answers });
  const id = useAuth.getState().account!.id;
  expect(useRule.getState().practices.length).toBeGreaterThan(0);

  await useAuth.getState().deleteAccount();

  expect(useAuth.getState().account).toBeNull();
  expect(useRule.getState().practices).toEqual([]);
  expect(await getRepo().getAccount(id)).toBeNull();
  expect(await getRepo().getSession()).toBeNull();
});
