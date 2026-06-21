/**
 * Data export — exportAccountData gathers every per-account collection and the
 * profile, and never leaks credentials (password hash / salt).
 */
import { MemoryRepo, type Account, type Repo } from '../../src/db/repo';
import type { CivilDate } from '../../src/domain/coptic';
import type { OnboardingAnswers } from '../../src/domain/onboarding';

const D: CivilDate = { year: 2026, month: 1, day: 1 };
const answers: OnboardingAnswers = { goals: ['coptic', 'fasts'], experience: 'new', reminder: { partOfDay: 'evening', time: '20:00' } };

test('exportAccountData returns every collection and omits credentials', async () => {
  const repo: Repo = new MemoryRepo();
  const acc: Account = { id: 'a', email: 'a@example.com', passwordHash: 'SECRETHASH', salt: 'SECRETSALT', createdAt: 7, displayName: 'Mina', journeyStage: 'exploring', onboardingComplete: true };
  await repo.createAccount(acc);
  await repo.upsertPractice('a', { id: 'p1', createdAt: 0, name: 'Pray', category: 'prayer', kind: 'custom', cadence: { type: 'daily' }, measure: 'binary', state: 'active', sortOrder: 0 });
  await repo.upsertLog('a', { practiceId: 'p1', date: D, status: 'kept' });
  await repo.upsertJournal('a', { id: 'j1', date: D, title: 't', body: 'b', createdAt: 1, updatedAt: 1 });
  await repo.upsertHighlight('a', { id: 'h1', textSnapshot: 'snap', referenceLabel: 'ref', createdAt: 1, updatedAt: 1, anchor: { source: 'synaxarium', copticMonth: 1, copticDay: 1, startOffset: 0, endOffset: 4 } });
  await repo.setOfficeLog('a', '2026-01-01', 'matins', true);
  await repo.completeLesson('a', 'alphabet-1', 5, 9, '2026-01-01');
  await repo.saveOnboarding('a', answers, 1);

  const data = await repo.exportAccountData('a');

  expect(data.profile.email).toBe('a@example.com');
  expect(data.profile.displayName).toBe('Mina');
  expect(data.practices).toHaveLength(1);
  expect(data.practiceLogs).toHaveLength(1);
  expect(data.journal).toHaveLength(1);
  expect(data.highlights).toHaveLength(1);
  expect(data.learn).toHaveLength(1);
  expect(data.officeLogs).toEqual([{ date: '2026-01-01', officeKey: 'matins' }]);
  expect(data.onboarding).toEqual(answers);

  // credentials never appear anywhere in the export
  expect((data.profile as Record<string, unknown>).passwordHash).toBeUndefined();
  expect((data.profile as Record<string, unknown>).salt).toBeUndefined();
  const json = JSON.stringify(data);
  expect(json).not.toContain('SECRETHASH');
  expect(json).not.toContain('SECRETSALT');
});
