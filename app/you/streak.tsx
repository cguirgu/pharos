/**
 * Streak detail — the flame numeral + a 4-week grid of complete days (PRD §5.6).
 */
import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Page } from '../../src/ui/Page';
import { SheetBar, Rubric, Caps, Numeral } from '../../src/ui/components';
import { font, type Palette } from '../../src/ui/theme';
import { useStyles, useThemeColors } from '../../src/ui/useStyles';
import { copy } from '../../src/ui/copy';
import { useRule } from '../../src/state/rule';
import { useOffices } from '../../src/state/offices';
import { useClock } from '../../src/state/clock';
import { youStats, flameGrid } from '../../src/domain/stats';
import type { PracticeLog } from '../../src/domain/rule';

const WD = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function StreakDetail() {
  const styles = useStyles(makeStyles);
  const t = useThemeColors();
  const router = useRouter();
  const today = useClock((s) => s.today);
  const practices = useRule((s) => s.practices);
  const logs = useRule((s) => s.logs);
  const restDays = useRule((s) => s.restDays);
  const officeTotal = useOffices((s) => s.total);

  const logsByPractice = useMemo(() => {
    const out: Record<string, PracticeLog[]> = {};
    for (const l of logs) (out[l.practiceId] ??= []).push(l);
    return out;
  }, [logs]);

  const ctx = { practices, logsByPractice, restDays, officeCompletions: officeTotal, today };
  const stats = youStats(ctx);
  const grid = flameGrid(ctx, 4);

  return (
    <Page>
      <SheetBar left="You" title={copy.you.streakTitle} onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        <View style={styles.center}>
          <Numeral size={108} color={t.goldHi}>{String(stats.streak)}</Numeral>
          <Caps size={10} ls={3} color={t.gold}>{copy.you.streakUnit}</Caps>
          <Text style={styles.body}>{copy.you.streakBody}</Text>
        </View>

        <Rubric num="Ⲏ">The last four weeks</Rubric>
        <View style={styles.weekHead}>
          {WD.map((d, i) => (
            <Caps key={i} size={8} ls={0} color={t.ink3} style={styles.cellLabel}>{d}</Caps>
          ))}
        </View>
        {grid.map((week, wi) => (
          <View key={wi} style={styles.weekRow}>
            {week.map((cell, ci) => (
              <View
                key={ci}
                style={[
                  styles.cell,
                  cell.complete && { backgroundColor: t.selWashHi, borderColor: t.rule },
                  cell.isToday && { borderColor: t.gold },
                ]}
              >
                {cell.complete ? <Text style={styles.check}>✓</Text> : null}
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </Page>
  );
}

const makeStyles = (t: Palette) => StyleSheet.create({
  center: { alignItems: 'center', paddingVertical: 24 },
  body: { fontFamily: font.bodyItalic, fontSize: 17, color: t.ink2, textAlign: 'center', marginTop: 14, maxWidth: 300 },
  weekHead: { flexDirection: 'row', marginTop: 6 },
  cellLabel: { flex: 1, textAlign: 'center' },
  weekRow: { flexDirection: 'row', marginVertical: 3 },
  cell: { flex: 1, height: 34, marginHorizontal: 2, borderWidth: 1, borderColor: t.ruleDim, alignItems: 'center', justifyContent: 'center' },
  check: { fontFamily: font.body, fontSize: 14, color: t.gold },
});
