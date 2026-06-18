/**
 * The Ordo — a scrollable month of liturgical days, from the calendar engine
 * (PRD §5.3). Tap a day for its detail.
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Page } from '../../src/ui/Page';
import { SheetBar, Caps, Mark } from '../../src/ui/components';
import { font, type Palette } from '../../src/ui/theme';
import { useStyles, useThemeColors } from '../../src/ui/useStyles';
import { copy } from '../../src/ui/copy';
import { useClock } from '../../src/state/clock';
import { monthGrid } from '../../src/domain/ordo';
import { dateKey } from '../../src/domain/rule';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const WD = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function Ordo() {
  const router = useRouter();
  const styles = useStyles(makeStyles);
  const t = useThemeColors();
  const today = useClock((s) => s.today);
  const [ym, setYm] = useState({ year: today.year, month: today.month });
  const grid = monthGrid(ym.year, ym.month, today);

  const shift = (delta: number) => {
    let m = ym.month + delta;
    let y = ym.year;
    if (m < 1) { m = 12; y--; }
    if (m > 12) { m = 1; y++; }
    setYm({ year: y, month: m });
  };

  return (
    <Page>
      <SheetBar
        left="Hours"
        title={copy.ordo.head}
        onBack={() => router.back()}
        right={
          <View style={{ flexDirection: 'row', gap: 14 }}>
            <Text onPress={() => shift(-1)} style={styles.chev}>‹</Text>
            <Text onPress={() => shift(1)} style={styles.chev}>›</Text>
          </View>
        }
      />
      <Caps size={10} ls={2.4} color={t.rubricHi}>{copy.ordo.title}</Caps>
      <Text style={styles.month}>{MONTHS[ym.month - 1]} {ym.year}</Text>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        {grid.map((d) => {
          const isFast = d.fastLevel !== 'none';
          return (
            <Pressable
              key={dateKey(d.date)}
              style={[styles.row, d.isToday && { backgroundColor: t.selWashLo }]}
              onPress={() => router.push(`/ordo/${dateKey(d.date)}`)}
            >
              <Text style={[styles.day, d.isToday && { color: t.goldHi }]}>{d.date.day}</Text>
              <Caps size={8} ls={1} color={t.ink3} style={{ width: 30 }}>{WD[d.weekday]}</Caps>
              <View style={{ width: 22, alignItems: 'center' }}>
                {d.feast ? <Mark state="kept" size={12} /> : isFast ? <View style={styles.fastDot} /> : null}
              </View>
              <Text
                style={[styles.title, d.feast ? { fontFamily: font.display, color: t.parch } : { color: t.ink2 }]}
                numberOfLines={1}
              >
                {d.feast?.name ?? d.season?.name ?? `${d.coptic.day} ${d.coptic.monthName}`}
              </Text>
            </Pressable>
          );
        })}

        <View style={styles.legend}>
          <Legend mark={<Mark state="kept" size={12} />} label={copy.ordo.legend.feast} />
          <Legend mark={<View style={styles.fastDot} />} label={copy.ordo.legend.fast} />
        </View>
      </ScrollView>
    </Page>
  );
}

function Legend({ mark, label }: { mark: React.ReactNode; label: string }) {
  const styles = useStyles(makeStyles);
  const t = useThemeColors();
  return (
    <View style={styles.legendItem}>
      {mark}
      <Caps size={8.5} ls={1.6} color={t.ink3}>{label}</Caps>
    </View>
  );
}

const makeStyles = (t: Palette) => StyleSheet.create({
  chev: { fontFamily: font.display, fontSize: 24, color: t.goldHi, paddingHorizontal: 4 },
  month: { fontFamily: font.display, fontSize: 34, color: t.parch, marginTop: 4, marginBottom: 10 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 11, borderBottomWidth: 1, borderBottomColor: t.ruleDim },
  day: { fontFamily: font.display, fontSize: 20, color: t.ink2, width: 26, fontVariant: ['oldstyle-nums'] },
  title: { flex: 1, fontFamily: font.body, fontSize: 15 },
  fastDot: { width: 7, height: 7, borderRadius: 0, backgroundColor: t.rubric, transform: [{ rotate: '45deg' }] },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 24, marginTop: 20 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
