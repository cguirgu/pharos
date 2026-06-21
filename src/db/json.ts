/**
 * Defensive JSON parsing for persisted/remote data. A corrupt row (a partial
 * write, a schema drift, a hand-edited value) must degrade that one field —
 * never throw and crash startup. Mirrors the resilient pattern used across the
 * state stores. Pure: no I/O, unit-testable.
 */

/**
 * Parse `raw` as JSON, returning `fallback` (and logging) on any failure.
 * `null`/`undefined`/empty input yields the fallback without logging.
 */
export function safeJsonParse<T>(raw: string | null | undefined, fallback: T, label = 'value'): T {
  if (raw == null || raw === '') return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch (e) {
    console.warn(`[db] failed to parse stored ${label}; using fallback`, e);
    return fallback;
  }
}
