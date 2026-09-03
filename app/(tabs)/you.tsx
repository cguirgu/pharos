/**
 * You — the hub: what you keep, the marks, your voice in the community, then
 * preferences and the account (PRD §5.6).
 *
 * Rule and Saved moved here when Questions took their place in the tab bar, so
 * this screen had to stop being a settings wall. The ordering is deliberate: the
 * first thing under your name is what you have MADE (your rule, your marks, your
 * journal, your questions), each with a live count; preferences sit below.
 */
import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { LEGAL_META } from '../../src/content/legal';
import { Page } from '../../src/ui/Page';
import { Folio, Rubric, Caps, Numeral, Btn, Register, Segmented, Toggle } from '../../src/ui/components';
import { font, type Palette } from '../../src/ui/theme';
import { useStyles, useThemeColors } from '../../src/ui/useStyles';
import { copy } from '../../src/ui/copy';
import { SUPPORT_ENABLED } from '../../src/content/flags';
import { useTheme, type ThemeMode } from '../../src/state/theme';
import { useTextScale, type TextSize } from '../../src/state/textScale';
import { useAuth } from '../../src/state/auth';
import { useRule } from '../../src/state/rule';
import { useJournal } from '../../src/state/journal';
import { useHighlights } from '../../src/state/highlights';
import { useQuestions } from '../../src/state/questions';
import { useReading } from '../../src/state/reading';
import { useOffices } from '../../src/state/offices';
import { useLearning } from '../../src/state/learning';
import { isLessonPassed } from '../../src/domain/learn/course';
import { proficiencyFor } from '../../src/domain/learn/proficiency';
import { useClock } from '../../src/state/clock';
import { getRepo, GUEST_ACCOUNT_ID } from '../../src/db/repo';
import { exportAndShare } from '../../src/platform/exportData';
import { dateKey } from '../../src/domain/rule';
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
  const textSize = useTextScale((s) => s.size);
  const setTextSize = useTextScale((s) => s.setSize);
  const { account, signOut } = useAuth();
  const isGuest = account?.id === GUEST_ACCOUNT_ID;
  const today = useClock((s) => s.today);
  const [exporting, setExporting] = useState(false);

  // Tappable support contact (App Review Guideline 1.5). Best-effort: a device
  // with no mail client simply does nothing rather than throwing to the UI.
  const onContact = async () => {
    const url = `mailto:${LEGAL_META.contactEmail}?subject=${encodeURIComponent('Coptic Daily Companion')}`;
    try {
      await Linking.openURL(url);
    } catch {
      // no mail client available — nothing to do
    }
  };

  const onExport = async () => {
    if (!account || exporting) return;
    setExporting(true);
    try {
      const data = await getRepo(account.id).exportAccountData(account.id);
      await exportAndShare({ ...data, exportedAt: Date.now() }, dateKey(today));
    } catch {
      // best-effort; the share sheet simply doesn't open on failure
    } finally {
      setExporting(false);
    }
  };
  const practices = useRule((s) => s.practices);
  const logs = useRule((s) => s.logs);
  const restDays = useRule((s) => s.restDays);
  const journalCount = useJournal((s) => s.entries.length);
  const practiceCount = practices.filter((p) => p.state !== 'archived').length;
  const highlightCount = useHighlights((s) => s.items.length);
  const myQuestionCount = useQuestions((s) => s.items).filter(
    (q) => q.author.accountId === account?.id,
  ).length;
  const anonymousDefault = useQuestions((s) => s.anonymousDefault);
  const setAnonymousDefault = useQuestions((s) => s.setAnonymousDefault);
  const planDaysCompleted = useReading((s) => s.totalDaysKept());
  const officeTotal = useOffices((s) => s.total);

  const logsByPractice = useMemo(() => {
    const out: Record<string, PracticeLog[]> = {};
    for (const l of logs) (out[l.practiceId] ??= []).push(l);
    return out;
  }, [logs]);

  const stats = youStats({ practices, logsByPractice, restDays, officeCompletions: officeTotal, today });
  const marks = evaluateMarks({ practices, logsByPractice, restDays, journalCount, planDaysCompleted, today });
  // Subscribe to the stable `lessons` record (not a Set-returning selector — that loops).
  const learnLessons = useLearning((s) => s.lessons);
  const copticRank = proficiencyFor(Object.values(learnLessons).filter(isLessonPassed).length);

  return (
    <Page>
      <Folio left={copy.you.head} right={isGuest ? copy.you.guestLabel : account?.email ?? ''} glyph="Ⲉ" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 30 }}>
        <View style={styles.head}>
          <Text style={styles.name}>{account?.displayName ?? 'Friend'}</Text>
          <Caps size={9} ls={1.4} color={t.ink2} style={{ marginTop: 6 }}>
            {copy.you.journeyLabel} · {journeyLabel(account?.journeyStage ?? null)}
          </Caps>
          <Caps size={9} ls={1.4} color={t.gold} style={{ marginTop: 4 }}>
            ☩ {copticRank.rank.title}
          </Caps>
        </View>

        {/* stats ledger */}
        <Pressable style={styles.stats} onPress={() => router.push('/you/streak')}>
          <Stat value={String(stats.streak)} label={copy.you.stats.streak} />
          <Stat value={String(stats.totalPrayers)} label={copy.you.stats.prayers} />
          <Stat value={`${stats.wedFriPercent}%`} label={copy.you.stats.wedfri} />
        </Pressable>

        {/* Ⲁ — what you keep: the surfaces that left the tab bar, plus the journal */}
        <Rubric num="Ⲁ">{copy.you.sections.keep}</Rubric>
        <HubRow
          title={copy.you.ruleRow}
          meta={copy.you.practiceCount(practiceCount)}
          onPress={() => router.push('/rule')}
        />
        <HubRow
          title={copy.you.savedRow}
          meta={copy.you.markCount(highlightCount)}
          onPress={() => router.push('/saved')}
        />
        <HubRow
          title={copy.you.journalRow}
          meta={copy.you.entryCount(journalCount)}
          onPress={() => router.push('/journal')}
        />

        {/* Ⲃ — marks */}
        <Rubric num="Ⲃ">{copy.you.marks}</Rubric>
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

        {/* Ⲅ — your voice in the community */}
        <Rubric num="Ⲅ">{copy.you.sections.voice}</Rubric>
        <HubRow
          title={copy.questions.yourQuestions}
          meta={copy.questions.askedCount(myQuestionCount)}
          onPress={() => router.navigate('/(tabs)/questions?filter=mine' as never)}
        />
        <Register>
          <Text style={styles.rowLabel}>{copy.questions.anonymousDefault}</Text>
          <Toggle value={anonymousDefault} onChange={(v) => void setAnonymousDefault(v)} />
        </Register>

        {/* Ⲇ — preferences */}
        <Rubric num="Ⲇ">{copy.you.sections.prefs}</Rubric>
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
        <Register>
          <Text style={styles.rowLabel}>{copy.you.textSize}</Text>
        </Register>
        <View style={{ marginTop: 12, marginBottom: 4 }}>
          <Segmented
            options={copy.you.textSizes}
            active={textSize}
            onChange={(key) => void setTextSize(key as TextSize)}
          />
        </View>
        <SettingRow label={copy.you.reminders} onPress={() => router.push('/you/reminders')} />
        <SettingRow label={copy.you.fastingNuance} />

        {/* Ⲉ — the book */}
        <Rubric num="Ⲉ">{copy.you.sections.book}</Rubric>
        <SettingRow label={copy.you.about} onPress={() => router.push('/you/about')} />
        <SettingRow label={copy.you.contact} onPress={onContact} />
        {SUPPORT_ENABLED ? (
          <SettingRow label={copy.you.support} onPress={() => router.push('/you/support')} />
        ) : null}
        <SettingRow label={copy.you.privacy} onPress={() => router.push('/you/privacy')} />
        <SettingRow label={copy.you.terms} onPress={() => router.push('/you/terms')} />

        {/* Ⲋ — the account */}
        {!isGuest ? (
          <>
            <Rubric num="Ⲋ">{copy.you.sections.account}</Rubric>
            <SettingRow label={exporting ? copy.you.exportWorking : copy.you.exportData} onPress={onExport} />
            <SettingRow label={copy.you.deleteAccount} onPress={() => router.push('/you/delete-account')} danger />
          </>
        ) : null}

        <View style={{ height: 24 }} />
        {isGuest ? (
          <>
            <Text style={styles.guestHint}>{copy.you.guestHint}</Text>
            <Btn kind="solid" onPress={() => router.push('/auth/welcome')}>
              {copy.you.guestCta}
            </Btn>
          </>
        ) : (
          <Btn
            kind="rubric"
            onPress={async () => {
              await signOut();
              router.replace('/auth/welcome');
            }}
          >
            {copy.you.signOut}
          </Btn>
        )}
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

/** A hub destination: display-font title, a right-aligned count, a chevron. */
function HubRow({ title, meta, onPress }: { title: string; meta?: string; onPress: () => void }) {
  const styles = useStyles(makeStyles);
  const t = useThemeColors();
  return (
    <Pressable onPress={onPress}>
      <Register>
        <Text style={styles.rowLabel}>{title}</Text>
        {meta ? (
          <Caps size={8.5} ls={1.4} color={t.ink3}>
            {meta}
          </Caps>
        ) : null}
        <Caps size={14} color={t.ink3}>
          ›
        </Caps>
      </Register>
    </Pressable>
  );
}

function SettingRow({ label, onPress, danger }: { label: string; onPress?: () => void; danger?: boolean }) {
  const styles = useStyles(makeStyles);
  const t = useThemeColors();
  return (
    <Pressable onPress={onPress}>
      <Register>
        <Text style={[styles.rowLabel, danger && { color: t.rubricHi }]}>{label}</Text>
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
  guestHint: { fontFamily: font.display, fontSize: 15, lineHeight: 22, color: t.ink2, marginBottom: 14 },
  acctRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: t.ruleDim },
  acctName: { flex: 1, fontFamily: font.display, fontSize: 19, color: t.parch },
});
