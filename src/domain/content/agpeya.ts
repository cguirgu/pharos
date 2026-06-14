/**
 * The Agpeya (Book of Hours) — STRUCTURE ONLY.
 *
 * ⚠️ CONTENT DISCIPLINE (PRD §6 + owner directive): everything must come from a
 * verified, official Coptic Orthodox source. This module encodes only the
 * *structure* of the Agpeya — the seven canonical hours, their times, and the
 * standard order of a prayer's sections. **No prayer/psalm/gospel prose is
 * included**; every body is a clearly-marked placeholder to be supplied from an
 * approved Agpeya. The per-hour `commemoration` strings are the commonly-cited
 * themes but are marked `draft` until verified against an official Agpeya.
 *
 * TODO(verify-content): confirm hour commemorations and supply all prayer text
 * from a licensed/approved English Agpeya (see TESTING.md → open content items).
 */
import { parseScriptureRef, type ScriptureRef } from './bible';

/** A scripture reference with optional verse bounds (an Agpeya psalm/gospel span). */
export type ScriptureSpan = ScriptureRef & { fromVerse?: number; toVerse?: number };

/** Placeholder shown wherever verified text is owed. */
export const TEXT_TBD = '⟨ text to be supplied from a verified Agpeya ⟩';

/** Marks this whole dataset as awaiting verification. */
export const AGPEYA_DRAFT = true;

export type OfficeKey =
  | 'matins'
  | 'prime'
  | 'terce'
  | 'sext'
  | 'none'
  | 'vespers'
  | 'compline';

export interface Office {
  readonly key: OfficeKey;
  readonly name: string;
  /** Coptic-script name (ornament). */
  readonly coptic: string;
  /** Hour of day it is prayed, 0–23 (local). */
  readonly hour: number;
  /** Commonly-cited commemoration — DRAFT, verify against an official Agpeya. */
  readonly commemoration: string;
}

/** The seven canonical hours, in order through the day. */
export const OFFICES: readonly Office[] = [
  { key: 'matins', name: 'Matins', coptic: 'Ϣⲱⲣⲡ', hour: 0, commemoration: 'The Resurrection' },
  { key: 'prime', name: 'Prime', coptic: 'Ⲁϫⲡ ⲁ̄', hour: 6, commemoration: 'The Nativity' },
  { key: 'terce', name: 'Terce', coptic: 'Ⲁϫⲡ ⲅ̄', hour: 9, commemoration: 'The Descent of the Holy Spirit' },
  { key: 'sext', name: 'Sext', coptic: 'Ⲁϫⲡ ⲋ̄', hour: 12, commemoration: 'The Crucifixion' },
  { key: 'none', name: 'None', coptic: 'Ⲁϫⲡ ⲑ̄', hour: 15, commemoration: 'The Death on the Cross' },
  { key: 'vespers', name: 'Vespers', coptic: 'Ⲁϫⲡ ⲓ̄ⲁ̄', hour: 18, commemoration: 'The Deposition from the Cross' },
  { key: 'compline', name: 'Compline', coptic: 'Ⲁϫⲡ ⲓ̄ⲃ̄', hour: 21, commemoration: 'The Burial' },
];

export type SectionKind =
  | 'introduction'
  | 'thanksgiving'
  | 'psalm50'
  | 'psalms'
  | 'gospel'
  | 'litanies'
  | 'lordHaveMercy'
  | 'conclusion';

export interface ReaderSection {
  readonly kind: SectionKind;
  readonly label: string;
  /** Placeholder body (for prose sections whose text isn't supplied yet). */
  readonly body: string;
  /** For the Lord-Have-Mercy section: the repetition count (×41). */
  readonly count?: number;
  /** Scripture references for psalm50/psalms/gospel sections (rendered from KJV). */
  readonly refs?: readonly ScriptureSpan[];
}

/** Per-office scripture references (which Psalms + Gospel), source: coptic.io. */
export interface AgpeyaReferences {
  readonly offices: Readonly<Record<string, { psalm50: string | null; psalms: string[]; gospels: string[] }>>;
}

let agpeyaRefs: AgpeyaReferences | null = null;

export function setAgpeyaReferences(data: AgpeyaReferences | null): void {
  agpeyaRefs = data;
}

/* ----- Full Agpeya hour content (from coptic.io, used with permission) ----- */

export type AgpeyaBlock =
  | { readonly type: 'text'; readonly text: string }
  | { readonly type: 'rubric'; readonly text: string }
  | { readonly type: 'verses'; readonly reference: string | null; readonly verses: readonly { n: number; text: string }[] };

export interface HourSection {
  readonly id: string;
  readonly kind: string;
  readonly title: string;
  readonly blocks: readonly AgpeyaBlock[];
}

export interface AgpeyaHour {
  readonly key: OfficeKey;
  readonly name: string;
  readonly englishName: string;
  readonly time: string;
  readonly sections: readonly HourSection[];
}

const hourRegistry: Partial<Record<OfficeKey, AgpeyaHour>> = {};

/** Register the full content for an hour (called at startup from bundled data). */
export function setAgpeyaHour(key: OfficeKey, hour: AgpeyaHour): void {
  hourRegistry[key] = hour;
}

/** The full Agpeya hour, or null if its content isn't loaded. */
export function getAgpeyaHour(key: OfficeKey): AgpeyaHour | null {
  return hourRegistry[key] ?? null;
}

/** The standard order of an Agpeya hour (PRD §5.3). */
export const SECTION_ORDER: readonly { kind: SectionKind; label: string; count?: number }[] = [
  { kind: 'introduction', label: 'Introduction' },
  { kind: 'thanksgiving', label: 'The Thanksgiving' },
  { kind: 'psalm50', label: 'Psalm 50' },
  { kind: 'psalms', label: 'The Psalms' },
  { kind: 'gospel', label: 'The Gospel' },
  { kind: 'litanies', label: 'The Litanies' },
  { kind: 'lordHaveMercy', label: 'Lord, have mercy', count: 41 },
  { kind: 'conclusion', label: 'The Conclusion' },
];

/** All seven offices for a day (the hours do not change by date). */
export function officesForDay(): readonly Office[] {
  return OFFICES;
}

export function officeByKey(key: OfficeKey): Office | undefined {
  return OFFICES.find((o) => o.key === key);
}

/** The office of the current period for a local hour 0–23. */
export function officeForHour(hour: number): Office {
  let current: Office = OFFICES[0]!;
  for (const o of OFFICES) if (hour >= o.hour) current = o;
  return current;
}

/** The next office to begin after the current period (wraps to Matins). */
export function nextOffice(hour: number): Office {
  const cur = officeForHour(hour);
  const i = OFFICES.findIndex((o) => o.key === cur.key);
  return OFFICES[(i + 1) % OFFICES.length]!;
}

function refsFor(office: OfficeKey, kind: SectionKind): ScriptureSpan[] | undefined {
  const r = agpeyaRefs?.offices[office];
  if (!r) return undefined;
  let labels: (string | null)[] = [];
  if (kind === 'psalm50') labels = [r.psalm50];
  else if (kind === 'psalms') labels = r.psalms;
  else if (kind === 'gospel') labels = r.gospels;
  else return undefined;
  const refs = labels.filter((l): l is string => !!l).map(parseScriptureRef).filter((x): x is ScriptureSpan => !!x);
  return refs.length > 0 ? refs : undefined;
}

/**
 * The reader (ordered sections) for an office. Scripture sections carry their
 * references (rendered from the bundled KJV); prose sections stay placeholder
 * until a permitted Agpeya is supplied.
 */
export function officeReader(key: OfficeKey): { office: Office; sections: ReaderSection[] } {
  const office = officeByKey(key) ?? OFFICES[0]!;
  const sections: ReaderSection[] = SECTION_ORDER.map((s) => {
    const refs = refsFor(key, s.kind);
    return {
      kind: s.kind,
      label: s.label,
      body: TEXT_TBD,
      ...(s.count !== undefined ? { count: s.count } : {}),
      ...(refs ? { refs } : {}),
    };
  });
  return { office, sections };
}
