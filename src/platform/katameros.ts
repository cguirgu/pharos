/**
 * Best-effort online fetch of the day's Katameros references from the open
 * katameros.app API (app layer). Stores REFERENCES only (the verse text is
 * rendered from our own provider). Silently no-ops offline; the structural
 * reading plan remains the fallback. The parser is the tested pure core.
 */
import type { CivilDate } from '../domain/coptic';
import { toCoptic } from '../domain/coptic';
import { parseKatameros, setLectionaryData } from '../domain/content';

const ENGLISH = 2;

/** Fetch + cache today's readings (references). Returns true on success. */
export async function fetchTodaysReadings(today: CivilDate): Promise<boolean> {
  const dd = String(today.day).padStart(2, '0');
  const mm = String(today.month).padStart(2, '0');
  const url = `https://api.katameros.app/readings/gregorian/${dd}-${mm}-${today.year}?languageId=${ENGLISH}`;
  try {
    const res = await fetch(url);
    if (!res.ok) return false;
    const json = await res.json();
    const day = parseKatameros(json);
    if (day.refs.length === 0) return false;
    const c = toCoptic(today);
    setLectionaryData({ days: { [`${c.month}-${c.day}`]: day } });
    return true;
  } catch {
    return false;
  }
}
