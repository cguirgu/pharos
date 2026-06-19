/**
 * Chapter picker — a grid of every chapter in the chosen book; tapping a cell
 * opens the reader.
 */
import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Page } from '../../../src/ui/Page';
import { SheetBar, Caps } from '../../../src/ui/components';
import { font, type Palette } from '../../../src/ui/theme';
import { useStyles, useThemeColors } from '../../../src/ui/useStyles';
import { BOOKS, type BookId } from '../../../src/domain/content/bible';

export default function ChapterPicker() {
  const router = useRouter();
  const styles = useStyles(makeStyles);
  const t = useThemeColors();
  const { book } = useLocalSearchParams<{ book: string }>();
  const id = (book as BookId) in BOOKS ? (book as BookId) : null;
  const meta = id ? BOOKS[id] : null;

  return (
    <Page>
      <SheetBar left="Bible" title={meta?.name ?? '—'} onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {meta?.coptic ? <Text style={styles.coptic}>{meta.coptic}</Text> : null}
        <Text style={styles.heading}>{meta?.name ?? '—'}</Text>
        {meta ? (
          <View style={styles.grid}>
            {Array.from({ length: meta.chapters }, (_, i) => i + 1).map((c) => (
              <Pressable key={c} style={styles.cell} onPress={() => router.push(`/word/${id}/${c}`)}>
                <Text style={styles.cellNum}>{c}</Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <Caps size={9} ls={1.6} color={t.ink3} style={{ marginTop: 24, textAlign: 'center' }}>
            Unknown book.
          </Caps>
        )}
      </ScrollView>
    </Page>
  );
}

const CELL = '14.2857%'; // 7 per row

const makeStyles = (t: Palette) => StyleSheet.create({
  coptic: { fontFamily: font.coptic, fontSize: 16, color: t.gold, marginTop: 6 },
  heading: { fontFamily: font.display, fontSize: 32, color: t.parch, marginTop: 4, marginBottom: 14 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    width: CELL,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: t.ruleDim,
    marginLeft: -1,
    marginTop: -1,
  },
  cellNum: { fontFamily: font.body, fontSize: 16, color: t.parch },
});
