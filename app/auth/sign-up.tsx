/**
 * Sign up — create a local account (email + password), then onboarding.
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Page } from '../../src/ui/Page';
import { SheetBar, Caps, Btn, Field } from '../../src/ui/components';
import { K, font } from '../../src/ui/theme';
import { copy } from '../../src/ui/copy';
import { useAuth } from '../../src/state/auth';

export default function SignUp() {
  const router = useRouter();
  const signUp = useAuth((s) => s.signUp);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await signUp(email, password);
      if (res.ok) router.replace('/onboarding');
      else setError(copy.auth.errors[res.error] ?? 'Something went wrong.');
    } catch (e) {
      setError(`Could not create the account. ${String(e)}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Page>
      <SheetBar left="Back" onBack={() => router.back()} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <Text style={styles.title}>{copy.auth.signUpTitle}</Text>
          <Text style={styles.sub}>{copy.auth.signUpSub}</Text>

          <Field
            label={copy.auth.email}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            placeholder="you@example.com"
          />
          <Field
            label={copy.auth.password}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••"
          />
          {error ? (
            <Caps size={9} ls={1} color={K.rubricHi} style={{ marginTop: 16 }}>
              {error}
            </Caps>
          ) : null}

          <View style={{ height: 28 }} />
          <Btn kind="solid" onPress={submit} disabled={busy}>
            {copy.auth.createAccount}
          </Btn>
          <Btn kind="line" onPress={() => router.replace('/auth/sign-in')} style={{ marginTop: 10 }}>
            {copy.auth.signIn}
          </Btn>
        </ScrollView>
      </KeyboardAvoidingView>
    </Page>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: font.display, fontSize: 34, color: K.parch, marginTop: 8 },
  sub: { fontFamily: font.bodyItalic, fontSize: 15, color: K.ink2, marginTop: 6, lineHeight: 21 },
});
