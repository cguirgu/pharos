/**
 * The Synaxarium (commemoration of the day) — SCHEMA + lookup only.
 *
 * ⚠️ CONTENT DISCIPLINE: saints' lives must come from a verified Synaxarium and
 * are NOT included here. The seeded entries are keyed to the calendar engine's
 * already-verified feast dates (so we never assert an unverified date), with
 * **placeholder lives** marked `draft: true`. The owner supplies the full,
 * verified Synaxarium. Most days return no entry until that text is provided.
 *
 * TODO(verify-content): supply verified Synaxarium entries (see TESTING.md).
 */
import type { CopticDate } from '../coptic';
import { CONTENT_LICENSED, SYNAXARIUM_NAMES } from '../../content/flags';

export const LIFE_TBD = '⟨ life to be supplied from a verified Synaxarium ⟩';

/**
 * Withhold a draft (unlicensed) life until content is licensed: the feast `name`
 * and `title` are structural facts and stay; only the prose `life` is blanked.
 */
export function gateLife(entry: SynaxariumEntry, licensed: boolean): SynaxariumEntry {
  if (licensed || !entry.draft) return entry;
  return { ...entry, life: '' };
}

export interface SynaxariumEntry {
  /** Coptic month 1–13. */
  readonly copticMonth: number;
  readonly copticDay: number;
  readonly name: string;
  readonly title?: string;
  /** All commemorations of the day (when available). */
  readonly feasts?: readonly string[];
  /** Placeholder until verified. */
  readonly life: string;
  readonly draft: boolean;
}

/**
 * A loaded Synaxarium dataset, keyed "<month>-<day>" (1–13). The app injects one
 * read from `content/synaxarium/synaxarium.json` (see scripts/ingest-synaxarium.mjs);
 * tests inject a filesystem copy. Until set, only the seeded feasts below resolve.
 *
 * ⚠️ The ingested English text is `draft` pending confirmation of the underlying
 * translation's permission (St. George C.O.C., Chicago) — see TESTING.md.
 */
export interface SynaxariumDataset {
  readonly days: Readonly<Record<string, { feasts: string[]; life: string }>>;
}

let dataset: SynaxariumDataset | null = null;

export function setSynaxariumData(d: SynaxariumDataset | null): void {
  dataset = d;
}

/**
 * Seeds limited to commemorations tied to the engine's verified feast dates.
 * Names are the feasts themselves (structural facts), lives are placeholders.
 */
export const SYNAXARIUM: readonly SynaxariumEntry[] = [
  { copticMonth: 1, copticDay: 1, name: 'The Feast of Nayrouz', title: 'The Coptic New Year', life: LIFE_TBD, draft: true },
  { copticMonth: 1, copticDay: 17, name: 'The Feast of the Cross', life: LIFE_TBD, draft: true },
  { copticMonth: 4, copticDay: 29, name: 'The Nativity of our Lord', life: LIFE_TBD, draft: true },
  { copticMonth: 5, copticDay: 11, name: 'Theophany — the Baptism of our Lord', life: LIFE_TBD, draft: true },
  { copticMonth: 7, copticDay: 10, name: 'The Feast of the Cross', life: LIFE_TBD, draft: true },
  { copticMonth: 7, copticDay: 29, name: 'The Annunciation', life: LIFE_TBD, draft: true },
];

/**
 * A Coptic day's Synaxarium — the day, not the saint, is the unit. Two tiers,
 * deliberately kept apart (see `src/content/flags.ts`):
 *
 *   - `commemorations` — WHICH saints and feasts the Church remembers today.
 *     Facts about the calendar. Tier 1: ships now.
 *   - `life` — the day's NARRATIVE account. Note the source supplies ONE account
 *     per day covering all of that day's commemorations; it is not divided per
 *     saint, and we do not divide it ourselves (that would be an editorial act
 *     on text we have not verified). Tier 2: gated, and blanked here in the
 *     domain rather than in any screen.
 */
export interface SynaxariumDay {
  /** Coptic month 1–13. */
  readonly copticMonth: number;
  readonly copticDay: number;
  /** Every commemoration of the day, in Synaxarium order. Never empty. */
  readonly commemorations: readonly string[];
  /** '' when withheld (unlicensed draft) or not supplied. */
  readonly life: string;
  readonly draft: boolean;
}

/** Tier-2 gate at the day level. Mirrors `gateLife`: names stay, prose goes. */
export function gateDayLife(day: SynaxariumDay, licensed: boolean): SynaxariumDay {
  if (licensed || !day.draft) return day;
  return { ...day, life: '' };
}

/** Whether the day's account is actually renderable — licensed AND non-empty. */
export function hasLife(day: SynaxariumDay | null): boolean {
  return !!day && day.life.trim().length > 0;
}

/**
 * Display form of one commemoration line: collapse whitespace and drop the
 * source's trailing full stop (most lines carry one) so headings set cleanly.
 * Purely typographic — no word is changed, added, removed, or reordered.
 */
export function commemorationLabel(raw: string): string {
  return raw.replace(/\s+/g, ' ').trim().replace(/\.$/, '');
}

/**
 * One commemoration trimmed to fit a notification body. iOS truncates around
 * 110 characters and a handful of Synaxarium lines run far longer, so cut at a
 * clause boundary rather than mid-name.
 */
export function notificationBody(label: string, max = 110): string {
  const s = commemorationLabel(label);
  if (s.length <= max) return s;
  const cut = s.slice(0, max);
  const at = Math.max(cut.lastIndexOf(', '), cut.lastIndexOf(' — '), cut.lastIndexOf(' '));
  return `${(at > 40 ? cut.slice(0, at) : cut).trimEnd()}…`;
}

/**
 * The Synaxarium for a Coptic day, both tiers gated, or null if nothing is
 * recorded. The single entry point — read this, never `dataset` directly.
 */
export function synaxariumDay(coptic: CopticDate): SynaxariumDay | null {
  const raw = SYNAXARIUM_NAMES ? dataset?.days[`${coptic.month}-${coptic.day}`] : undefined;
  if (raw && raw.feasts.length > 0) {
    const commemorations = raw.feasts.map(commemorationLabel).filter((s) => s.length > 0);
    if (commemorations.length > 0) {
      return gateDayLife(
        { copticMonth: coptic.month, copticDay: coptic.day, commemorations, life: raw.life, draft: true },
        CONTENT_LICENSED,
      );
    }
  }
  // Fallback: the project's own seeded feasts — our wording, no third-party text.
  const seeds = SYNAXARIUM.filter((e) => e.copticMonth === coptic.month && e.copticDay === coptic.day);
  const first = seeds[0];
  if (!first) return null;
  return gateDayLife(
    {
      copticMonth: coptic.month,
      copticDay: coptic.day,
      commemorations: seeds.map((e) => (e.title ? `${e.name} — ${e.title}` : e.name)),
      life: first.life,
      draft: first.draft,
    },
    CONTENT_LICENSED,
  );
}

/** Every commemoration of the day (tier 1). Empty when none is recorded. */
export function commemorationsOn(coptic: CopticDate): readonly string[] {
  return synaxariumDay(coptic)?.commemorations ?? [];
}

/** The day's leading commemoration — the one label for cards and reminders. */
export function primaryCommemoration(coptic: CopticDate): string | null {
  return commemorationsOn(coptic)[0] ?? null;
}

/**
 * Commemorations on a given Coptic date, in the older entry shape.
 * @deprecated Prefer `synaxariumDay` / `commemorationsOn`. Kept as a thin
 * adapter so existing call sites and their tests keep working unchanged.
 */
export function saintsOn(coptic: CopticDate): SynaxariumEntry[] {
  const day = synaxariumDay(coptic);
  if (!day) return [];
  return [
    {
      copticMonth: day.copticMonth,
      copticDay: day.copticDay,
      name: day.commemorations[0] ?? '',
      feasts: day.commemorations,
      life: day.life,
      draft: day.draft,
    },
  ];
}

/** The primary commemoration of the day, or null. */
export function primarySaint(coptic: CopticDate): SynaxariumEntry | null {
  return saintsOn(coptic)[0] ?? null;
}
