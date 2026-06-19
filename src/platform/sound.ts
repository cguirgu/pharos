/**
 * UI sound effects (app layer) — the Learn game's correct/wrong cues. Generic
 * synthesized tones (see scripts/gen-sfx.mjs), NOT liturgical content. Players
 * are created lazily and reused; web/no-op safe and error-swallowing.
 */
import { Platform } from 'react-native';
import { createAudioPlayer, type AudioPlayer } from 'expo-audio';

type SfxName = 'correct' | 'wrong' | 'complete' | 'crown';

const SOURCES: Record<SfxName, () => number> = {
  correct: () => require('../../assets/audio/ui/correct.wav'),
  wrong: () => require('../../assets/audio/ui/wrong.wav'),
  complete: () => require('../../assets/audio/ui/levelComplete.wav'),
  crown: () => require('../../assets/audio/ui/crown.wav'),
};

const players: Partial<Record<SfxName, AudioPlayer>> = {};

function play(name: SfxName): void {
  if (Platform.OS === 'web') return;
  try {
    let p = players[name];
    if (!p) {
      p = createAudioPlayer(SOURCES[name]());
      p.volume = 0.85;
      players[name] = p;
    }
    p.seekTo(0);
    p.play();
  } catch {
    /* audio unavailable — no-op */
  }
}

export const playCorrectSound = () => play('correct');
export const playWrongSound = () => play('wrong');
export const playCompleteSound = () => play('complete');
export const playCrownSound = () => play('crown');
