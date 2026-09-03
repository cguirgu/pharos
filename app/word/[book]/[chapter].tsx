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
import { SelectableProse } from '../../../src/ui/SelectableProse';
import { font, type Palette } from '../../../src/ui/theme';
import { useStyles, useThemeColors } from '../../../src/ui/useStyles';
import { copy } from '../../../src/ui/copy';
import { useClock } from '../../../src/state/clock';
import { useReading } from '../../../src/state/reading';
import { useHighlights } from '../../../src/state/highlights';
import { useTextScale } from '../../../src/state/textScale';
import { BOOKS, refLabel, type BookId } from '../../../src/domain/content/bible';
import { scriptureAnchorFromSelection, type RawSelection } from '../../../src/domain/highlights';
import { citationFromSelection, encodeCitation } from '../../../src/domain/citation';
import { getScriptureProvider } from '../../../src/state/content';

export default function Reader() {
  const router = useRouter();
  const styles = useStyles(makeStyles);
  const t = useThemeColors();
  const { book, chapter, plan } = useLocalSearchParams<{ book: string; chapter: string; plan?: string }>();
  const today = useClock((s) => s.today);
  const markRead = useReading((s) => s.markRead);
  // Plan context (optional): only present when arriving from a plan's Continue.
  const planId = typeof plan === 'string' ? plan : undefined;
  const progress = useReading((s) => s.progress)(planId ?? '', today);
  const forVerse = useHighlights((s) => s.forVerse);
  const saveHighlight = useHighlights((s) => s.save);
  const scale = useTextScale((s) => s.scale);

  const bookId = (book as BookId) in BOOKS ? (book as BookId) : 'matthew';
  const ch = Number(chapter) || 1;
  const ref = { book: bookId, chapter: ch };
  const content = getScriptureProvider().getChapter(ref);
  const meta = BOOKS[bookId];

  const markKept = async () => {
    if (planId && progress) await markRead(planId, progress.dayNumber, today);
    router.back();
  };

  // Drag-select within a verse → save just that span. Tapping the verse NUMBER
  // is the whole-verse fallback (and opens an already-marked verse's editor).
  const onSaveVerseSelection = async (n: number, text: string, sel: RawSelection) => {
    const built = scriptureAnchorFromSelection({ book: bookId, chapter: ch, verse: n }, sel, text);
    if (!built) return;
    const newId = await saveHighlight({ anchor: built.anchor, textSnapshot: built.snapshot });
    if (newId) router.push(`/highlights/${newId}`);
  };

  // The same selection, asked of the community instead of kept. Note the object
  // form of push: a snapshot can contain & or #, which a hand-built query string
  // would corrupt.
  const onAskVerseSelection = (n: number, text: string, sel: RawSelection) => {
    const citation = citationFromSelection({ source: 'scripture', book: bookId, chapter: ch, verse: n }, sel, text);
    if (!citation) return;
    router.push({ pathname: '/questions/compose', params: { cite: encodeCitation(citation) } });
  };

  const onVerseNumber = async (n: number, text: string) => {
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
              <View key={v.n} style={styles.verseRow}>
                <Pressable onPress={() => onVerseNumber(v.n, v.text)} hitSlop={8}>
                  <Text style={styles.vnum}>{v.n}</Text>
                </Pressable>
                <View style={{ flex: 1 }}>
                  <SelectableProse
                    text={v.text}
                    textStyle={[styles.verse, { fontSize: VERSE_FONT * scale, lineHeight: VERSE_LINE * scale }]}
                    washColor={marked ? t.highlightWash[marked.color ?? 'gold'] : undefined}
                    onSaveSelection={(sel) => onSaveVerseSelection(v.n, v.text, sel)}
                    onAskSelection={(sel) => onAskVerseSelection(v.n, v.text, sel)}
                  />
                </View>
              </View>
            );
          })
        ) : (
          <View style={styles.tbd}>
            <Caps size={9} ls={1.6} color={t.ink3} style={{ textAlign: 'center', lineHeight: 18 }}>
              {copy.word.tbd}
            </Caps>
          </View>
        )}

        {planId ? (
          <>
            <View style={{ height: 24 }} />
            <Btn kind="solid" onPress={markKept}>
              {copy.word.markKept}
            </Btn>
          </>
        ) : null}
      </ScrollView>
    </Page>
  );
}

// Base verse metrics; the user's text-size setting scales these.
const VERSE_FONT = 18;
const VERSE_LINE = 28;

const makeStyles = (t: Palette) => StyleSheet.create({
  coptic: { fontFamily: font.coptic, fontSize: 16, color: t.gold, marginTop: 6 },
  heading: { fontFamily: font.display, fontSize: 32, color: t.parch, marginTop: 4 },
  verseRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 6, paddingHorizontal: 4 },
  verse: { fontFamily: font.body, fontSize: VERSE_FONT, color: t.parch, lineHeight: VERSE_LINE, padding: 0 },
  vnum: { fontFamily: font.caps, fontSize: 11, color: t.rubricHi, paddingTop: 6, width: 22 },
  tbd: { borderWidth: 1, borderColor: t.ruleDim, padding: 26, alignItems: 'center' },
});
