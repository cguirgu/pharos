/**
 * Content initialisation (app layer): wires the bundled, verified data into the
 * domain.
 *  - Synaxarium (draft) → `setSynaxariumData`
 *  - KJV (public domain) → the active `ScriptureProvider`
 *
 * Loaded lazily once at startup. The bundled JSON lives under `content/` and is
 * only pulled in here (not eagerly across the app). NKJV, when licensed, layers
 * on as an async API.Bible provider with this KJV provider as the offline
 * fallback (see docs/CONTENT-SOURCES.md).
 */
import { makeScriptureProvider, placeholderProvider, type ScriptureProvider, type BookId } from '../domain/content/bible';
import { setSynaxariumData, type SynaxariumDataset } from '../domain/content/synaxarium';
import { setAgpeyaReferences, setAgpeyaHour, type AgpeyaReferences, type AgpeyaHour, type OfficeKey } from '../domain/content/agpeya';
import { kjvLoaders } from '../content/kjv.gen';

const agpeyaHourFiles: Record<OfficeKey, () => AgpeyaHour> = {
  matins: () => require('../../content/agpeya/hours/matins.json'),
  prime: () => require('../../content/agpeya/hours/prime.json'),
  terce: () => require('../../content/agpeya/hours/terce.json'),
  sext: () => require('../../content/agpeya/hours/sext.json'),
  none: () => require('../../content/agpeya/hours/none.json'),
  vespers: () => require('../../content/agpeya/hours/vespers.json'),
  compline: () => require('../../content/agpeya/hours/compline.json'),
};

let provider: ScriptureProvider = placeholderProvider;
let initialised = false;

/** The active scripture provider (KJV once initialised, placeholder before). */
export function getScriptureProvider(): ScriptureProvider {
  return provider;
}

/** Wire bundled content into the domain. Safe to call repeatedly. */
export function initContent(): void {
  if (initialised) return;
  initialised = true;

  // Synaxarium (per Coptic day).
  try {
    const synax = require('../../content/synaxarium/synaxarium.json') as SynaxariumDataset;
    setSynaxariumData(synax);
  } catch {
    // dataset not present — seeded fallback remains
  }

  // Agpeya per-hour scripture references (used when full content is absent).
  try {
    const refs = require('../../content/agpeya/references.json') as AgpeyaReferences;
    setAgpeyaReferences(refs);
  } catch {
    // references not present — office reader stays structure-only
  }

  // Full Agpeya hours (coptic.io, used with permission).
  for (const key of Object.keys(agpeyaHourFiles) as OfficeKey[]) {
    try {
      setAgpeyaHour(key, agpeyaHourFiles[key]());
    } catch {
      // hour content not present — falls back to references/placeholders
    }
  }

  // KJV scripture provider (lazy per-book parse).
  const cache = new Map<BookId, ReturnType<NonNullable<(typeof kjvLoaders)[BookId]>> | null>();
  provider = makeScriptureProvider((book) => {
    if (!cache.has(book)) {
      const loader = kjvLoaders[book];
      cache.set(book, loader ? loader() : null);
    }
    return cache.get(book) ?? null;
  });
}
