/**
 * Faith proficiency ranks — the ladder that tags the learner's profile and
 * climbs as they PERFECT lessons (100%), mirroring the Coptic course's ladder
 * but drawn from a different well so the two never read as the same course.
 *
 * The names loosely echo the stages of the ancient catechumenate — one moved
 * from inquiring, to hearing, to being enrolled, to being illumined at baptism,
 * to standing among the faithful. Treated here as a GAME LADDER and nothing
 * more: these are not offices, they confer nothing, and the app should never
 * present them as a standing in the Church. Thresholds are fractions of lessons
 * perfected, so the ladder scales as units are added.
 */
import { READY_LESSONS } from './course';

export interface FaithRank {
  readonly key: string;
  readonly title: string;
  /** What this rung means, in one line. */
  readonly note: string;
  /** Minimum fraction of lessons perfected to hold this rank (0–1). */
  readonly minFraction: number;
}

/** Lowest first. */
export const FAITH_RANKS: readonly FaithRank[] = [
  { key: 'inquirer', title: 'Inquirer', note: 'You have come to ask.', minFraction: 0 },
  { key: 'hearer', title: 'Hearer', note: 'You have begun to listen.', minFraction: 0.0001 },
  { key: 'catechumen', title: 'Catechumen', note: 'You are being taught.', minFraction: 0.25 },
  { key: 'illumined', title: 'Illumined', note: 'You can say what you believe, and why.', minFraction: 0.5 },
  { key: 'faithful', title: 'Among the Faithful', note: 'You can tell the settled from the open.', minFraction: 0.75 },
  { key: 'keeper', title: 'Keeper of the Faith', note: 'You have finished the whole course.', minFraction: 1 },
];

export interface FaithProficiency {
  readonly rank: FaithRank;
  /** The next rank up, or null at the top. */
  readonly next: FaithRank | null;
  /** Lessons still to perfect to reach `next` (0 at the top). */
  readonly toNext: number;
  readonly perfected: number;
  readonly total: number;
}

/** The learner's current rank and the distance to the next. */
export function faithRankFor(perfected: number, total = READY_LESSONS.length): FaithProficiency {
  const fraction = total > 0 ? perfected / total : 0;
  let idx = 0;
  for (let i = FAITH_RANKS.length - 1; i >= 0; i--) {
    if (fraction >= FAITH_RANKS[i]!.minFraction) {
      idx = i;
      break;
    }
  }
  const rank = FAITH_RANKS[idx]!;
  const next = FAITH_RANKS[idx + 1] ?? null;
  const toNext = next ? Math.max(1, Math.ceil(next.minFraction * total) - perfected) : 0;
  return { rank, next, toNext, perfected, total };
}
