/**
 * Scripture reader — renders verified text from the provider, or a clear
 * "to be supplied" state until an approved source is added. "Mark the day kept"
 * advances the reading plan.
 */
import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Page } from '../../../src/ui/Page';
import { SheetBar, Caps, Btn, Fleuron } from '../../../src/ui/components';
import { K, font, highlightWash } from '../../../src/ui/theme';
import { copy } from '../../../src/ui/copy';
import { useClock } from '../../../src/state/clock';
import { useReading } from '../../../src/state/reading';
import { useHighlights } from '../../../src/state/highlights';
import { BOOKS, refLabel, type BookId } from '../../../src/domain/content/bible';
import { getScriptureProvider } from '../../../src/state/content';

export default function Reader() {
  const router = useRouter();
  const { book, chapter } = useLocalSearchParams<{ book: string; chapter: string }>();
  const today = useClock((s) => s.today);
  const markRead = useReading((s) => s.markRead);
  const progress = useReading((s) => s.progress)(today);
  const forVerse = useHighlights((s) => s.forVerse);
  const saveHighlight = useHighlights((s) => s.save);

  const bookId = (book as BookId) in BOOKS ? (book as BookId) : 'matthew';
  const ch = Number(chapter) || 1;
  const ref = { book: bookId, chapter: ch };
  const content = getScriptureProvider().getChapter(ref);
  const meta = BOOKS[bookId];

  const markKept = async () => {
    if (progress) await markRead(progress.dayNumber, today);
    router.back();
  };

  // INTERIM highlight affordance: tapping a verse marks the WHOLE verse; an
  // already-marked verse opens its note editor. The snapshot is the durable
  // record, so this works before the native gesture exists.
  // TODO(gesture): replace whole-verse tap with RN text selection
  // (onSelectionChange → free char range) → saveHighlight() for sub-verse spans.
  const onVerse = async (n: number, text: string) => {
    const marked = forVerse(bookId, ch, n)[0];
    if (marked) {
      router.push(`/highlights/${marked.id}`);
      return;
    }
    const newId = await saveHighlight({
      anchor: { source: 'scripture', book: bookId, chapter: ch, startVerse: n, startOffset: 0, endVerse: n, endOffset: text.length },
      textSnapshot: text,
    });
    if (newId) router.push(`/highlights/${newId}`);
  };

  return (
    <Page>
      <SheetBar left="Word" title={refLabel(ref)} onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {meta.coptic ? <Text style={styles.coptic}>{meta.coptic}</Text> : null}
        <Text style={styles.heading}>{meta.name} {ch}</Text>
        <Fleuron />

        {content ? (
          content.verses.map((v) => {
            const marked = forVerse(bookId, ch, v.n)[0];
            return (
              <Pressable
                key={v.n}
                onPress={() => onVerse(v.n, v.text)}
                style={marked ? [styles.verseRow, { backgroundColor: highlightWash[marked.color ?? 'gold'] }] : styles.verseRow}
              >
                <Text style={styles.verse}>
                  <Text style={styles.vnum}>{v.n} </Text>
                  {v.text}
                </Text>
              </Pressable>
            );
          })
        ) : (
          <View style={styles.tbd}>
            <Caps size={9} ls={1.6} color={K.ink3} style={{ textAlign: 'center', lineHeight: 18 }}>
              {copy.word.tbd}
            </Caps>
          </View>
        )}

        <View style={{ height: 24 }} />
        <Btn kind="solid" onPress={markKept}>
          {copy.word.markKept}
        </Btn>
      </ScrollView>
    </Page>
  );
}

const styles = StyleSheet.create({
  coptic: { fontFamily: font.coptic, fontSize: 16, color: K.gold, marginTop: 6 },
  heading: { fontFamily: font.display, fontSize: 32, color: K.parch, marginTop: 4 },
  verseRow: { marginBottom: 4, paddingHorizontal: 4, paddingVertical: 2 },
  verse: { fontFamily: font.body, fontSize: 18, color: K.parch, lineHeight: 28 },
  vnum: { fontFamily: font.caps, fontSize: 11, color: K.rubricHi },
  tbd: { borderWidth: 1, borderColor: K.ruleDim, padding: 26, alignItems: 'center' },
});
