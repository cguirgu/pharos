/**
 * Ordo day detail — Coptic date, season, fast ruling, feast, commemoration.
 */
import React from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Page } from '../../src/ui/Page';
import { SheetBar, Rubric, Caps, Register, Fleuron } from '../../src/ui/components';
import { font, type Palette } from '../../src/ui/theme';
import { useStyles, useThemeColors } from '../../src/ui/useStyles';
import { copy } from '../../src/ui/copy';
import { CONTENT_LICENSED } from '../../src/content/flags';
import { folioDate } from '../../src/ui/format';
import { useClock } from '../../src/state/clock';
import { getDayInfo } from '../../src/domain/coptic';
import { parseDateKey, dateKey } from '../../src/domain/rule';
import { synaxariumDay, hasLife } from '../../src/domain/content/synaxarium';

export default function OrdoDay() {
  const router = useRouter();
  const styles = useStyles(makeStyles);
  const t = useThemeColors();
  const { date } = useLocalSearchParams<{ date: string }>();
  const today = useClock((s) => s.today);
  const civil = parseDateKey(date ?? '') ?? today;
  const info = getDayInfo(civil);
  const day = synaxariumDay(info.coptic);

  return (
    <Page>
      <SheetBar left="Ordo" title="The day" onBack={() => router.back()} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <Caps size={9} ls={2.2} color={t.gold}>{folioDate(civil)}</Caps>
        <Text style={styles.coptic}>{info.coptic.day} {info.coptic.monthName}</Text>
        <Caps size={8.5} ls={1.4} color={t.ink3}>Anno Martyrum {info.coptic.year}</Caps>
        <Fleuron />

        {info.feast ? (
          <Register onTop>
            <Caps size={8.5} ls={1.4} color={t.feast} style={{ width: 70 }}>Feast</Caps>
            <Text style={styles.detail}>{info.feast.name}</Text>
          </Register>
        ) : null}
        {info.season ? (
          <Register>
            <Caps size={8.5} ls={1.4} color={t.gold} style={{ width: 70 }}>Season</Caps>
            <Text style={styles.detail}>{info.season.name} · day {info.season.dayNumber} of {info.season.total}</Text>
          </Register>
        ) : null}
        <Register>
          <Caps size={8.5} ls={1.4} color={t.rubricHi} style={{ width: 70 }}>Fast</Caps>
          <Text style={styles.detail}>{info.fast.ruling}</Text>
        </Register>

        {info.fast.level !== 'none' ? (
          <View style={styles.foods}>
            <View style={{ flex: 1 }}>
              <Caps size={8.5} ls={1.4} color={t.feast}>Permitted</Caps>
              {info.fast.permitted.map((p) => <Text key={p} style={styles.food}>{p}</Text>)}
            </View>
            <View style={{ flex: 1 }}>
              <Caps size={8.5} ls={1.4} color={t.rubricHi}>Abstain</Caps>
              {info.fast.abstain.map((p) => <Text key={p} style={[styles.food, styles.strike]}>{p}</Text>)}
            </View>
          </View>
        ) : null}

        {/* The commemorations always show; the account only once licensed. */}
        {day && day.commemorations.length > 0 ? (
          <>
            <Rubric num="Ⲙ">{copy.hours.saint}</Rubric>
            {day.commemorations.map((c, i) => (
              <Text key={`${i}-${c}`} style={[styles.saintName, i > 0 && { marginTop: 8 }]}>
                {c}
              </Text>
            ))}
            {CONTENT_LICENSED && hasLife(day) ? (
              <Text style={styles.saintLife}>{day.life}</Text>
            ) : (
              <Pressable onPress={() => router.push(`/saint/${dateKey(civil)}`)} hitSlop={6} style={{ marginTop: 10 }}>
                <Caps size={8.5} ls={1.4} color={t.gold}>{copy.ordo.openCommemoration}</Caps>
              </Pressable>
            )}
          </>
        ) : null}
      </ScrollView>
    </Page>
  );
}

const makeStyles = (t: Palette) => StyleSheet.create({
  coptic: { fontFamily: font.display, fontSize: 38, color: t.parch, marginTop: 6 },
  detail: { flex: 1, fontFamily: font.display, fontSize: 18, color: t.parch },
  foods: { flexDirection: 'row', gap: 20, marginTop: 16 },
  food: { fontFamily: font.body, fontSize: 14, color: t.ink2, marginTop: 6 },
  strike: { textDecorationLine: 'line-through', color: t.ink3 },
  saintName: { fontFamily: font.display, fontSize: 22, color: t.parch },
  saintLife: { fontFamily: font.bodyItalic, fontSize: 15, color: t.ink2, lineHeight: 22, marginTop: 4 },
});
