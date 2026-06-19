/**
 * Highlight editor — the marked passage (read-only snapshot) + an optional note,
 * a colour picker, and remove. `save` re-persists; `remove` deletes. Mirrors the
 * journal editor.
 */
import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, KeyboardAvoidingView, Platform, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Page } from '../../src/ui/Page';
import { SheetBar, Caps, Btn } from '../../src/ui/components';
import { font, type Palette } from '../../src/ui/theme';
import { useStyles, useThemeColors } from '../../src/ui/useStyles';
import { copy } from '../../src/ui/copy';
import { useHighlights } from '../../src/state/highlights';
import { HIGHLIGHT_COLORS, type HighlightColor } from '../../src/domain/highlights';

export default function HighlightEditor() {
  const router = useRouter();
  const styles = useStyles(makeStyles);
  const t = useThemeColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { get, save, remove } = useHighlights();
  const existing = id ? get(id) : undefined;

  const [note, setNote] = useState(existing?.note ?? '');
  const [color, setColor] = useState<HighlightColor>(existing?.color ?? 'gold');

  if (!existing) {
    return (
      <Page>
        <SheetBar left="Saved" title={copy.highlights.title} onBack={() => router.back()} />
        <Caps size={10} ls={1.4} color={t.ink3} style={{ marginTop: 20 }}>{copy.highlights.noResults}</Caps>
      </Page>
    );
  }

  const onSave = async () => {
    await save({
      id: existing.id,
      anchor: existing.anchor,
      textSnapshot: existing.textSnapshot,
      referenceLabel: existing.referenceLabel,
      note: note.trim() || undefined,
      color,
      label: existing.label,
    });
    router.back();
  };

  const onRemove = async () => {
    await remove(existing.id);
    router.back();
  };

  return (
    <Page>
      <SheetBar
        left="Saved"
        title={existing.referenceLabel}
        onBack={() => router.back()}
        right={<Text onPress={onSave} style={styles.save}>{copy.highlights.save}</Text>}
      />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
          <View style={[styles.passage, { backgroundColor: t.highlightWash[color], borderLeftColor: t.highlightInk[color] }]}>
            <Text style={styles.snapshot}>{existing.textSnapshot}</Text>
          </View>

          <Caps size={9} ls={1.6} color={t.gold} style={{ marginTop: 22 }}>{copy.highlights.colour}</Caps>
          <View style={styles.swatches}>
            {HIGHLIGHT_COLORS.map((c) => (
              <Pressable
                key={c}
                onPress={() => setColor(c)}
                style={[styles.swatch, { backgroundColor: t.highlightInk[c] }, color === c && styles.swatchOn]}
              />
            ))}
          </View>

          <Caps size={9} ls={1.6} color={t.gold} style={{ marginTop: 22 }}>{copy.highlights.note}</Caps>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder={copy.highlights.notePlaceholder}
            placeholderTextColor={t.ink3}
            multiline
            style={styles.note}
            selectionColor={t.gold}
          />

          <Btn kind="line" style={{ marginTop: 28 }} onPress={onRemove}>{copy.highlights.remove}</Btn>
        </ScrollView>
      </KeyboardAvoidingView>
    </Page>
  );
}

const makeStyles = (t: Palette) => StyleSheet.create({
  passage: { borderLeftWidth: 3, paddingVertical: 14, paddingHorizontal: 16, marginTop: 6 },
  snapshot: { fontFamily: font.body, fontSize: 19, color: t.parch, lineHeight: 28 },
  swatches: { flexDirection: 'row', gap: 14, marginTop: 10 },
  swatch: { width: 30, height: 30, borderWidth: 1, borderColor: t.ruleDim },
  swatchOn: { borderColor: t.parch, borderWidth: 2 },
  note: { fontFamily: font.body, fontSize: 18, color: t.parch, lineHeight: 28, paddingTop: 10, minHeight: 120, textAlignVertical: 'top' },
  save: { fontFamily: font.caps, fontSize: 10, letterSpacing: 2, color: t.goldHi, textTransform: 'uppercase' },
});
