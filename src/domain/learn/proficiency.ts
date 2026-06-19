/**
 * Coptic proficiency ranks — a fun ladder that tags the learner's profile and
 * climbs as they PERFECT lessons (score 100%). Tied to the goal of reading and
 * chanting the hymns: Seeker → Catechumen → Reader → Chanter → Cantor → Scribe
 * → Scholar of Coptic. Thresholds are fractions of perfected lessons, so the
 * ladder scales as more lessons are added.
 */
import { LESSONS } from './course';

export interface Rank {
  readonly key: string;
  readonly title: string;
  /** Minimum fraction of lessons perfected to hold this rank (0–1). */
  readonly minFraction: number;
}

/** Highest first when scanning. */
export const RANKS: readonly Rank[] = [
  { key: 'seeker', title: 'Seeker', minFraction: 0 },
  { key: 'catechumen', title: 'Catechumen', minFraction: 0.0001 },
  { key: 'reader', title: 'Reader', minFraction: 0.25 },
  { key: 'chanter', title: 'Chanter', minFraction: 0.5 },
  { key: 'cantor', title: 'Cantor', minFraction: 0.7 },
  { key: 'scribe', title: 'Scribe', minFraction: 0.9 },
  { key: 'scholar', title: 'Scholar of Coptic', minFraction: 1 },
];

export interface Proficiency {
  readonly rank: Rank;
  /** The next rank up, or null at the top. */
  readonly next: Rank | null;
  /** Lessons still to perfect to reach `next` (0 at the top). */
  readonly toNext: number;
  readonly perfected: number;
  readonly total: number;
}

/** The learner's current rank + progress toward the next. */
export function proficiencyFor(perfected: number, total = LESSONS.length): Proficiency {
  const fraction = total > 0 ? perfected / total : 0;
  let idx = 0;
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (fraction >= RANKS[i]!.minFraction) {
      idx = i;
      break;
    }
  }
  const rank = RANKS[idx]!;
  const next = RANKS[idx + 1] ?? null;
  const toNext = next ? Math.max(1, Math.ceil(next.minFraction * total) - perfected) : 0;
  return { rank, next, toNext, perfected, total };
}
