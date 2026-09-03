/**
 * Faith milestones — the same timeline the Coptic course uses, over the theology
 * milestones. Reached by tapping the milestones stat on the Faith tab.
 */
import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Page } from '../../src/ui/Page';
import { SheetBar, Folio, Caps, Numeral, Copt, Fleuron } from '../../src/ui/components';
import { font, type Palette } from '../../src/ui/theme';
import { useStyles, useThemeColors } from '../../src/ui/useStyles';
import { copy } from '../../src/ui/copy';
import { useFaith } from '../../src/state/faith';
import { isLessonPassed } from '../../src/domain/faith/course';
import { evaluateFaithMilestones, nextFaithMilestone, FAITH_MILESTONE_COUNT } from '../../src/domain/faith/milestones';

export default function FaithMilestonesScreen() {
  const styles = useStyles(makeStyles);
  const t = useThemeColors();
  const router = useRouter();
  const lessons = useFaith((s) => s.lessons);

  const { all, next, earnedCount } = useMemo(() => {
    const passed = new Set<string>();
    for (const [id, r] of Object.entries(lessons)) if (isLessonPassed(r)) passed.add(id);
    const list = evaluateFaithMilestones(passed);
    return { all: list, next: nextFaithMilestone(passed), earnedCount: list.filter((m) => m.earned).length };
  }, [lessons]);

  return (
    <Page>
      <SheetBar left={copy.tabs.faith} title={copy.faith.milestonesTitle} onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <Folio left={copy.faith.milestonesHead} glyph="☩" />

        <View style={styles.counter}>
          <Numeral size={44} color={t.goldHi}>{`${earnedCount}`}</Numeral>
          <Caps size={9} ls={1.6} color={t.ink3}>{copy.faith.milestonesProgress(earnedCount, FAITH_MILESTONE_COUNT)}</Caps>
        </View>

        <Fleuron />

        <View style={{ marginTop: 14 }}>
          {all.map((m, i) => {
            const isNext = next?.key === m.key;
            const accent = m.earned ? t.gold : isNext ? t.goldHi : t.ink3;
            const first = i === 0;
            const last = i === all.length - 1;
            return (
              <View key={m.key} style={[styles.row, !m.earned && !isNext && { opacity: 0.45 }]}>
                {/* the rail: connecting line + node */}
                <View style={styles.rail}>
                  {/* line above / below the node (trimmed at the ends) */}
                  <View style={[styles.line, { top: 0, height: '50%', backgroundColor: first ? 'transparent' : t.ruleDim }]} />
                  <View style={[styles.line, { bottom: 0, height: '50%', backgroundColor: last ? 'transparent' : t.ruleDim }]} />
                  <View
                    style={[
                      styles.node,
                      {
                        borderColor: accent,
                        backgroundColor: m.earned ? t.selWashHi : t.bg,
                      },
                    ]}
                  >
                    {/* counter-rotate the glyph so it sits upright in the diamond */}
                    <View style={{ transform: [{ rotate: '-45deg' }] }}>
                      <Copt size={16} color={accent}>{m.glyph ?? '☩'}</Copt>
                    </View>
                  </View>
                </View>

                {/* the content */}
                <View style={styles.content}>
                  <Text style={[styles.name, { color: m.earned || isNext ? t.parch : t.ink2 }]}>{m.name}</Text>
                  <Text style={styles.desc}>{m.description}</Text>
                  <Caps size={8} ls={1.6} color={m.earned ? t.gold : isNext ? t.goldHi : t.ink3} style={{ marginTop: 5 }}>
                    {m.earned ? copy.faith.earnedLabel : isNext ? copy.faith.nextToUnlock : copy.faith.lockedLabel}
                  </Caps>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </Page>
  );
}

const RAIL = 44;
const NODE = 30;

const makeStyles = (t: Palette) => StyleSheet.create({
  counter: { alignItems: 'center', marginTop: 12, gap: 2 },
  row: { flexDirection: 'row', minHeight: 78 },
  rail: { width: RAIL, alignItems: 'center', justifyContent: 'center' },
  line: { position: 'absolute', width: 1 },
  node: {
    width: NODE,
    height: NODE,
    borderWidth: 1.5,
    transform: [{ rotate: '45deg' }],
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { flex: 1, paddingVertical: 14, paddingLeft: 6, justifyContent: 'center' },
  name: { fontFamily: font.display, fontSize: 22 },
  desc: { fontFamily: font.bodyItalic, fontSize: 14, color: t.ink2, marginTop: 2 },
});
