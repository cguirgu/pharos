/**
 * Today — the day's account (from Today3). Folio + greeting + flame, fast
 * banner, kept tally, the rule due today (with lozenge marks & affordances),
 * and what is resting. Wired to the calendar + rule engines.
 */
import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Page } from '../../src/ui/Page';
import { Folio, Rubric, Caps, Numeral, Mark, Tally, Dots, Btn, type MarkState } from '../../src/ui/components';
import { CheckinSheet } from '../../src/ui/CheckinSheet';
import { DevDate } from '../../src/ui/DevDate';
import { K, font } from '../../src/ui/theme';
import { copy } from '../../src/ui/copy';
import { folioDate, liturgicalLabel, practiceSubtitle } from '../../src/ui/format';
import { useClock } from '../../src/state/clock';
import { useRule } from '../../src/state/rule';
import { useAuth } from '../../src/state/auth';
import { getDayInfo } from '../../src/domain/coptic';
import { isDueOn, effectiveStatus, dateKey, globalFlame, type Practice } from '../../src/domain/rule';

export default function TodayScreen() {
  const today = useClock((s) => s.today);
  const { practices, logsFor, logsByPractice, restDays, toggle } = useRule();
  const name = useAuth((s) => s.account?.displayName) ?? 'friend';
  const [checkin, setCheckin] = useState<Practice | null>(null);
  const router = useRouter();

  const info = getDayInfo(today);
  const active = practices.filter((p) => p.state === 'active');
  const due = active.filter((p) => isDueOn(p, today, logsFor(p.id)));
  const resting = active.filter((p) => !isDueOn(p, today, logsFor(p.id)));

  const statusOf = (p: Practice): MarkState => {
    const log = logsFor(p.id).find((l) => dateKey(l.date) === dateKey(today));
    const s = effectiveStatus(log, today, today);
    return s === 'kept' ? 'kept' : s === 'part' ? 'part' : 'open';
  };
  const valueOf = (p: Practice) => logsFor(p.id).find((l) => dateKey(l.date) === dateKey(today))?.value ?? 0;
  const partsOf = (p: Practice) => logsFor(p.id).find((l) => dateKey(l.date) === dateKey(today))?.parts?.length ?? 0;

  const keptCount = due.filter((p) => statusOf(p) !== 'open').length;
  const flame = globalFlame(active, logsByPractice(), { today, restDays });
  const isFast = info.fast.level !== 'none';

  return (
    <Page>
      <Folio left={folioDate(today)} right={liturgicalLabel(info)} glyph="ⲡ" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* greeting + flame */}
        <View style={styles.head}>
          <View style={{ flex: 1 }}>
            <Rubric>{copy.today.account}</Rubric>
            <Text style={styles.greeting}>{copy.today.greeting(name)}</Text>
          </View>
          <View style={styles.flame}>
            <Numeral size={44} color={K.goldHi}>
              {String(flame)}
            </Numeral>
            <Caps size={9} ls={1.6} color={K.ink3}>
              {copy.today.streak}
            </Caps>
          </View>
        </View>

        {/* fast / feast banner */}
        {isFast ? (
          <Pressable style={styles.banner} onPress={() => router.navigate('/(tabs)/hours' as never)}>
            <Caps color={K.rubricHi} size={10} ls={2.2}>
              {info.season?.name ?? 'A fast day'}
            </Caps>
            <Text style={styles.bannerRuling}>{info.fast.ruling}</Text>
          </Pressable>
        ) : info.feast ? (
          <View style={[styles.banner, { borderColor: 'rgba(127,191,154,0.4)' }]}>
            <Caps color={K.feast} size={10} ls={2.2}>
              A feast of the Lord
            </Caps>
            <Text style={[styles.bannerRuling, { color: K.feast }]}>{info.feast.name}</Text>
          </View>
        ) : null}

        {due.length > 0 ? (
          <>
            <View style={styles.tallyRow}>
              <Caps color={K.gold} size={9.5} ls={1.6}>
                {copy.today.kept(keptCount, due.length)}
              </Caps>
              <Tally total={due.length} filled={keptCount} />
            </View>

            <Rubric num="Ⲁ">{copy.today.ruleToday}</Rubric>
            {due.map((p) => {
              const state = statusOf(p);
              const kept = state === 'kept';
              return (
                <Pressable
                  key={p.id}
                  style={[styles.row, { opacity: kept ? 0.62 : 1 }]}
                  onPress={() => (p.measure === 'binary' ? toggle(p, today) : setCheckin(p))}
                  hitSlop={6}
                >
                  <Mark state={state} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.rowName, kept && { textDecorationLine: 'line-through' }]}>{p.name}</Text>
                    <Caps size={8.5} ls={1.4} color={K.ink2}>
                      {practiceSubtitle(p)}
                    </Caps>
                  </View>
                  {p.measure === 'parts' ? (
                    <Dots total={p.parts?.length ?? 0} filled={partsOf(p)} />
                  ) : p.measure === 'count' || p.measure === 'duration' ? (
                    <Caps size={11} ls={1} color={K.gold}>
                      {valueOf(p)} / {p.target ?? 0}
                    </Caps>
                  ) : null}
                </Pressable>
              );
            })}
          </>
        ) : active.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>{copy.today.emptyTitle}</Text>
            <Caps color={K.ink3} size={11} ls={1.4} style={{ textAlign: 'center', marginVertical: 14 }}>
              {copy.today.emptyBody}
            </Caps>
            <Btn kind="solid" onPress={() => router.navigate('/(tabs)/rule' as never)}>
              {copy.today.toRule}
            </Btn>
          </View>
        ) : null}

        {/* resting today */}
        {resting.length > 0 ? (
          <View style={styles.resting}>
            <Caps color={K.ink3} size={9} ls={2}>
              {copy.today.resting}
            </Caps>
            <View style={styles.restingRule} />
            <Text style={styles.restingList}>{resting.map((p) => p.name).join(' · ')}</Text>
          </View>
        ) : null}
      </ScrollView>

      <DevDate />
      <CheckinSheet practice={checkin} date={today} onClose={() => setCheckin(null)} />
    </Page>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 8 },
  greeting: { fontFamily: font.display, fontSize: 34, color: K.parch, lineHeight: 36, marginTop: 2 },
  flame: { alignItems: 'center', paddingLeft: 16, marginLeft: 16, borderLeftWidth: 1, borderLeftColor: K.ruleDim, paddingTop: 18 },
  banner: { borderWidth: 1, borderColor: 'rgba(184,69,58,0.4)', padding: 14, marginTop: 22, gap: 4 },
  bannerRuling: { fontFamily: font.bodyItalic, fontSize: 15, color: K.rubricHi },
  tallyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14, marginTop: 24, paddingVertical: 10, borderTopWidth: 1, borderBottomWidth: 1, borderColor: K.ruleDim },
  row: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: K.ruleDim },
  rowName: { fontFamily: font.display, fontSize: 21, color: K.parch },
  empty: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 10 },
  emptyTitle: { fontFamily: font.displayItalic, fontSize: 26, color: K.ink2, textAlign: 'center' },
  resting: { marginTop: 30, opacity: 0.6 },
  restingRule: { height: 1, backgroundColor: K.ruleDim, marginVertical: 8 },
  restingList: { fontFamily: font.bodyItalic, fontSize: 14, color: K.ink3 },
});
