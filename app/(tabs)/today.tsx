/**
 * Today — the day's account (from Today3). Folio + greeting + flame, fast
 * banner, kept tally, the rule due today (with lozenge marks & affordances),
 * and what is resting. Wired to the calendar + rule engines.
 */
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Page } from '../../src/ui/Page';
import { Folio, Rubric, Caps, Numeral, Mark, Tally, Dots, Btn, type MarkState } from '../../src/ui/components';
import { CheckinSheet } from '../../src/ui/CheckinSheet';
import { DevDate } from '../../src/ui/DevDate';
import { font, type Palette } from '../../src/ui/theme';
import { useStyles, useThemeColors } from '../../src/ui/useStyles';
import { copy } from '../../src/ui/copy';
import { HOURS_READY, CONTENT_LICENSED } from '../../src/content/flags';
import { folioDate, liturgicalLabel, practiceSubtitle } from '../../src/ui/format';
import { useClock } from '../../src/state/clock';
import { useRule } from '../../src/state/rule';
import { useAuth } from '../../src/state/auth';
import { useJournal } from '../../src/state/journal';
import { getRepo } from '../../src/db/repo';
import { keptFeedback } from '../../src/platform/haptics';
import { getDayInfo } from '../../src/domain/coptic';
import { primarySaint } from '../../src/domain/content/synaxarium';
import { isDueOn, effectiveStatus, dateKey, globalFlame, type Practice } from '../../src/domain/rule';

/** Per-device preference for the Home commemoration card (persists across sessions). */
const COMMEM_KEY = 'home.commemoration.collapsed';

export default function TodayScreen() {
  const styles = useStyles(makeStyles);
  const t = useThemeColors();
  const today = useClock((s) => s.today);
  const { practices, logsFor, logsByPractice, restDays, toggle } = useRule();
  const name = useAuth((s) => s.account?.displayName) ?? 'friend';
  const entryCount = useJournal((s) => s.entries.length);
  const [checkin, setCheckin] = useState<Practice | null>(null);
  const router = useRouter();

  const info = getDayInfo(today);
  const saint = primarySaint(info.coptic);

  // Commemoration card: minimized state persists across sessions (per device).
  const [commemOpen, setCommemOpen] = useState(true);
  useEffect(() => {
    void getRepo().getSetting(COMMEM_KEY).then((v) => {
      if (v != null) setCommemOpen(v !== 'collapsed');
    });
  }, []);
  const toggleCommem = () => {
    setCommemOpen((open) => {
      const next = !open;
      void getRepo().setSetting(COMMEM_KEY, next ? 'open' : 'collapsed');
      return next;
    });
  };
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

  const onRowPress = (p: Practice) => {
    if (p.measure !== 'binary') {
      setCheckin(p);
      return;
    }
    // Fire the "kept" feedback only on the open → kept transition (not un-checking).
    if (statusOf(p) !== 'kept') keptFeedback();
    void toggle(p, today);
  };

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
            <Numeral size={44} color={t.goldHi}>
              {String(flame)}
            </Numeral>
            <Caps size={9} ls={1.6} color={t.ink3}>
              {copy.today.streak}
            </Caps>
          </View>
        </View>

        {/* fast / feast banner — opens the Hours only when that content is ready */}
        {isFast ? (
          HOURS_READY ? (
            <Pressable style={styles.banner} onPress={() => router.navigate('/(tabs)/hours' as never)}>
              <Caps color={t.rubricHi} size={10} ls={2.2}>
                {info.season?.name ?? 'A fast day'}
              </Caps>
              <Text style={styles.bannerRuling}>{info.fast.ruling}</Text>
            </Pressable>
          ) : (
            <View style={styles.banner}>
              <Caps color={t.rubricHi} size={10} ls={2.2}>
                {info.season?.name ?? 'A fast day'}
              </Caps>
              <Text style={styles.bannerRuling}>{info.fast.ruling}</Text>
            </View>
          )
        ) : info.feast ? (
          <View style={[styles.banner, { borderColor: 'rgba(127,191,154,0.4)' }]}>
            <Caps color={t.feast} size={10} ls={2.2}>
              A feast of the Lord
            </Caps>
            <Text style={[styles.bannerRuling, { color: t.feast }]}>{info.feast.name}</Text>
          </View>
        ) : null}

        {/* commemoration of the day — collapsible, remembers its state.
            Hidden until the saint-life text is licensed (no placeholder shown). */}
        {CONTENT_LICENSED && saint ? (
          <View style={styles.commem}>
            <Pressable style={styles.commemHead} onPress={toggleCommem} hitSlop={6}>
              <Caps size={10.5} ls={2.6} color={t.rubricHi}>
                {copy.today.commemoration}
              </Caps>
              <Caps size={13} color={t.ink3}>{commemOpen ? '▾' : '▸'}</Caps>
            </Pressable>
            {commemOpen ? (
              <Pressable onPress={() => router.navigate('/(tabs)/word?focus=commemoration' as never)}>
                <Text style={styles.commemName}>{saint.name}</Text>
                {saint.title ? (
                  <Caps size={8.5} ls={1.4} color={t.ink3} style={{ marginTop: 4 }}>
                    {saint.title}
                  </Caps>
                ) : null}
              </Pressable>
            ) : null}
          </View>
        ) : null}

        {due.length > 0 ? (
          <>
            <View style={styles.tallyRow}>
              <Caps color={t.gold} size={9.5} ls={1.6}>
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
                  onPress={() => onRowPress(p)}
                  hitSlop={6}
                >
                  <Mark state={state} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.rowName, kept && { textDecorationLine: 'line-through' }]}>{p.name}</Text>
                    <Caps size={8.5} ls={1.4} color={t.ink2}>
                      {practiceSubtitle(p)}
                    </Caps>
                  </View>
                  {p.measure === 'parts' ? (
                    <Dots total={p.parts?.length ?? 0} filled={partsOf(p)} />
                  ) : p.measure === 'count' || p.measure === 'duration' ? (
                    <Caps size={11} ls={1} color={t.gold}>
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
            <Caps color={t.ink3} size={11} ls={1.4} style={{ textAlign: 'center', marginVertical: 14 }}>
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
            <Caps color={t.ink3} size={9} ls={2}>
              {copy.today.resting}
            </Caps>
            <View style={styles.restingRule} />
            <Text style={styles.restingList}>{resting.map((p) => p.name).join(' · ')}</Text>
          </View>
        ) : null}

        {/* journal — the commonplace book lives on the home page */}
        <Rubric num="Ⲓ">{copy.today.journal}</Rubric>
        <Pressable style={styles.journalRow} onPress={() => router.push('/journal')}>
          <Text style={styles.journalText}>{copy.journal.title}</Text>
          <Caps size={9} ls={1.4} color={t.ink3}>
            {entryCount} {entryCount === 1 ? 'entry' : 'entries'}
          </Caps>
        </Pressable>
        <Btn kind="line" style={{ marginTop: 16 }} onPress={() => router.push('/journal')}>
          {copy.today.openJournal}
        </Btn>
      </ScrollView>

      <DevDate />
      <CheckinSheet practice={checkin} date={today} onClose={() => setCheckin(null)} />
    </Page>
  );
}

const makeStyles = (t: Palette) => StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'flex-start', marginTop: 8 },
  greeting: { fontFamily: font.display, fontSize: 34, color: t.parch, lineHeight: 36, marginTop: 2 },
  flame: { alignItems: 'center', paddingLeft: 16, marginLeft: 16, borderLeftWidth: 1, borderLeftColor: t.ruleDim, paddingTop: 18 },
  banner: { borderWidth: 1, borderColor: 'rgba(184,69,58,0.4)', padding: 14, marginTop: 22, gap: 4 },
  bannerRuling: { fontFamily: font.bodyItalic, fontSize: 15, color: t.rubricHi },
  commem: { borderWidth: 1, borderColor: t.rule, padding: 14, marginTop: 22 },
  commemHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  commemName: { fontFamily: font.display, fontSize: 24, color: t.parch, marginTop: 10 },
  journalRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: t.ruleDim },
  journalText: { fontFamily: font.display, fontSize: 20, color: t.parch },
  tallyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 14, marginTop: 24, paddingVertical: 10, borderTopWidth: 1, borderBottomWidth: 1, borderColor: t.ruleDim },
  row: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: t.ruleDim },
  rowName: { fontFamily: font.display, fontSize: 21, color: t.parch },
  empty: { alignItems: 'center', paddingVertical: 40, paddingHorizontal: 10 },
  emptyTitle: { fontFamily: font.displayItalic, fontSize: 26, color: t.ink2, textAlign: 'center' },
  resting: { marginTop: 30, opacity: 0.6 },
  restingRule: { height: 1, backgroundColor: t.ruleDim, marginVertical: 8 },
  restingList: { fontFamily: font.bodyItalic, fontSize: 14, color: t.ink3 },
});
