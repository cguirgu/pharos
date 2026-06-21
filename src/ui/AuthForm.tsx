/**
 * Email/password form shared by the sign-up and sign-in routes. Drives the auth
 * store's password methods and maps the resulting error code to a copy string.
 * Backend-agnostic: the store routes to Supabase Auth or the local store.
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Page } from './Page';
import { Field, Btn, Caps, Fleuron } from './components';
import { font, type Palette } from './theme';
import { useStyles, useThemeColors } from './useStyles';
import { useResponsive } from './useResponsive';
import { copy } from './copy';
import { useAuth } from '../state/auth';

export function AuthForm({ mode }: { mode: 'signup' | 'signin' }) {
  const router = useRouter();
  const styles = useStyles(makeStyles);
  const t = useThemeColors();
  const r = useResponsive();
  const insets = useSafeAreaInsets();

  const signUpWithPassword = useAuth((s) => s.signUpWithPassword);
  const signInWithPassword = useAuth((s) => s.signInWithPassword);
  const verifyEmailOtp = useAuth((s) => s.verifyEmailOtp);
  const resendConfirmation = useAuth((s) => s.resendConfirmation);
  const clearPendingConfirm = useAuth((s) => s.clearPendingConfirm);
  const pendingConfirmEmail = useAuth((s) => s.pendingConfirmEmail);
  const signingIn = useAuth((s) => s.signingIn);
  const authError = useAuth((s) => s.authError);
  const clearError = useAuth((s) => s.clearError);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [resent, setResent] = useState(false);

  // Drop any error carried over from another auth screen on mount.
  useEffect(() => clearError(), [clearError, mode]);

  const isSignup = mode === 'signup';
  const title = isSignup ? copy.auth.signUpTitle : copy.auth.signInTitle;
  const sub = isSignup ? copy.auth.signUpSub : copy.auth.signInSub;
  const submitLabel = isSignup ? copy.auth.createAccount : copy.auth.signIn;
  const switchLabel = isSignup ? copy.auth.toSignIn : copy.auth.toSignUp;
  const switchTo = isSignup ? '/auth/signin' : '/auth/signup';

  const errorText = authError ? copy.auth.errors[authError] ?? copy.auth.signInError : null;

  const onSubmit = async () => {
    const ok = isSignup
      ? await signUpWithPassword(email, password)
      : await signInWithPassword(email, password);
    if (ok) router.replace('/'); // routing gate → onboarding or tabs
  };

  const onConfirm = async () => {
    const ok = await verifyEmailOtp(pendingConfirmEmail ?? email, code);
    if (ok) router.replace('/'); // confirmed → onboarding
  };

  const onResend = async () => {
    setResent(false);
    clearError();
    const ok = await resendConfirmation(pendingConfirmEmail ?? email);
    if (ok) setResent(true);
  };

  const onChangeEmail = () => {
    setCode('');
    setResent(false);
    clearPendingConfirm();
  };

  // After sign-up the project requires email confirmation: collect the code here
  // instead of dead-ending. Verifying it establishes the session → onboarding.
  if (isSignup && pendingConfirmEmail) {
    return (
      <Page>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
            <View style={styles.header}>
              <Text style={[styles.title, { fontSize: r.scale(34) }]}>{copy.auth.confirmTitle}</Text>
              <Fleuron />
              <Text style={[styles.sub, { maxWidth: r.textWidth }]}>{copy.auth.confirmSub(pendingConfirmEmail)}</Text>
            </View>

            <Field
              label={copy.auth.code}
              value={code}
              onChangeText={(v) => setCode(v.replace(/[^0-9]/g, ''))}
              keyboardType="number-pad"
              autoComplete="one-time-code"
              textContentType="oneTimeCode"
              maxLength={6}
              returnKeyType="go"
              onSubmitEditing={onConfirm}
            />

            {errorText ? (
              <View style={styles.error}>
                <Caps size={9} ls={1.2} color={t.rubricHi}>{errorText}</Caps>
              </View>
            ) : resent ? (
              <View style={styles.error}>
                <Caps size={9} ls={1.2} color={t.ink2}>{copy.auth.resent}</Caps>
              </View>
            ) : null}

            <View style={styles.submit}>
              <Btn kind="solid" onPress={onConfirm} disabled={signingIn || code.length < 6}>
                {signingIn ? copy.auth.signingIn : copy.auth.confirmCta}
              </Btn>
            </View>

            <Pressable style={styles.switch} onPress={onResend} hitSlop={10}>
              <Caps size={9.5} ls={1.4} color={t.ink2}>{copy.auth.resend}</Caps>
            </Pressable>
            <Pressable style={styles.switchSmall} onPress={onChangeEmail} hitSlop={10}>
              <Caps size={9.5} ls={1.4} color={t.ink3}>{copy.auth.changeEmail}</Caps>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>

        <Pressable style={[styles.back, { top: insets.top + 4 }]} onPress={() => router.replace('/auth/welcome')} hitSlop={12}>
          <Caps size={9.5} ls={1.6} color={t.ink3}>← {copy.auth.wordmark}</Caps>
        </Pressable>
      </Page>
    );
  }

  return (
    <Page>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
          <View style={styles.header}>
            <Text style={[styles.title, { fontSize: r.scale(34) }]}>{title}</Text>
            <Fleuron />
            <Text style={[styles.sub, { maxWidth: r.textWidth }]}>{sub}</Text>
          </View>

          <Field
            label={copy.auth.email}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            keyboardType="email-address"
            textContentType="emailAddress"
            returnKeyType="next"
          />
          <Field
            label={copy.auth.password}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
            autoComplete={isSignup ? 'new-password' : 'password'}
            textContentType={isSignup ? 'newPassword' : 'password'}
            returnKeyType="go"
            onSubmitEditing={onSubmit}
          />

          {errorText ? (
            <View style={styles.error}>
              <Caps size={9} ls={1.2} color={t.rubricHi}>{errorText}</Caps>
            </View>
          ) : null}

          <View style={styles.submit}>
            <Btn kind="solid" onPress={onSubmit} disabled={signingIn}>
              {signingIn ? copy.auth.signingIn : submitLabel}
            </Btn>
          </View>

          <Pressable style={styles.switch} onPress={() => router.replace(switchTo)} hitSlop={10}>
            <Caps size={9.5} ls={1.4} color={t.ink2}>{switchLabel}</Caps>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>

      <Pressable style={[styles.back, { top: insets.top + 4 }]} onPress={() => router.replace('/auth/welcome')} hitSlop={12}>
        <Caps size={9.5} ls={1.6} color={t.ink3}>← {copy.auth.wordmark}</Caps>
      </Pressable>
    </Page>
  );
}

const makeStyles = (t: Palette) => StyleSheet.create({
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 8, paddingVertical: 48 },
  header: { alignItems: 'center', marginBottom: 8 },
  title: { fontFamily: font.display, color: t.parch, textAlign: 'center' },
  sub: { fontFamily: font.displayItalic, fontSize: 16, color: t.goldHi, textAlign: 'center', lineHeight: 24, marginTop: 4 },
  error: { alignItems: 'center', paddingTop: 18 },
  submit: { marginTop: 28 },
  switch: { alignItems: 'center', paddingVertical: 22 },
  switchSmall: { alignItems: 'center', paddingBottom: 8 },
  back: { position: 'absolute', left: 12 },
});
