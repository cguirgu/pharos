/**
 * Delete account — a deliberate, irreversible confirmation. The learner types
 * DELETE to confirm; on success every trace of the account is removed (locally,
 * and on the backend via the delete-account Edge Function) and they're returned
 * to the welcome screen.
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Page } from '../../src/ui/Page';
import { SheetBar, Caps, Btn, Field, Fleuron } from '../../src/ui/components';
import { font, type Palette } from '../../src/ui/theme';
import { useStyles, useThemeColors } from '../../src/ui/useStyles';
import { copy } from '../../src/ui/copy';
import { useAuth } from '../../src/state/auth';

export default function DeleteAccount() {
  const styles = useStyles(makeStyles);
  const t = useThemeColors();
  const router = useRouter();
  const deleteAccount = useAuth((s) => s.deleteAccount);
  const c = copy.you.deleteScreen;

  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const armed = confirm.trim().toUpperCase() === c.confirmWord;

  const onDelete = async () => {
    if (!armed || busy) return;
    setBusy(true);
    setError(false);
    try {
      await deleteAccount();
      router.replace('/auth/welcome');
    } catch {
      setError(true);
      setBusy(false);
    }
  };

  return (
    <Page>
      <SheetBar left={copy.you.head} title={c.title} onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.heading}>{c.heading}</Text>
        <Text style={styles.body}>{c.body}</Text>
        <Caps size={9} ls={1.4} color={t.ink3} style={{ marginTop: 14 }}>{c.hint}</Caps>
        <Fleuron />
        <Field
          label={c.confirmLabel}
          value={confirm}
          onChangeText={setConfirm}
          autoCapitalize="characters"
          autoCorrect={false}
          placeholder={c.confirmWord}
        />
        {error ? (
          <Caps size={9} ls={1.4} color={t.rubricHi} style={{ marginTop: 14, textAlign: 'center' }}>{c.error}</Caps>
        ) : null}
        <View style={{ height: 26 }} />
        <Btn kind="rubric" onPress={onDelete} disabled={!armed || busy}>
          {busy ? c.working : c.confirmCta}
        </Btn>
        <Btn kind="line" onPress={() => router.back()} disabled={busy} style={{ marginTop: 10 }}>
          {c.cancel}
        </Btn>
      </ScrollView>
    </Page>
  );
}

const makeStyles = (t: Palette) => StyleSheet.create({
  heading: { fontFamily: font.display, fontSize: 30, color: t.parch, marginTop: 12 },
  body: { fontFamily: font.body, fontSize: 16, color: t.ink2, lineHeight: 24, marginTop: 10 },
});
