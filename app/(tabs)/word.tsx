/**
 * Word — the reading plan, the scripture reader, and the journal (PRD §5.4).
 * Scripture text is supplied later from a verified, approved source.
 */
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Page } from '../../src/ui/Page';
import { Folio, Rubric, Caps, Numeral, Btn } from '../../src/ui/components';
import { K, font } from '../../src/ui/theme';
import { copy } from '../../src/ui/copy';
import { liturgicalLabel } from '../../src/ui/format';
import { useClock } from '../../src/state/clock';
import { useReading } from '../../src/state/reading';
import { useJournal } from '../../src/state/journal';
import { getDayInfo } from '../../src/domain/coptic';
import { FOUR_GOSPELS_90 } from '../../src/domain/content/readingPlan';
import { readingsOn, readingLabel } from '../../src/domain/content';
import { BOOKS, type BookId } from '../../src/domain/content/bible';
import { fetchTodaysReadings } from '../../src/platform/katameros';

export default function WordScreen() {
  const router = useRouter();
  const today = useClock((s) => s.today);
  const progress = useReading((s) => s.progress)(today);
  const entryCount = useJournal((s) => s.entries.length);
  const info = getDayInfo(today);

  // Best-effort: fetch today's Katameros readings (references) when online.
  const [, setTick] = useState(0);
  useEffect(() => {
    void fetchTodaysReadings(today).then((ok) => ok && setTick((n) => n + 1));
  }, [today]);
  const readings = readingsOn(info.coptic);
  const bookId = (name: string): BookId | null => {
    const id = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    return (id in BOOKS ? (id as BookId) : null);
  };

  return (
    <Page>
      <Folio left={copy.word.head} right={liturgicalLabel(info)} glyph="Ⲅ" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        <Rubric>{copy.word.nowReading}</Rubric>
        <View style={styles.card}>
          <View style={styles.cardHead}>
            <View style={{ flex: 1 }}>
              <Text style={styles.planName}>{FOUR_GOSPELS_90.name}</Text>
              {progress ? (
                <Caps size={9} ls={1.4} color={K.ink3} style={{ marginTop: 4 }}>
                  {copy.word.dayOf(progress.dayNumber, progress.total)} · {progress.todayLabel}
                </Caps>
              ) : null}
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Numeral size={40} color={K.goldHi}>{String(progress?.percent ?? 0)}</Numeral>
              <Caps size={8} ls={1.4} color={K.ink3}>per cent</Caps>
            </View>
          </View>
          <View style={styles.bar}>
            <View style={[styles.barFill, { width: `${progress?.percent ?? 0}%` }]} />
          </View>
          <Btn
            kind="solid"
            style={{ marginTop: 16 }}
            onPress={() => {
              const ref = progress?.todayRef;
              if (ref) router.push(`/word/${ref.book}/${ref.chapter}`);
            }}
          >
            {copy.word.continue}
          </Btn>
        </View>

        {readings && readings.refs.length > 0 ? (
          <>
            <Rubric num="Ⲕ">The day’s readings</Rubric>
            {readings.refs.map((r, i) => {
              const id = bookId(String(r.book));
              return (
                <Pressable
                  key={i}
                  style={styles.readingRow}
                  disabled={!id}
                  onPress={() => id && router.push(`/word/${id}/${r.chapter}`)}
                >
                  <Text style={styles.readingLabel}>{readingLabel(r)}</Text>
                  {r.slot ? (
                    <Caps size={8} ls={1.2} color={K.ink3}>
                      {r.slot}
                    </Caps>
                  ) : null}
                </Pressable>
              );
            })}
          </>
        ) : null}

        <Rubric num="Ⲓ">{copy.word.journal}</Rubric>
        <Pressable style={styles.journalRow} onPress={() => router.push('/journal')}>
          <Text style={styles.journalText}>{copy.journal.title}</Text>
          <Caps size={9} ls={1.4} color={K.ink3}>{entryCount} {entryCount === 1 ? 'entry' : 'entries'}</Caps>
        </Pressable>
        <Btn kind="line" style={{ marginTop: 16 }} onPress={() => router.push('/journal')}>
          {copy.word.openJournal}
        </Btn>
      </ScrollView>
    </Page>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderColor: K.rule, padding: 18 },
  cardHead: { flexDirection: 'row', alignItems: 'flex-start', gap: 14 },
  planName: { fontFamily: font.display, fontSize: 30, color: K.parch },
  bar: { height: 2, backgroundColor: K.ruleDim, marginTop: 16 },
  barFill: { height: 2, backgroundColor: K.gold },
  journalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: K.ruleDim },
  journalText: { fontFamily: font.display, fontSize: 20, color: K.parch },
  readingRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: K.ruleDim, gap: 3 },
  readingLabel: { fontFamily: font.display, fontSize: 19, color: K.parch },
});
