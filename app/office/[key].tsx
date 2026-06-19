/**
 * Office reader — the full Agpeya hour (from coptic.io, used with permission).
 * Sections can be expanded/minimised, and a side drawer jumps to any section.
 * "Mark this hour kept" records the office prayed.
 */
import React, { useMemo, useRef, useState } from 'react';
import { View, Text, ScrollView, Pressable, Modal, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Page } from '../../src/ui/Page';
import { SheetBar, Caps, Btn, Fleuron } from '../../src/ui/components';
import { font, type Palette } from '../../src/ui/theme';
import { useStyles, useThemeColors } from '../../src/ui/useStyles';
import { copy } from '../../src/ui/copy';
import { useClock } from '../../src/state/clock';
import { useOffices } from '../../src/state/offices';
import { keptFeedback } from '../../src/platform/haptics';
import { getAgpeyaHour, officeByKey, type OfficeKey, type AgpeyaBlock } from '../../src/domain/content/agpeya';

export default function OfficeReader() {
  const router = useRouter();
  const styles = useStyles(makeStyles);
  const t = useThemeColors();
  const { key } = useLocalSearchParams<{ key: string }>();
  const officeKey = (key as OfficeKey) ?? 'matins';
  const today = useClock((s) => s.today);
  const toggle = useOffices((s) => s.toggle);

  const hour = getAgpeyaHour(officeKey);
  const office = officeByKey(officeKey);
  const sections = hour?.sections ?? [];

  const [expanded, setExpanded] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(sections.map((s) => [s.id, true])),
  );
  const [drawer, setDrawer] = useState(false);
  const scrollRef = useRef<ScrollView>(null);
  const yPos = useRef<Record<string, number>>({});

  const allOpen = useMemo(() => sections.every((s) => expanded[s.id]), [sections, expanded]);

  const setAll = (open: boolean) => setExpanded(Object.fromEntries(sections.map((s) => [s.id, open])));
  const jumpTo = (id: string) => {
    setDrawer(false);
    setExpanded((e) => ({ ...e, [id]: true }));
    setTimeout(() => scrollRef.current?.scrollTo({ y: Math.max(0, (yPos.current[id] ?? 0) - 8), animated: true }), 60);
  };

  const markKept = async () => {
    keptFeedback();
    await toggle(today, officeKey, true);
    router.back();
  };

  return (
    <Page>
      <SheetBar
        left="Hours"
        title={hour?.name ?? office?.name}
        onBack={() => router.back()}
        right={
          <Pressable onPress={() => setDrawer(true)} hitSlop={8}>
            <Caps size={9} ls={1.8} color={t.goldHi}>
              ☰ Sections
            </Caps>
          </Pressable>
        }
      />
      <ScrollView ref={scrollRef} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <Caps size={9} ls={2.2} color={t.gold}>
          {office?.commemoration}
        </Caps>
        <Text style={styles.coptic}>{office?.coptic}</Text>

        {sections.map((s) => (
          <View key={s.id} onLayout={(e) => (yPos.current[s.id] = e.nativeEvent.layout.y)}>
            <Pressable style={styles.secHead} onPress={() => setExpanded((ex) => ({ ...ex, [s.id]: !ex[s.id] }))}>
              <Caps size={10.5} ls={2.4} color={t.rubricHi}>
                {s.title}
              </Caps>
              <View style={styles.leader} />
              <Text style={styles.chevron}>{expanded[s.id] ? '▾' : '▸'}</Text>
            </Pressable>
            {expanded[s.id] ? <View style={{ paddingBottom: 6 }}>{s.blocks.map((b, i) => <Block key={i} block={b} />)}</View> : null}
          </View>
        ))}

        {sections.length === 0 ? (
          <Text style={styles.body}>{copy.hours.draftNote}</Text>
        ) : null}

        <Fleuron />
        <Btn kind="solid" onPress={markKept}>
          {copy.hours.markKept}
        </Btn>
      </ScrollView>

      {/* jump drawer */}
      <Modal visible={drawer} transparent animationType="fade" onRequestClose={() => setDrawer(false)}>
        <Pressable style={styles.scrim} onPress={() => setDrawer(false)} />
        <View style={styles.drawer}>
          <View style={styles.drawerHead}>
            <Caps size={10} ls={2.4} color={t.ink2}>
              Jump to
            </Caps>
            <Pressable onPress={() => setAll(!allOpen)} hitSlop={8}>
              <Caps size={9} ls={1.6} color={t.goldHi}>
                {allOpen ? 'Collapse all' : 'Expand all'}
              </Caps>
            </Pressable>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {sections.map((s) => (
              <Pressable key={s.id} style={styles.jumpRow} onPress={() => jumpTo(s.id)}>
                <Text style={styles.jumpText}>{s.title}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </Page>
  );
}

function Block({ block }: { block: AgpeyaBlock }) {
  const styles = useStyles(makeStyles);
  const t = useThemeColors();
  if (block.type === 'rubric') {
    return <Text style={styles.rubric}>{block.text}</Text>;
  }
  if (block.type === 'verses') {
    return (
      <View style={{ marginVertical: 6 }}>
        {block.reference ? (
          <Caps size={8.5} ls={1.4} color={t.gold} style={{ marginBottom: 4 }}>
            {block.reference}
          </Caps>
        ) : null}
        {block.verses.map((v) => (
          <Text key={v.n} style={styles.verse}>
            <Text style={styles.vnum}>{v.n} </Text>
            {v.text}
          </Text>
        ))}
      </View>
    );
  }
  return <Text style={styles.text}>{block.text}</Text>;
}

const makeStyles = (t: Palette) => StyleSheet.create({
  coptic: { fontFamily: font.coptic, fontSize: 22, color: t.gold, marginTop: 6, marginBottom: 6 },
  secHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 22, marginBottom: 8 },
  leader: { flex: 1, height: 1, backgroundColor: t.rule },
  chevron: { fontFamily: font.body, fontSize: 13, color: t.ink3 },
  text: { fontFamily: font.body, fontSize: 16, color: t.parch, lineHeight: 26, marginVertical: 6 },
  rubric: { fontFamily: font.bodyItalic, fontSize: 14, color: t.rubricHi, lineHeight: 22, marginVertical: 6 },
  verse: { fontFamily: font.body, fontSize: 16, color: t.parch, lineHeight: 25, marginBottom: 3 },
  vnum: { fontFamily: font.caps, fontSize: 10, color: t.rubricHi },
  body: { fontFamily: font.bodyItalic, fontSize: 16, color: t.ink2, lineHeight: 24, marginTop: 10 },
  scrim: { flex: 1, backgroundColor: 'rgba(0,0,0,0.55)' },
  drawer: { position: 'absolute', top: 0, bottom: 0, right: 0, width: '74%', backgroundColor: t.bg2, borderLeftWidth: 1, borderLeftColor: t.rule, paddingTop: 56, paddingHorizontal: 20 },
  drawerHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: t.rule, marginBottom: 6 },
  jumpRow: { paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: t.ruleDim },
  jumpText: { fontFamily: font.display, fontSize: 18, color: t.parch },
});
