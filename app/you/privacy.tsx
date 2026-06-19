/**
 * Privacy policy — renders the canonical doc from src/content/legal.ts so the
 * in-app text and the hosted HTML (web/legal) never drift apart.
 */
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Page } from '../../src/ui/Page';
import { SheetBar, Rubric } from '../../src/ui/components';
import { font, type Palette } from '../../src/ui/theme';
import { useStyles } from '../../src/ui/useStyles';
import { PRIVACY, LEGAL_META } from '../../src/content/legal';

export default function Privacy() {
  const styles = useStyles(makeStyles);
  const router = useRouter();
  return (
    <Page>
      <SheetBar left="You" title={PRIVACY.title} onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>
        <Text style={styles.updated}>Effective {LEGAL_META.effectiveDate}</Text>
        {PRIVACY.intro.map((p, i) => (
          <Text key={`intro-${i}`} style={styles.body}>{p}</Text>
        ))}
        {PRIVACY.sections.map((s) => (
          <View key={s.heading}>
            <Rubric>{s.heading}</Rubric>
            {s.body?.map((p, i) => (
              <Text key={`b-${i}`} style={styles.body}>{p}</Text>
            ))}
            {s.bullets?.map((b, i) => (
              <View key={`l-${i}`} style={styles.bulletRow}>
                <Text style={styles.dash}>—</Text>
                <Text style={styles.bullet}>{b}</Text>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </Page>
  );
}

const makeStyles = (t: Palette) => StyleSheet.create({
  updated: { fontFamily: font.body, fontSize: 12, color: t.ink3, marginTop: 4, marginBottom: 4 },
  body: { fontFamily: font.body, fontSize: 14, color: t.ink2, lineHeight: 22, marginTop: 10 },
  bulletRow: { flexDirection: 'row', gap: 10, marginTop: 8 },
  dash: { fontFamily: font.body, fontSize: 14, color: t.ink3 },
  bullet: { flex: 1, fontFamily: font.body, fontSize: 14, color: t.ink2, lineHeight: 22 },
});
