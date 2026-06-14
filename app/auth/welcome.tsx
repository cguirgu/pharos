/**
 * Welcome (from OnbWelcome2): the seal, the promise, and the way in.
 */
import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Page } from '../../src/ui/Page';
import { PharosSeal, Caps, Btn, Fleuron } from '../../src/ui/components';
import { K, font } from '../../src/ui/theme';
import { copy } from '../../src/ui/copy';

export default function Welcome() {
  const router = useRouter();
  return (
    <Page>
      <View style={styles.top}>
        <Caps size={9.5} ls={2.6} color={K.ink3}>
          {copy.auth.era}
        </Caps>
      </View>
      <View style={styles.center}>
        <PharosSeal size={104} />
        <Text style={styles.wordmark}>{copy.auth.wordmark}</Text>
        <Text style={styles.coptic}>{copy.auth.coptic}</Text>
        <Fleuron />
        <Text style={styles.promise}>{copy.auth.promise}</Text>
      </View>
      <View style={styles.bottom}>
        <Btn kind="solid" onPress={() => router.push('/auth/sign-up')}>
          {copy.auth.begin}
        </Btn>
        <Pressable onPress={() => router.push('/auth/sign-in')} style={styles.link} hitSlop={8}>
          <Caps size={10} ls={1.6} color={K.ink3}>
            {copy.auth.haveAccount}
          </Caps>
        </Pressable>
      </View>
    </Page>
  );
}

const styles = StyleSheet.create({
  top: { alignItems: 'center', paddingTop: 8 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 8 },
  wordmark: { fontFamily: font.display, fontSize: 72, color: K.parch, marginTop: 14, lineHeight: 76 },
  coptic: { fontFamily: font.coptic, fontSize: 22, color: K.gold, marginTop: 2 },
  promise: {
    fontFamily: font.displayItalic,
    fontSize: 24,
    color: K.goldHi,
    textAlign: 'center',
    lineHeight: 32,
    maxWidth: 320,
  },
  bottom: { gap: 6, paddingBottom: 8 },
  link: { alignItems: 'center', paddingVertical: 16 },
});
