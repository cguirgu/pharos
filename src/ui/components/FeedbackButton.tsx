/**
 * FeedbackButton — the persistent "leave feedback" affordance pinned to the
 * top-right of every main tab screen (and previewed during onboarding). Codex
 * language: a hairline gold box, sharp corners, the lozenge motif + a caps label.
 *
 * It is presentational only (no routing): the tabs layout wires `onPress` to open
 * the feedback modal, and onboarding renders it with `preview` for a static mock.
 */
import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { type Palette } from '../theme';
import { useStyles, useThemeColors } from '../useStyles';
import { Caps } from './primitives';
import { copy } from '../copy';

/** The rendered width the header should reserve so text never sits beneath it. */
export const FEEDBACK_BUTTON_WIDTH = 104;

export function FeedbackButton({
  onPress,
  preview = false,
}: {
  onPress?: () => void;
  /** Static, non-interactive render for the onboarding preview. */
  preview?: boolean;
}) {
  const styles = useStyles(makeStyles);
  const t = useThemeColors();
  return (
    <Pressable
      onPress={preview ? undefined : onPress}
      disabled={preview}
      accessibilityRole="button"
      accessibilityLabel={copy.feedback.button}
      hitSlop={8}
      style={({ pressed }) => [
        styles.btn,
        { backgroundColor: pressed && !preview ? t.selWashHi : t.selWashLo },
      ]}
    >
      {/* the lozenge — the codex's one icon motif */}
      <View style={styles.lozenge} />
      <Caps size={8.5} ls={1.6} color={t.goldHi}>
        {copy.feedback.button}
      </Caps>
    </Pressable>
  );
}

const makeStyles = (t: Palette) => StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: t.rule,
  },
  lozenge: {
    width: 7,
    height: 7,
    backgroundColor: t.gold,
    transform: [{ rotate: '45deg' }],
  },
});
