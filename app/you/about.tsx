/**
 * About & attributions — credits every source used, explicitly, and names what
 * is still to be supplied from verified official sources.
 */
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Page } from '../../src/ui/Page';
import { SheetBar, Rubric, Caps, Fleuron, PharosSeal } from '../../src/ui/components';
import { font, type Palette } from '../../src/ui/theme';
import { useStyles, useThemeColors } from '../../src/ui/useStyles';
import { copy } from '../../src/ui/copy';

export default function About() {
  const styles = useStyles(makeStyles);
  const t = useThemeColors();
  const router = useRouter();
  return (
    <Page>
      <SheetBar left="You" title={copy.you.about} onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={{ alignItems: 'center', paddingVertical: 16 }}>
          <PharosSeal size={64} />
          <Fleuron />
        </View>
        <Text style={styles.body}>{copy.you.aboutBody}</Text>

        <Rubric>{copy.you.attributionsTitle}</Rubric>
        {copy.you.attributions.map((a) => (
          <View key={a.title} style={styles.attr}>
            <Caps size={9} ls={1.6} color={t.gold}>
              {a.title}
            </Caps>
            <Text style={styles.attrBody}>{a.body}</Text>
          </View>
        ))}

        <Rubric>{copy.you.awaiting}</Rubric>
        {copy.you.awaitingItems.map((s) => (
          <View key={s} style={styles.awaitRow}>
            <Text style={styles.dash}>—</Text>
            <Text style={styles.attrBody}>{s}</Text>
          </View>
        ))}
      </ScrollView>
    </Page>
  );
}

const makeStyles = (t: Palette) => StyleSheet.create({
  body: { fontFamily: font.bodyItalic, fontSize: 16, color: t.ink2, lineHeight: 24 },
  attr: { marginTop: 16, gap: 4 },
  attrBody: { fontFamily: font.body, fontSize: 14, color: t.ink2, lineHeight: 21 },
  awaitRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  dash: { fontFamily: font.body, fontSize: 14, color: t.ink3 },
});
