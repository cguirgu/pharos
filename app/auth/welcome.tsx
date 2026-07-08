/**
 * Welcome (from OnbWelcome2): the seal, the promise, and the way in.
 */
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Page } from '../../src/ui/Page';
import { PharosSeal, Caps, Btn, Fleuron } from '../../src/ui/components';
import { font, type Palette } from '../../src/ui/theme';
import { useStyles, useThemeColors } from '../../src/ui/useStyles';
import { useResponsive } from '../../src/ui/useResponsive';
import { copy } from '../../src/ui/copy';
import { useAuth } from '../../src/state/auth';

export default function Welcome() {
  const router = useRouter();
  const styles = useStyles(makeStyles);
  const t = useThemeColors();
  const r = useResponsive();
  const insets = useSafeAreaInsets();
  const wordmarkSize = r.scale(64);
  const signInWithApple = useAuth((s) => s.signInWithApple);
  const signingIn = useAuth((s) => s.signingIn);
  const authError = useAuth((s) => s.authError);
  const clearError = useAuth((s) => s.clearError);

  // Clear any error left over from a password screen when landing here.
  useEffect(() => clearError(), [clearError]);

  // Offer Sign in with Apple where available (iOS 13+ on a real/dev build).
  const [appleAvailable, setAppleAvailable] = useState(false);
  useEffect(() => {
    if (Platform.OS !== 'ios') return;
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { isAppleAuthAvailable } = require('../../src/platform/appleAuth') as typeof import('../../src/platform/appleAuth');
    void isAppleAuthAvailable().then(setAppleAvailable);
  }, []);

  const onApple = async () => {
    const ok = await signInWithApple();
    if (ok) router.replace('/'); // the routing gate sends to onboarding or the tabs
  };
  return (
    <Page>
      <View style={styles.top}>
        <Caps size={9.5} ls={2.6} color={t.ink3}>
          {copy.auth.era}
        </Caps>
      </View>
      <View style={styles.center}>
        <PharosSeal size={r.scale(96)} animated delay={120} />
        <Text style={[styles.wordmark, { fontSize: wordmarkSize, lineHeight: wordmarkSize + 4 }]}>{copy.auth.wordmark}</Text>
        <Text style={styles.coptic}>{copy.auth.coptic}</Text>
        <Fleuron />
        <Text style={[styles.promise, { fontSize: r.scale(22), maxWidth: r.textWidth }]}>{copy.auth.promise}</Text>
      </View>
      <View style={[styles.bottom, { paddingBottom: insets.bottom + 8 }]}>
        {appleAvailable ? (
          <Btn kind="solid" onPress={onApple} disabled={signingIn}>
            {signingIn ? copy.auth.signingIn : copy.auth.continueApple}
          </Btn>
        ) : null}
        <Btn kind={appleAvailable ? 'line' : 'solid'} onPress={() => router.push('/auth/signup')} disabled={signingIn}>
          {copy.auth.withEmail}
        </Btn>
        {authError ? (
          <View style={styles.error}>
            <Caps size={9} ls={1.4} color={t.rubricHi}>{copy.auth.signInError}</Caps>
          </View>
        ) : null}
        <Pressable style={styles.link} onPress={() => router.push('/auth/signin')} hitSlop={10}>
          <Caps size={9.5} ls={1.4} color={t.ink2}>{copy.auth.haveAccount}</Caps>
        </Pressable>
      </View>
    </Page>
  );
}

const makeStyles = (t: Palette) => StyleSheet.create({
  top: { alignItems: 'center', paddingTop: 8 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  wordmark: { fontFamily: font.display, color: t.parch, marginTop: 14 },
  coptic: { fontFamily: font.coptic, fontSize: 22, color: t.gold, marginTop: 2 },
  promise: {
    fontFamily: font.displayItalic,
    color: t.goldHi,
    textAlign: 'center',
    lineHeight: 32,
  },
  bottom: { gap: 10 },
  error: { alignItems: 'center', paddingTop: 6 },
  link: { alignItems: 'center', paddingVertical: 12 },
});
