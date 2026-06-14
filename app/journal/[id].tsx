/**
 * Journal editor — title + ruled writing area. `id === 'new'` starts a fresh
 * entry; otherwise loads an existing one. Persists across relaunch.
 */
import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Page } from '../../src/ui/Page';
import { SheetBar, Caps } from '../../src/ui/components';
import { K, font } from '../../src/ui/theme';
import { copy } from '../../src/ui/copy';
import { folioDate } from '../../src/ui/format';
import { useClock } from '../../src/state/clock';
import { useJournal } from '../../src/state/journal';

export default function JournalEditor() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const today = useClock((s) => s.today);
  const { get, save } = useJournal();
  const existing = id && id !== 'new' ? get(id) : undefined;

  const [title, setTitle] = useState(existing?.title ?? '');
  const [body, setBody] = useState(existing?.body ?? '');
  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0;

  const onSave = async () => {
    await save({ id: existing?.id, date: existing?.date ?? today, title, body });
    router.back();
  };

  return (
    <Page>
      <SheetBar
        left="Journal"
        title={folioDate(existing?.date ?? today)}
        onBack={() => router.back()}
        right={
          <Text onPress={onSave} style={styles.save}>
            {copy.journal.save}
          </Text>
        }
      />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder={copy.journal.titlePlaceholder}
            placeholderTextColor={K.ink3}
            style={styles.title}
          />
          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder={copy.journal.bodyPlaceholder}
            placeholderTextColor={K.ink3}
            multiline
            style={styles.body}
            selectionColor={K.gold}
          />
        </ScrollView>
        <View style={styles.footer}>
          <Caps size={8.5} ls={1.4} color={K.ink3}>{copy.journal.words(wordCount)}</Caps>
        </View>
      </KeyboardAvoidingView>
    </Page>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: font.display, fontSize: 30, color: K.parch, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: K.ruleDim },
  body: { fontFamily: font.body, fontSize: 18, color: K.parch, lineHeight: 28, paddingTop: 16, minHeight: 240, textAlignVertical: 'top' },
  footer: { paddingVertical: 10, borderTopWidth: 1, borderTopColor: K.ruleDim, alignItems: 'flex-end' },
  save: { fontFamily: font.caps, fontSize: 10, letterSpacing: 2, color: K.goldHi, textTransform: 'uppercase' },
});
