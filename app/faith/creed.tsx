/**
 * The Creed seal — the Faith course's reward screen. Nine clauses in order,
 * each sealed until its unit is finished. An unsealed clause shows its plain
 * description and the council that fixed it; a sealed one shows only which unit
 * opens it, so the shape of what is still to come stays visible.
 */
import React, { useMemo } from 'react';
import { View, Text, ScrollView, Pressable, Linking, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Page } from '../../src/ui/Page';
import { SheetBar, Folio, Caps, Numeral, Copt, Fleuron } from '../../src/ui/components';
import { font, type Palette } from '../../src/ui/theme';
import { useStyles, useThemeColors } from '../../src/ui/useStyles';
import { copy } from '../../src/ui/copy';
import { useFaith } from '../../src/state/faith';
import { isLessonPassed } from '../../src/domain/faith/course';
import { creedSeal, CREED_CLAUSES, CREED_SOURCES } from '../../src/domain/faith/creed';
import { citations } from '../../src/domain/faith/sources';

export default function CreedScreen() {
  const styles = useStyles(makeStyles);
  const t = useThemeColors();
  const router = useRouter();
  const lessons = useFaith((s) => s.lessons);

  const { clauses, unsealed } = useMemo(() => {
    const passed = new Set<string>();
    for (const [id, r] of Object.entries(lessons)) if (isLessonPassed(r)) passed.add(id);
    const list = creedSeal(passed);
    return { clauses: list, unsealed: list.filter((c) => c.unsealed).length };
  }, [lessons]);

  return (
    <Page>
      <SheetBar left={copy.tabs.faith} title={copy.faith.creedTitle} onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <Folio left={copy.faith.creedHead} glyph="☩" />

        <View style={styles.counter}>
          <Numeral size={44} color={t.goldHi}>{String(unsealed)}</Numeral>
          <Caps size={9} ls={1.6} color={t.ink3}>
            {copy.faith.creedProgress(unsealed, CREED_CLAUSES.length)}
          </Caps>
        </View>
        <Text style={styles.intro}>{copy.faith.creedIntro}</Text>

        <Fleuron />

        <View style={{ marginTop: 10 }}>
          {clauses.map((c) => (
            <View key={c.id} style={[styles.clause, !c.unsealed && { opacity: 0.42 }]}>
              <View style={styles.clauseHead}>
                <Copt size={15} color={c.unsealed ? t.gold : t.ink3}>{c.unsealed ? '☩' : '⳾'}</Copt>
                <Caps size={8} ls={1.8} color={c.unsealed ? t.gold : t.ink3}>
                  {c.unsealed ? c.council : copy.faith.creedSealed}
                </Caps>
              </View>
              <Text style={[styles.title, { color: c.unsealed ? t.parch : t.ink2 }]}>{c.title}</Text>
              {c.unsealed ? (
                <Text style={styles.gist}>{c.gist}</Text>
              ) : (
                <Text style={styles.gist}>{copy.faith.creedUnsealBy(c.unitTitle)}</Text>
              )}
            </View>
          ))}
        </View>

        <Text style={styles.note}>{copy.faith.creedNote}</Text>

        <View style={styles.sources}>
          <Caps size={8} ls={2} color={t.ink3}>{copy.faith.sourcesLabel}</Caps>
          {citations(CREED_SOURCES).map((s) => (
            <Pressable key={s.id} onPress={() => void Linking.openURL(s.url)} hitSlop={4}>
              <Text style={styles.sourceTitle}>{s.title}</Text>
              <Text style={styles.sourcePublisher}>{s.publisher}</Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </Page>
  );
}

const makeStyles = (t: Palette) => StyleSheet.create({
  counter: { alignItems: 'center', marginTop: 12, gap: 2 },
  intro: { fontFamily: font.bodyItalic, fontSize: 14, lineHeight: 21, color: t.ink2, textAlign: 'center', marginTop: 12 },
  clause: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: t.ruleDim, gap: 4 },
  clauseHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontFamily: font.display, fontSize: 22, lineHeight: 28 },
  gist: { fontFamily: font.body, fontSize: 15, lineHeight: 23, color: t.ink2 },
  note: { fontFamily: font.bodyItalic, fontSize: 12, lineHeight: 19, color: t.ink3, marginTop: 22, textAlign: 'center' },
  sources: { marginTop: 22, borderTopWidth: 1, borderTopColor: t.ruleDim, paddingTop: 12, gap: 6 },
  sourceTitle: { fontFamily: font.body, fontSize: 13, lineHeight: 19, color: t.gold, textDecorationLine: 'underline' },
  sourcePublisher: { fontFamily: font.bodyItalic, fontSize: 12, color: t.ink3, marginBottom: 4 },
});
