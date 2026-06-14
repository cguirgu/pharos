/**
 * Clock store — the app's notion of "today", with a hidden dev override so
 * liturgical behaviour is testable on any date (CLAUDE.md §2 / TESTING.md).
 *
 * On every change it keeps the domain clock (`src/domain/coptic/clock`) in sync,
 * so any domain function that calls `today()` agrees with the UI.
 */
import { create } from 'zustand';
import type { CivilDate } from '../domain/coptic';
import { setFixedToday } from '../domain/coptic';
import { civilFromJsDate, installSystemClock } from '../platform/today';

interface ClockState {
  /** Dev override; null = follow the system clock. */
  override: CivilDate | null;
  /** The effective civil date the app should render. */
  today: CivilDate;
  setOverride: (date: CivilDate) => void;
  clearOverride: () => void;
  /** Re-read the system clock (call on app foreground). */
  refresh: () => void;
}

function systemToday(): CivilDate {
  return civilFromJsDate(new Date());
}

export const useClock = create<ClockState>((set) => {
  installSystemClock();
  return {
    override: null,
    today: systemToday(),
    setOverride: (date) => {
      setFixedToday(date);
      set({ override: date, today: date });
    },
    clearOverride: () => {
      installSystemClock();
      set({ override: null, today: systemToday() });
    },
    refresh: () =>
      set((s) => (s.override ? s : { today: systemToday() })),
  };
});
