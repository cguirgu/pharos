/**
 * The passage a question was asked about — a gold-washed block carrying the
 * reference and the exact words that were selected.
 *
 * Reuses the treatment already established for a saved mark in
 * app/highlights/[id].tsx (gold wash, 3px gold left edge, caps reference above
 * body text), so a cited question and a saved highlight read as the same
 * gesture in two places.
 *
 * Feature-level UI, so it sits at src/ui/ beside SelectableProse and the sheets,
 * not in src/ui/components/ — that folder is the design system proper.
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Caps } from './components';
import { font, type Palette } from './theme';
import { useStyles, useThemeColors } from './useStyles';
import { copy } from './copy';
import type { Citation } from '../domain/citation';

export function CitationCard({
  citation,
  onOpen,
  style,
}: {
  citation: Citation;
  /** When given, the card becomes tappable and offers to open the source. */
  onOpen?: () => void;
  style?: object;
}) {
  const styles = useStyles(makeStyles);
  const t = useThemeColors();
  const Wrap: React.ElementType = onOpen ? Pressable : View;

  return (
    <Wrap onPress={onOpen} style={[styles.card, style]}>
      <Caps size={8.5} ls={1.6} color={t.gold}>
        {citation.referenceLabel}
      </Caps>
      <Text style={styles.snapshot}>{citation.textSnapshot}</Text>
      {onOpen ? (
        <Caps size={8} ls={1.4} color={t.ink3} style={{ marginTop: 8 }}>
          {copy.questions.openSource}
        </Caps>
      ) : null}
    </Wrap>
  );
}

const makeStyles = (t: Palette) =>
  StyleSheet.create({
    card: {
      backgroundColor: t.highlightWash.gold,
      borderLeftWidth: 3,
      borderLeftColor: t.highlightInk.gold,
      paddingVertical: 14,
      paddingHorizontal: 14,
      marginTop: 18,
    },
    snapshot: { fontFamily: font.body, fontSize: 16, color: t.parch, lineHeight: 25, marginTop: 6 },
  });
