/**
 * Haptic feedback (app layer). A restrained, tactile "it is done" — fired when a
 * practice is kept, in keeping with the codex voice (the lamp is tended, not
 * stormed: a single confident pulse, never a buzz). No-ops on web and silently
 * swallows any platform error so feedback is never a failure path.
 */
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

/** A practice was completed/kept — a success notification pulse. */
export function keptFeedback(): void {
  if (Platform.OS === 'web') return;
  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
}

/** A lighter selection tick — checking off a sub-part, stepping, etc. */
export function tapFeedback(): void {
  if (Platform.OS === 'web') return;
  Haptics.selectionAsync().catch(() => {});
}
