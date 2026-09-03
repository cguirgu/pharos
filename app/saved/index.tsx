/**
 * Saved — everything the reader has marked in scripture + the Synaxarium, with
 * an optional note. A search box filters by snapshot text, note, and reference
 * (ranked, diacritic-insensitive — see @domain/highlights/search). Source chips
 * narrow to scripture or synaxarium. Tapping a mark opens its note editor.
 */
import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Page } from '../../src/ui/Page';
import { SheetBar, Rubric, Caps, Chip } from '../../src/ui/components';
import { font, type Palette } from '../../src/ui/theme';
import { useStyles, useThemeColors } from '../../src/ui/useStyles';
import { copy } from '../../src/ui/copy';
import { useHighlights } from '../../src/state/highlights';
import type { HighlightSource } from '../../src/domain/highlights';

type SourceFilter = 'all' | HighlightSource;

export default function SavedScreen() {
  const styles = useStyles(makeStyles);
  const t = useThemeColors();
  const router = useRouter();
  const search = useHighlights((s) => s.search);
  const total = useHighlights((s) => s.items.length);
  const [query, setQuery] = useState('');
  const [source, setSource] = useState<SourceFilter>('all');

  const opts = source === 'all' ? undefined : { source };
  const hits = search(query, opts);

  return (
    <Page>
      <SheetBar
        left={copy.tabs.you}
        title={copy.highlights.title}
        onBack={() => router.back()}
        right={
          <Caps size={8.5} ls={1.4} color={t.ink3}>
            {copy.highlights.count(total)}
          </Caps>
        }
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder={copy.highlights.searchPlaceholder}
          placeholderTextColor={t.ink3}
          style={styles.search}
          selectionColor={t.gold}
          autoCorrect={false}
        />

        <View style={styles.chips}>
          <Chip on={source === 'all'} onPress={() => setSource('all')}>{copy.highlights.sources.all}</Chip>
          <Chip on={source === 'scripture'} onPress={() => setSource('scripture')}>{copy.highlights.sources.scripture}</Chip>
          <Chip on={source === 'synaxarium'} onPress={() => setSource('synaxarium')}>{copy.highlights.sources.synaxarium}</Chip>
        </View>

        <Rubric num="Ⲓ">{copy.highlights.title}</Rubric>
        {hits.length === 0 ? (
          <Caps size={10} ls={1.4} color={t.ink3} style={{ marginTop: 8 }}>
            {total === 0 ? copy.highlights.empty : copy.highlights.noResults}
          </Caps>
        ) : (
          hits.map(({ highlight: h }) => (
            <Pressable key={h.id} style={styles.row} onPress={() => router.push(`/highlights/${h.id}`)}>
              <View style={[styles.swatch, { backgroundColor: t.highlightInk[h.color ?? 'gold'] }]} />
              <View style={styles.entry}>
                <Caps size={8.5} ls={1.4} color={t.ink3}>{h.referenceLabel}</Caps>
                <Text style={styles.snapshot} numberOfLines={2}>{h.textSnapshot}</Text>
                {h.note ? <Text style={styles.note} numberOfLines={1}>{h.note}</Text> : null}
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </Page>
  );
}

const makeStyles = (t: Palette) => StyleSheet.create({
  search: {
    fontFamily: font.body,
    fontSize: 17,
    color: t.parch,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: t.rule,
    marginTop: 6,
  },
  chips: { flexDirection: 'row', gap: 8, marginTop: 12 },
  row: { flexDirection: 'row', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: t.ruleDim },
  swatch: { width: 4, alignSelf: 'stretch' },
  entry: { flex: 1 },
  snapshot: { fontFamily: font.body, fontSize: 17, color: t.parch, lineHeight: 24, marginTop: 3 },
  note: { fontFamily: font.bodyItalic, fontSize: 15, color: t.ink2, marginTop: 3 },
});
