/**
 * Bible book picker — browse the whole canon (Old & New Testament), then a
 * chapter, then the reader. Reachable from the Word tab; free reading, separate
 * from any reading plan.
 */
import React from 'react';
import { Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Page } from '../../src/ui/Page';
import { SheetBar, Rubric, Caps } from '../../src/ui/components';
import { font, type Palette } from '../../src/ui/theme';
import { useStyles, useThemeColors } from '../../src/ui/useStyles';
import { copy } from '../../src/ui/copy';
import { booksByTestament, type BookMeta } from '../../src/domain/content/bible';

export default function BookPicker() {
  const router = useRouter();
  const styles = useStyles(makeStyles);
  const t = useThemeColors();
  const ot = booksByTestament('ot');
  const nt = booksByTestament('nt');

  const Row = (b: BookMeta) => (
    <Pressable key={b.id} style={styles.row} onPress={() => router.push(`/word/${b.id}`)}>
      <Text style={styles.name}>{b.name}</Text>
      <Caps size={9} ls={1.2} color={t.ink3}>
        {b.chapters} {b.chapters === 1 ? 'chapter' : 'chapters'}
      </Caps>
    </Pressable>
  );

  return (
    <Page>
      <SheetBar left="Word" title={copy.word.bible} onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <Rubric num="Ⲁ">{copy.word.oldTestament}</Rubric>
        {ot.map(Row)}
        <Rubric num="Ⲃ">{copy.word.newTestament}</Rubric>
        {nt.map(Row)}
      </ScrollView>
    </Page>
  );
}

const makeStyles = (t: Palette) => StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: t.ruleDim,
    gap: 12,
  },
  name: { fontFamily: font.display, fontSize: 21, color: t.parch, flexShrink: 1 },
});
