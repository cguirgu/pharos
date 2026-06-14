/**
 * Starter rule templates (PRD §5.1 / onboarding "Set the daily hours").
 *
 * Onboarding presents these five with toggles; the chosen subset is created as
 * the new account's rule. `accountId` is applied at the repo boundary, so these
 * templates stay plain domain `Practice` objects.
 */
import type { Practice, Category, Cadence, Measure } from '../domain/rule';
import { id } from '../platform/id';

export type StarterKey = 'agpeya' | 'word' | 'fasts' | 'saint' | 'journal';

interface StarterTemplate {
  key: StarterKey;
  /** Display name shown on the rhythm screen. */
  name: string;
  /** Subtitle shown under the name. */
  subtitle: string;
  defaultOn: boolean;
  category: Category;
  cadence: Cadence;
  measure: Measure;
  parts?: string[];
  intention: string;
}

export const STARTERS: readonly StarterTemplate[] = [
  {
    key: 'agpeya',
    name: 'Pray the Agpeya',
    subtitle: 'Morning · Noon · Evening',
    defaultOn: true,
    category: 'prayer',
    cadence: { type: 'daily' },
    measure: 'parts',
    parts: ['Morning', 'Noon', 'Evening'],
    intention: 'Pray the hours through the day.',
  },
  {
    key: 'word',
    name: 'Read the Word',
    subtitle: 'The Gospels in ninety days',
    defaultOn: true,
    category: 'word',
    cadence: { type: 'daily' },
    measure: 'binary',
    intention: 'A chapter of the Gospels each day.',
  },
  {
    key: 'fasts',
    name: 'Keep the fasts',
    subtitle: 'Wednesday · Friday · seasons',
    defaultOn: true,
    category: 'fast',
    cadence: { type: 'fastDays' },
    measure: 'binary',
    intention: 'Follow the Church’s seasons of fasting.',
  },
  {
    key: 'saint',
    name: 'A saint each day',
    subtitle: 'A life from the Synaxarium',
    defaultOn: false,
    category: 'devotion',
    cadence: { type: 'daily' },
    measure: 'binary',
    intention: 'Read the life of the saint of the day.',
  },
  {
    key: 'journal',
    name: 'Keep a journal',
    subtitle: 'One ruled line is enough',
    defaultOn: false,
    category: 'word',
    cadence: { type: 'daily' },
    measure: 'binary',
    intention: 'A line of reflection, daily.',
  },
];

/** The keys that are ON by default (the design's pre-checked starters). */
export const DEFAULT_SELECTION: StarterKey[] = STARTERS.filter((t) => t.defaultOn).map((t) => t.key);

/** Build `Practice` objects for the chosen starter keys, in template order. */
export function starterPractices(createdAt: number, selection: readonly StarterKey[]): Practice[] {
  let order = 0;
  return STARTERS.filter((t) => selection.includes(t.key)).map((t) => ({
    id: id(),
    createdAt,
    name: t.name,
    category: t.category,
    kind: 'library' as const,
    cadence: t.cadence,
    measure: t.measure,
    parts: t.parts,
    intention: t.intention,
    state: 'active' as const,
    sortOrder: order++,
  }));
}
