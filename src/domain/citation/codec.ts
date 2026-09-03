/**
 * Citation ⇄ route param. The "Ask others" tooltip hands a citation to the
 * Questions composer through expo-router, where every param is a string.
 *
 * `decodeCitation` MUST NEVER THROW: a malformed or truncated param has to
 * degrade to an uncited question, never to a crashed composer. It also tolerates
 * a double-encoded value, since a citation can arrive from a shared link that
 * has been through someone else's URL handling.
 *
 * Pure TypeScript — no react/react-native/expo imports, no `new Date()`.
 */
import { LIMITS, clampText } from '../limits';
import { isCitationAnchor, type Citation } from './types';

/** Citation → a single route-param string. */
export function encodeCitation(citation: Citation): string {
  return JSON.stringify(citation);
}

function parse(raw: string): unknown {
  try {
    return JSON.parse(raw);
  } catch {
    try {
      return JSON.parse(decodeURIComponent(raw));
    } catch {
      return null;
    }
  }
}

/** Route param → Citation, or null for anything unusable. Never throws. */
export function decodeCitation(raw: string | undefined | null): Citation | null {
  if (!raw) return null;
  const value = parse(raw);
  if (typeof value !== 'object' || value === null) return null;

  const { anchor, textSnapshot, referenceLabel } = value as Record<string, unknown>;
  if (!isCitationAnchor(anchor)) return null;
  if (typeof textSnapshot !== 'string' || typeof referenceLabel !== 'string') return null;

  return {
    anchor,
    textSnapshot: clampText(textSnapshot, LIMITS.citationSnapshot),
    referenceLabel,
  };
}
