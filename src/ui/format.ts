/**
 * Display formatting for the codex voice: weekday + "the sixth of June",
 * liturgical day labels, and measure subtitles.
 */
import type { CivilDate, DayInfo } from '../domain/coptic';
import { weekday } from '../domain/coptic';
import type { Practice } from '../domain/rule';
import { cadenceSummary } from '../domain/rule';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const ORDINALS = [
  '', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth',
  'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth', 'eighteenth',
  'nineteenth', 'twentieth', 'twenty-first', 'twenty-second', 'twenty-third', 'twenty-fourth', 'twenty-fifth',
  'twenty-sixth', 'twenty-seventh', 'twenty-eighth', 'twenty-ninth', 'thirtieth', 'thirty-first',
];

export function weekdayName(d: CivilDate): string {
  return WEEKDAYS[weekday(d)] ?? '';
}

/** "Friday · the sixth of June" */
export function folioDate(d: CivilDate): string {
  return `${weekdayName(d)} · the ${ORDINALS[d.day] ?? d.day} of ${MONTHS[d.month - 1]}`;
}

/** Right-hand liturgical label: feast, else season + day-number, else Coptic date. */
export function liturgicalLabel(info: DayInfo): string {
  if (info.feast) return info.feast.name;
  if (info.season) return `Day ${info.season.dayNumber} · ${info.season.name}`;
  return `${info.coptic.day} ${info.coptic.monthName}`;
}

/** Subtitle under a practice name: cadence + measure hint. */
/**
 * A quiet, unnumbered sense of when — "today", "yesterday", "3 days ago".
 * `now` is passed in so it stays testable and the caller owns the clock.
 */
export function sinceLabel(createdAt: number, now: number): string {
  const DAY = 86_400_000;
  const days = Math.floor(Math.max(0, now - createdAt) / DAY);
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 14) return 'last week';
  if (days < 31) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 62) return 'last month';
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return days < 730 ? 'last year' : `${Math.floor(days / 365)} years ago`;
}

export function practiceSubtitle(p: Practice): string {
  const cad = cadenceSummary(p.cadence);
  switch (p.measure) {
    case 'count':
      return p.target ? `${cad} · ${p.target}` : cad;
    case 'duration':
      return p.target ? `${cad} · ${p.target} min` : cad;
    case 'parts':
      return p.parts ? `${cad} · ${p.parts.length} parts` : cad;
    default:
      return cad;
  }
}
