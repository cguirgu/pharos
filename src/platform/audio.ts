/**
 * Pronunciation audio (app layer). Plays a verified Coptic clip by key from the
 * owner-supplied manifest, one-shot. Web/no-op safe; swallows errors so audio is
 * never a failure path (like haptics.ts). When no clip exists the caller shows a
 * quiet "audio soon" state and teaches pronunciation via the phonetic key.
 */
import { Platform } from 'react-native';
import { createAudioPlayer } from 'expo-audio';
import { copticAudio } from '../content/coptic-audio.gen';

/** Whether a verified clip is bundled for this letter/word id. */
export function hasAudio(key: string): boolean {
  return Object.prototype.hasOwnProperty.call(copticAudio, key);
}

/** Play the clip for `key`, if one is bundled. */
export function playCoptic(key: string): void {
  if (Platform.OS === 'web') return;
  const loader = copticAudio[key];
  if (!loader) return;
  try {
    const player = createAudioPlayer(loader());
    player.play();
    // Best-effort cleanup after the (short) clip is done.
    setTimeout(() => {
      try {
        player.remove();
      } catch {
        /* already released */
      }
    }, 6000);
  } catch {
    /* audio unavailable — no-op */
  }
}
