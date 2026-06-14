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
