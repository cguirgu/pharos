/**
 * Practice detail & history (from PracticeHistory3): streak, % kept, the 4-week
 * due-day grid, and edit / pause / remove actions.
 */
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Page } from '../../src/ui/Page';
import { SheetBar, Rubric, Caps, Numeral, Tag, Btn } from '../../src/ui/components';
import { font, type Palette } from '../../src/ui/theme';
import { useStyles, useThemeColors } from '../../src/ui/useStyles';
import { practiceSubtitle } from '../../src/ui/format';
import { useClock } from '../../src/state/clock';
import { useRule } from '../../src/state/rule';
import { practiceStreak, practiceStats, historyGrid, cadenceSummary } from '../../src/domain/rule';

const WD = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const GLYPH = { kept: '✓', part: '╱', missed: '×', open: '◆' } as const;

export default function PracticeDetail() {
  const styles = useStyles(makeStyles);
  const t = useThemeColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const today = useClock((s) => s.today);
  const { practices, logsFor, savePractice, removePractice } = useRule();
  const practice = practices.find((p) => p.id === id);

  if (!practice) {
    return (
      <Page>
        <SheetBar title="Practice" onBack={() => router.back()} />
      </Page>
    );
  }

  const logs = logsFor(practice.id);
  const streak = practiceStreak(practice, logs, { today });
  const stats = practiceStats(practice, logs, { today });
  const grid = historyGrid(practice, logs, today);
  const paused = practice.state === 'paused';

  return (
    <Page>
      <SheetBar
        title="Practice"
        onBack={() => router.back()}
        right={
          <Text onPress={() => router.push(`/practice/compose?id=${practice.id}` as never)} style={styles.edit}>
            Edit
          </Text>
        }
      />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <Text style={styles.name}>{practice.name}</Text>
        <Caps size={9} ls={1.6} color={t.ink2} style={{ marginTop: 4 }}>
          {practiceSubtitle(practice)}
        </Caps>
        {practice.intention ? <Text style={styles.intention}>{practice.intention}</Text> : null}

        {/* stats ledger */}
        <View style={styles.stats}>
          <Stat value={String(streak)} label="streak" />
          <Stat value={`${stats.keptPercent}%`} label="kept" />
          <Stat value={String(stats.dueDays)} label="due days" />
        </View>

        <Rubric>The last four weeks</Rubric>
        <View style={styles.weekHead}>
          {WD.map((d, i) => (
            <Caps key={i} size={8} ls={0} color={t.ink3} style={styles.cellLabel}>
              {d}
            </Caps>
          ))}
        </View>
        {grid.map((week, wi) => (
          <View key={wi} style={styles.weekRow}>
            {week.map((cell, ci) => (
              <View key={ci} style={styles.cell}>
                {cell.due ? (
                  <Text
                    style={[
                      styles.glyph,
                      {
                        color: cell.isToday
                          ? t.goldHi
                          : cell.status === 'kept'
                            ? t.gold
                            : cell.status === 'part'
                              ? t.ink2
                              : cell.status === 'missed'
                                ? t.ink3
                                : t.ink2,
                      },
                    ]}
                  >
                    {cell.isToday && cell.status === 'open' ? GLYPH.open : GLYPH[cell.status ?? 'open']}
                  </Text>
                ) : (
                  <View style={styles.blank} />
                )}
              </View>
            ))}
          </View>
        ))}

        <View style={styles.tags}>
          <Tag>{cadenceSummary(practice.cadence)}</Tag>
          {practice.reminder?.enabled ? <Tag>{practice.reminder.time}</Tag> : null}
        </View>

        <View style={{ height: 24 }} />
        <Btn kind="line" onPress={() => savePractice({ ...practice, state: paused ? 'active' : 'paused' })}>
          {paused ? 'Resume practice' : 'Pause practice'}
        </Btn>
        <View style={{ height: 10 }} />
        <Btn
          kind="rubric"
          onPress={async () => {
            await removePractice(practice.id);
            router.back();
          }}
        >
          Remove from the rule
        </Btn>
      </ScrollView>
    </Page>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  const styles = useStyles(makeStyles);
  const t = useThemeColors();
  return (
    <View style={styles.stat}>
      <Numeral size={40} color={t.goldHi}>
        {value}
      </Numeral>
      <Caps size={8.5} ls={1.4} color={t.ink3}>
        {label}
      </Caps>
    </View>
  );
}

const makeStyles = (t: Palette) => StyleSheet.create({
  edit: { fontFamily: font.caps, fontSize: 10, letterSpacing: 2, color: t.goldHi, textTransform: 'uppercase' },
  name: { fontFamily: font.display, fontSize: 34, color: t.parch, marginTop: 6 },
  intention: { fontFamily: font.bodyItalic, fontSize: 15, color: t.ink2, marginTop: 10, lineHeight: 21 },
  stats: { flexDirection: 'row', marginVertical: 22, borderTopWidth: 1, borderBottomWidth: 1, borderColor: t.ruleDim, paddingVertical: 14 },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  weekHead: { flexDirection: 'row', marginTop: 4 },
  weekRow: { flexDirection: 'row', marginVertical: 3 },
  cell: { flex: 1, alignItems: 'center', justifyContent: 'center', height: 26 },
  cellLabel: { flex: 1, textAlign: 'center' },
  glyph: { fontFamily: font.body, fontSize: 14 },
  blank: { width: 4, height: 4, backgroundColor: t.ruleDim },
  tags: { flexDirection: 'row', gap: 8, marginTop: 20 },
});
