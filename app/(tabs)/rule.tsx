/**
 * Rule — the rule of life (from RuleOverview3). Practices grouped by category
 * with rubricated headers; add a practice; lighten the rule.
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Page } from '../../src/ui/Page';
import { Folio, Rubric, Caps, Btn } from '../../src/ui/components';
import { LightenSheet } from '../../src/ui/LightenSheet';
import { font, type Palette } from '../../src/ui/theme';
import { useStyles, useThemeColors } from '../../src/ui/useStyles';
import { copy } from '../../src/ui/copy';
import { practiceSubtitle } from '../../src/ui/format';
import { useRule } from '../../src/state/rule';
import type { Category, Practice } from '../../src/domain/rule';

const GROUPS: { key: Category; label: string; glyph: string }[] = [
  { key: 'prayer', label: copy.rule.groups.prayer, glyph: 'Ⲡ' },
  { key: 'word', label: copy.rule.groups.word, glyph: 'Ⲱ' },
  { key: 'fast', label: copy.rule.groups.fast, glyph: 'Ⲛ' },
  { key: 'devotion', label: copy.rule.groups.devotion, glyph: 'Ⲇ' },
];

export default function RuleScreen() {
  const styles = useStyles(makeStyles);
  const t = useThemeColors();
  const router = useRouter();
  const { practices } = useRule();
  const [lighten, setLighten] = useState(false);
  const active = practices.filter((p) => p.state !== 'archived');

  return (
    <Page>
      <Folio left={copy.rule.head} right={`${active.length} practices`} glyph="ⲣ" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        <Rubric>{copy.rule.head}</Rubric>
        <Text style={styles.title}>{copy.rule.title}</Text>
        <Text style={styles.subtitle}>{copy.rule.subtitle}</Text>

        {GROUPS.map((g) => {
          const items = active.filter((p) => p.category === g.key);
          if (items.length === 0) return null;
          return (
            <View key={g.key}>
              <Rubric num={g.glyph}>{g.label}</Rubric>
              {items.map((p) => (
                <PracticeRow key={p.id} practice={p} onPress={() => router.push(`/practice/${p.id}` as never)} />
              ))}
            </View>
          );
        })}

        <View style={{ height: 26 }} />
        <Btn kind="solid" onPress={() => router.push('/practice/compose' as never)}>
          {copy.rule.add}
        </Btn>
        <Pressable onPress={() => setLighten(true)} style={styles.lighten}>
          <Caps color={t.ink3} size={10} ls={1.6}>
            {copy.rule.lighten}
          </Caps>
        </Pressable>
      </ScrollView>

      <LightenSheet visible={lighten} onClose={() => setLighten(false)} />
    </Page>
  );
}

function PracticeRow({ practice, onPress }: { practice: Practice; onPress: () => void }) {
  const styles = useStyles(makeStyles);
  const t = useThemeColors();
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={{ flex: 1 }}>
        <Text style={styles.rowName}>{practice.name}</Text>
        <Caps size={8.5} ls={1.4} color={t.ink2}>
          {practiceSubtitle(practice)}
        </Caps>
      </View>
      <Caps size={16} ls={0} color={t.ink3}>
        ›
      </Caps>
    </Pressable>
  );
}

const makeStyles = (t: Palette) => StyleSheet.create({
  title: { fontFamily: font.display, fontSize: 36, color: t.parch, marginTop: 6 },
  subtitle: { fontFamily: font.bodyItalic, fontSize: 15, color: t.ink2, marginTop: 6, lineHeight: 21 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: t.ruleDim },
  rowName: { fontFamily: font.display, fontSize: 20, color: t.parch },
  lighten: { alignItems: 'center', paddingVertical: 18 },
});
