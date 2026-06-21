/**
 * Maximum lengths for user-entered free text. Caps keep a single field from
 * ballooning the local DB / a synced row (and blunt any abuse of the write
 * path). Generous enough never to constrain ordinary use. Pure data — enforced
 * at the inputs (maxLength) and clamped again at the store boundary.
 */
export const LIMITS = {
  /** Practice name. */
  practiceName: 80,
  /** Practice intention / short note. */
  intention: 280,
  /** Journal entry title. */
  journalTitle: 120,
  /** Journal entry body. */
  journalBody: 20_000,
  /** Highlight note. */
  highlightNote: 2_000,
  /** Highlight user tag/label. */
  highlightLabel: 60,
} as const;

/** Trim to `max` characters (no-op for shorter strings; tolerant of undefined). */
export function clampText(value: string | undefined, max: number): string {
  return (value ?? '').slice(0, max);
}
