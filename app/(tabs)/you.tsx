/**
 * You — streaks, marks, stats, settings, and the account (PRD §5.6).
 */
import React, { useMemo } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Page } from '../../src/ui/Page';
import { Folio, Rubric, Caps, Numeral, Btn, Register, Segmented } from '../../src/ui/components';
import { font, type Palette } from '../../src/ui/theme';
import { useStyles, useThemeColors } from '../../src/ui/useStyles';
import { copy } from '../../src/ui/copy';
import { useTheme, type ThemeMode } from '../../src/state/theme';
import { useAuth } from '../../src/state/auth';
import { useRule } from '../../src/state/rule';
import { useJournal } from '../../src/state/journal';
import { useReading } from '../../src/state/reading';
import { useOffices } from '../../src/state/offices';
import { useClock } from '../../src/state/clock';
import { youStats } from '../../src/domain/stats';
import { evaluateMarks } from '../../src/domain/marks';
import type { PracticeLog } from '../../src/domain/rule';
import type { JourneyStage } from '../../src/db/repo';

const journeyLabel = (j: JourneyStage | null): string =>
  j ? copy.onboarding.journey[j].title : '—';

export default function YouScreen() {
  const styles = useStyles(makeStyles);
  const t = useThemeColors();
  const router = useRouter();
  const themeMode = useTheme((s) => s.mode);
  const setThemeMode = useTheme((s) => s.setMode);
  const { account, accounts, signOut, switchAccount } = useAuth();
  const today = useClock((s) => s.today);
  const practices = useRule((s) => s.practices);
  const logs = useRule((s) => s.logs);
  const restDays = useRule((s) => s.restDays);
  const journalCount = useJournal((s) => s.entries.length);
  const planDaysCompleted = useReading((s) => s.totalDaysKept());
  const officeTotal = useOffices((s) => s.total);
  const others = accounts.filter((a) => a.id !== account?.id);

  const logsByPractice = useMemo(() => {
    const out: Record<string, PracticeLog[]> = {};
    for (const l of logs) (out[l.practiceId] ??= []).push(l);
    return out;
  }, [logs]);

  const stats = youStats({ practices, logsByPractice, restDays, officeCompletions: officeTotal, today });
  const marks = evaluateMarks({ practices, logsByPractice, restDays, journalCount, planDaysCompleted, today });

  return (
    <Page>
      <Folio left={copy.you.head} right={account?.email ?? ''} glyph="Ⲉ" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        <View style={styles.head}>
          <Text style={styles.name}>{account?.displayName ?? 'Friend'}</Text>
          <Caps size={9} ls={1.4} color={t.ink2} style={{ marginTop: 6 }}>
            {copy.you.journeyLabel} · {journeyLabel(account?.journeyStage ?? null)}
          </Caps>
        </View>

        {/* stats ledger */}
        <Pressable style={styles.stats} onPress={() => router.push('/you/streak')}>
          <Stat value={String(stats.streak)} label={copy.you.stats.streak} />
          <Stat value={String(stats.totalPrayers)} label={copy.you.stats.prayers} />
          <Stat value={`${stats.wedFriPercent}%`} label={copy.you.stats.wedfri} />
        </Pressable>

        {/* marks */}
        <Rubric num="Ⲕ">{copy.you.marks}</Rubric>
        <View style={styles.marks}>
          {marks.map((m) => (
            <View key={m.key} style={[styles.mark, !m.earned && { opacity: 0.42 }]}>
              <Text style={[styles.markGlyph, { color: m.earned ? t.goldHi : t.ink3 }]}>☩</Text>
              <Caps size={8} ls={1.2} color={m.earned ? t.ink2 : t.ink3} style={{ textAlign: 'center' }}>
                {m.name}
              </Caps>
            </View>
          ))}
        </View>

        {/* settings */}
        <Rubric>{copy.you.settings}</Rubric>
        <Register onTop>
          <Text style={styles.rowLabel}>{copy.you.theme}</Text>
        </Register>
        <View style={{ marginTop: 12, marginBottom: 4 }}>
          <Segmented
            options={copy.you.themeModes}
            active={themeMode}
            onChange={(key) => void setThemeMode(key as ThemeMode)}
          />
        </View>
        <SettingRow label={copy.you.reminders} />
        <SettingRow label={copy.you.fastingNuance} />
        <SettingRow label={copy.you.about} onPress={() => router.push('/you/about')} />

        {/* accounts */}
        {others.length > 0 ? (
          <>
            <Rubric>{copy.you.switch}</Rubric>
            {others.map((a) => (
              <Pressable
                key={a.id}
                style={styles.acctRow}
                onPress={async () => {
                  await switchAccount(a.id);
                  router.replace(a.onboardingComplete ? '/(tabs)/today' : '/onboarding');
                }}
              >
                <Text style={styles.acctName}>{a.displayName ?? a.email}</Text>
                <Caps size={14} color={t.ink3}>›</Caps>
              </Pressable>
            ))}
          </>
        ) : null}

        <View style={{ height: 24 }} />
        <Btn kind="line" onPress={() => router.push('/auth/sign-up')}>{copy.you.addAccount}</Btn>
        <Btn
          kind="rubric"
          style={{ marginTop: 10 }}
          onPress={async () => {
            await signOut();
            router.replace('/auth/welcome');
          }}
        >
          {copy.you.signOut}
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
      <Numeral size={36} color={t.goldHi}>{value}</Numeral>
      <Caps size={8} ls={1.4} color={t.ink3}>{label}</Caps>
    </View>
  );
}

function SettingRow({ label, onPress }: { label: string; onPress?: () => void }) {
  const styles = useStyles(makeStyles);
  const t = useThemeColors();
  return (
    <Pressable onPress={onPress}>
      <Register>
        <Text style={styles.rowLabel}>{label}</Text>
        <Caps size={14} color={t.ink3}>{onPress ? '›' : ''}</Caps>
      </Register>
    </Pressable>
  );
}

const makeStyles = (t: Palette) => StyleSheet.create({
  head: { marginTop: 10, marginBottom: 8 },
  name: { fontFamily: font.display, fontSize: 36, color: t.parch },
  stats: { flexDirection: 'row', marginVertical: 18, borderTopWidth: 1, borderBottomWidth: 1, borderColor: t.ruleDim, paddingVertical: 16 },
  stat: { flex: 1, alignItems: 'center', gap: 2 },
  marks: { flexDirection: 'row', flexWrap: 'wrap' },
  mark: { width: '33.33%', alignItems: 'center', gap: 6, paddingVertical: 16, borderWidth: 1, borderColor: t.ruleDim, marginLeft: -1, marginTop: -1 },
  markGlyph: { fontFamily: font.display, fontSize: 26 },
  rowLabel: { flex: 1, fontFamily: font.display, fontSize: 19, color: t.parch },
  acctRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: t.ruleDim },
  acctName: { flex: 1, fontFamily: font.display, fontSize: 19, color: t.parch },
});
