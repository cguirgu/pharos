/**
 * Injectable "today" provider.
 *
 * CLAUDE.md §2 is a hard rule: domain code must NEVER call `new Date()`.
 * "Today" is always supplied from outside so liturgical behaviour is testable
 * on any date. The app layer installs a system clock at startup
 * (`setTodayProvider(() => civilFromJsDate(new Date()))`); tests install a
 * fixed date. Until a provider is installed, `today()` throws — by design.
 */
import type { CivilDate } from './types';

let provider: (() => CivilDate) | null = null;

/** Install the source of "today". */
export function setTodayProvider(fn: () => CivilDate): void {
  provider = fn;
}

/** Install a fixed civil date as "today" (tests / dev date-override). */
export function setFixedToday(date: CivilDate): void {
  provider = () => date;
}

/** Today's civil date. Throws if no provider has been installed. */
export function today(): CivilDate {
  if (!provider) {
    throw new Error('No today-provider installed. Call setTodayProvider() at app startup.');
  }
  return provider();
}

/** Reset to the uninstalled state (test teardown). */
export function resetTodayProvider(): void {
  provider = null;
}
