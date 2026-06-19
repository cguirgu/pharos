/**
 * Coptic pronunciation clips — owner-supplied, VERIFIED recordings keyed by
 * letter id / word id (the same ids used in src/domain/learn/{alphabet,words}.ts).
 *
 * ⚠️ Audio is liturgical content: it must be a verified recording (a deacon /
 * cantor), never synthesized. Until clips are supplied this map is empty, and
 * the lesson teaches pronunciation via transliteration + the phonetic key; the
 * play button stays in a quiet "audio soon" state. To enable a clip, drop the
 * file in `assets/audio/coptic/<key>.m4a` and add a static require below, e.g.:
 *
 *   alpha: () => require('../../assets/audio/coptic/alpha.m4a'),
 *   amen:  () => require('../../assets/audio/coptic/amen.m4a'),
 *
 * (Metro needs a static string literal in each require.)
 */
export const copticAudio: Record<string, () => number> = {
  // (no verified clips bundled yet)
};
