/**
 * Journal list — the commonplace book (PRD §5.4): today's prompt + entries.
 */
import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Page } from '../../src/ui/Page';
import { SheetBar, Rubric, Caps, Numeral, Btn } from '../../src/ui/components';
import { K, font } from '../../src/ui/theme';
import { copy } from '../../src/ui/copy';
import { useJournal } from '../../src/state/journal';

const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function JournalList() {
  const router = useRouter();
  const entries = useJournal((s) => s.entries);

  return (
    <Page>
      <SheetBar left="Word" title={copy.journal.title} onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        <View style={styles.prompt}>
          <Caps size={9} ls={1.6} color={K.gold}>Today’s prompt</Caps>
          <Text style={styles.promptText}>{copy.journal.prompt}</Text>
          <Btn kind="line" style={{ marginTop: 12 }} onPress={() => router.push('/journal/new')}>
            {copy.journal.take}
          </Btn>
        </View>

        <Rubric num="Ⲓ">Entries</Rubric>
        {entries.length === 0 ? (
          <Caps size={10} ls={1.4} color={K.ink3} style={{ marginTop: 8 }}>{copy.journal.empty}</Caps>
        ) : (
          entries.map((e) => (
            <Pressable key={e.id} style={styles.row} onPress={() => router.push(`/journal/${e.id}`)}>
              <View style={styles.date}>
                <Numeral size={26} color={K.ink2}>{String(e.date.day)}</Numeral>
                <Caps size={7.5} ls={1} color={K.ink3}>{MON[e.date.month - 1]}</Caps>
              </View>
              <View style={styles.entry}>
                <Text style={styles.entryTitle} numberOfLines={1}>{e.title || 'Untitled'}</Text>
                <Text style={styles.entryExcerpt} numberOfLines={1}>{e.body}</Text>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </Page>
  );
}

const styles = StyleSheet.create({
  prompt: { borderWidth: 1, borderColor: K.rule, padding: 16, marginTop: 4 },
  promptText: { fontFamily: font.displayItalic, fontSize: 22, color: K.parch, marginTop: 8, lineHeight: 28 },
  row: { flexDirection: 'row', gap: 14, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: K.ruleDim },
  date: { width: 36, alignItems: 'center' },
  entry: { flex: 1, borderLeftWidth: 1, borderLeftColor: K.ruleDim, paddingLeft: 14 },
  entryTitle: { fontFamily: font.display, fontSize: 21, color: K.parch },
  entryExcerpt: { fontFamily: font.bodyItalic, fontSize: 15, color: K.ink2, marginTop: 2 },
});
