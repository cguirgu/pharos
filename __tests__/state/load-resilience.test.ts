/**
 * Startup resilience — a failing per-account data source (e.g. a backend that
 * hasn't provisioned the onboarding_answers table) must NEVER reject app startup
 * or block finishing onboarding. This guards the regression that left the app
 * hanging on the splash. Failures degrade gracefully (empty / in-memory only).
 */
import { MemoryRepo, setRepo, getRepo } from '../../src/db/repo';
import { useAuth } from '../../src/state/auth';
import { useRule } from '../../src/state/rule';
import { useOnboarding } from '../../src/state/onboarding';
import type { OnboardingAnswers } from '../../src/domain/onboarding';

const ANSWERS: OnboardingAnswers = { goals: ['coptic'], experience: 'new', reminder: null };

/** A repo whose onboarding reads/writes always fail (table missing, RLS, offline…). */
class FaultyOnboardingRepo extends MemoryRepo {
  override async getOnboarding(): Promise<OnboardingAnswers | null> {
    throw new Error('relation "onboarding_answers" does not exist');
  }
  override async saveOnboarding(): Promise<void> {
    throw new Error('relation "onboarding_answers" does not exist');
  }
}

/** A repo where even restoring the session throws (the splash-hang trigger). */
class SessionReadFailsRepo extends MemoryRepo {
  override async getSession(): Promise<string | null> {
    throw new Error('session read failed');
  }
}

/** A repo where EVERY per-account read fails — the worst case for startup. */
class AllReadsFailRepo extends MemoryRepo {
  override async listPractices(): Promise<never> { throw new Error('boom'); }
  override async listLogs(): Promise<never> { throw new Error('boom'); }
  override async listRestDays(): Promise<never> { throw new Error('boom'); }
  override async listJournal(): Promise<never> { throw new Error('boom'); }
  override async listHighlights(): Promise<never> { throw new Error('boom'); }
  override async listLearn(): Promise<never> { throw new Error('boom'); }
  override async getOnboarding(): Promise<never> { throw new Error('boom'); }
  override async listOfficeLogs(): Promise<never> { throw new Error('boom'); }
}

let warn: jest.SpyInstance;
beforeEach(() => {
  warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
  useRule.getState().clear();
  useOnboarding.getState().clear();
});
afterEach(() => warn.mockRestore());

test('the onboarding store load degrades to null and never throws', async () => {
  setRepo(new FaultyOnboardingRepo());
  await expect(useOnboarding.getState().load('acc-1')).resolves.toBeUndefined();
  expect(useOnboarding.getState().accountId).toBe('acc-1'); // session still established
  expect(useOnboarding.getState().answers).toBeNull(); // graceful default
});

test('the onboarding store save never throws on a backend error; keeps answers in memory', async () => {
  setRepo(new FaultyOnboardingRepo());
  await useOnboarding.getState().load('acc-1');
  await expect(useOnboarding.getState().save(ANSWERS)).resolves.toBeUndefined();
  expect(useOnboarding.getState().answers).toEqual(ANSWERS);
});

test('auth.load ALWAYS marks loaded — even if session restore throws (the splash-hang fix)', async () => {
  setRepo(new SessionReadFailsRepo());
  await expect(useAuth.getState().load()).resolves.toBeUndefined();
  expect(useAuth.getState().loaded).toBe(true); // app/index.tsx can leave the splash
  expect(useAuth.getState().account).toBeNull(); // safe signed-out start
});

test('sign-in completes even when the onboarding table is missing (no splash hang)', async () => {
  setRepo(new FaultyOnboardingRepo());
  await useAuth.getState().load();
  const ok = await useAuth.getState().signUpWithPassword('mina@example.com', 'pa55word');
  expect(ok).toBe(true);
  expect(useAuth.getState().account).not.toBeNull(); // NOT bricked
  expect(useOnboarding.getState().answers).toBeNull();
});

test('startup survives even when every per-account read fails', async () => {
  setRepo(new AllReadsFailRepo());
  await useAuth.getState().load();
  const ok = await useAuth.getState().signUpWithPassword('mina@example.com', 'pa55word');
  expect(ok).toBe(true);
  expect(useAuth.getState().account).not.toBeNull();
  expect(useRule.getState().practices).toEqual([]); // degraded, not crashed
});

test('completeOnboarding still finishes when answers cannot be saved', async () => {
  setRepo(new FaultyOnboardingRepo());
  await useAuth.getState().load();
  await useAuth.getState().signUpWithPassword('mina@example.com', 'pa55word');
  await expect(
    useAuth.getState().completeOnboarding({ displayName: 'Mina', journeyStage: 'returning', selection: ['agpeya'], answers: ANSWERS }),
  ).resolves.toBeUndefined();
  expect(useAuth.getState().account?.onboardingComplete).toBe(true);
  expect(useRule.getState().practices.length).toBeGreaterThan(0); // the rule was still created
});

test('a healthy repo still persists and reloads answers (no regression)', async () => {
  setRepo(new MemoryRepo());
  await useAuth.getState().load();
  await useAuth.getState().signUpWithPassword('mina@example.com', 'pa55word');
  await useAuth.getState().completeOnboarding({ displayName: 'Mina', journeyStage: 'returning', selection: ['agpeya'], answers: ANSWERS });
  expect(useOnboarding.getState().answers).toEqual(ANSWERS);
  expect(await getRepo().getOnboarding(useAuth.getState().account!.id)).toEqual(ANSWERS);
});
