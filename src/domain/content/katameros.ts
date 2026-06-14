/**
 * Katameros API response → references-only `DayReadings`.
 *
 * Parses the open katameros.app / coptic.io response shape and extracts ONLY the
 * scripture references (book/chapter/verse range + slot) — never the verse text,
 * which is a licensed translation (NKJV). The text is rendered from our own
 * licensed/public-domain provider. Pure & tested; the network fetch lives in the
 * app layer (`src/state/reading.ts`).
 */
import type { DayReadings, ReadingRef } from './lectionary';

// Minimal shapes of the parts of the API response we read.
interface ApiPassage {
  bookTranslation?: string;
  bookId?: number;
  chapter?: number;
  ref?: string;
  verses?: { number?: number }[];
}
interface ApiReading {
  title?: string | null;
  passages?: ApiPassage[];
}
interface ApiSubSection {
  title?: string | null;
  readings?: ApiReading[];
}
interface ApiSection {
  title?: string | null;
  subSections?: ApiSubSection[];
}
export interface KatamerosResponse {
  sections?: ApiSection[];
}

function verseBounds(p: ApiPassage): { fromVerse?: number; toVerse?: number } {
  const nums = (p.verses ?? []).map((v) => v.number).filter((n): n is number => typeof n === 'number');
  if (nums.length === 0) return {};
  return { fromVerse: Math.min(...nums), toVerse: Math.max(...nums) };
}

/** Extract references-only readings from a Katameros API response. */
export function parseKatameros(res: KatamerosResponse): DayReadings {
  const refs: ReadingRef[] = [];
  for (const section of res.sections ?? []) {
    for (const sub of section.subSections ?? []) {
      const slot = [section.title, sub.title].filter(Boolean).join(' · ') || undefined;
      for (const reading of sub.readings ?? []) {
        for (const p of reading.passages ?? []) {
          if (typeof p.chapter !== 'number') continue;
          const { fromVerse, toVerse } = verseBounds(p);
          refs.push({
            book: p.bookTranslation ?? String(p.bookId ?? ''),
            chapter: p.chapter,
            ...(fromVerse !== undefined ? { fromVerse } : {}),
            ...(toVerse !== undefined ? { toVerse } : {}),
            ...(slot ? { slot } : {}),
          });
        }
      }
    }
  }
  return { refs };
}

/** "Matthew 5:1–12" / "Psalms 32:11" label for a reference. */
export function readingLabel(ref: ReadingRef): string {
  const base = `${ref.book} ${ref.chapter}`;
  if (ref.fromVerse == null) return base;
  if (ref.toVerse == null || ref.toVerse === ref.fromVerse) return `${base}:${ref.fromVerse}`;
  return `${base}:${ref.fromVerse}–${ref.toVerse}`;
}
