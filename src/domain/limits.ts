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
  /** Question title — one line, the thing being asked. */
  questionTitle: 140,
  /** Question body — the fuller wording. */
  questionBody: 4_000,
  /** An answer or a reply. */
  answerBody: 4_000,
  /** The passage text carried into a question as its citation. */
  citationSnapshot: 600,
  /** Optional note attached to a report. */
  reportNote: 500,
} as const;

/** Trim to `max` characters (no-op for shorter strings; tolerant of undefined). */
export function clampText(value: string | undefined, max: number): string {
  return (value ?? '').slice(0, max);
}
